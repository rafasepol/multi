// Diagramação: transforma o espelho de dados.js em páginas prontas para desenhar.
//
// Cada página da revista é planejada em dados.js: um modelo (capa, sumário, abertura,
// matéria, fontes, contracapa) e uma pilha de blocos (título, texto em colunas, foto,
// números, gráfico, citação...). Aqui cada bloco é medido e vira elementos com posição
// fixa: retângulos, fotos, linhas de texto já quebradas e estrelas. paginas.js só desenha.
//
// Tudo é medido numa unidade de projeto "u": a página tem LARG × ALT = 80u × 100u.
// Como a medida não depende da janela, as quebras de linha são sempre as mesmas.

import { PROPORCAO_MAPA } from "./mapa-biomas.js";

export const LARG = 80;
export const ALT = 100;

// A revista inteira (capa e contracapa incluídas) tem no máximo este número de páginas
export const MAX_PAGINAS = 18;

export const DISPLAY = '"Anton", Impact, "Arial Narrow", sans-serif';
export const SANS = '"Inter", system-ui, sans-serif';
export const SERIF = '"Playfair Display", Georgia, serif';

export const COR = {
  papel: "#f2ead9",
  vermelho: "#d22a1e",
  preto: "#1c1a18",
  suave: "#665e53",
  creme: "#f8f1e2",
  cremeSuave: "rgba(248,241,226,.82)",
  bege: "#e5d9c0",
};

// A margem de dentro (lombada) é maior que a de fora
const MARGEM_DENTRO = 7;
const MARGEM_FORA = 5.5;
const TOPO = 11; // onde o conteúdo começa (abaixo do cabeçalho)
const BASE = 93; // até onde o conteúdo desce (acima do número da página)
const GAP = 2.6; // espaço padrão entre blocos de uma pilha

// Estilos de texto: tam = tamanho da letra, alt = altura da linha (ambos em u).
// alta = caixa alta; base = posição da linha de base em relação ao tamanho da letra.
const E = {
  corpo: { fam: SANS, peso: 400, tam: 1.5, alt: 2.3 },
  lead: { fam: SANS, peso: 600, tam: 1.7, alt: 2.45 },
  inter: { fam: DISPLAY, peso: 400, tam: 2.2, alt: 2.6, alta: true, base: 0.86 },
  rotulo: { fam: SANS, peso: 600, tam: 1.15, alt: 1.6, alta: true },
  legenda: { fam: SANS, peso: 400, tam: 1.12, alt: 1.6, italico: true },
  numTexto: { fam: SANS, peso: 400, tam: 1.25, alt: 1.75 },
  autor: { fam: SANS, peso: 600, tam: 1.2, alt: 1.75 },
  grafRotulo: { fam: SANS, peso: 400, tam: 1.25, alt: 1.7 },
  grafEixo: { fam: SANS, peso: 400, tam: 1.05, alt: 1.5 },
  aspas: { fam: SERIF, peso: 800, tam: 9, alt: 9 },
};

// Anton (títulos e números): caixa alta, linhas juntas. Abaixo de 1,15 os acentos de uma
// linha (Á, Ã, É...) encostam nas letras da linha de cima.
export const ENTRELINHA = 1.15;
export function display(tam, alt = tam * ENTRELINHA) {
  return { fam: DISPLAY, peso: 400, tam, alt, alta: true, base: 0.86 };
}

// Marcadores de fonte como [1; 2]: menores, ligeiramente elevados
export const MARCA = 0.72;
export const MARCA_FOLGA = 0.3;

// o desenho final pode medir um pouco diferente da medida; essa sobra evita estourar
const FOLGA = 0.97;

export function cssFonte(est, tamPx) {
  return `${est.italico ? "italic " : ""}${est.peso} ${tamPx}px ${est.fam}`;
}

export function estiloMarca(est) {
  return { ...est, fam: SANS, peso: 600, italico: false };
}

// distância do topo da linha até a linha de base do texto
export function baseLinha(est) {
  return (est.alt - est.tam) / 2 + est.tam * (est.base ?? 0.78);
}

// ---------- Medição ----------

const K = 11; // 1u = 11 px no canvas de medida
let medidor = null;
let fonteDoMedidor = "";

function largura(texto, est) {
  if (!medidor) medidor = document.createElement("canvas").getContext("2d");
  const f = cssFonte(est, est.tam * K);
  if (f !== fonteDoMedidor) {
    medidor.font = f;
    fonteDoMedidor = f;
  }
  return medidor.measureText(texto).width / K;
}

const ER_MARCA = /(\[[^\]]+\])/;

// Divide em palavras; o marcador [n] fica colado na palavra anterior
function tokens(texto) {
  const toks = [];
  let tok = null;
  const juntar = (p) => {
    if (!tok) {
      tok = [];
      toks.push(tok);
    }
    tok.push(p);
  };
  for (const parte of texto.split(ER_MARCA)) {
    if (!parte) continue;
    if (/^\[[^\]]+\]$/.test(parte)) {
      if (!tok && toks.length) tok = toks[toks.length - 1];
      juntar({ t: parte, m: true });
    } else {
      // só espaços comuns quebram a linha: o espaço sem quebra (como em "26 °C") não
      for (const s of parte.split(/([ \t\n]+)/)) {
        if (!s) continue;
        if (/^[ \t\n]+$/.test(s)) tok = null;
        else juntar({ t: s, m: false });
      }
    }
  }
  return toks;
}

// Une as palavras de uma linha em trechos: texto comum e marcadores
function paraTrechos(toks) {
  const trechos = [];
  const add = (t, m) => {
    const ult = trechos[trechos.length - 1];
    if (!m && ult && !ult.m) ult.t += t;
    else trechos.push({ t, m });
  };
  toks.forEach((tok, i) => {
    if (i) add(" ", false);
    tok.forEach((p) => add(p.t, p.m));
  });
  return trechos;
}

function larguraMarca(t, est) {
  return MARCA_FOLGA + largura(t, { ...estiloMarca(est), tam: est.tam * MARCA });
}

// largura de uma linha já quebrada (lista de trechos)
function larguraLinha(linha, est) {
  return linha.reduce((s, r) => s + (r.m ? larguraMarca(r.t, est) : largura(r.t, est)), 0);
}

// Quebra um texto sem espaços (endereços) em linhas que cabem em `larg`
function quebrarPorCaractere(texto, est, larg) {
  const linhas = [];
  let atual = "";
  for (const ch of texto) {
    if (atual && largura(atual + ch, est) > larg) {
      linhas.push(atual);
      atual = "";
    }
    atual += ch;
  }
  linhas.push(atual);
  return linhas;
}

