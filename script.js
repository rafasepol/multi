// Revista paginada em WebGL (Three.js).
//
// Como a dobra funciona:
// - Você segura a folha num ponto P0 (ex.: canto superior direito).
// - Esse ponto do papel vai até o mouse (M).
// - A linha de dobra fica entre P0 e M; o papel além dela se enrola num
//   cilindro e passa por cima, como uma página real.
// - A folha continua presa na lombada: o ponto agarrado não pode se afastar
//   da lombada mais do que o próprio papel permite.
// - Ao soltar: se o mouse passou do meio do livro, a página termina de virar;
//   senão, ela volta. O movimento até o fim é feito por uma mola amortecida.
// - Fechada (capa ou contracapa), a câmera mostra a revista inclinada no meio da tela;
//   aberta, a câmera fica de cima e as páginas ocupam a tela inteira (camera.js).
//   A câmera só muda de posição quando uma virada é confirmada.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { carregarFontes, desenharPagina } from "./paginas.js";
import { diagramar, paginaCapa, paginaContracapa } from "./diagramacao.js";
import { paginasDoPdf } from "./pdfpaginas.js";
import { carregarShader } from "./carregar.js";
import { criarCamera } from "./camera.js";
import { criarCenario } from "./cenario.js";

// Duas formas de montar as páginas (sempre em número par):
// - PDF: PAGINAS_PDF (paginas/paginas-pdf.js) lista as páginas do PDF como imagens; cada
//   página do PDF é uma página da revista, entre a capa e a contracapa desenhadas à parte
//   (?semcapa na URL usa a primeira página do PDF como capa e a última como contracapa);
// - texto (?texto na URL, ou sem PAGINAS_PDF): a diagramação automática de diagramacao.js.
const parametros = new URLSearchParams(location.search);
const usarPdf = typeof PAGINAS_PDF !== "undefined" && parametros.has("pdf") && !parametros.has("texto");
await carregarFontes(); // a capa e a diagramação do texto usam as fontes da revista
let paginas;
if (usarPdf) {
  paginas = paginasDoPdf(PAGINAS_PDF);
  if (!parametros.has("semcapa")) paginas = [paginaCapa(REVISTA), ...paginas, paginaContracapa(REVISTA)];
} else {
  paginas = diagramar(REVISTA);
}

// ---------- Parâmetros ----------

const ALTURA = 2;          // altura da página no mundo 3D
const SEG_X = 56;          // subdivisões da malha na largura
const SEG_Y = 80;          // subdivisões da malha na altura
const ESPESSURA = 0.0012;  // distância entre folhas empilhadas
const FOV = 30;

// Ajuste aqui a "sensação" da virada (valores menores = mais lento)
const MOLA_ARRASTO = 90;   // quão rápido o papel acompanha o mouse
const MOLA_SOLTA = 9;      // força que leva a página até o fim depois de soltar
const AMORTECIMENTO = 1;   // 1 = sem balanço (evita a dobra "tremer")
const VEL_MAX = 1.4;       // velocidade máxima do canto (larguras de página por segundo)
const RAIO_DOBRA = 0.11;   // raio da curva do papel (fração da largura)
const LIMITE_VIRADA = 0;   // onde o mouse precisa passar: 0 = meio do livro (lombada)

// Vinco da lombada: as páginas "descem" para dentro da lombada (só na luz, a malha não muda)
const VINCO_LARGURA = 0.10;    // largura da curva (fração da largura da página)
const VINCO_INCLINACAO = 1.0;  // inclinação do papel no fundo do vinco (1 = 45°)

// ---------- Cena ----------

const canvas = document.getElementById("cena");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(new THREE.Color("#2b2219")); // cor de terra (só aparece se faltar chão)

const scene = new THREE.Scene();
const cam = criarCamera({ fov: FOV, altura: ALTURA });
const camera = cam.camera;

let largura = 1; // largura de UMA página no mundo (depende da proporção da tela)

// Shaders das páginas (GLSL), em arquivos próprios na pasta shaders/
const [vertexShader, fragmentShader] = await Promise.all([
  carregarShader("pagina.vert.glsl"),
  carregarShader("pagina.frag.glsl"),
]);

// Cor da luz do cenário sobre as páginas (branco = cores fiéis, usado na leitura)
const luzPagina = { value: new THREE.Vector3(1, 1, 1) };

