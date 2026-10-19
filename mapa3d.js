// Mapa interativo da página "Fogo no Brasil".
//
// Na página, o mapa é desenhado junto com o papel (bloco "mapa" de diagramacao.js). Com a
// revista aberta nessa página, este módulo põe por cima uma placa 3D com o mesmo desenho, no
// mesmo lugar: parada, ela é igual ao papel; com o mouse em cima (ou ao tocar), ela sobe,
// inclina e ganha espessura. O bioma sob o ponteiro acende (os outros apagam) e aparece um
// cartão com os números dele. O desenho vem de mapa-biomas.js; os números, de dados.js
// (REVISTA.mapaFogo).
//
// script.js chama atualizar() todo quadro, com a posição do mapa no mundo, e repassa o
// ponteiro em apontar() (mouse andando), tocar() (clique ou toque) e sair().

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { desenharMapaBiomas, biomaEm, coresDosBiomas, PROPORCAO_MAPA } from "./mapa-biomas.js";
import { COR } from "./paleta.js";

const SUBIDA = 0.2;      // quanto o mapa sobe (unidades do mundo; a página tem 2 de altura)
const INCLINACAO = 0.34; // quanto ele inclina, em radianos (a borda de baixo vem para a frente)
const ESPESSURA = 0.045; // espessura da placa quando está no alto
const VELOCIDADE = 7;    // quão rápido sobe e desce (maior = mais rápido)

