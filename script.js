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
//   aberta, a câmera fica de cima com as duas páginas inteiras na tela (camera.js).
//   Com a tela em pé (celular), a leitura mostra uma página por vez.
//   A câmera só muda de posição quando uma virada é confirmada.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { carregarFontes, desenharPagina } from "./paginas.js";
import { diagramar, LARG, ALT, COR } from "./diagramacao.js";
import { carregarShader } from "./carregar.js";
import { criarCamera } from "./camera.js";
import { criarCenario } from "./cenario.js";
import { criarMapa3D } from "./mapa3d.js";

// As 18 páginas são planejadas em dados.js e montadas por diagramacao.js.
await carregarFontes(); // a capa e a diagramação do texto usam as fontes da revista
const paginas = diagramar(REVISTA);

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

// largura de UMA página no mundo: a página tem sempre a proporção do projeto (80 × 100)
const largura = (ALTURA * LARG) / ALT;

// Tela em pé (celular): a leitura mostra uma página por vez, e `foco` diz qual delas
const LIMITE_RETRATO = 1.1; // largura/altura da tela abaixo da qual vale o modo de uma página
let foco = "dir";
const modoRetrato = () => window.innerWidth / window.innerHeight < LIMITE_RETRATO;

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
  g.fillStyle = "#f2ead9";
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

// ---------- Mapa interativo ----------

// página com o mapa 3D (bloco "mapa" em dados.js) e o retângulo dele, em u
const mapaNaPagina = (() => {
  for (let i = 0; i < paginas.length; i++) {
    const el = paginas[i].els?.find((e) => e.k === "interativo");
    if (el) return { pagina: i, el };
  }
  return null;
})();
const mapa = mapaNaPagina && typeof REVISTA !== "undefined" && REVISTA.mapaFogo
  ? await criarMapa3D({ scene, camera, canvas, luzPagina, cfg: REVISTA.mapaFogo }).catch((erro) => {
      console.warn("[mapa]", erro);
      return null;
    })
  : null;

// O mapa 3D só aparece com a revista aberta e parada na página dele; fica exatamente
// por cima do mapa impresso (mesma conta de paginas.js: a página de projeto LARG × ALT
// fica centralizada na folha).
function atualizarMapa(dt) {
  if (!mapa) return;
  const { pagina, el } = mapaNaPagina;
  const a = atual();
  const direita = pagina === a * 2;
  const naTela = direita || pagina === a * 2 - 1;
  const parado = !arrasto && folhas.every((f) => !f.dobra);
  const s = Math.min(largura / LARG, ALTURA / ALT);
  const x0 = (direita ? 0 : -largura) + (largura - LARG * s) / 2 + el.x * s;
  const yTopo = ALTURA / 2 - ((ALTURA - ALT * s) / 2 + el.y * s);
  mapa.atualizar(dt, {
    visivel: naTela && parado && cam.totalmenteAberta() && texturas.has(pagina),
    cx: x0 + (el.w * s) / 2,
    cy: yTopo - (el.h * s) / 2,
    w: el.w * s,
    h: el.h * s,
    z: alturaBase(folhas[pagina >> 1]),
  });
}

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

// a textura tem o tamanho com que a página aparece na tela (no máximo 2048 de altura)
function tamanhoDaTextura() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const porPagina = modoRetrato() ? 1 : 2;
  const hTela = Math.min(window.innerHeight, window.innerWidth / porPagina / (LARG / ALT));
  const h = Math.min(2048, Math.max(1024, hTela * dpr));
  return { w: Math.round((h * LARG) / ALT), h: Math.round(h) };
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
  // fotos ainda carregando: a página é redesenhada e reenviada à GPU quando chegarem
  if (pronto) {
    pronto
      .then(() => { if (texturas.get(idx) === tex) tex.needsUpdate = true; })
      .catch((erro) => console.warn(`[página ${idx + 1}]`, erro));
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
  cam.ajustar(largura, aspecto);
  // tamanho de um pixel da tela por unidade de distância (a grama não fica mais fina que isso)
  const pixel = (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / (h * renderer.getPixelRatio());
  cenario.ajustar(largura, areaDoCenario(), pixel);
  sombraDobra.dobraLargura.value = largura * 0.3;
}

// área do chão que a câmera enxerga em todas as posições, com folga
function areaDoCenario() {
  const pontos = ["capa", "contracapa", "aberta", "esquerda", "direita"]
    .flatMap((nome) => cam.cantosNoChao(nome))
    .filter(Boolean);
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
  atualizarUI();
  clearTimeout(timerTextura);
  timerTextura = setTimeout(criarTexturas, 200);
});