// Quebra `texto` em linhas de até `larg` (u, ou uma função do número da linha).
// Cada linha é uma lista de trechos {t, m}.
function quebrar(texto, est, larg) {
  if (est.alta) texto = texto.toUpperCase();
  const max = (i) => (typeof larg === "function" ? larg(i) : larg) * FOLGA;
  const espaco = largura(" ", est);
  const larguraParte = (p) => (p.m ? larguraMarca(p.t, est) : largura(p.t, est));

  const linhas = [];
  let linha = [];
  let w = 0;
  const fechar = () => {
    if (linha.length) linhas.push(paraTrechos(linha));
    linha = [];
    w = 0;
  };

  for (const tok of tokens(texto)) {
    const tw = tok.reduce((s, p) => s + larguraParte(p), 0);
    if (tw > max(linhas.length) && tok.length === 1 && !tok[0].m) {
      // palavra mais larga que a linha (endereço): quebra por caractere
      fechar();
      const pedacos = quebrarPorCaractere(tok[0].t, est, max(linhas.length));
      for (const t of pedacos.slice(0, -1)) linhas.push([{ t, m: false }]);
      const ult = pedacos[pedacos.length - 1];
      linha = [[{ t: ult, m: false }]];
      w = largura(ult, est);
      continue;
    }
    if (linha.length && w + espaco + tw > max(linhas.length)) fechar();
    w += (linha.length ? espaco : 0) + tw;
    linha.push(tok);
  }
  fechar();
  return linhas;
}

// maior tamanho de letra (até `tam`) em que a palavra mais larga de `texto` cabe em `larg`
function caberPalavra(texto, tam, larg, criar = display) {
  const palavras = texto.toUpperCase().split(/\s+/);
  const maior = (t) => Math.max(...palavras.map((p) => largura(p, criar(t))));
  while (tam > 1 && maior(tam) > larg * FOLGA) tam *= 0.96;
  return tam;
}

// maior tamanho de letra (até `tam`) em que `texto` inteiro cabe numa linha de `larg`
function caberLinha(texto, tam, larg, criar = display) {
  while (tam > 1 && largura(texto.toUpperCase(), criar(tam)) > larg * FOLGA) tam *= 0.96;
  return tam;
}

const linhaUnica = (t) => [[{ t, m: false }]];

// ---------- Acentos que encostam ----------
// Na Anton em caixa alta, as letras têm 0,86 do tamanho, os acentos sobem até 1,11 e o Ç,
// a vírgula e o Q descem abaixo da linha. Se um deles fica bem em cima de uma letra da linha
// de baixo, os dois se tocam. entrelinhaSegura() afasta as linhas só o necessário.

const SOBE = /[ÁÀÂÃÉÊÍÓÔÕÚÜ]/;
const DESCE = { "Ç": 0.31, ",": 0.12, ";": 0.12, Q: 0.1 };
const MAIUSCULA = 0.86;
const ACENTO = 1.11;
const FOLGA_ACENTO = 0.14; // respiro mínimo entre o que desce e o que sobe

// posição horizontal (u) de cada letra de uma linha já quebrada
function letras(linha, est) {
  const saida = [];
  let x = 0;
  for (const r of linha) {
    if (r.m) {
      x += larguraMarca(r.t, est);
      continue;
    }
    let antes = 0;
    for (let i = 0; i < r.t.length; i++) {
      const depois = largura(r.t.slice(0, i + 1), est);
      saida.push({ ch: r.t[i], x0: x + antes, x1: x + depois });
      antes = depois;
    }
    x += largura(r.t, est);
  }
  return saida;
}

export function entrelinhaSegura(linhas, est, w = 0, alinhar = "esq") {
  if (!est.alta || linhas.length < 2) return est;
  const desloc = (l) => {
    if (alinhar === "esq") return 0;
    const lw = larguraLinha(l, est);
    return alinhar === "dir" ? w - lw : (w - lw) / 2;
  };
  // trecho horizontal (fração da largura da letra) ocupado pelo que desce de cada letra
  const parteQueDesce = { "Ç": [0.2, 0.8], Q: [0.5, 1], ",": [0, 1], ";": [0, 1] };
  const linhasDeLetras = linhas.map((l) => {
    const d = desloc(l);
    return letras(l, est).map((c) => ({ ...c, x0: c.x0 + d, x1: c.x1 + d }));
  });
  const trecho = (c, [a, b]) => [c.x0 + (c.x1 - c.x0) * a, c.x0 + (c.x1 - c.x0) * b];
  const cruza = ([a0, a1], [b0, b1]) => a0 < b1 && b0 < a1;
  let alt = est.alt;
  for (let k = 0; k + 1 < linhasDeLetras.length; k++) {
    for (const de of linhasDeLetras[k]) {
      const desce = DESCE[de.ch];
      if (!desce) continue;
      const baixo = trecho(de, parteQueDesce[de.ch]);
      for (const ac of linhasDeLetras[k + 1]) {
        if (ac.ch === " ") continue;
        // o corpo da letra (quase toda a largura) e, se houver, o acento (no meio dela)
        if (cruza(baixo, trecho(ac, [0.06, 0.94]))) alt = Math.max(alt, (MAIUSCULA + desce + FOLGA_ACENTO) * est.tam);
        if (SOBE.test(ac.ch) && cruza(baixo, trecho(ac, [0.2, 0.8]))) alt = Math.max(alt, (ACENTO + desce + FOLGA_ACENTO) * est.tam);
      }
    }
  }
  return alt > est.alt ? { ...est, alt } : est;
}

// ---------- Elementos ----------

const ret = (x, y, w, h, cor) => ({ k: "ret", x, y, w, h, cor });

function txt(x, y, linhas, est, cor, alinhar = "esq", w = 0) {
  const el = { k: "texto", x, y, linhas, est, cor, alinhar, w };
  if (alinhar !== "esq") el.ws = linhas.map((l) => larguraLinha(l, est));
  return el;
}

// ---------- Blocos ----------
// Cada bloco devolve { h, gerar(x, y, w, h) }; os marcados com `resto` crescem para
// ocupar a sobra da pilha.

function rotulo(b, w) {
  const est = E.rotulo;
  const cor = b.cor ?? COR.vermelho;
  const linhas = quebrar(b.texto, est, w - 2.4);
  return {
    h: linhas.length * est.alt,
    gerar: (x, y) => [
      { k: "estrela", x: x + 0.85, y: y + est.alt / 2, r: 0.9, cor },
      txt(x + 2.4, y, linhas, est, cor),
    ],
  };
}

