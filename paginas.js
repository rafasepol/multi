// Desenha cada página da revista num <canvas> 2D.
// Esse canvas vira a textura da folha no WebGL.
// Também devolve os "links" clicáveis (sumário e endereços das fontes) em coordenadas 0–1.
//
// O desenho usa a unidade de projeto u da diagramação: a página tem 80u × 100u e fica
// centralizada na textura (sobra margem de papel quando a janela é mais larga que isso).
// As linhas já chegam quebradas e posicionadas de diagramacao.js.

import {
  LARG, ALT, SERIF, SANS, ESTILO, MARCA, MARCA_FOLGA,
  MARGEM_DENTRO, MARGEM_FORA, LARG_TEXTO, GRAF_ROTULO, GRAF_BARRA, GRAF_ESPESSURA, PARTE_MARGEM,
  cssFonte, estiloMarca, baseLinha,
} from "./diagramacao.js";
import { desenharPaginaPdf } from "./pdfpaginas.js";

const PAPEL = "#fbf8f2";
const TINTA = "#1d1d1f";
const TINTA_SUAVE = "#5b5b60";
const DESTAQUE = "#c8553d";

export async function carregarFontes() {
  const carregadas = Promise.all([
    document.fonts.load(`800 40px ${SERIF}`),
    document.fonts.load(`600 40px ${SERIF}`),
    document.fonts.load(`italic 600 40px ${SERIF}`),
    document.fonts.load(`400 20px ${SANS}`),
    document.fonts.load(`600 20px ${SANS}`),
  ]).catch(() => {});
  // rede lenta ou sem internet: depois de 5 s segue com as fontes do sistema
  await Promise.race([carregadas, new Promise((ok) => setTimeout(ok, 5000))]);
}

// ---------- Texto livre (capa, sumário, contracapa) ----------

// Quebra um texto em linhas que cabem na largura
function linhas(ctx, texto, largura) {
  const palavras = texto.split(" ");
  const out = [];
  let linha = "";
  for (const p of palavras) {
    const teste = linha ? `${linha} ${p}` : p;
    if (ctx.measureText(teste).width > largura && linha) {
      out.push(linha);
      linha = p;
    } else {
      linha = teste;
    }
  }
  if (linha) out.push(linha);
  return out;
}

function escrever(ctx, texto, x, y, largura, alturaLinha) {
  for (const l of linhas(ctx, texto, largura)) {
    ctx.fillText(l, x, y);
    y += alturaLinha;
  }
  return y;
}

function fonte(ctx, peso, tamanho, familia, espacamento = 0) {
  ctx.font = `${peso} ${tamanho}px ${familia}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${espacamento}px`;
}

function fundoColorido(ctx, w, h, cor) {
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, w, h);
  let g = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, h * 0.45);
  g.addColorStop(0, "rgba(255,255,255,.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.4, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,.3)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function rotuloSecao(ctx, texto, x, y, u, cor = DESTAQUE) {
  fonte(ctx, 600, 1.8 * u, SANS, 0.3 * u);
  ctx.fillStyle = cor;
  ctx.fillText(texto.toUpperCase(), x, y);
}

function numeroPagina(ctx, numero, u, lado, cor = TINTA_SUAVE) {
  fonte(ctx, 400, 1.8 * u, SANS, 0.1 * u);
  ctx.fillStyle = cor;
  ctx.textAlign = lado === "dir" ? "right" : "left";
  ctx.fillText(String(numero), (lado === "dir" ? LARG - MARGEM_FORA : MARGEM_FORA) * u, (ALT - 4) * u);
  ctx.textAlign = "left";
}

// ---------- Texto diagramado (páginas de leitura) ----------

// Uma linha já quebrada: trechos comuns e marcadores de fonte [n]
function trechos(ctx, linha, x, yBase, est, esc, u, cor) {
  for (const r of linha) {
    if (r.m) {
      const m = estiloMarca(est);
      ctx.font = cssFonte(m, m.tam * esc * MARCA * u);
      ctx.fillStyle = DESTAQUE;
      x += MARCA_FOLGA * esc * u;
      ctx.fillText(r.t, x, yBase - est.tam * esc * 0.3 * u);
    } else {
      ctx.font = cssFonte(est, est.tam * esc * u);
      ctx.fillStyle = cor;
      ctx.fillText(r.t, x, yBase);
    }
    x += ctx.measureText(r.t).width;
  }
}

// y e x em u (dentro da página); desenha uma lista de linhas
function linhasTexto(ctx, lista, x, y, est, esc, u, cor) {
  const alt = est.alt * esc;
  const base = baseLinha(est, esc);
  lista.forEach((l, i) => trechos(ctx, l, x * u, (y + i * alt + base) * u, est, esc, u, cor));
}

