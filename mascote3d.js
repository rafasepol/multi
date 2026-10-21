// Mascote da ONU em pé na grama queimada, ao lado da contracapa.
//
// Ele aparece quando a frente de fogo passa pelo lugar dele (cenario.js) e some quando a
// revista sai da contracapa. Fica olhando para o ponteiro; cada clique (ou toque) nele faz
// ele pular e dizer a próxima fala de REVISTA.mascote (dados.js), num balão sobre a cabeça.
// O boneco vem de mascote.js; aqui ele é posto no chão da revista (z para cima) e ganha uma
// luz só dele, com as cores do sol e das brasas do cenário.
//
// script.js chama atualizar() todo quadro e repassa o ponteiro em apontar() (mouse andando),
// tocar() (clique ou toque) e sair(), como no mapa (mapa3d.js).

import * as THREE from "three";
import { criarMascote, ALTURA_MASCOTE } from "./mascote.js";

const ALTURA = 0.85;         // altura no mundo (a revista tem 2): uns 12 cm
const LARGURA_BONECO = ALTURA * 1.15; // largura no mundo, com o braço que acena
const INCLINACAO = 0.55;     // tomba para trás (radianos), olhando para a câmera, que vê de cima
const VIRADA_MAX = 0.45;     // quanto ele gira para acompanhar o ponteiro (radianos)
const SEGUIR = 6;            // quão rápido ele gira até o ponteiro
const MOLA = 160;            // aparecer e sumir: mola com um pouco de balanço
const BALANCO = 0.35;        // 1 = sem balanço
const DURACAO_PULO = 0.65;   // segundos
const DURACAO_ANIMO = 2.5;   // segundos de aceno animado depois de um clique
const DURACAO_FALA = 5;      // segundos que o balão fica na tela
const ATRASO_OI = 0.8;       // segundos depois de aparecer até dizer "oi"
const FOLGA_FOGO = 0.45;     // o fogo precisa passar desta distância além dos pés dele