function titulo(b, w) {
  const pad = b.fundo ? (b.pad ?? 2.4) : 0;
  const iw = w - 2 * pad;
  const tam = caberPalavra(b.texto, b.tam ?? 7, iw);
  const linhas = quebrar(b.texto, display(tam, tam * (b.entrelinha ?? ENTRELINHA)), iw);
  const est = entrelinhaSegura(linhas, display(tam, tam * (b.entrelinha ?? ENTRELINHA)), iw, b.alinhar);
  const h = linhas.length * est.alt + 2 * pad;
  return {
    h,
    resto: b.resto,
    // num bloco com fundo que cresceu (resto), o texto fica centralizado na altura
    gerar: (x, y, w2, h2 = h) => [
      ...(b.fundo ? [ret(x, y, w2, h2, b.fundo)] : []),
      txt(x + pad, y + pad + (b.fundo ? (h2 - h) / 2 : 0), linhas, est, b.cor ?? COR.preto, b.alinhar, iw),
    ],
  };
}

function lead(b, w) {
  const est = E[b.est ?? "lead"];
  const linhas = quebrar(b.texto, est, w);
  return {
    h: linhas.length * est.alt,
    gerar: (x, y) => [txt(x, y, linhas, est, b.cor ?? COR.preto, b.alinhar, w)],
  };
}

// Texto corrido em colunas equilibradas. Parágrafos são strings; { inter: "..." } é um
// intertítulo, que sempre leva junto as primeiras linhas do parágrafo seguinte.
// capitular: a primeira letra do texto fica grande, ocupando três linhas.
function blocoTexto(b, w) {
  const n = b.colunas ?? 2;
  const gap = b.gap ?? 2.4;
  const cw = (w - gap * (n - 1)) / n;
  const est = E[b.est ?? "corpo"];
  const cor = b.cor ?? COR.preto;
  const corInter = b.corInter ?? (b.cor ?? COR.vermelho);
  const ESPACO_PAR = 0.9;
  const unidades = []; // pedaços que não se separam: { h, antes, linhas: [{ dy, dx, linha, est, cor }] }
  let capitular = null;
  let interPendente = null;

  b.p.forEach((par, ip) => {
    if (typeof par === "object") {
      const li = quebrar(par.inter, E.inter, cw);
      const ei = entrelinhaSegura(li, E.inter, cw);
      interPendente = { h: li.length * ei.alt + 0.5, linhas: li.map((l, k) => ({ dy: k * ei.alt, dx: 0, linha: l, est: ei, cor: corInter })) };
      return;
    }
    let texto = par;
    let larg = cw;
    let minPrimeiro = 2;
    if (ip === 0 && b.capitular) {
      const letra = texto[0];
      texto = texto.slice(1);
      const tamC = (2 * est.alt + baseLinha(est)) / 0.73;
      const ec = display(tamC, tamC);
      const wc = largura(letra, ec) + 0.9;
      larg = (k) => (k < 3 ? cw - wc : cw);
      capitular = { letra, est: ec, w: wc };
      minPrimeiro = 3;
    }
    const ls = quebrar(texto, est, larg);
    const dxDe = (k) => (capitular && ip === 0 && k < 3 ? capitular.w : 0);
    // grupos de linhas: as primeiras e as duas últimas de cada parágrafo ficam juntas
    const grupos = [];
    if (ls.length <= minPrimeiro + 1) grupos.push([0, ls.length]);
    else {
      grupos.push([0, minPrimeiro]);
      for (let k = minPrimeiro; k < ls.length - 2; k++) grupos.push([k, k + 1]);
      grupos.push([ls.length - 2, ls.length]);
    }
    grupos.forEach(([a, z], ig) => {
      const u = {
        h: (z - a) * est.alt,
        antes: ig === 0 && unidades.length ? ESPACO_PAR : 0,
        linhas: ls.slice(a, z).map((l, k) => ({ dy: k * est.alt, dx: dxDe(a + k), linha: l, est, cor })),
      };
      if (ip === 0 && ig === 0 && capitular) u.capitular = true;
      if (ig === 0 && interPendente) {
        // o intertítulo vai junto com o começo do parágrafo
        const ih = interPendente.h;
        u.linhas = [...interPendente.linhas, ...u.linhas.map((l) => ({ ...l, dy: l.dy + ih }))];
        u.h += ih;
        u.antes = unidades.length ? 1.6 : 0;
        interPendente = null;
      }
      unidades.push(u);
    });
  });

  // reparte as unidades em n colunas de altura H; devolve as posições ou null
  const encher = (H) => {
    const pos = [];
    let col = 0;
    let y = 0;
    for (const u of unidades) {
      let a = y > 0 ? u.antes : 0;
      if (y + a + u.h > H + 1e-6) {
        if (y === 0) return null;
        col++;
        y = 0;
        a = 0;
        if (col >= n) return null;
      }
      pos.push({ col, y: y + a });
      y += a + u.h;
    }
    return pos;
  };
  const total = unidades.reduce((s, u) => s + u.antes + u.h, 0);
  let lo = Math.max(total / n, ...unidades.map((u) => u.h));
  let hi = total + 1;
  if (!encher(lo)) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (encher(mid)) hi = mid;
      else lo = mid;
    }
  } else hi = lo;
  const pos = encher(hi) ?? unidades.map(() => ({ col: 0, y: 0 }));
  const h = Math.max(0, ...unidades.map((u, i) => pos[i].y + u.h));

  return {
    h,
    gerar: (x, y) => {
      const els = [];
      unidades.forEach((u, i) => {
        const xc = x + pos[i].col * (cw + gap);
        const yu = y + pos[i].y;
        for (const l of u.linhas) els.push(txt(xc + l.dx, yu + l.dy, [l.linha], l.est, l.cor));
        if (u.capitular) {
          const ehInter = u.linhas[0].est === E.inter;
          const y0 = yu + (ehInter ? u.linhas.find((l) => l.est === est).dy : 0);
          const yBase = y0 + 2 * est.alt + baseLinha(est);
          els.push(txt(xc, yBase - baseLinha(capitular.est), linhaUnica(capitular.letra), capitular.est, b.corCapitular ?? COR.vermelho));
        }
      });
      return els;
    },
  };
}

function foto(b, w) {
  const leg = b.legenda ? quebrar(b.legenda, E.legenda, w) : [];
  const hl = leg.length ? 0.7 + leg.length * E.legenda.alt : 0;
  const hf = b.h ?? (b.proporcao ? w / b.proporcao : 24);
  const gerar = (x, y, w2, h2) => {
    const hFoto = h2 - hl;
    return [
      { k: "foto", x, y, w: w2, h: hFoto, src: b.src, foco: b.foco, conter: b.conter, mesclar: b.mesclar, fundo: b.fundo },
      ...(leg.length ? [txt(x, y + hFoto + 0.7, leg, E.legenda, b.corLegenda ?? COR.suave)] : []),
    ];
  };
  if (b.resto) return { h: (b.min ?? 14) + hl, resto: true, gerar };
  return { h: hf + hl, gerar };
}