// Chão, grama, luz e queimada em volta da revista (cenario.js)
const cenario = await criarCenario({ scene, renderer, altura: ALTURA, luzPagina });

// Uniforms da sombra, compartilhados por todas as folhas
const sombraDobra = {
  dobraP: { value: new THREE.Vector2() },
  dobraN: { value: new THREE.Vector2(1, 0) },
  dobraForca: { value: 0 },
  dobraLargura: { value: 0.3 },
};

// Uniforms do vinco, compartilhados por todas as folhas
const vinco = {
  vinco: { value: 0 }, // 0 = revista fechada (sem vinco), 1 = aberta na leitura
  vincoLargura: { value: VINCO_LARGURA },
  vincoInclinacao: { value: VINCO_INCLINACAO },
};

// ---------- Folhas ----------

// Papel liso, usado nas folhas que ainda não têm a página desenhada (ver "Texturas")
const texPapel = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 4;
  const g = c.getContext("2d");
  g.fillStyle = "#fbf8f2";
  g.fillRect(0, 0, 4, 4);
  return new THREE.CanvasTexture(c);
})();

const folhas = [];
const links = []; // links[indiceDaPagina] = [{x0,y0,x1,y1,ir | url}]
let ordemDobra = 0; // a dobra mais recente fica por cima das outras

function criarFolha(i) {
  const geo = new THREE.PlaneGeometry(1, 1, SEG_X, SEG_Y);
  // para onde a normal inclina no vinco (preenchido em deformar)
  const eixoVinco = new Float32Array(geo.attributes.position.count * 3);
  geo.setAttribute("eixoVinco", new THREE.BufferAttribute(eixoVinco, 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      frente: { value: texPapel },
      verso: { value: texPapel },
      recebeSombra: { value: 1 },
      uLuzPagina: luzPagina,
      ...sombraDobra,
      ...vinco,
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });
  // a malha muda de forma todo quadro; uma esfera fixa evita recalcular os limites
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return {
    i,
    geo,
    mat,
    mesh,
    uv: geo.attributes.uv.array.slice(),
    virada: false,  // está deitada do lado esquerdo?
    destino: false, // para que lado está indo
    dobra: null,    // estado da dobra quando a folha está se mexendo
    chave: null,    // forma em que a malha parada foi calculada pela última vez
  };
}

for (let i = 0; i < paginas.length / 2; i++) folhas.push(criarFolha(i));

// Coordenadas "locais" de uma dobra: a folha sempre começa à direita (x de 0 a largura).
// Para folhas que voltam (deitadas à esquerda), o x é espelhado.
function novaDobra(f, ponto) {
  const P0 = limitarAoPapel(ponto);
  return {
    sgn: f.virada ? -1 : 1,
    P0,
    M: { ...P0 },
    V: { x: 0, y: 0 },
    T: { ...P0 },
    modo: "arrasto", // arrasto | voltar | completar
    arco: 0,
    ordem: ++ordemDobra,
  };
}

function limitarAoPapel(p) {
  return {
    x: THREE.MathUtils.clamp(p.x, largura * 0.08, largura),
    y: THREE.MathUtils.clamp(p.y, -ALTURA / 2, ALTURA / 2),
  };
}

function paraLocal(d, p) {
  return { x: d.sgn * p.x, y: p.y };
}

// O papel está preso na lombada: o ponto agarrado não pode ficar mais longe
// das pontas da lombada do que estava no papel plano.
function prenderNaLombada(d) {
  const pontas = [{ x: 0, y: ALTURA / 2 }, { x: 0, y: -ALTURA / 2 }];
  for (let k = 0; k < 3; k++) {
    for (const S of pontas) {
      const r = Math.hypot(d.P0.x - S.x, d.P0.y - S.y);
      const dx = d.M.x - S.x;
      const dy = d.M.y - S.y;
      const dist = Math.hypot(dx, dy);
      if (dist > r) {
        d.M.x = S.x + (dx * r) / dist;
        d.M.y = S.y + (dy * r) / dist;
      }
    }
  }
}

function progresso(d) {
  return THREE.MathUtils.clamp((d.P0.x - d.M.x) / (2 * d.P0.x), 0, 1);
}