// ---------- Física ----------

let arrasto = null; // { folha, moveu, inicio, x0, y0, clientX, clientY }
let toqueEsquerda = null; // modo de uma página: toque na página da esquerda { inicio, x0, y0 }

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
  if (modoRetrato()) return foco === "esq" ? "esquerda" : "direita";
  return "aberta";
}

function atualizarUI() {
  const a = atual();
  btnAnterior.disabled = a === 0;
  btnProximo.disabled = a === folhas.length;
  if (a === 0) indicador.textContent = "Capa";
  else if (a === folhas.length) indicador.textContent = "Contracapa";
  else if (modoRetrato()) indicador.textContent = `Página ${foco === "esq" ? a * 2 : a * 2 + 1} de ${paginas.length}`;
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

// No modo de uma página (tela em pé), avançar primeiro passa da página da esquerda para a da
// direita; só depois a folha vira. Voltar faz o caminho contrário.
const abertaNoMeio = () => atual() > 0 && atual() < folhas.length;

function proxima() {
  if (modoRetrato() && abertaNoMeio() && foco === "esq") {
    foco = "dir";
    atualizarUI();
    return;
  }
  foco = "esq";
  virarAuto(folhas[atual()], true);
}

function anterior() {
  if (modoRetrato() && abertaNoMeio() && foco === "dir") {
    foco = "esq";
    atualizarUI();
    return;
  }
  foco = "dir";
  virarAuto(folhas[atual() - 1], false);
}

// pagina: número da página (1 = capa)
function irPara(pagina) {
  const alvo = Math.min(Math.floor(pagina / 2), folhas.length);
  const a = atual();
  const dir = Math.sign(alvo - a);
  const n = Math.abs(alvo - a);
  for (let k = 0; k < n; k++) {
    const f = folhas[dir > 0 ? a + k : a - 1 - k];
    f.destino = dir > 0;
    setTimeout(() => virarAuto(f, dir > 0), k * 220);
  }
  foco = pagina % 2 === 0 ? "esq" : "dir"; // páginas pares ficam à esquerda
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

// página (índice), e posição 0–1 nela (v = 0 em cima) sob o ponto p da revista
function posicaoNaPagina(p) {
  const a = atual();
  const direita = p.x >= 0;
  return {
    idx: direita ? a * 2 : a * 2 - 1,
    u: direita ? p.x / largura : (p.x + largura) / largura,
    v: 1 - (p.y / ALTURA + 0.5),
  };
}

function achar(p, filtro) {
  const { idx, u, v } = posicaoNaPagina(p);
  const l = (links[idx] || []).find((l) => filtro(l) && u >= l.x0 && u <= l.x1 && v >= l.y0 && v <= l.y1);
  return l && { idx, l };
}

// link do sumário sob o ponteiro, se houver (barras de gráfico e placas não são links)
function linkEm(p) {
  return achar(p, (l) => !l.barra && !l.placa)?.l;
}

// ---------- Barras de gráfico em 3D ----------

// Ao passar o mouse numa linha de gráfico, a barra sobe da página como um bloco.
const BARRA_SOBE = 0.07;     // altura que a barra alcança (mundo 3D; a página tem altura 2)
const BARRA_CRESCE = 0.14;   // quanto a barra engorda ao subir (fração da espessura)
const BARRA_MOLA = 230;      // força da mola (maior = sobe mais rápido)
const BARRA_AMORTEC = 0.5;   // < 1 dá um leve "pulinho" ao chegar em cima

// sombra suave embaixo da barra (retângulo borrado)
const texSombraBarra = (() => {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 32;
  const g = c.getContext("2d");
  g.filter = "blur(5px)";
  g.fillStyle = "#000";
  g.fillRect(14, 8, 100, 16);
  return new THREE.CanvasTexture(c);
})();
const geoCaixa = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5); // base em z = 0
const geoPlano = new THREE.PlaneGeometry(1, 1);

// cada face com um tom: a luz vem de cima à esquerda (as faces escuras ficam longe dela)
function materiaisDaBarra(cor) {
  const base = new THREE.Color(cor);
  const tom = (k) => new THREE.MeshBasicMaterial({ color: base.clone().multiplyScalar(k) });
  const topo = new THREE.MeshBasicMaterial({ color: base.clone().multiplyScalar(1.12) });
  // ordem do BoxGeometry: +x, -x, +y, -y, +z, -z
  return [tom(0.62), tom(0.85), tom(0.75), tom(0.45), topo, tom(0.5)];
}

const barras3d = []; // { chave, idx, x0, x1, y0, y1, cor, grupo, caixa, sombra, t, v, alvo }
let hoverBarra = null; // chave da barra sob o mouse

function criarBarra3d(idx, b, chave) {
  const mats = materiaisDaBarra(b.cor);
  const caixa = new THREE.Mesh(geoCaixa, mats);
  const matSombra = new THREE.MeshBasicMaterial({
    map: texSombraBarra, transparent: true, depthWrite: false, opacity: 0,
  });
  const sombra = new THREE.Mesh(geoPlano, matSombra);
  const grupo = new THREE.Group();
  grupo.frustumCulled = false;
  grupo.add(sombra, caixa);
  scene.add(grupo);
  const item = { chave, idx, ...b, grupo, caixa, sombra, matSombra, mats, t: 0, v: 0, alvo: 1 };
  barras3d.push(item);
  return item;
}

function removerBarra3d(item) {
  scene.remove(item.grupo);
  item.mats.forEach((m) => m.dispose());
  item.matSombra.dispose();
  barras3d.splice(barras3d.indexOf(item), 1);
}

// barra sob o ponteiro (a linha inteira do gráfico conta)
function barraEm(p) {
  const r = achar(p, (l) => !!l.barra);
  if (!r) return null;
  const b = r.l.barra;
  return { idx: r.idx, b, chave: `${r.idx}:${b.x0.toFixed(4)}:${b.y0.toFixed(4)}` };
}

function definirHoverBarra(alvo) {
  const chave = alvo ? alvo.chave : null;
  if (chave === hoverBarra) return;
  hoverBarra = chave;
  if (alvo && !barras3d.some((i) => i.chave === chave)) criarBarra3d(alvo.idx, alvo.b, chave);
}

function atualizarBarras3d(dt) {
  // só desenha quando as páginas estão paradas; virar a folha desce a barra
  const parado = !arrasto && folhas.every((f) => !f.dobra);
  for (const item of [...barras3d]) {
    const a = atual();
    const naTela = item.idx === a * 2 || item.idx === a * 2 - 1;
    const ativa = parado && naTela && item.chave === hoverBarra;
    item.alvo = ativa ? 1 : 0;
    // mola amortecida em passos pequenos
    const k = BARRA_MOLA;
    const c = 2 * Math.sqrt(k) * BARRA_AMORTEC;
    const passos = Math.max(1, Math.ceil(dt / (1 / 240)));
    for (let s = 0; s < passos; s++) {
      item.v += (k * (item.alvo - item.t) - c * item.v) * (dt / passos);
      item.t += item.v * (dt / passos);
    }
    if (item.alvo === 0 && Math.abs(item.t) < 0.002 && Math.abs(item.v) < 0.02) {
      removerBarra3d(item);
      continue;
    }

    const t = Math.max(item.t, 0);
    const dir = item.idx % 2 === 0;
    const f = folhas[item.idx >> 1];
    const z = alturaBase(f) + 0.0004;
    // retângulo da barra (0–1 na página) -> mundo
    const gx = (u) => (dir ? u * largura : (u - 1) * largura);
    const gy = (v) => (0.5 - v) * ALTURA;
    const larg = (item.x1 - item.x0) * largura;
    const alt = (item.y1 - item.y0) * ALTURA;
    const cx = (gx(item.x0) + gx(item.x1)) / 2;
    const cy = (gy(item.y0) + gy(item.y1)) / 2;
    const engorda = 1 + BARRA_CRESCE * t;
    const altura = Math.max(BARRA_SOBE * t, 0.00005);
    // a perspectiva aumenta o que chega perto da câmera: encolhe a barra em direção ao
    // centro da câmera para o topo cair exatamente sobre a barra desenhada (sem cobrir o valor)
    const cam3 = camera.position;
    const encolhe = THREE.MathUtils.clamp(1 - altura / Math.max(cam3.z - z, 0.5), 0.6, 1);
    item.grupo.position.set(cam3.x + (cx - cam3.x) * encolhe, cam3.y + (cy - cam3.y) * encolhe, z);
    item.caixa.scale.set(larg * encolhe, alt * engorda * encolhe, altura);
    item.sombra.position.set((cx - item.grupo.position.x) + 0.012 * t, (cy - item.grupo.position.y) - 0.016 * t, 0.00005);
    item.sombra.scale.set(larg * 1.3 + 0.03 * t, alt * 2.4 + 0.03 * t, 1);
    item.matSombra.opacity = 0.4 * Math.min(1, t);
  }
}

// ---------- Placas: pedaços da página que saltam em 3D ----------

// Números, fluxos, citações, fotos e retratos da equipe: com o mouse em cima, o pedaço da
// página sobe como um cartão, inclina na direção do ponteiro e deixa uma sombra no papel.
// O cartão mostra a própria textura da página, então é sempre igual ao que está impresso.
const PLACA_SOBE = 0.085;    // altura que o cartão alcança (a página tem altura 2)
const PLACA_INCLINA = 0.22;  // inclinação máxima (radianos) na direção do ponteiro
const PLACA_CRESCE = 0.035;  // quanto o cartão aumenta ao subir
const PLACA_MOLA = 170;
const PLACA_AMORTEC = 0.62;

const VERTICE_PLACA = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const FRAGMENTO_PLACA = `
uniform sampler2D pagina;
uniform vec4 rect;      // x0, y0, x1, y1 na página (0–1, y = 0 em cima)
uniform float redondo;
uniform vec3 uLuzPagina;
varying vec2 vUv;
void main() {
  if (redondo > 0.5 && length(vUv - 0.5) > 0.5) discard;
  vec2 st = vec2(mix(rect.x, rect.z, vUv.x), 1.0 - mix(rect.y, rect.w, 1.0 - vUv.y));
  gl_FragColor = vec4(texture2D(pagina, st).rgb * uLuzPagina, 1.0);
}`;

// sombra redonda (para os retratos)
const texSombraRedonda = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 10, 32, 32, 32);
  gr.addColorStop(0, "rgba(0,0,0,1)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const geoCilindro = new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5);
const corLados = new THREE.Color(COR.preto);

const placas3d = []; // { chave, idx, x0, y0, x1, y1, redondo, grupo, pivo, topo, lados, sombra, t, v }
let hoverPlaca = null;  // chave da placa sob o mouse
let ponteiroPlaca = { u: 0.5, v: 0.5 }; // posição do ponteiro dentro da placa (0–1)

function criarPlaca3d(alvo) {
  const { idx, l, chave } = alvo;
  const redondo = !!l.placa.redondo;
  const matTopo = new THREE.ShaderMaterial({
    uniforms: {
      pagina: { value: texturas.get(idx) ?? texPapel },
      rect: { value: new THREE.Vector4(l.x0, l.y0, l.x1, l.y1) },
      redondo: { value: redondo ? 1 : 0 },
      uLuzPagina: luzPagina,
    },
    vertexShader: VERTICE_PLACA,
    fragmentShader: FRAGMENTO_PLACA,
  });
  const topo = new THREE.Mesh(geoPlano, matTopo);
  const matLados = new THREE.MeshBasicMaterial({ color: corLados, side: THREE.DoubleSide });
  const lados = new THREE.Mesh(redondo ? geoCilindro : geoCaixa, matLados);
  const matSombra = new THREE.MeshBasicMaterial({
    map: redondo ? texSombraRedonda : texSombraBarra, transparent: true, depthWrite: false, opacity: 0,
  });
  const sombra = new THREE.Mesh(geoPlano, matSombra);
  const pivo = new THREE.Group();
  pivo.add(lados, topo);
  const grupo = new THREE.Group();
  grupo.add(sombra, pivo);
  scene.add(grupo);
  const item = { chave, idx, x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1, redondo, grupo, pivo, topo, lados, sombra, mats: [matTopo, matLados, matSombra], t: 0, v: 0 };
  placas3d.push(item);
  return item;
}

function removerPlaca3d(item) {
  scene.remove(item.grupo);
  item.mats.forEach((m) => m.dispose());
  placas3d.splice(placas3d.indexOf(item), 1);
}

// placa sob o ponteiro e a posição do ponteiro dentro dela
function placaEm(p) {
  const r = achar(p, (l) => !!l.placa);
  if (!r) return null;
  const { u, v } = posicaoNaPagina(p);
  const l = r.l;
  return {
    idx: r.idx,
    l,
    chave: `${r.idx}:${l.x0.toFixed(4)}:${l.y0.toFixed(4)}`,
    u: (u - l.x0) / (l.x1 - l.x0),
    v: (v - l.y0) / (l.y1 - l.y0),
  };
}

function definirHoverPlaca(alvo) {
  if (alvo) ponteiroPlaca = { u: alvo.u, v: alvo.v };
  const chave = alvo ? alvo.chave : null;
  if (chave === hoverPlaca) return;
  hoverPlaca = chave;
  if (alvo && !placas3d.some((i) => i.chave === chave)) criarPlaca3d(alvo);
}

function atualizarPlacas3d(dt) {
  const parado = !arrasto && folhas.every((f) => !f.dobra) && cam.totalmenteAberta();
  const a = atual();
  for (const item of [...placas3d]) {
    const naTela = item.idx === a * 2 || item.idx === a * 2 - 1;
    const tex = texturas.get(item.idx);
    // virando a página (ou a página saiu da tela): o cartão some na hora
    if (!parado || !naTela || !tex) {
      removerPlaca3d(item);
      continue;
    }
    item.topo.material.uniforms.pagina.value = tex;
    const ativa = item.chave === hoverPlaca;
    const alvo = ativa ? 1 : 0;
    const k = PLACA_MOLA;
    const c = 2 * Math.sqrt(k) * PLACA_AMORTEC;
    const passos = Math.max(1, Math.ceil(dt / (1 / 240)));
    for (let s = 0; s < passos; s++) {
      item.v += (k * (alvo - item.t) - c * item.v) * (dt / passos);
      item.t += item.v * (dt / passos);
    }
    if (!ativa && Math.abs(item.t) < 0.002 && Math.abs(item.v) < 0.02) {
      removerPlaca3d(item);
      continue;
    }

    const t = Math.max(item.t, 0);
    const dir = item.idx % 2 === 0;
    const z = alturaBase(folhas[item.idx >> 1]) + 0.0004;
    const gx = (u) => (dir ? u * largura : (u - 1) * largura);
    const gy = (v) => (0.5 - v) * ALTURA;
    const larg = (item.x1 - item.x0) * largura;
    const alt = (item.y1 - item.y0) * ALTURA;
    const altura = Math.max(PLACA_SOBE * t, 0.00005);
    const cresce = 1 + PLACA_CRESCE * t;

    item.grupo.position.set((gx(item.x0) + gx(item.x1)) / 2, (gy(item.y0) + gy(item.y1)) / 2, z);
    item.pivo.position.set(0, 0, altura);
    // inclina na direção do ponteiro (só o cartão em destaque segue o mouse)
    const pu = ativa ? ponteiroPlaca.u - 0.5 : 0;
    const pv = ativa ? ponteiroPlaca.v - 0.5 : 0;
    item.pivo.rotation.set(pv * PLACA_INCLINA * t, pu * PLACA_INCLINA * t, 0);
    item.pivo.scale.set(cresce, cresce, 1);
    item.topo.position.z = 0.0001;
    item.topo.scale.set(larg, alt, 1);
    item.lados.position.z = -altura;
    item.lados.scale.set(larg, alt, altura);
    item.sombra.position.set(0.012 * t, -0.022 * t, 0.0002);
    item.sombra.scale.set(larg * (item.redondo ? 1.35 : 1.3) + 0.04 * t, alt * (item.redondo ? 1.35 : 1.6) + 0.04 * t, 1);
    item.mats[2].opacity = 0.5 * Math.min(1, t);
  }
}

// folha que pode ser puxada do lado onde está o ponteiro
function folhaDoLado(p) {
  const a = atual();
  return p.x >= 0 ? folhas[a] : folhas[a - 1];
}

canvas.addEventListener("pointerdown", (e) => {
  // no mapa interativo a página não vira: o clique (ou toque) deixa o mapa no alto
  if (mapa && mapa.tocar(e.clientX, e.clientY, e.pointerType !== "mouse")) return;
  const p = pontoDoEvento(e);
  if (!dentroDaRevista(p)) return; // clicou fora da revista (na grama)
  // tela em pé, lendo a página da esquerda: tocar avança para a da direita (ou segue um
  // link do sumário) e arrastar para o lado passa de página, sem puxar a folha de trás
  if (modoRetrato() && abertaNoMeio() && foco === "esq" && p.x < 0) {
    toqueEsquerda = { inicio: p, x0: e.clientX, y0: e.clientY };
    return;
  }
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

  const noMapa = !!mapa && mapa.apontar(e.clientX, e.clientY);
  canvas.classList.toggle("mapa", noMapa);
  if (noMapa) {
    canvas.classList.remove("fora", "link");
    definirHoverBarra(null);
    definirHoverPlaca(null);
    return;
  }

  // sem clicar, a página não se mexe; só muda o cursor
  const sobrePagina = dentroDaRevista(p) && !!folhaDoLado(p);
  canvas.classList.toggle("fora", !sobrePagina);
  canvas.classList.toggle("link", sobrePagina && !!linkEm(p));
  const barra = sobrePagina ? barraEm(p) : null;
  definirHoverBarra(barra);
  definirHoverPlaca(sobrePagina && !barra ? placaEm(p) : null);
});

function soltar(e) {
  if (toqueEsquerda) {
    const { inicio, x0, y0 } = toqueEsquerda;
    toqueEsquerda = null;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
      if (dx < 0) proxima();
      else anterior();
      return;
    }
    const l = linkEm(inicio);
    if (l?.url) window.open(l.url, "_blank", "noopener");
    else if (l) irPara(l.ir);
    else proxima();
    return;
  }
  if (!arrasto) return;
  const { folha: f, moveu, inicio } = arrasto;
  const d = f.dobra;
  const arrasto0 = arrasto;
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
    foco = f.virada ? "dir" : "esq";
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
    foco = f.destino ? "esq" : "dir"; // depois de virar, lê-se a página que acabou de chegar
  } else if (modoRetrato() && abertaNoMeio() && foco === "dir" && e.clientX - arrasto0.x0 > 40) {
    // tela em pé, na página da direita: arrastar para a direita volta para a da esquerda
    d.modo = "voltar";
    d.T = { ...d.P0 };
    f.destino = f.virada;
    anterior();
  } else {
    d.modo = "voltar";
    d.T = { ...d.P0 };
    f.destino = f.virada;
  }
  atualizarUI();
}