// mapa "Fogo no Brasil": desenhado na página por mapa-biomas.js; script.js põe por cima o
// mapa 3D (mapa3d.js), com o mesmo desenho e a mesma proporção, para cobrir o impresso.
function mapa(b, w) {
  const h = w / PROPORCAO_MAPA;
  return {
    h,
    gerar: (x, y, w2) => [
      { k: "mapaBiomas", x, y, w: w2, h },
      { k: "interativo", id: b.id, x, y, w: w2, h },
    ],
  };
}

// números grandes com uma explicação curta embaixo de cada um
function numeros(b, w) {
  const n = b.colunas ?? b.itens.length;
  const gap = b.gap ?? 2.6;
  const pad = b.fundo ? (b.pad ?? 2.4) : 0;
  const iw = w - 2 * pad;
  const cw = (iw - gap * (n - 1)) / n;
  const corN = b.corNumero ?? (b.fundo ? COR.creme : COR.vermelho);
  const corT = b.corTexto ?? (b.fundo ? COR.creme : COR.preto);
  let tam = b.tam ?? 8;
  for (const it of b.itens) tam = Math.min(tam, caberLinha(it.n, tam, cw));
  const en = display(tam, tam * 1.0);
  const et = E.numTexto;
  const regua = !b.fundo;
  const topo = regua ? 1.1 : 0;
  const cels = b.itens.map((it) => {
    const lt = it.texto ? quebrar(it.texto, et, cw) : [];
    return { n: it.n.toUpperCase(), lt, h: topo + en.alt + (lt.length ? 0.5 + lt.length * et.alt : 0) };
  });
  const linhas = [];
  for (let i = 0; i < cels.length; i += n) linhas.push(cels.slice(i, i + n));
  const GAP_LINHA = 2;
  const hs = linhas.map((l) => Math.max(...l.map((c) => c.h)));
  const h = hs.reduce((s, x) => s + x, 0) + GAP_LINHA * (linhas.length - 1) + 2 * pad;
  return {
    h,
    gerar: (x, y, w2) => {
      const els = b.fundo ? [ret(x, y, w2, h, b.fundo)] : [];
      let yy = y + pad;
      linhas.forEach((l, il) => {
        l.forEach((c, ic) => {
          const xc = x + pad + ic * (cw + gap);
          if (regua) els.push(ret(xc, yy, cw, 0.35, corN));
          els.push(txt(xc, yy + topo, linhaUnica(c.n), en, corN));
          if (c.lt.length) els.push(txt(xc, yy + topo + en.alt + 0.5, c.lt, et, corT));
        });
        yy += hs[il] + GAP_LINHA;
      });
      return els;
    },
  };
}

// gráfico de barras horizontais (barras: [rótulo, valor, texto exibido]; max = fim do eixo)
function grafico(b, w) {
  const cor = b.cor ?? COR.vermelho;
  const tit = quebrar(b.titulo, display(b.tamTitulo ?? 2.2), w);
  const et = entrelinhaSegura(tit, display(b.tamTitulo ?? 2.2), w);
  const lw = w * (b.rotulos ?? 0.36);
  const er = E.grafRotulo;
  const ev = display(1.8, 1.8);
  const folgaValor = Math.max(...b.barras.map(([, , t]) => largura(t, ev))) + 1.4;
  const bmax = w - lw - folgaValor;
  let y = tit.length * et.alt + 1.0;
  const y0 = y;
  const barras = b.barras.map(([rot, val, rotV]) => {
    const linhas = quebrar(rot, er, lw - 1.2);
    const h = Math.max(3.2, linhas.length * er.alt + 0.9);
    const r = { linhas, rotV, frac: Math.min(1, val / b.max), y, h };
    y += h;
    return r;
  });
  const yFim = y;
  y += 0.6;
  const eixo = b.eixo ? quebrar(b.eixo, E.grafEixo, w - lw) : [];
  const yEixo = y;
  y += eixo.length * E.grafEixo.alt + (eixo.length ? 0.8 : 0);
  const leg = b.legenda ? quebrar(b.legenda, E.legenda, w) : [];
  const yLeg = y;
  y += leg.length * E.legenda.alt;
  return {
    h: y,
    gerar: (x, yy) => {
      const els = [txt(x, yy, tit, et, b.corTitulo ?? COR.preto)];
      const xe = x + lw;
      for (const r of barras) {
        const top = yy + r.y;
        els.push(txt(x, top + (r.h - r.linhas.length * er.alt) / 2, r.linhas, er, COR.preto, "dir", lw - 1.2));
        const bl = Math.max(0.3, r.frac * bmax);
        const esp = Math.min(2.2, r.h - 0.9);
        els.push(ret(xe, top + (r.h - esp) / 2, bl, esp, cor));
        // área de passar o mouse (a linha toda); a barra sobe em 3D em script.js
        els.push({ k: "barra", x, y: top, w: lw + bl + folgaValor, h: r.h, bx: xe, by: top + (r.h - esp) / 2, bw: bl, bh: esp, cor });
        els.push(txt(xe + bl + 0.8, top + (r.h - ev.alt) / 2, linhaUnica(r.rotV), ev, COR.preto));
      }
      els.push(ret(xe - 0.08, yy + y0, 0.16, yFim - y0, COR.preto));
      if (eixo.length) els.push(txt(xe, yy + yEixo, eixo, E.grafEixo, COR.suave));
      if (leg.length) els.push(txt(x, yy + yLeg, leg, E.legenda, COR.suave));
      return els;
    },
  };
}