// Calcula a linha de dobra (ponto F, normal n) e o raio da curva
function geometriaDobra(d) {
  const dx = d.P0.x - d.M.x;
  const dy = d.P0.y - d.M.y;
  const D = Math.hypot(dx, dy);
  if (D < 1e-4 || dx < 1e-4) return null;

  const n = { x: dx / D, y: dy / D };
  const t = progresso(d);
  // a curva é maior no meio da virada e some quando a página assenta
  let R = largura * RAIO_DOBRA * Math.min(1, Math.sin(Math.PI * t) * 2.5);
  R = Math.min(R, (D / Math.PI) * 0.9);
  // P0 fica do outro lado da dobra, já descontado o papel gasto na curva
  const s0 = (D + Math.PI * R) / 2;
  const F = { x: d.P0.x - n.x * s0, y: d.P0.y - n.y * s0 };
  return { F, n, R, t, D };
}

function alturaBase(f) {
  const n = folhas.length;
  if (f.dobra) return (n + 1 + f.dobra.ordem) * ESPESSURA;
  return f.virada ? (f.i + 1) * ESPESSURA : (n - f.i) * ESPESSURA;
}

function deformar(f) {
  // folha parada: a forma só depende do lado e da largura, então não recalcula todo quadro
  if (f.dobra) {
    f.chave = null;
  } else {
    const chave = `${f.virada}|${largura}`;
    if (f.chave === chave) return;
    f.chave = chave;
  }
  const pos = f.geo.attributes.position;
  const nor = f.geo.attributes.normal;
  const eixo = f.geo.attributes.eixoVinco;
  const uv = f.uv;
  const z0 = alturaBase(f);
  const d = f.dobra;
  const g = d ? geometriaDobra(d) : null;
  const sgn = d ? d.sgn : f.virada ? -1 : 1;
  const PI_R = g ? Math.PI * g.R : 0;

  for (let k = 0; k < pos.count; k++) {
    const X = uv[k * 2] * largura;
    const Y = (uv[k * 2 + 1] - 0.5) * ALTURA;
    let px = X;
    let py = Y;
    let pz = 0;
    let nx = 0;
    let ny = 0;
    let nz = 1;
    let c = 0; // quanto o papel já girou na dobra: 0 = plano, 2 = espelhado por cima

    if (g) {
      const s = (X - g.F.x) * g.n.x + (Y - g.F.y) * g.n.y;
      if (s > 0) {
        // projeção do ponto na linha de dobra
        const bx = X - g.n.x * s;
        const by = Y - g.n.y * s;
        if (s < PI_R) {
          // trecho enrolado no cilindro
          const a = s / g.R;
          px = bx + g.n.x * g.R * Math.sin(a);
          py = by + g.n.y * g.R * Math.sin(a);
          pz = g.R * (1 - Math.cos(a));
          // normal aponta para o eixo do cilindro: a luz varia suave na curva
          nx = -g.n.x * Math.sin(a);
          ny = -g.n.y * Math.sin(a);
          nz = Math.cos(a);
          c = 1 - Math.cos(a);
        } else {
          // trecho que já passou da curva: deitado por cima, espelhado
          const e = s - PI_R;
          px = bx - g.n.x * e;
          py = by - g.n.y * e;
          pz = 2 * g.R;
          nz = -1;
          c = 2;
        }
      }
    }
    pos.setXYZ(k, sgn * px, py, z0 + pz);
    nor.setXYZ(k, sgn * nx, ny, nz);

    // Vinco: se o papel descesse para a lombada, a normal inclinaria nesta direção
    // (no papel plano é (-1, 0, 0): para o lado da lombada). Na folha que vira,
    // a direção gira junto com o papel, então o vinco acompanha a dobra.
    const gy = g ? g.n.y : 0;
    const gx = g ? g.n.x : 0;
    eixo.setXYZ(k, sgn * -(1 - gy * gy * c), -gx * gy * c, 0);
  }
  pos.needsUpdate = true;
  nor.needsUpdate = true;
  eixo.needsUpdate = true;
}

// ---------- Texturas ----------

// Com dezenas de páginas, desenhar todas de uma vez gastaria memória demais. Só as folhas
// perto da página aberta (e as que estão virando) têm a página desenhada; as outras
// mostram papel liso e perdem a textura quando ficam longe.
const FOLHAS_PERTO = 2;  // folhas além da página aberta que já ganham textura
const FOLHAS_LONGE = 3;  // além disso a textura é liberada

const texturas = new Map(); // índice da página -> THREE.CanvasTexture
let tamTextura = null;      // { w, h } do último desenho

