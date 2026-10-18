// Mapa "Fogo no Brasil" (página 5): os seis biomas, pintados pela participação de cada um
// nos focos de calor do ano. É desenhado aqui, na hora, a partir de dois arquivos:
// - biomas-mapa.js (BIOMAS_MAPA): contorno do Brasil e forma de cada bioma
//   (gerado por ferramentas/gerar-biomas.py);
// - dados.js (REVISTA.mapaFogo): os números de cada bioma.
// Mudou um número em dados.js? O mapa muda junto, na página e no mapa 3D (mapa3d.js).

import { COR, rgb } from "./paleta.js";

const OESTE = -74.2;
const LESTE = -34.5;
const NORTE = 5.6;
const SUL = -34.0;
const COS_LAT = Math.cos((14 * Math.PI) / 180); // corrige a largura dos graus perto do meio do país
const LARG_GRAUS = (LESTE - OESTE) * COS_LAT;
const ALT_GRAUS = NORTE - SUL;

// largura / altura do mapa
export const PROPORCAO_MAPA = LARG_GRAUS / ALT_GRAUS;

export const FUNDO_MAPA = COR.preto;

// escala de cor, só com as cores principais da paleta: do vinho (poucos focos) ao âmbar (muitos)
const ESCALA = [
  [0, rgb(COR.vinho)],
  [0.4, rgb(COR.vermelho)],
  [0.75, rgb(COR.laranja)],
  [1, rgb(COR.ambar)],
];

function corDaEscala(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < ESCALA.length; i++) {
    const [t1, c1] = ESCALA[i];
    const [t0, c0] = ESCALA[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return ESCALA[ESCALA.length - 1][1];
}

function dados() {
  const geo = typeof BIOMAS_MAPA !== "undefined" ? BIOMAS_MAPA : null;
  const cfg = typeof REVISTA !== "undefined" ? REVISTA.mapaFogo : null;
  return geo && cfg ? { geo, cfg } : null;
}

// [lon, lat] -> pixel dentro do retângulo (x, y, w, h), sem deformar o mapa
function projecao(x, y, w, h) {
  const k = Math.min(w / LARG_GRAUS, h / ALT_GRAUS);
  const ox = x + (w - LARG_GRAUS * k) / 2;
  const oy = y + (h - ALT_GRAUS * k) / 2;
  return ([lon, lat]) => [ox + (lon - OESTE) * COS_LAT * k, oy + (NORTE - lat) * k];
}

function caminho(ctx, poligonos, p) {
  ctx.beginPath();
  for (const aneis of poligonos) {
    for (const anel of aneis) {
      anel.forEach((c, i) => {
        const [px, py] = p(c);
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      });
      ctx.closePath();
    }
  }
}

// cor de cada bioma (proporcional à raiz da participação: os pequenos não somem)
export function coresDosBiomas() {
  const d = dados();
  if (!d) return {};
  const max = Math.max(...d.cfg.biomas.map((b) => b.parte));
  const cores = {};
  for (const b of d.cfg.biomas) {
    const c = corDaEscala(Math.sqrt(b.parte / max));
    cores[b.nome] = `rgb(${c.join(",")})`;
  }
  return cores;
}

const fmt = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Desenha o mapa em ctx, no retângulo (x, y, w, h) em pixels.
// ativo: nome do bioma em destaque (os outros escurecem), ou null.
export function desenharMapaBiomas(ctx, x, y, w, h, ativo = null) {
  ctx.save();
  ctx.fillStyle = FUNDO_MAPA;
  ctx.fillRect(x, y, w, h);
  const d = dados();
  if (!d) {
    ctx.restore();
    return;
  }
  const p = projecao(x, y, w, h);
  const esc = Math.min(w, h);
  const cores = coresDosBiomas();
  ctx.lineJoin = "round";

  for (const b of d.cfg.biomas) {
    const forma = d.geo.biomas[b.nome]?.forma;
    if (!forma) continue;
    caminho(ctx, forma, p);
    ctx.globalAlpha = ativo && ativo !== b.nome ? 0.28 : 1;
    ctx.fillStyle = cores[b.nome];
    ctx.fill("evenodd");
    // contorno da mesma cor: tapa as frestas de antisserrilhado entre dois biomas
    ctx.strokeStyle = cores[b.nome];
    ctx.lineWidth = esc * 0.002;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // divisas entre biomas e o contorno do país
  for (const b of d.cfg.biomas) {
    const forma = d.geo.biomas[b.nome]?.forma;
    if (!forma) continue;
    caminho(ctx, forma, p);
    ctx.strokeStyle = "rgba(28,26,24,.75)";
    ctx.lineWidth = esc * 0.004;
    ctx.stroke();
  }
  caminho(ctx, d.geo.contorno, p);
  ctx.strokeStyle = "rgba(248,241,226,.55)";
  ctx.lineWidth = esc * 0.003;
  ctx.stroke();

  if (ativo) {
    const forma = d.geo.biomas[ativo]?.forma;
    if (forma) {
      caminho(ctx, forma, p);
      ctx.strokeStyle = COR.creme;
      ctx.lineWidth = esc * 0.007;
      ctx.stroke();
    }
  }

  // nome e participação de cada bioma, com contorno escuro para ler sobre qualquer cor
  const tn = esc * 0.034;
  const tp = esc * 0.05;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (const b of d.cfg.biomas) {
    const g = d.geo.biomas[b.nome];
    if (!g) continue;
    const [lx, ly] = p(g.rotulo);
    const [dx, dy] = b.desvioRotulo ?? [0, 0];
    const cx = lx + dx * esc;
    const cy = ly + dy * esc;
    ctx.globalAlpha = ativo && ativo !== b.nome ? 0.45 : 1;
    const linhas = [
      { t: b.nome.toUpperCase(), f: `600 ${tn}px "Inter", system-ui, sans-serif`, y: cy - tp * 0.15 },
      { t: `${fmt(b.parte)}%`, f: `400 ${tp}px "Anton", Impact, sans-serif`, y: cy + tp * 0.9 },
    ];
    for (const l of linhas) {
      ctx.font = l.f;
      ctx.lineWidth = esc * 0.012;
      ctx.strokeStyle = "rgba(28,26,24,.9)";
      ctx.strokeText(l.t, cx, l.y);
      ctx.fillStyle = COR.creme;
      ctx.fillText(l.t, cx, l.y);
    }
  }
  ctx.restore();
}

function dentroDoAnel(px, py, anel) {
  let d = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

// bioma no ponto (u, v) do mapa (0–1, v = 0 em cima), ou null
export function biomaEm(u, v) {
  const d = dados();
  if (!d) return null;
  const k = Math.min(1 / LARG_GRAUS, 1 / PROPORCAO_MAPA / ALT_GRAUS);
  const ox = (1 - LARG_GRAUS * k) / 2;
  const oy = (1 / PROPORCAO_MAPA - ALT_GRAUS * k) / 2;
  const lon = OESTE + (u - ox) / k / COS_LAT;
  const lat = NORTE - (v / PROPORCAO_MAPA - oy) / k;
  for (const b of d.cfg.biomas) {
    const forma = d.geo.biomas[b.nome]?.forma ?? [];
    let dentro = false;
    for (const aneis of forma) for (const anel of aneis) if (dentroDoAnel(lon, lat, anel)) dentro = !dentro;
    if (dentro) return b;
  }
  return null;
}
