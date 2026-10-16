// Diagramação: reparte o conteúdo de dados.js em páginas.
//
// Tudo é medido numa unidade de projeto "u": a página tem LARG × ALT = 80u × 100u.
// Como a medida não depende do tamanho da janela, as quebras de linha e o número de
// páginas são sempre os mesmos; paginas.js só redesenha em escala.
//
// Devolve a lista de páginas no formato que script.js e paginas.js esperam:
//   capa | sumario | texto | vazia | contracapa
// Os itens das páginas de texto já vêm com as linhas quebradas e a posição (y) em u.
// O título de cada parte é um bloco colorido no topo da sua primeira página de texto.

export const LARG = 80;
export const ALT = 100;

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = '"Inter", system-ui, sans-serif';

// A margem de dentro (lombada) é maior que a de fora
export const MARGEM_DENTRO = 10;
export const MARGEM_FORA = 6;
export const LARG_TEXTO = LARG - MARGEM_DENTRO - MARGEM_FORA;
export const TOPO = 14; // onde o texto começa (abaixo do cabeçalho corrido)
export const BASE = 89; // até onde o texto desce (acima do número da página)

// Estilos do texto: tam = tamanho da letra, alt = altura da linha (ambos em u)
export const ESTILO = {
  corpo: { fam: SANS, peso: 400, tam: 1.7, alt: 2.9 },
  titulo: { fam: SERIF, peso: 600, tam: 5.5, alt: 6.3 },
  parteNumero: { fam: SERIF, peso: 800, tam: 4.2, alt: 5 },
  parteTitulo: { fam: SERIF, peso: 600, tam: 6.5, alt: 7.2 },
  parteFina: { fam: SANS, peso: 400, tam: 2.1, alt: 3.3 },
  inter: { fam: SERIF, peso: 600, tam: 3.3, alt: 4.2 },
  assinatura: { fam: SERIF, peso: 600, tam: 2.6, alt: 3.6, italico: true },
  citacao: { fam: SERIF, peso: 600, tam: 3.0, alt: 4.2, italico: true },
  autor: { fam: SANS, peso: 600, tam: 1.7, alt: 2.6 },
  nota: { fam: SANS, peso: 400, tam: 1.5, alt: 2.5, italico: true },
  grafTitulo: { fam: SANS, peso: 600, tam: 1.9, alt: 2.8 },
  grafRotulo: { fam: SANS, peso: 400, tam: 1.55, alt: 2.4 },
  grafEixo: { fam: SANS, peso: 400, tam: 1.4, alt: 2.2 },
  fonte: { fam: SANS, peso: 400, tam: 1.6, alt: 2.6 },
  url: { fam: SANS, peso: 400, tam: 1.3, alt: 2.1 },
};

// Marcadores de fonte como [1; 2]: menores, ligeiramente elevados
export const MARCA = 0.72;
export const MARCA_FOLGA = 0.3;

// Larguras fixas do gráfico (u)
export const GRAF_ROTULO = 22; // coluna dos rótulos, à esquerda
export const GRAF_BARRA = 30;  // comprimento de uma barra que chega ao fim do eixo
export const GRAF_ESPESSURA = 2.6; // altura de uma barra

// Espaço antes e depois de cada tipo de item (u, multiplicado pela escala da seção)
const ESPACO = {
  titulo: [0, 3.2],
  parte: [0, 0.4], // o intertítulo que vem depois já tem espaço antes
  p: [0, 1.5],
  inter: [3.6, 1.2],
  assinatura: [2.6, 0],
  nota: [0.4, 2.6],
  citacao: [2.4, 3.4],
  grafico: [2.6, 3.6],
  fonte: [0, 1.4],
};

const CITACAO_RECUO = 7;
const NOTA_RECUO = 2.4;
const FONTE_RECUO = 6.5;

// o desenho final pode medir um pouco diferente da medida; essa sobra evita estourar a margem
const FOLGA = 0.97;

export function cssFonte(est, tamPx) {
  return `${est.italico ? "italic " : ""}${est.peso} ${tamPx}px ${est.fam}`;
}

export function estiloMarca(est) {
  return { ...est, peso: 600, italico: false };
}

// distância do topo da linha até a linha de base do texto
export function baseLinha(est, esc = 1) {
  return ((est.alt - est.tam) / 2 + est.tam * 0.78) * esc;
}

// ---------- Medição ----------

const K = 11; // 1u = 11 px no canvas de medida
let medidor = null;
let fonteDoMedidor = "";