function tamanhoDaTextura() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const w = (window.innerWidth / 2) * dpr;
  const h = window.innerHeight * dpr;
  const k = Math.min(1, 2048 / Math.max(w, h));
  return { w: Math.round(w * k), h: Math.round(h * k) };
}

function uniformeDaPagina(idx) {
  return folhas[idx >> 1].mat.uniforms[idx % 2 === 0 ? "frente" : "verso"];
}

function desenharTextura(idx) {
  const { w, h } = tamTextura;
  const { canvas: c, links: l, pronto } = desenharPagina(paginas[idx], idx + 1, w, h, REVISTA);
  links[idx] = l;
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  texturas.set(idx, tex);
  uniformeDaPagina(idx).value = tex;
  // página de PDF: o desenho termina depois; a textura é reenviada à GPU quando acabar
  if (pronto) {
    pronto
      .then(() => { if (texturas.get(idx) === tex) tex.needsUpdate = true; })
      .catch((erro) => console.warn(`[pdf] página ${idx + 1}:`, erro));
  }
}

function liberarTextura(idx) {
  const tex = texturas.get(idx);
  if (!tex) return;
  tex.dispose();
  texturas.delete(idx);
  uniformeDaPagina(idx).value = texPapel;
}

// chamado todo quadro: é barato quando nada muda
function atualizarTexturas() {
  if (!tamTextura) return;
  const a = atual();
  folhas.forEach((f, i) => {
    const dist = i < a ? a - 1 - i : i - a; // 0 = folha visível (esquerda ou direita)
    for (const idx of [i * 2, i * 2 + 1]) {
      const tem = texturas.has(idx);
      if (!tem && (dist <= FOLHAS_PERTO || f.dobra)) desenharTextura(idx);
      else if (tem && dist > FOLHAS_LONGE && !f.dobra) liberarTextura(idx);
    }
  });
}

// no início e quando a janela muda de tamanho: refaz as texturas que estão em uso
function criarTexturas() {
  if (!janelaTemTamanho()) return;
  for (const idx of [...texturas.keys()]) liberarTextura(idx);
  tamTextura = tamanhoDaTextura();
  atualizarTexturas();
}

// ---------- Tamanho da tela ----------

// O navegador pode carregar a página com a janela ainda sem tamanho (ex.: aba escondida);
// nesse caso esperamos o evento de resize em vez de calcular com zero.
function janelaTemTamanho() {
  return window.innerWidth > 1 && window.innerHeight > 1;
}

