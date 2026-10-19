// Desenha cada página da revista num <canvas> 2D.
// Esse canvas vira a textura da folha no WebGL.
// Também devolve os "links" clicáveis (sumário e endereços das fontes) em coordenadas 0–1.
//
// As páginas chegam de diagramacao.js como listas de elementos já posicionados na unidade
// de projeto u (a página tem 80u × 100u). A página de projeto fica centralizada na textura;
// fundos e fotos que encostam na borda da página "sangram" até a borda da textura.

import { LARG, ALT, COR, TAM_MARCA, MARCA_FOLGA, cssFonte, estiloMarca, baseLinha } from "./diagramacao.js";
import { desenharMapaBiomas } from "./mapa-biomas.js";

export async function carregarFontes() {
  const carregadas = Promise.all([
    document.fonts.load(`400 40px "Anton"`),
    document.fonts.load(`400 20px "Inter"`),
    document.fonts.load(`600 20px "Inter"`),
    document.fonts.load(`italic 400 20px "Inter"`),
  ]).catch(() => {});
  // rede lenta ou sem internet: depois de 5 s segue com as fontes do sistema
  await Promise.race([carregadas, new Promise((ok) => setTimeout(ok, 5000))]);
}

// ---------- Fotos ----------

const fotos = new Map(); // src -> { img, ok } depois de carregada (ou de falhar)
const carregando = new Map(); // src -> Promise

function carregarFoto(src) {
  if (!carregando.has(src)) {
    carregando.set(src, new Promise((ok) => {
      const img = new Image();
      img.onload = () => { fotos.set(src, { img, ok: true }); ok(); };
      img.onerror = () => {
        console.warn(`[revista] imagem não encontrada: ${src}`);
        fotos.set(src, { img, ok: false });
        ok();
      };
      img.src = src;
    }));
  }
  return carregando.get(src);
}

// ---------- Elementos ----------

// retângulo em u -> pixels da textura; o que encosta na borda da página sangra
function caixaPx(el, g, sangrar) {
  let x0 = g.ox + el.x * g.u;
  let y0 = g.oy + el.y * g.u;
  let x1 = g.ox + (el.x + el.w) * g.u;
  let y1 = g.oy + (el.y + el.h) * g.u;
  if (sangrar) {
    if (el.x <= 0.01) x0 = 0;
    if (el.y <= 0.01) y0 = 0;
    if (el.x + el.w >= LARG - 0.01) x1 = g.w;
    if (el.y + el.h >= ALT - 0.01) y1 = g.h;
  }
  return { x0, y0, x1, y1 };
}

// uma linha já quebrada: trechos comuns e marcadores de fonte [n]
function trechos(ctx, linha, x, yBase, est, u, cor, corMarca) {
  for (const r of linha) {
    if (r.m) {
      const m = estiloMarca(est);
      ctx.font = cssFonte(m, TAM_MARCA * u);
      ctx.fillStyle = corMarca;
      x += MARCA_FOLGA * u;
      ctx.fillText(r.t, x, yBase - est.tam * 0.3 * u);
    } else {
      ctx.font = cssFonte(est, est.tam * u);
      ctx.fillStyle = cor;
      ctx.fillText(r.t, x, yBase);
    }
    x += ctx.measureText(r.t).width;
  }
}