function cabecalho(ctx, rotulo, x0, u) {
  fonte(ctx, 600, 1.5 * u, SANS, 0.25 * u);
  ctx.fillStyle = DESTAQUE;
  ctx.fillText(rotulo.toUpperCase(), x0 * u, 8 * u);
  ctx.fillStyle = "rgba(0,0,0,.12)";
  ctx.fillRect(x0 * u, 9.6 * u, LARG_TEXTO * u, Math.max(1, 0.15 * u));
}

function desenharItem(ctx, it, x0, u, aoLink) {
  const e = it.esc;
  switch (it.k) {
    case "titulo":
    case "inter":
    case "p":
    case "assinatura":
      linhasTexto(ctx, it.linhas, x0, it.y, ESTILO[it.est], e, u, TINTA);
      break;

    case "parte": {
      // bloco colorido: número, título e linha fina da parte
      const X = x0 * u;
      const Y = it.y * u;
      const Wd = LARG_TEXTO * u;
      const Hh = it.h * u;
      ctx.fillStyle = it.cor;
      ctx.fillRect(X, Y, Wd, Hh);
      let g = ctx.createRadialGradient(X + Wd * 0.85, Y, 0, X + Wd * 0.85, Y, Hh * 1.1);
      g.addColorStop(0, "rgba(255,255,255,.2)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(X, Y, Wd, Hh);
      g = ctx.createLinearGradient(0, Y, 0, Y + Hh);
      g.addColorStop(0.4, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,.28)");
      ctx.fillStyle = g;
      ctx.fillRect(X, Y, Wd, Hh);

      const xt = x0 + PARTE_MARGEM;
      const eN = ESTILO.parteNumero;
      const eT = ESTILO.parteTitulo;
      const eF = ESTILO.parteFina;
      ctx.font = cssFonte(eN, eN.tam * u);
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.fillText(String(it.numero).padStart(2, "0"), xt * u, (it.y + it.yNumero + baseLinha(eN, 1)) * u);
      linhasTexto(ctx, it.titulo, xt, it.y + it.yTitulo, eT, it.escTitulo, u, "#fff");
      linhasTexto(ctx, it.fina, xt, it.y + it.yFina, eF, 1, u, "rgba(255,255,255,.92)");
      break;
    }

    case "nota": {
      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.fillRect(x0 * u, it.y * u, Math.max(1, 0.25 * u * e), it.h * u);
      linhasTexto(ctx, it.linhas, x0 + it.recuo, it.y, ESTILO.nota, e, u, TINTA_SUAVE);
      break;
    }

    case "citacao": {
      ctx.font = cssFonte({ fam: SERIF, peso: 800 }, 9 * e * u);
      ctx.fillStyle = DESTAQUE;
      ctx.fillText("“", x0 * u, (it.y + 6.8 * e) * u);
      linhasTexto(ctx, it.linhasQ, x0 + it.recuo, it.y + it.yQ, ESTILO.citacao, e, u, TINTA);
      linhasTexto(ctx, it.linhasA, x0 + it.recuo, it.y + it.yA, ESTILO.autor, e, u, DESTAQUE);
      linhasTexto(ctx, it.linhasC, x0 + it.recuo, it.y + it.yC, ESTILO.nota, e, u, TINTA_SUAVE);
      break;
    }

    case "imagem": {
      const px = x0 * u;
      const py = it.y * u;
      const larg = LARG_TEXTO * u;
      const alt = it.alturaFoto * u;
      const foto = imagensRevista.get(it.src);
      ctx.fillStyle = "#e9e5dc";
      ctx.fillRect(px, py, larg, alt);
      if (foto && foto.complete && foto.naturalWidth) {
        const escala = Math.max(larg / foto.naturalWidth, alt / foto.naturalHeight);
        const sw = larg / escala, sh = alt / escala;
        ctx.drawImage(foto, (foto.naturalWidth - sw) / 2, (foto.naturalHeight - sh) / 2, sw, sh, px, py, larg, alt);
      }
      linhasTexto(ctx, it.legenda, x0, it.y + it.alturaFoto + 1.4 * e, ESTILO.nota, e, u, TINTA_SUAVE);
      break;
    }

    case "grafico": {
      linhasTexto(ctx, it.titulo, x0, it.y, ESTILO.grafTitulo, e, u, TINTA);
      const xEixo = x0 + GRAF_ROTULO * e;
      const est = ESTILO.grafRotulo;
      const altR = est.alt * e;
      for (const b of it.barras) {
        const topo = it.y + b.y;
        // rótulo encostado no eixo, centralizado na altura da barra
        ctx.font = cssFonte(est, est.tam * e * u);
        ctx.fillStyle = TINTA;
        ctx.textAlign = "right";
        const y0 = topo + (b.h - b.linhas.length * altR) / 2;
        b.linhas.forEach((l, i) => {
          const yBase = (y0 + i * altR + baseLinha(est, e)) * u;
          ctx.fillText(l.map((r) => r.t).join(""), (xEixo - 1) * u, yBase);
        });
        ctx.textAlign = "left";
        // barra e valor
        const larg = Math.max(b.frac * GRAF_BARRA * e, 0.2);
        const esp = GRAF_ESPESSURA * e;
        ctx.fillStyle = it.cor;
        ctx.fillRect(xEixo * u, (topo + (b.h - esp) / 2) * u, larg * u, esp * u);
        ctx.font = cssFonte({ fam: SANS, peso: 600 }, 1.7 * e * u);
        ctx.fillStyle = TINTA;
        ctx.fillText(b.texto, (xEixo + larg + 1 * e) * u, (topo + b.h / 2 + 0.6 * e) * u);
      }
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(xEixo * u, (it.y + it.yBarras) * u, Math.max(1, 0.15 * u), (it.yFim - it.yBarras) * u);
      linhasTexto(ctx, it.eixo, xEixo, it.y + it.yEixo, ESTILO.grafEixo, e, u, TINTA_SUAVE);
      linhasTexto(ctx, it.legenda, x0, it.y + it.yLegenda, ESTILO.nota, e, u, TINTA_SUAVE);
      break;
    }

    case "fonte": {
      const est = ESTILO.fonte;
      ctx.font = cssFonte({ fam: SANS, peso: 600 }, est.tam * e * u);
      ctx.fillStyle = DESTAQUE;
      ctx.fillText(`[${it.n}]`, x0 * u, (it.y + baseLinha(est, e)) * u);
      linhasTexto(ctx, it.linhasT, x0 + it.recuo, it.y, est, e, u, TINTA);
      linhasTexto(ctx, it.linhasU, x0 + it.recuo, it.y + it.yU, ESTILO.url, e, u, TINTA_SUAVE);
      aoLink({ x: x0 + it.recuo, y: it.y, larg: LARG_TEXTO - it.recuo, alt: it.h, url: it.url });
      break;
    }
  }
}

// ---------- Página ----------

const imagensRevista = new Map();

function carregarImagem(src) {
  if (imagensRevista.has(src)) return Promise.resolve(imagensRevista.get(src));
  return new Promise((resolve) => {
    const foto = new Image();
    foto.onload = () => { imagensRevista.set(src, foto); resolve(foto); };
    foto.onerror = () => resolve(null);
    foto.src = src;
  });
}

export function desenharPagina(p, numero, w, h, revista) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "alphabetic";

  // página vinda de um PDF: a imagem é carregada depois; `pronto` avisa quando terminou
  if (p.tipo === "pdf") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    const links = [];
    return { canvas, links, pronto: desenharPaginaPdf(p, canvas, links) };
  }

  const u = Math.min(w / LARG, h / ALT); // unidade de projeto, em pixels
  const ox = (w - LARG * u) / 2; // a página de projeto fica centralizada na textura
  const oy = (h - ALT * u) / 2;
  const lado = numero % 2 === 1 ? "dir" : "esq";
  const x0 = lado === "dir" ? MARGEM_DENTRO : MARGEM_FORA; // início do texto, em u
  const links = [];
  // `ret` em u, dentro da página de projeto -> coordenadas 0–1 da textura
  const aoLink = ({ x, y, larg, alt, ...resto }) =>
    links.push({
      x0: (ox + x * u) / w,
      y0: (oy + y * u) / h,
      x1: (ox + (x + larg) * u) / w,
      y1: (oy + (y + alt) * u) / h,
      ...resto,
    });

  ctx.fillStyle = PAPEL;
  ctx.fillRect(0, 0, w, h);

  // fundos de página inteira vão antes de deslocar para a página de projeto
  if (p.tipo === "capa" || p.tipo === "contracapa") {
    fundoColorido(ctx, w, h, p.cor);
  }
  ctx.save();
  ctx.translate(ox, oy);

  switch (p.tipo) {
    case "capa": {
      const pad = 7 * u;
      const larg = (LARG - 14) * u;
      ctx.fillStyle = "#fff";
      fonte(ctx, 800, 11 * u, SERIF, -0.2 * u);
      ctx.fillText(p.titulo, pad, pad + 9 * u);
      fonte(ctx, 600, 1.8 * u, SANS, 0.3 * u);
      ctx.globalAlpha = 0.8;
      ctx.fillText(p.edicao.toUpperCase(), pad, pad + 13 * u);
      ctx.globalAlpha = 1;

      // bloco de baixo, montado de baixo para cima
      let y = ALT * u - 9 * u;
      fonte(ctx, 600, 2 * u, SANS, 0.12 * u);
      for (const d of [...p.destaques].reverse()) {
        ctx.fillText(`— ${d.toUpperCase()}`, pad, y);
        y -= 3.2 * u;
      }
      y -= 2 * u;
      fonte(ctx, 400, 2.4 * u, SANS);
      const sub = linhas(ctx, p.subtitulo, larg);
      y -= (sub.length - 1) * 3.4 * u;
      escrever(ctx, p.subtitulo, pad, y, larg, 3.4 * u);
      y -= 4.5 * u;
      fonte(ctx, 600, 6.5 * u, SERIF);
      const tit = linhas(ctx, p.chamada, larg);
      y -= (tit.length - 1) * 7.2 * u;
      escrever(ctx, p.chamada, pad, y, larg, 7.2 * u);
      break;
    }

    case "sumario": {
      const x = x0 * u;
      rotuloSecao(ctx, revista.titulo, x, 8 * u, u);
      fonte(ctx, 600, 7 * u, SERIF);
      ctx.fillStyle = TINTA;
      ctx.fillText(p.titulo, x, 19.5 * u);
      let y = 30 * u;
      for (const item of p.itens) {
        const topo = y - 4.2 * u;
        fonte(ctx, 600, 4.4 * u, SERIF);
        ctx.fillStyle = DESTAQUE;
        ctx.fillText(String(item.pagina).padStart(2, "0"), x, y + 1 * u);
        fonte(ctx, 600, 2.6 * u, SANS);
        ctx.fillStyle = TINTA;
        ctx.fillText(item.titulo, x + 9.5 * u, y - 0.6 * u);
        if (item.sub) {
          fonte(ctx, 400, 1.7 * u, SANS);
          ctx.fillStyle = TINTA_SUAVE;
          ctx.fillText(item.sub, x + 9.5 * u, y + 2.4 * u);
        }
        y += 5.2 * u;
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(x, y, LARG_TEXTO * u, Math.max(1, 0.15 * u));
        aoLink({ x: x0, y: topo / u, larg: LARG_TEXTO, alt: (y - topo) / u, ir: item.pagina });
        y += 4.4 * u;
      }
      // expediente no pé da página
      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(x, 80.5 * u, LARG_TEXTO * u, Math.max(1, 0.15 * u));
      rotuloSecao(ctx, "Expediente", x, 84 * u, u);
      fonte(ctx, 400, 1.6 * u, SANS);
      ctx.fillStyle = TINTA;
      const yFim = escrever(ctx, p.expediente, x, 87.4 * u, LARG_TEXTO * u * 0.97, 2.6 * u);
      fonte(ctx, 400, 1.4 * u, SANS, 0.1 * u);
      ctx.fillStyle = TINTA_SUAVE;
      ctx.fillText(p.edicao, x, yFim + 0.8 * u);
      numeroPagina(ctx, numero, u, lado);
      break;
    }

    case "texto": {
      cabecalho(ctx, p.rotulo, x0, u);
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      for (const it of p.itens) desenharItem(ctx, it, x0, u, aoLink);
      numeroPagina(ctx, numero, u, lado);
      break;
    }

    case "contracapa": {
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      fonte(ctx, 800, 8 * u, SERIF);
      ctx.fillText(p.titulo, (LARG / 2) * u, (ALT / 2) * u);
      fonte(ctx, 400, 2.4 * u, SANS);
      ctx.globalAlpha = 0.85;
      escrever(ctx, p.texto, (LARG / 2) * u, (ALT / 2 + 6) * u, 52 * u, 3.4 * u);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      break;
    }
  }

  ctx.restore();
  if (p.tipo === "texto") {
    const pendentes = p.itens.filter(it => it.k === "imagem" && !imagensRevista.has(it.src));
    if (pendentes.length) {
      const pronto = Promise.all(pendentes.map(it => carregarImagem(it.src))).then(() => {
        ctx.save();
        ctx.translate(ox, oy);
        for (const it of p.itens.filter(it => it.k === "imagem")) desenharItem(ctx, it, x0, u, () => {});
        ctx.restore();
      });
      return { canvas, links, pronto };
    }
  }
  return { canvas, links };
}