canvas.addEventListener("pointerup", soltar);
canvas.addEventListener("pointercancel", soltar);
canvas.addEventListener("pointerleave", () => {
  toqueEsquerda = null;
  cenario.definirMouse(null);
  mapa?.sair();
  canvas.classList.remove("mapa");
  definirHoverBarra(null);
  definirHoverPlaca(null);
});

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
// Na leitura, as páginas só cobrem a tela inteira quando a tela tem a mesma proporção delas;
// senão sobra chão dos lados (ou em cima e embaixo) e o cenário continua à vista.
function paginasCobremATela() {
  const aspecto = window.innerWidth / window.innerHeight;
  const paginasNaTela = modoRetrato() ? LARG / ALT : (2 * LARG) / ALT;
  return Math.abs(aspecto - paginasNaTela) / paginasNaTela < 0.01;
}

function cenarioVisivel() {
  return (
    !cam.totalmenteAberta() ||
    !paginasCobremATela() ||
    !!folhas[0].dobra ||
    !!folhas[folhas.length - 1].dobra
  );
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
  atualizarMapa(dt);
  atualizarBarras3d(dt);
  atualizarPlacas3d(dt);
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
  folhas, paginas, texturas, proxima, anterior, irPara, atual, cam, cenario, links, mapa, barras3d, placas3d, ALTURA,
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