function estrela(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function desenharFoto(ctx, el, g) {
  const r = caixaPx(el, g, !el.conter);
  const W = r.x1 - r.x0;
  const H = r.y1 - r.y0;
  const reg = fotos.get(el.src);
  if (el.fundo) {
    ctx.fillStyle = el.fundo;
    ctx.fillRect(r.x0, r.y0, W, H);
  }
  if (!reg || !reg.ok) {
    // ainda carregando, ou o arquivo não existe: um bloco no lugar da foto
    ctx.fillStyle = COR.bege;
    ctx.fillRect(r.x0, r.y0, W, H);
    if (reg) {
      ctx.fillStyle = COR.suave;
      ctx.font = `600 ${Math.max(10, 1.4 * g.u)}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`imagem: ${el.src.split("/").pop()}`, (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2);
      ctx.textAlign = "left";
    }
    return;
  }
  const img = reg.img;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  ctx.save();
  if (el.mesclar) ctx.globalCompositeOperation = el.mesclar;
  if (el.filtro) ctx.filter = el.filtro;
  ctx.imageSmoothingQuality = "high";
  if (el.conter) {
    const k = Math.min(W / iw, H / ih);
    const dw = iw * k;
    const dh = ih * k;
    ctx.drawImage(img, r.x0 + (W - dw) / 2, r.y0 + (H - dh) / 2, dw, dh);
  } else {
    // cobre o retângulo inteiro, cortando o que sobra em volta do ponto de foco
    const k = Math.max(W / iw, H / ih);
    const sw = W / k;
    const sh = H / k;
    const [fx, fy] = el.foco ?? [0.5, 0.5];
    ctx.drawImage(img, (iw - sw) * fx, (ih - sh) * fy, sw, sh, r.x0, r.y0, W, H);
  }
  ctx.restore();
}

function desenharElemento(ctx, el, g, links) {
  switch (el.k) {
    case "ret": {
      const r = caixaPx(el, g, true);
      ctx.fillStyle = el.cor;
      ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      break;
    }
    case "foto":
      desenharFoto(ctx, el, g);
      break;
    case "retrato": {
      // círculo bege; com foto, a foto preenche o círculo
      const r = caixaPx(el, g, false);
      const cx = (r.x0 + r.x1) / 2;
      const cy = (r.y0 + r.y1) / 2;
      const raio = (r.x1 - r.x0) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, raio, 0, Math.PI * 2);
      ctx.fillStyle = COR.bege;
      ctx.fill();
      const reg = el.src ? fotos.get(el.src) : null;
      if (reg?.ok) {
        ctx.clip();
        const img = reg.img;
        const k = Math.max((2 * raio) / img.naturalWidth, (2 * raio) / img.naturalHeight);
        const dw = img.naturalWidth * k;
        const dh = img.naturalHeight * k;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      }
      ctx.restore();
      break;
    }
    case "mapaBiomas": {
      const r = caixaPx(el, g, false);
      desenharMapaBiomas(ctx, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      break;
    }
    case "texto": {
      const est = el.est;
      const base = baseLinha(est);
      const corMarca = el.cor === COR.preto || el.cor === COR.suave ? COR.vermelho : el.cor;
      // texto girado (capa): gira em volta do canto de cima à esquerda do bloco
      const ox = g.ox + el.x * g.u;
      const oy = g.oy + el.y * g.u;
      ctx.save();
      ctx.translate(ox, oy);
      if (el.rot) ctx.rotate((el.rot * Math.PI) / 180);
      el.linhas.forEach((l, i) => {
        let x = 0;
        if (el.alinhar === "dir") x += el.w - el.ws[i];
        else if (el.alinhar === "centro") x += (el.w - el.ws[i]) / 2;
        trechos(ctx, l, x * g.u, (i * est.alt + base) * g.u, est, g.u, el.cor, corMarca);
      });
      ctx.restore();
      break;
    }
    case "poli": {
      // polígono em u; pontos na borda da página sangram até a borda da textura
      const px = (x) => (x <= 0.01 ? 0 : x >= LARG - 0.01 ? g.w : g.ox + x * g.u);
      const py = (y) => (y <= 0.01 ? 0 : y >= ALT - 0.01 ? g.h : g.oy + y * g.u);
      ctx.beginPath();
      el.pts.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
      ctx.closePath();
      ctx.fillStyle = el.cor;
      ctx.fill();
      break;
    }
    case "estrela":
      ctx.fillStyle = el.cor;
      estrela(ctx, g.ox + el.x * g.u, g.oy + el.y * g.u, el.r * g.u);
      break;
    case "barra": {
      // gráfico: não desenha nada (a barra é um "ret"); só marca onde o mouse faz a barra subir em 3D
      const n = (x, y, w, h) => ({
        x0: (g.ox + x * g.u) / g.w,
        y0: (g.oy + y * g.u) / g.h,
        x1: (g.ox + (x + w) * g.u) / g.w,
        y1: (g.oy + (y + h) * g.u) / g.h,
      });
      links.push({ ...n(el.x, el.y, el.w, el.h), barra: { ...n(el.bx, el.by, el.bw, el.bh), cor: el.cor } });
      break;
    }
    case "placa": {
      // não desenha nada: marca o pedaço da página que sobe em 3D (script.js)
      const r = caixaPx(el, g, false);
      links.push({ x0: r.x0 / g.w, y0: r.y0 / g.h, x1: r.x1 / g.w, y1: r.y1 / g.h, placa: { redondo: !!el.redondo } });
      break;
    }
    case "link":
      links.push({
        x0: (g.ox + el.x * g.u) / g.w,
        y0: (g.oy + el.y * g.u) / g.h,
        x1: (g.ox + (el.x + el.w) * g.u) / g.w,
        y1: (g.oy + (el.y + el.h) * g.u) / g.h,
        ...(el.url ? { url: el.url } : { ir: el.ir }),
      });
      break;
  }
}

// ---------- Página ----------

export function desenharPagina(p, numero, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "alphabetic";
  const links = [];

  const u = Math.min(w / LARG, h / ALT); // unidade de projeto, em pixels
  const g = { u, w, h, ox: (w - LARG * u) / 2, oy: (h - ALT * u) / 2 };
  const els = p.els ?? [];

  const desenhar = () => {
    links.length = 0;
    ctx.fillStyle = p.fundo ?? COR.papel;
    ctx.fillRect(0, 0, w, h);
    for (const el of els) desenharElemento(ctx, el, g, links);
  };
  desenhar();

  // fotos ainda não carregadas: a página é redesenhada quando chegarem
  const faltam = [...new Set(els.filter((el) => (el.k === "foto" || el.k === "retrato") && el.src && !fotos.has(el.src)).map((el) => el.src))];
  if (faltam.length) return { canvas, links, pronto: Promise.all(faltam.map(carregarFoto)).then(desenhar) };
  return { canvas, links };
}