const VERTICE = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export async function criarMapa3D({ scene, camera, canvas, luzPagina, cfg }) {
  // ---------- Textura: o mapa, com o bioma sob o ponteiro aceso ----------

  const W = 1024;
  const H = Math.round(W / PROPORCAO_MAPA);
  const tela = document.createElement("canvas");
  tela.width = W;
  tela.height = H;
  const g = tela.getContext("2d");
  const textura = new THREE.CanvasTexture(tela);
  textura.anisotropy = 8;

  function desenharTextura(ativo) {
    desenharMapaBiomas(g, 0, 0, W, H, ativo?.nome ?? null);
    textura.needsUpdate = true;
  }
  desenharTextura(null);

  // ---------- Placa 3D e sombra ----------

  const grupo = new THREE.Group();
  grupo.visible = false;
  scene.add(grupo);

  // a frente usa a mesma conta de cor das páginas, para a placa parada ser igual ao papel
  const frente = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms: { mapa: { value: textura }, uLuzPagina: luzPagina },
      vertexShader: VERTICE,
      fragmentShader: `
        uniform sampler2D mapa;
        uniform vec3 uLuzPagina;
        varying vec2 vUv;
        void main() { gl_FragColor = vec4(texture2D(mapa, vUv).rgb * uLuzPagina, 1.0); }`,
    }),
  );
  grupo.add(frente);

  // lados da placa: a espessura aparece quando ela inclina
  const lados = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: COR.preto }));
  grupo.add(lados);

  // sombra no papel embaixo da placa (também esconde o mapa impresso enquanto ela está no alto)
  const MARGEM = 0.12; // quanto a sombra passa da placa, em fração do tamanho
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { forca: { value: 0 }, margem: { value: MARGEM } },
      vertexShader: VERTICE,
      fragmentShader: `
        uniform float forca;
        uniform float margem;
        varying vec2 vUv;
        void main() {
          vec2 q = abs(vUv - 0.5) * 2.0;     // 0 no centro, 1 na borda da sombra
          float placa = 1.0 / (1.0 + 2.0 * margem); // onde termina a placa
          vec2 t = clamp((q - placa) / (1.0 - placa), 0.0, 1.0);
          float a = 1.0 - smoothstep(0.0, 1.0, max(t.x, t.y));
          gl_FragColor = vec4(0.05, 0.03, 0.02, a * forca);
        }`,
    }),
  );
  sombra.visible = false;
  scene.add(sombra);

  // ---------- Cartão com os números do bioma ----------

  const cartao = document.createElement("div");
  cartao.className = "mapa-cartao";
  cartao.hidden = true;
  cartao.setAttribute("role", "status");
  cartao.innerHTML = `
    <div class="mapa-cartao__topo"><span class="mapa-cartao__nome"></span><span class="mapa-cartao__parte"></span></div>
    <p class="mapa-cartao__periodo"></p>
    <canvas class="mapa-cartao__grafico" width="560" height="250"></canvas>
    <p class="mapa-cartao__area"></p>
    <p class="mapa-cartao__fonte"></p>`;
  document.body.appendChild(cartao);
  const elNome = cartao.querySelector(".mapa-cartao__nome");
  const elParte = cartao.querySelector(".mapa-cartao__parte");
  const elGrafico = cartao.querySelector(".mapa-cartao__grafico");
  const elArea = cartao.querySelector(".mapa-cartao__area");
  cartao.querySelector(".mapa-cartao__periodo").textContent = cfg.periodo;
  cartao.querySelector(".mapa-cartao__fonte").textContent = cfg.fonte;

  // barras com os focos de todos os biomas; a do bioma em destaque fica acesa
  function desenharGrafico(ativo) {
    const c = elGrafico.getContext("2d");
    const w = elGrafico.width;
    const h = elGrafico.height;
    const cores = coresDosBiomas();
    const lista = [...cfg.biomas].sort((a, b) => b.focos - a.focos);
    const max = Math.max(...lista.map((b) => b.focos));
    const linha = h / lista.length;
    const lw = 170;
    const fmt = (n) => n.toLocaleString("pt-BR");
    c.clearRect(0, 0, w, h);
    c.textBaseline = "middle";
    lista.forEach((b, i) => {
      const y = i * linha;
      const eh = b === ativo;
      c.font = `${eh ? 600 : 400} 22px "Inter", system-ui, sans-serif`;
      c.fillStyle = eh ? COR.preto : COR.suave;
      c.textAlign = "right";
      c.fillText(b.nome, lw - 12, y + linha / 2);
      const bw = Math.max(3, ((w - lw - 110) * b.focos) / max);
      c.fillStyle = eh ? cores[b.nome] : COR.bege;
      c.fillRect(lw, y + linha * 0.2, bw, linha * 0.6);
      c.textAlign = "left";
      c.font = `${eh ? 600 : 400} 21px "Inter", system-ui, sans-serif`;
      c.fillStyle = eh ? COR.preto : COR.suave;
      c.fillText(fmt(b.focos), lw + bw + 8, y + linha / 2);
    });
  }

  // ---------- Estado ----------

  let subida = 0;      // 0 = deitado no papel, 1 = no alto
  let sobre = false;   // ponteiro em cima do mapa
  let fixo = false;    // tocado/clicado: fica no alto até tocar fora
  let ativo = null;    // bioma sob o ponteiro
  let ponteiro = null; // última posição do ponteiro na tela
  let pos = null;      // { visivel, cx, cy, w, h, z } do último quadro

  function definirAtivo(b) {
    if (b === ativo) return;
    ativo = b;
    desenharTextura(b);
    if (!b) {
      cartao.hidden = true;
      return;
    }
    elNome.textContent = b.nome;
    elParte.textContent = `${b.parte.toLocaleString("pt-BR")}%`;
    elArea.textContent = b.area ?? "";
    elArea.hidden = !b.area;
    desenharGrafico(b);
    cartao.hidden = false;
    posicionarCartao();
  }

  // largura do mapa na tela (cantos do lugar dele no papel, com folga para quando sobe)
  const canto = new THREE.Vector3();
  function mapaNaTela() {
    const r = canvas.getBoundingClientRect();
    let x0 = Infinity;
    let x1 = -Infinity;
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      canto.set(pos.cx + (dx * pos.w) / 2, pos.cy + (dy * pos.h) / 2, pos.z).project(camera);
      const x = r.left + ((canto.x + 1) / 2) * r.width;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
    }
    const folga = (x1 - x0) * 0.08;
    return { x0: x0 - folga, x1: x1 + folga };
  }

  // o cartão fica ao lado do mapa (de preferência à esquerda), sem cobrir o bioma aceso
  function posicionarCartao() {
    if (cartao.hidden || !ponteiro || !pos) return;
    const m = 16;
    const r = cartao.getBoundingClientRect();
    const tela = mapaNaTela();
    let x = tela.x0 - m - r.width;
    if (x < 8) x = tela.x1 + m;
    if (x + r.width > window.innerWidth - 8) x = Math.max(8, ponteiro.x - m - r.width);
    const y = Math.max(8, Math.min(window.innerHeight - r.height - 8, ponteiro.y - r.height / 2));
    cartao.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // ---------- Ponteiro ----------

  const raio = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ponto = new THREE.Vector3();

  // o ponteiro está sobre o mapa? Vale a placa (onde quer que ela esteja) ou o lugar
  // dela no papel, para o mapa não ficar subindo e descendo quando o mouse está na borda
  function testar(x, y) {
    if (!pos || !pos.visivel) {
      sobre = false;
      definirAtivo(null);
      return false;
    }
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -(((y - r.top) / r.height) * 2 - 1));
    raio.setFromCamera(ndc, camera);
    grupo.updateMatrixWorld();
    const hit = raio.intersectObject(frente, false)[0];
    let noPapel = false;
    plano.constant = -pos.z;
    if (raio.ray.intersectPlane(plano, ponto)) {
      noPapel = Math.abs(ponto.x - pos.cx) <= pos.w / 2 && Math.abs(ponto.y - pos.cy) <= pos.h / 2;
    }
    sobre = !!hit || noPapel;
    definirAtivo(hit ? biomaEm(hit.uv.x, 1 - hit.uv.y) : null);
    return sobre;
  }

  function sair() {
    ponteiro = null;
    sobre = false;
    fixo = false;
    definirAtivo(null);
  }

  // ---------- Quadro a quadro ----------

  function atualizar(dt, estado) {
    pos = estado;
    if (!estado.visivel) {
      subida = 0;
      grupo.visible = false;
      sombra.visible = false;
      sobre = false;
      fixo = false;
      definirAtivo(null);
      return;
    }
    // o mapa se mexe enquanto sobe: o que está sob o ponteiro muda mesmo com o mouse parado
    if (ponteiro) testar(ponteiro.x, ponteiro.y);
    const alvo = sobre || fixo ? 1 : 0;
    subida += (alvo - subida) * (1 - Math.exp(-VELOCIDADE * dt));
    if (Math.abs(alvo - subida) < 1e-3) subida = alvo;
    const s = subida * subida * (3 - 2 * subida);

    grupo.visible = true;
    grupo.position.set(estado.cx, estado.cy, estado.z + 0.0008 + SUBIDA * s);
    grupo.rotation.set(-INCLINACAO * s, 0, 0);
    grupo.scale.set(estado.w, estado.h, 1);
    const esp = Math.max(1e-4, ESPESSURA * s);
    lados.scale.set(1, 1, esp);
    lados.position.z = -esp / 2 - 1e-4;

    sombra.visible = s > 0.001;
    sombra.position.set(estado.cx + 0.015 * s, estado.cy - 0.03 * s, estado.z + 0.0005);
    sombra.scale.set(estado.w * (1 + 2 * MARGEM), estado.h * (1 + 2 * MARGEM), 1);
    sombra.material.uniforms.forca.value = 0.85 * s;
    posicionarCartao();
  }

  return {
    atualizar,
    // mouse andando (sem botão apertado): devolve true se está sobre o mapa
    apontar(x, y) {
      ponteiro = { x, y };
      return testar(x, y);
    },
    // clique ou toque: devolve true se foi no mapa. No toque não existe "passar o mouse",
    // então o mapa tocado fica no alto até tocar fora dele
    tocar(x, y, toque) {
      ponteiro = { x, y };
      const noMapa = testar(x, y);
      fixo = toque && noMapa;
      return noMapa;
    },
    sair,
    // para testes no console (revista.mapa.estado())
    estado: () => ({ pos, subida, sobre, fixo, ativo: ativo?.nome ?? null }),
  };
}