// olho: fala em destaque num bloco colorido, com aspas grandes, autor e crédito
function citacao(b, w) {
  const fundo = b.fundo ?? COR.vermelho;
  const cor = b.cor ?? COR.creme;
  const corAspas = b.corAspas ?? (fundo === COR.vermelho ? COR.preto : COR.vermelho);
  const pad = 2.6;
  const iw = w - 2 * pad;
  const tq = caberPalavra(b.texto, b.tam ?? 3.4, iw);
  const lq = quebrar(b.texto, display(tq), iw);
  const eq = entrelinhaSegura(lq, display(tq), iw);
  const la = b.autor ? quebrar(b.autor, E.autor, iw) : [];
  const lc = b.credito ? quebrar(b.credito, E.legenda, iw) : [];
  let y = pad + 4.2;
  const yQ = y;
  y += lq.length * eq.alt + 1.2;
  const yA = y;
  y += la.length * E.autor.alt + (lc.length ? 0.3 : 0);
  const yC = y;
  y += lc.length * E.legenda.alt;
  const hMin = y + pad;
  const gerar = (x, yy, w2, h2) => [
    ret(x, yy, w2, h2, fundo),
    txt(x + pad - 0.3, yy + pad - 2.6, linhaUnica("“"), E.aspas, corAspas),
    txt(x + pad, yy + yQ, lq, eq, cor),
    ...(la.length ? [txt(x + pad, yy + yA, la, E.autor, cor)] : []),
    ...(lc.length ? [txt(x + pad, yy + yC, lc, E.legenda, b.corCredito ?? COR.cremeSuave)] : []),
  ];
  return { h: hMin, resto: b.resto, gerar };
}

// lista com estrelas: título curto e uma ou duas linhas de explicação
function lista(b, w) {
  const n = b.colunas ?? 1;
  const gap = b.gap ?? 2.6;
  const cw = (w - gap * (n - 1)) / n;
  const tt = b.tamTitulo ?? 2.0;
  const ec = E[b.est ?? "corpo"];
  const recuo = 2.6;
  const cels = b.itens.map((it) => {
    const lt = quebrar(it.titulo, display(tt), cw - recuo);
    const et = entrelinhaSegura(lt, display(tt), cw - recuo);
    const lc = it.texto ? quebrar(it.texto, ec, cw - recuo) : [];
    return { lt, lc, et, h: lt.length * et.alt + (lc.length ? 0.3 + lc.length * ec.alt : 0) };
  });
  const linhas = [];
  for (let i = 0; i < cels.length; i += n) linhas.push(cels.slice(i, i + n));
  const GAP_LINHA = 1.8;
  const hs = linhas.map((l) => Math.max(...l.map((c) => c.h)));
  const h = hs.reduce((s, x) => s + x, 0) + GAP_LINHA * (linhas.length - 1);
  return {
    h,
    gerar: (x, y) => {
      const els = [];
      let yy = y;
      linhas.forEach((l, il) => {
        l.forEach((c, ic) => {
          const xc = x + ic * (cw + gap);
          els.push({ k: "estrela", x: xc + 0.9, y: yy + c.et.alt * 0.48, r: 0.95, cor: b.corEstrela ?? COR.vermelho });
          els.push(txt(xc + recuo, yy, c.lt, c.et, b.corTitulo ?? COR.preto));
          if (c.lc.length) els.push(txt(xc + recuo, yy + c.lt.length * c.et.alt + 0.3, c.lc, ec, b.cor ?? COR.preto));
        });
        yy += hs[il] + GAP_LINHA;
      });
      return els;
    },
  };
}

// caixas lado a lado ligadas por sinais (ex.: PERIGO + EXPOSIÇÃO = RISCO)
function fluxo(b, w) {
  const n = b.itens.length;
  const sinais = b.sinais ?? [];
  const sw = sinais.length ? 4 : 1.4;
  const cw = (w - sw * (n - 1)) / n;
  const pad = 1.6;
  const iw = cw - 2 * pad;
  let tam = b.tamTitulo ?? 2.4;
  for (const it of b.itens) tam = Math.min(tam, caberPalavra(it.titulo, tam, iw));
  const ex = E.numTexto;
  const cels = b.itens.map((it) => ({
    lt: quebrar(it.titulo, display(tam), iw),
    lx: it.texto ? quebrar(it.texto, ex, iw) : [],
  }));
  const et = cels.reduce((e, c) => entrelinhaSegura(c.lt, e, iw), display(tam));
  const h = Math.max(...cels.map((c) => pad + c.lt.length * et.alt + (c.lx.length ? 0.4 + c.lx.length * ex.alt : 0) + pad));
  const cores = b.cores ?? b.itens.map((_, i) => (i === n - 1 && sinais.includes("=") ? COR.preto : COR.vermelho));
  const es = display(4, 4);
  return {
    h,
    gerar: (x, y) => {
      const els = [];
      cels.forEach((c, i) => {
        const xc = x + i * (cw + sw);
        els.push(ret(xc, y, cw, h, cores[i]));
        els.push(txt(xc + pad, y + pad, c.lt, et, COR.creme));
        if (c.lx.length) els.push(txt(xc + pad, y + pad + c.lt.length * et.alt + 0.4, c.lx, ex, COR.creme));
        if (i < n - 1 && sinais[i]) {
          els.push(txt(xc + cw, y + (h - es.alt) / 2, linhaUnica(sinais[i]), es, COR.preto, "centro", sw));
        }
      });
      return els;
    },
  };
}

function caixa(b, w, pag) {
  const pad = b.pad ?? 2.6;
  const m = medirPilha(b.blocos, w - 2 * pad, pag);
  return {
    h: m.h + 2 * pad,
    resto: b.resto,
    gerar: (x, y, w2, h2) => [
      ret(x, y, w2, h2, b.fundo ?? COR.bege),
      ...gerarPilha(b.blocos, { x: x + pad, y: y + pad, w: w2 - 2 * pad, h: h2 - 2 * pad }, pag),
    ],
  };
}

// colunas lado a lado, cada uma com a sua pilha de blocos; as que têm um bloco `resto`
// crescem até a altura da coluna mais alta
function lado(b, w, pag) {
  const gap = b.gap ?? 3;
  const props = b.larguras ?? b.colunas.map(() => 1);
  const tot = props.reduce((s, p) => s + p, 0);
  const ws = props.map((p) => ((w - gap * (props.length - 1)) * p) / tot);
  const hs = b.colunas.map((blocos, i) => medirPilha(blocos, ws[i], pag).h);
  const H = Math.max(...hs);
  return {
    h: H,
    resto: b.resto,
    gerar: (x, y, w2, h2) => {
      const els = [];
      let xx = x;
      b.colunas.forEach((blocos, i) => {
        els.push(...gerarPilha(blocos, { x: xx, y, w: ws[i], h: Math.max(H, h2) }, pag));
        xx += ws[i] + gap;
      });
      return els;
    },
  };
}