function ajustar() {
  if (!janelaTemTamanho()) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  const aspecto = w / h;
  largura = (ALTURA * aspecto) / 2; // as duas páginas abertas preenchem a largura da tela
  cam.ajustar(largura, aspecto);
  // tamanho de um pixel da tela por unidade de distância (a grama não fica mais fina que isso)
  const pixel = (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / (h * renderer.getPixelRatio());
  cenario.ajustar(largura, areaDoCenario(), pixel);
  sombraDobra.dobraLargura.value = largura * 0.3;
}

// área do chão que a câmera enxerga com a revista fechada (capa e contracapa), com folga
function areaDoCenario() {
  const pontos = [...cam.cantosNoChao("capa"), ...cam.cantosNoChao("contracapa")].filter(Boolean);
  const xs = pontos.map((p) => p.x);
  const ys = pontos.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const fx = (x1 - x0) * 0.12, fy = (y1 - y0) * 0.12;
  return { x0: x0 - fx, x1: x1 + fx, y0: y0 - fy, y1: y1 + fy };
}

let timerTextura;
window.addEventListener("resize", () => {
  ajustar();
  clearTimeout(timerTextura);
  timerTextura = setTimeout(criarTexturas, 200);
});

// ---------- Física ----------

let arrasto = null; // { folha, moveu, inicio, x0, y0, clientX, clientY }

function passoFisica(f, dt) {
  const d = f.dobra;
  if (!d) return;

  const segurando = arrasto && arrasto.folha === f;
  const k = segurando ? MOLA_ARRASTO : MOLA_SOLTA;
  const c = 2 * Math.sqrt(k) * AMORTECIMENTO;

  // nas viradas automáticas o canto faz um leve arco em vez de linha reta
  const alvo = { x: d.T.x, y: d.T.y + d.arco * Math.sin(Math.PI * progresso(d)) };

  d.V.x += (k * (alvo.x - d.M.x) - c * d.V.x) * dt;
  d.V.y += (k * (alvo.y - d.M.y) - c * d.V.y) * dt;

  const vel = Math.hypot(d.V.x, d.V.y);
  const max = VEL_MAX * largura;
  if (vel > max) {
    d.V.x *= max / vel;
    d.V.y *= max / vel;
  }

  d.M.x += d.V.x * dt;
  d.M.y += d.V.y * dt;
  prenderNaLombada(d);
}

function verificarFim(f) {
  const d = f.dobra;
  if (!d || (d.modo !== "voltar" && d.modo !== "completar")) return;
  const perto = Math.hypot(d.M.x - d.T.x, d.M.y - d.T.y) < largura * 0.004;
  const parado = Math.hypot(d.V.x, d.V.y) < largura * 0.05;
  if (perto && parado) {
    if (d.modo === "completar") f.virada = !f.virada;
    f.destino = f.virada;
    f.dobra = null;
  }
}

function atualizarSombra() {
  let ativa = null;
  for (const f of folhas) {
    if (f.dobra && (!ativa || f.dobra.ordem > ativa.dobra.ordem)) ativa = f;
  }
  const g = ativa ? geometriaDobra(ativa.dobra) : null;
  for (const f of folhas) f.mat.uniforms.recebeSombra.value = f === ativa ? 0 : 1;

  if (!g) {
    sombraDobra.dobraForca.value = 0;
    return;
  }
  const sgn = ativa.dobra.sgn;
  sombraDobra.dobraP.value.set(sgn * g.F.x, g.F.y);
  sombraDobra.dobraN.value.set(sgn * g.n.x, g.n.y);
  sombraDobra.dobraForca.value = Math.min(1, g.D / (largura * 0.15)) * Math.sqrt(1 - g.t);
}

// ---------- Navegação ----------

const btnAnterior = document.getElementById("btnAnterior");
const btnProximo = document.getElementById("btnProximo");
const indicador = document.getElementById("indicador");

// página atual = quantas folhas estão (ou estão indo) para a esquerda
function atual() {
  return folhas.filter((f) => f.destino).length;
}

// posição da câmera para a página atual
function estadoDaCamera() {
  const a = atual();
  if (a === 0) return "capa";
  if (a === folhas.length) return "contracapa";
  return "aberta";
}

function atualizarUI() {
  const a = atual();
  btnAnterior.disabled = a === 0;
  btnProximo.disabled = a === folhas.length;
  if (a === 0) indicador.textContent = "Capa";
  else if (a === folhas.length) indicador.textContent = "Contracapa";
  else indicador.textContent = `Páginas ${a * 2}–${a * 2 + 1} de ${paginas.length}`;
}

// Vira sozinha, a partir de um canto (botões, teclado, clique simples).
// paraEsquerda: true = a folha vai para a esquerda (avançar); false = volta para a direita.
// Se a folha já estiver no meio de uma virada, ela completa ou volta conforme o pedido.
function virarAuto(f, paraEsquerda, yCanto = -ALTURA / 2) {
  if (!f) return;
  if (!f.dobra) {
    if (f.virada === paraEsquerda) return; // já está desse lado
    f.dobra = novaDobra(f, { x: largura, y: yCanto });
  }
  const d = f.dobra;
  const completa = d.sgn > 0 === paraEsquerda;
  d.modo = completa ? "completar" : "voltar";
  d.T = completa ? { x: -d.P0.x, y: d.P0.y } : { ...d.P0 };
  d.arco = completa ? (d.P0.y < 0 ? 1 : -1) * ALTURA * 0.08 : 0;
  f.destino = paraEsquerda;
  atualizarUI();
}

function proxima() { virarAuto(folhas[atual()], true); }
function anterior() { virarAuto(folhas[atual() - 1], false); }

function irPara(pagina) {
  const alvo = Math.min(Math.floor(pagina / 2), folhas.length);
  const a = atual();
  const dir = Math.sign(alvo - a);
  for (let k = 0; k < Math.abs(alvo - a); k++) {
    const f = folhas[dir > 0 ? a + k : a - 1 - k];
    f.destino = dir > 0;
    setTimeout(() => virarAuto(f, dir > 0), k * 220);
  }
  atualizarUI();
}

btnProximo.addEventListener("click", proxima);
btnAnterior.addEventListener("click", anterior);
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown") proxima();
  if (e.key === "ArrowLeft" || e.key === "PageUp") anterior();
});

// ---------- Mouse / toque ----------