function largura(texto, est, esc = 1) {
  if (!medidor) medidor = document.createElement("canvas").getContext("2d");
  const f = cssFonte(est, est.tam * esc * K);
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
      for (const s of parte.split(/(\s+)/)) {
        if (!s) continue;
        if (/^\s+$/.test(s)) tok = null;
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

// Quebra um texto sem espaços (endereços) em linhas que cabem em `larg`
function quebrarPorCaractere(texto, est, esc, larg) {
  const linhas = [];
  let atual = "";
  for (const ch of texto) {
    if (atual && largura(atual + ch, est, esc) > larg) {
      linhas.push(atual);
      atual = "";
    }
    atual += ch;
  }
  linhas.push(atual);
  return linhas;
}

// Quebra `texto` em linhas de até `larg` (u). Cada linha é uma lista de trechos {t, m}.
function quebrar(texto, nomeEst, esc, larg) {
  const est = ESTILO[nomeEst];
  const max = larg * FOLGA;
  const espaco = largura(" ", est, esc);
  const marca = estiloMarca(est);
  const larguraParte = (p) =>
    p.m ? MARCA_FOLGA * esc + largura(p.t, marca, esc * MARCA) : largura(p.t, est, esc);

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
    if (tw > max && tok.length === 1 && !tok[0].m) {
      // palavra mais larga que a linha (endereço): quebra por caractere
      fechar();
      const pedacos = quebrarPorCaractere(tok[0].t, est, esc, max);
      for (const t of pedacos.slice(0, -1)) linhas.push([{ t, m: false }]);
      const ult = pedacos[pedacos.length - 1];
      linha = [[{ t: ult, m: false }]];
      w = largura(ult, est, esc);
      continue;
    }
    if (linha.length && w + espaco + tw > max) fechar();
    w += (linha.length ? espaco : 0) + tw;
    linha.push(tok);
  }
  fechar();
  return linhas;
}

// ---------- Itens (o que vai dentro de uma página de texto) ----------

function espaco(k, esc) {
  const [antes, depois] = ESPACO[k];
  return { antes: antes * esc, depois: depois * esc };
}

// título, intertítulo, parágrafo (p, no estilo "corpo"), assinatura
function itemTexto(k, texto, esc, nomeEst = k) {
  const est = ESTILO[nomeEst];
  const linhas = quebrar(texto, nomeEst, esc, LARG_TEXTO);
  return { k, est: nomeEst, esc, linhas, alt: est.alt * esc, h: linhas.length * est.alt * esc, ...espaco(k, esc) };
}

// bloco colorido com o número e o título da parte, no topo da primeira página de texto
export const PARTE_MARGEM = 3.5; // espaço interno do bloco (u)

function itemParte(parte) {
  const interno = LARG_TEXTO - 2 * PARTE_MARGEM;
  // reduz a letra do título se uma palavra não couber na largura do bloco
  const maior = parte.titulo.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");
  let escTitulo = 1;
  while (escTitulo > 0.5 && largura(maior, ESTILO.parteTitulo, escTitulo) > interno * FOLGA) escTitulo -= 0.05;
  const titulo = quebrar(parte.titulo, "parteTitulo", escTitulo, interno);
  const fina = quebrar(parte.linhaFina, "parteFina", 1, interno);
  const eN = ESTILO.parteNumero;
  const eT = ESTILO.parteTitulo;
  const eF = ESTILO.parteFina;
  let y = PARTE_MARGEM;
  const yNumero = y;
  y += eN.alt + 0.8;
  const yTitulo = y;
  y += titulo.length * eT.alt * escTitulo + 1.2;
  const yFina = y;
  y += fina.length * eF.alt + PARTE_MARGEM;
  return {
    k: "parte",
    esc: 1,
    escTitulo,
    numero: parte.numero,
    cor: parte.cor,
    titulo,
    fina,
    yNumero,
    yTitulo,
    yFina,
    h: y,
    ...espaco("parte", 1),
  };
}

function itemNota(texto, esc) {
  const est = ESTILO.nota;
  const recuo = NOTA_RECUO * esc;
  const linhas = quebrar(texto, "nota", esc, LARG_TEXTO - recuo);
  return { k: "nota", esc, recuo, linhas, alt: est.alt * esc, h: linhas.length * est.alt * esc, ...espaco("nota", esc) };
}

// olho: aspas grandes, a fala, quem falou e o crédito da reportagem
function itemCitacao(b, esc) {
  const recuo = CITACAO_RECUO * esc;
  const lw = LARG_TEXTO - recuo;
  const linhasQ = quebrar(b.texto, "citacao", esc, lw);
  const linhasA = quebrar(b.autor, "autor", esc, lw);
  const linhasC = quebrar(b.credito, "nota", esc, lw);
  let y = 0.8 * esc;
  const yQ = y;
  y += linhasQ.length * ESTILO.citacao.alt * esc + 1.2 * esc;
  const yA = y;
  y += linhasA.length * ESTILO.autor.alt * esc + 0.6 * esc;
  const yC = y;
  y += linhasC.length * ESTILO.nota.alt * esc;
  return { k: "citacao", flutua: true, esc, recuo, linhasQ, linhasA, linhasC, yQ, yA, yC, h: y + 0.4 * esc, ...espaco("citacao", esc) };
}

function itemGrafico(b, esc, cor) {
  const titulo = quebrar(b.titulo, "grafTitulo", esc, LARG_TEXTO);
  const alt = ESTILO.grafRotulo.alt * esc;
  let y = titulo.length * ESTILO.grafTitulo.alt * esc + 1.6 * esc;
  const yBarras = y;
  const barras = b.barras.map(([rotulo, valor, texto]) => {
    const linhas = quebrar(rotulo, "grafRotulo", esc, (GRAF_ROTULO - 1) * esc);
    const h = Math.max(4.4 * esc, linhas.length * alt + 1.4 * esc);
    const barra = { linhas, texto, frac: Math.min(1, valor / b.max), y, h };
    y += h;
    return barra;
  });
  const yFim = y;
  y += 0.8 * esc;
  const yEixo = y;
  const eixo = quebrar(b.eixo, "grafEixo", esc, LARG_TEXTO - GRAF_ROTULO * esc - 1);
  y += eixo.length * ESTILO.grafEixo.alt * esc + 2 * esc;
  const yLegenda = y;
  const legenda = quebrar(b.legenda, "nota", esc, LARG_TEXTO);
  y += legenda.length * ESTILO.nota.alt * esc;
  return { k: "grafico", flutua: true, esc, cor, titulo, barras, yBarras, yFim, yEixo, eixo, yLegenda, legenda, h: y, ...espaco("grafico", esc) };
}

// fonte da lista: número, texto e endereço (clicável)
function itemFonte(f, esc) {
  const recuo = FONTE_RECUO * esc;
  const lw = LARG_TEXTO - recuo;
  const linhasT = quebrar(f.texto, "fonte", esc, lw);
  const linhasU = quebrarPorCaractere(f.url, ESTILO.url, esc, lw * FOLGA).map((t) => [{ t, m: false }]);
  const yU = linhasT.length * ESTILO.fonte.alt * esc + 0.5 * esc;
  const h = yU + linhasU.length * ESTILO.url.alt * esc;
  return { k: "fonte", esc, n: f.n, recuo, linhasT, linhasU, yU, url: f.url, h, ...espaco("fonte", esc) };
}

// ---------- Fluxo: espalha os itens pelas páginas ----------

// Regras: parágrafos quebram entre páginas por linha (nunca deixando 1 linha sozinha);
// intertítulo nunca fica no pé da página sem texto depois; gráficos e olhos não
// quebram: se não cabem, vão para o topo da próxima página e o texto continua
// preenchendo a atual.
function fluir(itens, cfg) {
  const paginas = [];
  let pag = null;
  let y = TOPO;
  let adiados = [];

  const cabe = (it) => y + (y > TOPO ? it.antes : 0) + it.h <= BASE + 1e-6;
  const colocar = (it) => {
    if (y > TOPO) y += it.antes;
    it.y = y;
    y += it.h + it.depois;
    pag.itens.push(it);
    if (it.y + it.h > BASE + 0.5) console.warn(`[diagramação] item "${it.k}" passa da base da página (${cfg.rotulo})`);
  };
  const novaPagina = () => {
    pag = { tipo: "texto", rotulo: cfg.rotulo, cor: cfg.cor, itens: [] };
    paginas.push(pag);
    y = TOPO;
    const resto = [];
    for (const it of adiados) {
      if (y === TOPO || cabe(it)) colocar(it);
      else resto.push(it);
    }
    adiados = resto;
  };
  // pedaço de um parágrafo (só o último pedaço leva o espaço depois)
  const pedaco = (it, linhas, ultimo) => ({
    ...it,
    linhas,
    h: linhas.length * it.alt,
    depois: ultimo ? it.depois : 0,
  });

  novaPagina();
  itens.forEach((it, i) => {
    if (it.k === "p") {
      let linhas = it.linhas;
      while (linhas.length) {
        const livre = Math.floor((BASE - y + 1e-6) / it.alt);
        if (linhas.length <= livre) {
          colocar(pedaco(it, linhas, true));
          break;
        }
        let n = livre;
        if (linhas.length - n < 2) n = linhas.length - 2; // sem linha viúva
        if (n < 2) {
          if (y === TOPO) {
            colocar(pedaco(it, linhas, true)); // página vazia: não há o que fazer
            break;
          }
          novaPagina();
          continue;
        }
        colocar(pedaco(it, linhas.slice(0, n), false));
        linhas = linhas.slice(n);
        novaPagina();
      }
    } else if (it.flutua) {
      if (y === TOPO || cabe(it)) colocar(it);
      else adiados.push(it);
    } else {
      if (it.k === "inter") {
        // o intertítulo leva junto pelo menos 2 linhas do texto seguinte
        const prox = itens[i + 1];
        const resto = prox && prox.k === "p" ? Math.min(2, prox.linhas.length) * prox.alt : 0;
        if (y > TOPO && y + it.antes + it.h + it.depois + resto > BASE + 1e-6) novaPagina();
      } else if (y > TOPO && !cabe(it)) {
        novaPagina();
      }
      colocar(it);
    }
  });
  while (adiados.length) novaPagina();
  return paginas;
}

// Fluxo para uma seção que deve caber numa página só (editorial): reduz a letra até caber
function fluirCaber(montar, cfg) {
  let paginas;
  for (let esc = 1; esc >= 0.78; esc -= 0.04) {
    paginas = fluir(montar(esc), cfg);
    if (paginas.length === 1) break;
  }
  return paginas;
}

// ---------- Montagem da revista ----------

const ESCALA_FONTES = 0.85; // lista de fontes e notas em letra menor

function itensDaParte(parte, esc) {
  return parte.blocos.map((b) => {
    switch (b.t) {
      case "inter": return itemTexto("inter", b.texto, esc);
      case "p": return itemTexto("p", b.texto, esc, "corpo");
      case "nota": return itemNota(b.texto, esc);
      case "citacao": return itemCitacao(b, esc);
      case "grafico": return itemGrafico(b, esc, parte.cor);
      default:
        console.warn(`[diagramação] bloco desconhecido: ${b.t}`);
        return null;
    }
  }).filter(Boolean);
}

function itensDeFontes(f) {
  const e = ESCALA_FONTES;
  const out = [itemTexto("titulo", f.titulo, 1)];
  if (f.intro) out.push(itemTexto("p", f.intro, e, "corpo"));
  for (const it of f.itens) out.push(itemFonte(it, e));
  for (const n of f.notas) {
    out.push(itemTexto("inter", n.titulo, e));
    for (const t of n.texto) out.push(itemTexto("p", t, e, "corpo"));
  }
  return out;
}

// capa e contracapa: páginas desenhadas à parte, sem texto corrido
// (o modo PDF de script.js também usa as duas, em volta das páginas do PDF)
export function paginaCapa(R) {
  return {
    tipo: "capa",
    titulo: R.titulo,
    edicao: R.edicao,
    chamada: R.capa.chamada,
    subtitulo: R.capa.subtitulo,
    destaques: R.capa.destaques,
    cor: R.capa.cor,
  };
}

export function paginaContracapa(R) {
  return { tipo: "contracapa", titulo: R.titulo, texto: R.contracapa.texto, cor: R.contracapa.cor };
}

export function diagramar(R) {
  const pags = [];
  const inicios = []; // { pagina, titulo, sub } para o sumário

  // 1 — capa
  pags.push(paginaCapa(R));

  // 2 — sumário e expediente (os números de página entram no fim)
  const sumario = { tipo: "sumario", titulo: "Sumário", itens: [], expediente: R.expediente, edicao: R.edicao };
  pags.push(sumario);

  // 3 — editorial (numa página só)
  const ed = R.editorial;
  pags.push(...fluirCaber(
    (esc) => [
      itemTexto("titulo", ed.titulo, esc),
      ...ed.texto.map((t) => itemTexto("p", t, esc, "corpo")),
      itemTexto("assinatura", ed.assinatura, esc),
    ],
    { rotulo: R.titulo, cor: "#c8553d" },
  ));

  // 4+ — as partes: cada uma começa em página nova, com o título no topo
  for (const parte of R.partes) {
    inicios.push({ pagina: pags.length + 1, titulo: parte.titulo, sub: parte.linhaFina });
    pags.push(...fluir(
      [itemParte(parte), ...itensDaParte(parte, 1)],
      { rotulo: `${parte.numero} · ${parte.titulo}`, cor: parte.cor },
    ));
  }

  // fontes e notas
  inicios.push({ pagina: pags.length + 1, titulo: R.fontes.titulo, sub: "" });
  pags.push(...fluir(itensDeFontes(R.fontes), { rotulo: "Fontes e notas", cor: "#c8553d" }));

  // o total tem de ser par: a contracapa é a última página, no verso da última folha
  if (pags.length % 2 === 0) pags.push({ tipo: "vazia" });
  pags.push(paginaContracapa(R));

  sumario.itens = inicios;
  console.info(`[diagramação] ${pags.length} páginas, ${pags.length / 2} folhas`);
  return pags;
}