// equipe: um retrato redondo por integrante, com o nome embaixo (foto vazia = círculo liso)
function equipe(b, w) {
  const n = b.itens.length;
  const gap = b.gap ?? 2;
  const cw = (w - gap * (n - 1)) / n;
  const d = Math.min(cw, b.diametro ?? cw);
  const en = E.autor;
  const nomes = b.itens.map((it) => quebrar(it.nome, en, cw));
  const hNomes = Math.max(...nomes.map((l) => l.length)) * en.alt;
  const h = d + 0.9 + hNomes;
  return {
    h,
    gerar: (x, y) => {
      const els = [];
      b.itens.forEach((it, i) => {
        const xc = x + i * (cw + gap);
        els.push({ k: "retrato", x: xc + (cw - d) / 2, y, w: d, h: d, src: it.foto ?? null });
        els.push(txt(xc, y + d + 0.9, nomes[i], en, COR.preto, "centro", cw));
      });
      return els;
    },
  };
}

const espaco = (b) => ({ h: b.h ?? 2, resto: b.resto, gerar: () => [] });

const regra = (b) => ({ h: b.esp ?? 0.35, gerar: (x, y, w) => [ret(x, y, w, b.esp ?? 0.35, b.cor ?? COR.preto)] });

// sumário: número da página num quadrado vermelho, título e linha fina
function indice(b, w) {
  const q = 7;
  const et = display(2.2);
  const es = E.numTexto;
  const lw = w - q - 2.6;
  const itens = b.itens.map((it) => {
    const lt = quebrar(it.titulo, et, lw);
    const eti = entrelinhaSegura(lt, et, lw);
    const ls = it.sub ? quebrar(it.sub, es, lw) : [];
    return { ...it, lt, ls, et: eti, h: Math.max(q, lt.length * eti.alt + (ls.length ? 0.3 + ls.length * es.alt : 0)) };
  });
  const GAP_LINHA = 1.2;
  const h = itens.reduce((s, it) => s + it.h, 0) + GAP_LINHA * (itens.length - 1);
  const en = display(3.7, 3.7);
  return {
    h,
    gerar: (x, y, w2) => {
      const els = [];
      let yy = y;
      for (const it of itens) {
        els.push(ret(x, yy, q, q, COR.vermelho));
        els.push(txt(x, yy + (q - en.alt) / 2, linhaUnica(String(it.pagina).padStart(2, "0")), en, COR.creme, "centro", q));
        const ht = it.lt.length * it.et.alt + (it.ls.length ? 0.3 + it.ls.length * es.alt : 0);
        const yt = yy + (it.h - ht) / 2;
        els.push(txt(x + q + 2.6, yt, it.lt, it.et, COR.preto));
        if (it.ls.length) els.push(txt(x + q + 2.6, yt + it.lt.length * it.et.alt + 0.3, it.ls, es, COR.suave));
        els.push({ k: "link", x, y: yy, w: w2, h: it.h, ir: it.pagina });
        yy += it.h + GAP_LINHA;
      }
      return els;
    },
  };
}

const CRIAR = { rotulo, titulo, lead, texto: blocoTexto, foto, mapa, numeros, grafico, citacao, lista, fluxo, caixa, lado, espaco, regra, indice, equipe };

function criar(b, w, pag) {
  const f = CRIAR[b.t];
  if (!f) {
    pag.avisos.push(`bloco desconhecido: ${b.t}`);
    return { h: 0, gerar: () => [] };
  }
  return f(b, w, pag);
}

// ---------- Pilha: blocos um embaixo do outro ----------

function medirPilha(blocos, w, pag) {
  const cx = blocos.map((b) => criar(b, w, pag));
  const h = cx.reduce((s, c, i) => s + c.h + (i ? blocos[i].antes ?? GAP : 0), 0);
  return { cx, h };
}

// distribui os blocos em r = {x, y, w, h}; a sobra vai para os blocos `resto`
function gerarPilha(blocos, r, pag) {
  const { cx, h } = medirPilha(blocos, r.w, pag);
  const sobra = r.h - h;
  if (sobra < -0.3) pag.avisos.push(`o conteúdo passa ${(-sobra).toFixed(1)}u da área`);
  const restos = cx.filter((c) => c.resto).length;
  const els = [];
  let y = r.y;
  cx.forEach((c, i) => {
    if (i) y += blocos[i].antes ?? GAP;
    const hb = c.resto ? c.h + Math.max(0, sobra) / restos : c.h;
    els.push(...c.gerar(r.x, y, r.w, hb));
    y += hb;
  });
  return els;
}

// ---------- Partes fixas de cada página ----------

// seção da página, no alto
function cabecalho(els, secao, x) {
  if (secao) els.push(txt(x, 4.2 + (2.8 - E.rotulo.alt) / 2 + 0.1, linhaUnica(secao.toUpperCase()), E.rotulo, COR.vermelho));
}

function numeroPagina(els, pag, cor = COR.preto) {
  const est = display(2, 2.2);
  const t = linhaUnica(String(pag.numero).padStart(2, "0"));
  if (pag.lado === "dir") els.push(txt(LARG - MARGEM_FORA - 8, ALT - 5.6, t, est, cor, "dir", 8));
  else els.push(txt(MARGEM_FORA, ALT - 5.6, t, est, cor));
}

function margens(pag) {
  const dir = pag.lado === "dir";
  return { x0: dir ? MARGEM_DENTRO : MARGEM_FORA, x1: LARG - (dir ? MARGEM_FORA : MARGEM_DENTRO) };
}

// ---------- Modelos de página ----------

function materia(p, pag) {
  const els = [];
  let { x0, x1 } = margens(pag);
  const dir = pag.lado === "dir";
  let corNumero = COR.preto;
  if (p.lateral) {
    // coluna colorida no lado de fora da página, de cima a baixo
    const lw = p.lateral.largura ?? 21;
    const lx = dir ? LARG - lw : 0;
    els.push(ret(lx, 0, lw, ALT, p.lateral.fundo ?? COR.vermelho));
    const r = dir
      ? { x: lx + 3, y: TOPO, w: LARG - MARGEM_FORA - lx - 3, h: BASE - TOPO }
      : { x: MARGEM_FORA, y: TOPO, w: lw - 3 - MARGEM_FORA, h: BASE - TOPO };
    els.push(...gerarPilha(p.lateral.blocos, r, pag));
    if (dir) x1 = lx - 3.4;
    else x0 = lw + 3.4;
    corNumero = COR.creme;
  }
  cabecalho(els, p.secao, x0);
  els.push(...gerarPilha(p.blocos, { x: x0, y: TOPO, w: x1 - x0, h: BASE - TOPO }, pag));
  numeroPagina(els, pag, corNumero);
  return { els, fundo: p.fundo };
}