// ponto da revista (plano z = 0) sob o ponteiro; null se o raio não acertar o plano
function pontoDoEvento(e) {
  return cam.pontoNoLivro(e.clientX, e.clientY, canvas);
}

function dentroDaRevista(p) {
  return p && Math.abs(p.x) <= largura && Math.abs(p.y) <= ALTURA / 2;
}

// a câmera pode estar em movimento, então o alvo do arrasto é recalculado todo quadro
function atualizarAlvoArrasto() {
  const d = arrasto.folha.dobra;
  const p = cam.pontoNoLivro(arrasto.clientX, arrasto.clientY, canvas);
  if (p) d.T = paraLocal(d, p);
}

// link do sumário sob o ponteiro, se houver
function linkEm(p) {
  const a = atual();
  let idx, u;
  if (p.x >= 0) { idx = a * 2; u = p.x / largura; }
  else { idx = a * 2 - 1; u = (p.x + largura) / largura; }
  const v = 1 - (p.y / ALTURA + 0.5); // 0 em cima
  return (links[idx] || []).find((l) => u >= l.x0 && u <= l.x1 && v >= l.y0 && v <= l.y1);
}

// folha que pode ser puxada do lado onde está o ponteiro
function folhaDoLado(p) {
  const a = atual();
  return p.x >= 0 ? folhas[a] : folhas[a - 1];
}

canvas.addEventListener("pointerdown", (e) => {
  const p = pontoDoEvento(e);
  if (!dentroDaRevista(p)) return; // clicou fora da revista (na grama)
  const f = folhaDoLado(p);
  if (!f) return;

  try { canvas.setPointerCapture(e.pointerId); } catch {}
  canvas.classList.add("arrastando");

  // começa a dobra exatamente onde o usuário segurou
  // (se a folha ainda estava voltando de um arrasto anterior, continua dela)
  if (!f.dobra) {
    const sgn = f.virada ? -1 : 1;
    f.dobra = novaDobra(f, { x: sgn * p.x, y: p.y });
  }
  f.dobra.modo = "arrasto";
  f.destino = f.virada;

  arrasto = {
    folha: f,
    moveu: false,
    inicio: p,
    x0: e.clientX,
    y0: e.clientY,
    clientX: e.clientX,
    clientY: e.clientY,
  };
  atualizarAlvoArrasto();
});

canvas.addEventListener("pointermove", (e) => {
  // o mouse sopra a grama por onde passa (cenario.js)
  const p = pontoDoEvento(e);
  cenario.definirMouse(p);

  if (arrasto) {
    arrasto.clientX = e.clientX;
    arrasto.clientY = e.clientY;
    if (Math.hypot(e.clientX - arrasto.x0, e.clientY - arrasto.y0) > 6) arrasto.moveu = true;
    atualizarAlvoArrasto();
    return;
  }

  // sem clicar, a página não se mexe; só muda o cursor
  const sobrePagina = dentroDaRevista(p) && !!folhaDoLado(p);
  canvas.classList.toggle("fora", !sobrePagina);
  canvas.classList.toggle("link", sobrePagina && !!linkEm(p));
});

function soltar(e) {
  if (!arrasto) return;
  const { folha: f, moveu, inicio } = arrasto;
  const d = f.dobra;
  arrasto = null;
  canvas.classList.remove("arrastando");

  if (!moveu) {
    const l = linkEm(inicio);
    if (l) {
      d.modo = "voltar";
      d.T = { ...d.P0 };
      if (l.url) window.open(l.url, "_blank", "noopener"); // endereço de uma fonte
      else irPara(l.ir);                                    // item do sumário
      return;
    }
    // clique simples: vira a partir do canto mais próximo
    if (Math.hypot(d.M.x - d.P0.x, d.M.y - d.P0.y) < largura * 0.02) {
      const canto = { x: largura, y: inicio.y >= 0 ? ALTURA / 2 : -ALTURA / 2 };
      d.P0 = canto;
      d.M = { ...canto };
      d.V = { x: 0, y: 0 };
    }
    virarAuto(f, !f.virada, d.P0.y);
    return;
  }

  // só termina de virar se o mouse passou do meio do livro
  const passou = d.T.x < LIMITE_VIRADA * largura;
  if (passou) {
    d.modo = "completar";
    d.T = { x: -d.P0.x, y: d.P0.y };
    d.arco = 0;
    f.destino = !f.virada;
  } else {
    d.modo = "voltar";
    d.T = { ...d.P0 };
    f.destino = f.virada;
  }
  atualizarUI();
}