export async function criarMascote3D({ scene, renderer, camera, canvas, cenario, largura, cfg }) {
  const mascote = await criarMascote({ renderer, reflexo: 0.4, corSombra: "#000000", forcaSombra: 0.6 });

  // de pé no chão: o boneco tem y para cima; aqui o alto é +z
  const pe = new THREE.Group();
  pe.rotation.order = "ZYX";
  pe.rotation.x = Math.PI / 2;
  pe.visible = false;
  pe.add(mascote.grupo);
  scene.add(pe);
  const escala = ALTURA / ALTURA_MASCOTE;

  // luz só para ele (o resto da cena usa shaders com a luz do cenário)
  const sol = new THREE.DirectionalLight();
  sol.target = pe;
  const ceu = new THREE.HemisphereLight();
  ceu.position.set(0, 0, 1);
  const brasas = new THREE.DirectionalLight("#ff7a2e"); // brilho alaranjado do chão, por trás
  brasas.target = pe;
  scene.add(sol, ceu, brasas);

  // ---------- Balão de fala ----------

  const balao = document.createElement("div");
  balao.className = "mascote-balao";
  balao.hidden = true;
  balao.setAttribute("role", "status");
  document.body.appendChild(balao);
  let tempoFala = 0;
  let proxima = 0; // índice da próxima fala

  function falar(texto) {
    balao.textContent = texto;
    balao.hidden = false;
    // reinicia a animação de entrada
    balao.style.animation = "none";
    void balao.offsetWidth;
    balao.style.animation = "";
    tempoFala = DURACAO_FALA;
  }

  const cabeca = new THREE.Vector3();
  function posicionarBalao() {
    if (balao.hidden) return;
    mascote.topo.getWorldPosition(cabeca).project(camera);
    const r = canvas.getBoundingClientRect();
    const w = balao.offsetWidth;
    const x = r.left + ((cabeca.x + 1) / 2) * r.width;
    const y = r.top + ((1 - cabeca.y) / 2) * r.height;
    balao.style.left = `${Math.round(Math.min(Math.max(x, w / 2 + 8), innerWidth - w / 2 - 8))}px`;
    balao.style.top = `${Math.round(y)}px`;
  }

  // ---------- Estado ----------

  const lugar = new THREE.Vector2(); // onde ele fica no chão
  const camChao = new THREE.Vector3();
  let frente = 0;      // giro que deixa o rosto virado para a câmera
  let virar = 0;       // giro extra, para olhar o ponteiro
  let alvoChao = null; // ponto do chão sob o ponteiro
  let s = 0, vs = 0;   // tamanho (0 = sumido, 1 = inteiro) e velocidade da mola
  let pulo = -1;       // andamento do pulo (0–1); -1 = no chão
  let animo = 0;
  let tempoOi = -1;    // contagem para o "oi" depois de aparecer
  let sobre = false;   // ponteiro em cima dele

  // Lugar: à esquerda da contracapa (deitada em x de -largura a 0, y de -1 a 1), no meio do
  // chão que sobra até a borda da tela; se não couber (tela em pé), acima da revista.
  // Vale a câmera do momento: ele só muda de lugar escondido, e só aparece depois que o
  // fogo passa, quando a câmera já parou na contracapa.
  const chao = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const borda = new THREE.Vector3();
  function noChao(nx, ny) {
    raio.setFromCamera(ndc.set(nx, ny), camera);
    return raio.ray.intersectPlane(chao, borda);
  }
  function definirLugar() {
    const esq = noChao(-1, -0.2);
    const livre = esq ? -largura - esq.x : 0;
    if (livre > LARGURA_BONECO * 1.2) {
      lugar.set(-largura - Math.min(livre / 2, LARGURA_BONECO), THREE.MathUtils.clamp(esq.y, -0.6, 0.2));
      return;
    }
    const alto = noChao(0, 1);
    const acima = alto ? alto.y - 1 : 0;
    lugar.set(-largura / 2 + 0.3, 1 + Math.min(acima * 0.3, 0.6));
  }

  // giro (em torno de z) que vira o rosto do boneco para o ponto (x, y) do chão
  const giroPara = (x, y) => Math.atan2(x - lugar.x, -(y - lugar.y));
  const embrulhar = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  // ---------- Ponteiro ----------

  const raio = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const meio = new THREE.Vector3();
  const esfera = new THREE.Sphere();

  // uma esfera em volta do corpo: mais fácil de acertar com o dedo que o boneco em si
  function acertou(x, y) {
    if (!pe.visible || s < 0.6) return false;
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -(((y - r.top) / r.height) * 2 - 1));
    raio.setFromCamera(ndc, camera);
    mascote.centro.getWorldPosition(meio);
    esfera.set(meio, escala * s * 1.35);
    return raio.ray.intersectsSphere(esfera);
  }

  function clicar() {
    pulo = 0;
    animo = 1;
    tempoOi = -1;
    if (cfg.falas?.length) {
      falar(cfg.falas[proxima]);
      proxima = (proxima + 1) % cfg.falas.length;
    }
  }

  function sair() {
    alvoChao = null;
    sobre = false;
  }

  // ---------- Quadro a quadro ----------

  const u = cenario.uniforms;
  const cor = (destino, v) => destino.setRGB(v.x, v.y, v.z, THREE.SRGBColorSpace);

  // estado: posição da câmera; visivel: se o cenário aparece
  function atualizar(dt, { estado, visivel }) {
    // só muda de lugar escondido, para não pular de um canto para outro na frente de quem lê
    if (s < 0.01 && estado === "contracapa") definirLugar();

    // aparece depois que o fogo passa por ele; some ao sair da contracapa
    const distFogo = lugar.distanceTo(u.uFogoCentro.value);
    const queimado = u.uFogoRaio.value > distFogo + FOLGA_FOGO;
    const alvo = estado === "contracapa" && visivel && queimado ? 1 : 0;
    if (alvo && s < 0.01 && vs <= 0) tempoOi = ATRASO_OI;
    const k = alvo ? MOLA : MOLA * 2;
    for (let i = 0; i < 4; i++) { // passos pequenos: a mola não dispara com quadros lentos
      vs += (k * (alvo - s) - 2 * Math.sqrt(k) * BALANCO * vs) * (dt / 4);
      s += vs * (dt / 4);
    }
    if (!alvo && s < 0.01) { s = 0; vs = 0; }

    pe.visible = s > 0.001;
    if (!pe.visible) {
      balao.hidden = true;
      pulo = -1;
      animo = 0;
      tempoOi = -1;
      sobre = false;
      return;
    }

    // rosto para a câmera; o giro extra segue o ponteiro, até um limite
    camChao.setFromMatrixPosition(camera.matrixWorld);
    frente = giroPara(camChao.x, camChao.y);
    const alvoVirar = alvoChao
      ? THREE.MathUtils.clamp(embrulhar(giroPara(alvoChao.x, alvoChao.y) - frente), -VIRADA_MAX, VIRADA_MAX)
      : 0;
    virar += (alvoVirar - virar) * (1 - Math.exp(-SEGUIR * dt));

    if (pulo >= 0) {
      pulo += dt / DURACAO_PULO;
      if (pulo >= 1) pulo = -1;
    }
    animo = Math.max(sobre ? 0.4 : 0, animo - dt / DURACAO_ANIMO);

    pe.position.set(lugar.x, lugar.y, 0);
    pe.rotation.z = frente;
    pe.scale.setScalar(escala * Math.max(0, s));
    mascote.posar(dt, { virar, inclinar: INCLINACAO, pulo, animo });

    // luz: o sol e o céu do cenário (fumaça, tom alaranjado) e as brasas, que vão se apagando
    cor(sol.color, u.uCorSol.value);
    sol.intensity = 3.2;
    sol.position.set(lugar.x, lugar.y, 0).addScaledVector(u.uDirSol.value, 5);
    cor(ceu.color, u.uCorAmbiente.value);
    ceu.groundColor.set("#1a120c");
    ceu.intensity = 2.8;
    brasas.position.set(lugar.x - Math.sin(frente) * 3, lugar.y + Math.cos(frente) * 3, 0.6);
    brasas.intensity = 1.6 * u.uBrasas.value;

    // "oi" logo depois de aparecer, para quem lê saber que dá para mexer com ele
    if (tempoOi >= 0) {
      tempoOi -= dt;
      if (tempoOi < 0 && cfg.oi) falar(cfg.oi);
    }
    if (!balao.hidden) {
      tempoFala -= dt;
      if (tempoFala <= 0 || s < 0.5) balao.hidden = true;
    }
    pe.updateMatrixWorld(true);
    posicionarBalao();
  }

  return {
    atualizar,
    // mouse andando (sem botão apertado): ele olha para o ponto do chão; devolve true se o
    // ponteiro está em cima dele
    apontar(x, y, pontoDoChao) {
      alvoChao = pontoDoChao;
      sobre = acertou(x, y);
      return sobre;
    },
    // clique ou toque: devolve true se foi nele
    tocar(x, y) {
      if (!acertou(x, y)) return false;
      clicar();
      return true;
    },
    sair,
    // para testes no console (revista.mascote().estado())
    estado: () => ({ lugar: lugar.toArray(), tamanho: s, pulo, animo, fala: balao.hidden ? null : balao.textContent }),
  };
}