// abertura de parte: foto sangrando no alto (ou, sem foto, uma frase grande sobre fundo
// escuro), faixa colorida com número e título, e o começo da matéria embaixo
function abertura(p, pag) {
  const els = [];
  const { x0, x1 } = margens(pag);
  const w = x1 - x0;
  const fa = p.fotoAlt ?? 48;
  if (p.foto) {
    els.push({ k: "foto", x: 0, y: 0, w: LARG, h: fa, src: p.foto, foco: p.foco, mesclar: p.mesclar });
  } else {
    els.push(ret(0, 0, LARG, fa, p.fundoTopo ?? COR.preto));
    if (p.destaque) {
      const td = caberPalavra(p.destaque, p.tamDestaque ?? 6, w);
      const ld = quebrar(p.destaque, display(td), w);
      const ed = entrelinhaSegura(ld, display(td), w);
      const hd = ld.length * ed.alt;
      els.push(ret(x0, (fa - hd) / 2 - 2.4, 10, 0.5, COR.vermelho));
      els.push(txt(x0, (fa - hd) / 2, ld, ed, p.corDestaque ?? COR.creme));
    }
  }
  const pad = 2.6;
  const en = display(12, 10.5);
  const num = String(p.numero).padStart(2, "0");
  const wn = largura(num, en) + 2.4;
  const tw = w - wn;
  const tt = caberPalavra(p.titulo, p.tamTitulo ?? 5.4, tw);
  const lt = quebrar(p.titulo, display(tt), tw);
  const et = entrelinhaSegura(lt, display(tt), tw);
  const lf = quebrar(p.linhaFina, E.lead, tw);
  const hTexto = lt.length * et.alt + 0.8 + lf.length * E.lead.alt;
  const hb = pad + Math.max(en.alt, hTexto) + pad;
  const corFaixa = p.cor ?? COR.vermelho;
  els.push(ret(0, fa, LARG, hb, corFaixa));
  els.push(txt(x0, fa + pad, linhaUnica(num), en, corFaixa === COR.preto ? COR.vermelho : "rgba(0,0,0,.32)"));
  els.push(txt(x0 + wn, fa + pad, lt, et, COR.creme));
  els.push(txt(x0 + wn, fa + pad + lt.length * et.alt + 0.8, lf, E.lead, COR.creme));
  let y = fa + hb + 1.2;
  if (p.legenda) {
    const ll = quebrar(p.legenda, E.legenda, w);
    els.push(txt(x0, y, ll, E.legenda, COR.suave, "dir", w));
    y += ll.length * E.legenda.alt;
  }
  y += 2.2;
  els.push(...gerarPilha(p.blocos ?? [], { x: x0, y, w, h: BASE - y }, pag));
  numeroPagina(els, pag);
  return { els };
}

function sumario(p, pag, R, entradas) {
  const els = [];
  const { x0, x1 } = margens(pag);
  const ed = R.editorial;
  const blocos = [
    { t: "titulo", texto: "Sumário", tam: 8, cor: COR.vermelho },
    {
      t: "lado", antes: 1.6, gap: 3.4, resto: true, larguras: [1.04, 1.26],
      colunas: [
        [{ t: "indice", itens: entradas }],
        [{
          t: "caixa", resto: true, fundo: COR.bege,
          blocos: [
            { t: "rotulo", texto: ed.titulo },
            { t: "titulo", texto: ed.chamada, tam: 2.6, antes: 1 },
            { t: "texto", p: ed.texto, colunas: 1, capitular: true, antes: 1.2 },
            { t: "lead", texto: `— ${ed.assinatura}`, antes: 1, cor: COR.vermelho },
          ],
        }],
      ],
    },
    { t: "regra", antes: 2 },
    { t: "rotulo", texto: "Equipe", cor: COR.preto, antes: 1.3 },
    { t: "equipe", itens: R.equipe ?? [], antes: 1.2, diametro: 9 },
    { t: "lead", est: "legenda", texto: R.expediente, antes: 1.2 },
  ];
  els.push(...gerarPilha(blocos, { x: x0, y: 6, w: x1 - x0, h: BASE - 6 }, pag));
  numeroPagina(els, pag);
  return { els };
}

// fontes e notas: 2 colunas por página, em letra pequena; diminui até caber em n páginas
function paginasFontes(f, pags) {
  for (let esc = 1; esc >= 0.7 - 1e-6; esc -= 0.05) {
    const r = tentarFontes(f, pags, esc, false);
    if (r) return r;
  }
  pags[0].avisos.push("as fontes não couberam nas páginas reservadas");
  return tentarFontes(f, pags, 0.7, true);
}

function tentarFontes(f, pags, esc, forcar) {
  const ef = { fam: SANS, peso: 400, tam: 1.1 * esc, alt: 1.55 * esc };
  const eu = { fam: SANS, peso: 400, tam: 0.95 * esc, alt: 1.35 * esc };
  const en = { fam: SANS, peso: 600, tam: 1.1 * esc, alt: 1.55 * esc };
  const ei = display(1.9 * esc, 2.3 * esc);
  const ep = { fam: SANS, peso: 400, tam: 1.2 * esc, alt: 1.75 * esc };
  const recuo = 3.4 * esc;
  const gap = 2.4;

  // cada página: duas colunas; a primeira tem o título e a introdução em cima
  const colunas = [];
  const topoDe = [];
  pags.forEach((pag, i) => {
    const { x0, x1 } = margens(pag);
    const cw = (x1 - x0 - gap) / 2;
    let yTopo = TOPO;
    if (i === 0) {
      const tit = titulo({ texto: f.titulo, tam: 9, cor: COR.vermelho }, x1 - x0);
      const intro = lead({ texto: f.intro, est: "numTexto" }, x1 - x0);
      topoDe.push({ x0, w: x1 - x0, tit, intro });
      yTopo = TOPO + tit.h + 1.6 + intro.h + 2.6;
    }
    colunas.push({ pag: i, x: x0, y: yTopo, w: cw, h: BASE - yTopo });
    colunas.push({ pag: i, x: x0 + cw + gap, y: yTopo, w: cw, h: BASE - yTopo });
  });
  const cw = colunas[0].w;

  const unidades = [];
  for (const it of f.itens) {
    const lt = quebrar(it.texto, ef, cw - recuo);
    // fonte sem endereço: só o texto, sem link
    const lu = it.url ? quebrarPorCaractere(it.url, eu, (cw - recuo) * FOLGA).map((t) => linhaUnica(t)[0]) : [];
    const yU = lt.length * ef.alt + 0.2;
    const h = lu.length ? yU + lu.length * eu.alt : lt.length * ef.alt;
    unidades.push({
      h, antes: 1.0,
      gerar: (x, y, w) => [
        txt(x, y, linhaUnica(`[${it.n}]`), en, COR.vermelho),
        txt(x + recuo, y, lt, ef, COR.preto),
        ...(lu.length ? [
          txt(x + recuo, y + yU, lu, eu, COR.suave),
          { k: "link", x: x + recuo, y, w: w - recuo, h, url: it.url },
        ] : []),
      ],
    });
  }
  for (const nota of f.notas) {
    const li = quebrar(nota.titulo, ei, cw);
    unidades.push({ h: li.length * ei.alt, antes: 2.4, junto: true, gerar: (x, y) => [txt(x, y, li, ei, COR.vermelho)] });
    for (const t of nota.texto) {
      const lp = quebrar(t, ep, cw);
      unidades.push({ h: lp.length * ep.alt, antes: 0.7, gerar: (x, y) => [txt(x, y, lp, ep, COR.preto)] });
    }
  }

  const porPagina = pags.map(() => []);
  let c = 0;
  let y = colunas[0].y;
  for (let i = 0; i < unidades.length; i++) {
    const u = unidades[i];
    const prox = u.junto ? unidades[i + 1] : null;
    const precisa = u.h + (prox ? prox.antes + prox.h : 0);
    let a = y > colunas[c].y ? u.antes : 0;
    if (y + a + precisa > colunas[c].y + colunas[c].h + 1e-6) {
      if (c + 1 >= colunas.length) {
        if (!forcar) return null;
      } else {
        c++;
        y = colunas[c].y;
        a = 0;
      }
    }
    const col = colunas[c];
    porPagina[col.pag].push(...u.gerar(col.x, y + a, col.w));
    y += a + u.h;
  }

  return pags.map((pag, i) => {
    const els = [];
    const { x0 } = margens(pag);
    cabecalho(els, "Fontes e notas", x0);
    if (i === 0) {
      const t = topoDe[0];
      els.push(...t.tit.gerar(t.x0, TOPO, t.w));
      els.push(...t.intro.gerar(t.x0, TOPO + t.tit.h + 1.6, t.w));
    }
    els.push(...porPagina[i]);
    numeroPagina(els, pag);
    return { els };
  });
}