canvas.addEventListener("pointerup", soltar);
canvas.addEventListener("pointercancel", soltar);
canvas.addEventListener("pointerleave", () => cenario.definirMouse(null));

// ---------- Loop ----------

const relogio = new THREE.Clock();

// ---------- Cenário ----------

// onde há papel sobre o chão: pilhas paradas e folhas sendo viradas
function papelSobreOChao() {
  let esq = false, dir = false;
  const dobras = [];
  for (const f of folhas) {
    const g = f.dobra ? geometriaDobra(f.dobra) : null;
    if (!g) {
      if (f.virada) esq = true;
      else dir = true;
      continue;
    }
    dobras.push({ F: g.F, n: g.n, R: g.R, sgn: f.dobra.sgn });
  }
  return { esq, dir, dobras };
}

// O cenário só aparece com a câmera fora da posição de leitura, ou quando a
// primeira/última folha está sendo virada (o chão aparece por baixo dela).
function cenarioVisivel() {
  return !cam.totalmenteAberta() || !!folhas[0].dobra || !!folhas[folhas.length - 1].dobra;
}

// Avança a simulação (câmera, física e dobras) em dt segundos
function atualizarTudo(dt) {
  atualizarTexturas();
  cam.definirEstado(estadoDaCamera());
  cam.atualizar(dt);
  if (arrasto) atualizarAlvoArrasto();

  const passos = Math.max(1, Math.ceil(dt / (1 / 240)));
  for (let s = 0; s < passos; s++) folhas.forEach((f) => passoFisica(f, dt / passos));
  folhas.forEach(verificarFim);
  if (folhas.every((f) => !f.dobra)) ordemDobra = 0;

  folhas.forEach(deformar);
  atualizarSombra();
  // o vinco aparece junto com a câmera indo para a leitura (fechada não tem vinco)
  vinco.vinco.value = cam.abertura();

  cenario.definirPapel(papelSobreOChao());
  cenario.atualizar(dt, {
    estado: estadoDaCamera(),
    abertura: cam.abertura(),
    visivel: cenarioVisivel(),
  });
}

// Contador de quadros por segundo (aparece com ?fps na URL)
function criarContadorFps() {
  const el = document.createElement("div");
  el.className = "fps";
  document.body.appendChild(el);
  let quadros = 0;
  let inicio = performance.now();
  return () => {
    quadros++;
    const agora = performance.now();
    if (agora - inicio >= 500) {
      el.textContent = `${Math.round((quadros * 1000) / (agora - inicio))} fps`;
      quadros = 0;
      inicio = agora;
    }
  };
}
const contarQuadro = new URLSearchParams(location.search).has("fps") ? criarContadorFps() : () => {};

let pausado = false; // só para testes (revista.pausar())

function quadro() {
  // segue o tempo real mesmo se o navegador perder quadros;
  // passos pequenos deixam a mola estável
  const dt = Math.min(relogio.getDelta(), 0.1);
  if (!pausado) atualizarTudo(dt);
  renderer.render(scene, camera);
  contarQuadro();
  requestAnimationFrame(quadro);
}

// ---------- Início ----------

ajustar();
criarTexturas();
atualizarUI();
quadro();

// usado para testes no console
window.revista = {
  folhas, paginas, texturas, proxima, anterior, irPara, atual, cam, cenario, links, ALTURA,
  largura: () => largura,
  // congela/descongela o tempo (o desenho continua)
  pausar(valor = true) {
    pausado = valor;
  },
  // simula `segundos` de tempo na hora (testes não dependem da taxa de quadros do navegador)
  avancar(segundos) {
    for (let t = 0; t < segundos; t += 1 / 60) atualizarTudo(1 / 60);
    renderer.render(scene, camera);
  },
  // desenha `quadros` quadros seguidos e devolve quantos milissegundos cada um levou
  medirDesempenho(quadros = 30) {
    const gl = renderer.getContext();
    const px = new Uint8Array(4);
    const esperarGpu = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    renderer.render(scene, camera);
    esperarGpu();
    const t0 = performance.now();
    for (let i = 0; i < quadros; i++) {
      atualizarTudo(1 / 60);
      renderer.render(scene, camera);
    }
    esperarGpu();
    return +((performance.now() - t0) / quadros).toFixed(2);
  },
};