// capa e contracapa
function montarCapa(R) {
  const c = R.capa;
  const avisos = { avisos: [] };
  const m = 5;
  const hTopo = 3 + E.rotulo.alt + 2.6;
  // a foto começa abaixo da faixa com a edição, para não esconder o alto da imagem
  const els = [{ k: "foto", x: 0, y: hTopo, w: LARG, h: ALT - hTopo, src: c.foto, foco: c.foco }];
  els.push(ret(0, 0, LARG, hTopo, COR.vermelho));
  els.push(txt(m, 3, linhaUnica(R.edicao.toUpperCase()), E.rotulo, COR.creme));
  const blocos = [
    { t: "titulo", texto: c.chamada, tam: 5.6, cor: COR.creme },
    { t: "lead", texto: c.subtitulo, cor: COR.cremeSuave, antes: 1.4 },
    { t: "fluxo", itens: c.destaques.map((d) => ({ titulo: d })), tamTitulo: 1.9, antes: 2.2 },
  ];
  const w = LARG - 2 * m;
  const h = medirPilha(blocos, w, avisos).h;
  const y = ALT - 4.6 - h;
  els.push(ret(0, y - 3.6, LARG, ALT - y + 3.6, "rgba(24,22,20,.88)"));
  els.push(...gerarPilha(blocos, { x: m, y, w, h }, avisos));
  return { tipo: "pagina", fundo: COR.preto, els };
}

function montarContracapa(R) {
  const c = R.contracapa;
  const els = [ret(0, 0, LARG, ALT, COR.vermelho)];
  const m = 8;
  const w = LARG - 2 * m;
  const tf = caberPalavra(c.texto, 4.4, w);
  const lf = quebrar(c.texto, display(tf), w);
  const ef = entrelinhaSegura(lf, display(tf), w, "centro");
  const hf = lf.length * ef.alt;
  const y = (ALT - (3 + hf)) / 2;
  els.push(ret(LARG / 2 - 6, y, 12, 0.5, COR.preto));
  els.push(txt(m, y + 3, lf, ef, COR.preto, "centro", w));
  els.push(txt(m, ALT - 9, linhaUnica(R.edicao.toUpperCase()), E.rotulo, COR.creme, "centro", w));
  return { tipo: "pagina", fundo: COR.vermelho, els };
}

// ---------- Montagem da revista ----------

export function diagramar(R) {
  // o espelho de dados.js tem as páginas de dentro; "fontes" ocupa várias páginas
  const plano = [{ modelo: "capa" }];
  for (const p of R.paginas) {
    if (p.modelo === "fontes") {
      for (let i = 0; i < (p.paginas ?? 2); i++) plano.push({ ...p, parte: i, sumario: i ? null : p.sumario });
    }
    else plano.push(p);
  }
  // o total tem de ser par: a contracapa é a última página, no verso da última folha
  if ((plano.length + 1) % 2) plano.push({ modelo: "vazia" });
  plano.push({ modelo: "contracapa" });

  const entradas = [];
  plano.forEach((p, i) => {
    if (p.sumario) entradas.push({ ...p.sumario, pagina: i + 1 });
  });

  const pags = plano.map((p, i) => ({ numero: i + 1, lado: (i + 1) % 2 === 1 ? "dir" : "esq", avisos: [] }));
  let fontes = null;
  const paginas = plano.map((p, i) => {
    const pag = pags[i];
    switch (p.modelo) {
      case "capa": return montarCapa(R);
      case "contracapa": return montarContracapa(R);
      case "vazia": return { tipo: "pagina", els: [] };
      case "sumario": return { tipo: "pagina", ...sumario(p, pag, R, entradas) };
      case "abertura": return { tipo: "pagina", ...abertura(p, pag) };
      case "materia": return { tipo: "pagina", ...materia(p, pag) };
      case "fontes": {
        if (!fontes) fontes = paginasFontes(R.fontes, pags.slice(i, i + (p.paginas ?? 2)));
        return { tipo: "pagina", ...fontes[p.parte] };
      }
      default:
        pag.avisos.push(`modelo desconhecido: ${p.modelo}`);
        return { tipo: "pagina", els: [] };
    }
  });

  pags.forEach((pag) => pag.avisos.forEach((a) => console.warn(`[diagramação] página ${pag.numero}: ${a}`)));
  if (paginas.length > MAX_PAGINAS) {
    console.warn(`[diagramação] a revista tem ${paginas.length} páginas; o limite é ${MAX_PAGINAS}`);
  }
  console.info(`[diagramação] ${paginas.length} páginas, ${paginas.length / 2} folhas`);
  return paginas;
}
