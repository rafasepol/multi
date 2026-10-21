// Câmera da revista.
//
// Posições:
// - capa:       revista fechada, câmera inclinada e girada (revista "jogada" na grama);
// - aberta:     vista de cima, reta, com as duas páginas abertas cabendo na tela;
// - esquerda / direita: vista de cima de uma página só (tela em pé, como no celular);
// - contracapa: espelho da capa, centrada na contracapa.
//
// A troca de posição é uma transição suave (sempre parte de onde a câmera está).
// Também converte a posição do mouse na tela em um ponto no plano da revista (z = 0).

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const INCLINACAO_FECHADA = THREE.MathUtils.degToRad(30); // câmera inclinada com a revista fechada
const GIRO_FECHADA = THREE.MathUtils.degToRad(7);        // revista caída "torta" na grama
const OCUPACAO_FECHADA = 0.72; // fração da tela ocupada pela revista fechada
const FOLGA_ABERTA = 1;        // 1 = as páginas encostam na borda da tela que limita
const DURACAO = 1.4;           // segundos de transição entre as posições

// curva de aceleração: começa e termina devagar
function suavizar(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function misturar(a, b, e) {
  const l = THREE.MathUtils.lerp;
  return {
    alvoX: l(a.alvoX, b.alvoX, e),
    distancia: l(a.distancia, b.distancia, e),
    inclinacao: l(a.inclinacao, b.inclinacao, e),
    giro: l(a.giro, b.giro, e),
  };
}

// Posiciona uma câmera a partir de uma "pose" (alvo, distância, inclinação e giro)
function aplicar(cam, pose) {
  const frente = new THREE.Vector3(Math.sin(pose.giro), Math.cos(pose.giro), 0);
  const alvo = new THREE.Vector3(pose.alvoX, 0, 0);
  cam.position
    .copy(alvo)
    .addScaledVector(frente, -pose.distancia * Math.sin(pose.inclinacao))
    .setZ(pose.distancia * Math.cos(pose.inclinacao));
  cam.up.copy(frente); // o topo da tela aponta para "a frente" no chão
  cam.lookAt(alvo);
  cam.updateMatrixWorld();
}

export function criarCamera({ fov, altura }) {
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
  const rascunho = camera.clone(); // usada para calcular o que cada posição enxerga
  const raycaster = new THREE.Raycaster();
  const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2();
  const ponto = new THREE.Vector3();

  const poses = {};
  let destino = "capa";
  let partida = null;
  let atual = null;
  let t = 1;

  // largura = largura de UMA página no mundo (a proporção da página é fixa)
  function ajustar(largura, aspecto) {
    camera.aspect = aspecto;
    camera.updateProjectionMatrix();
    rascunho.aspect = aspecto;
    rascunho.updateProjectionMatrix();

    const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    // distância em que um retângulo w × h cabe inteiro na tela
    const caber = (w, h) => Math.max(h / 2 / tan, w / 2 / (tan * aspecto));
    const distAberta = caber(2 * largura, altura) * FOLGA_ABERTA;
    const distPagina = caber(largura, altura) * FOLGA_ABERTA;
    const distFechada = caber(largura / OCUPACAO_FECHADA, altura / OCUPACAO_FECHADA);
    poses.aberta = { alvoX: 0, distancia: distAberta, inclinacao: 0, giro: 0 };
    poses.esquerda = { alvoX: -largura / 2, distancia: distPagina, inclinacao: 0, giro: 0 };
    poses.direita = { alvoX: largura / 2, distancia: distPagina, inclinacao: 0, giro: 0 };
    poses.capa = { alvoX: largura / 2, distancia: distFechada, inclinacao: INCLINACAO_FECHADA, giro: -GIRO_FECHADA };
    poses.contracapa = { alvoX: -largura / 2, distancia: distFechada, inclinacao: INCLINACAO_FECHADA, giro: GIRO_FECHADA };

    if (!atual) {
      atual = { ...poses[destino] };
      partida = { ...atual };
    }
    if (t >= 1) atual = { ...poses[destino] };
    aplicar(camera, atual);
  }

  function definirEstado(nome) {
    if (nome === destino || !atual) return;
    partida = { ...atual };
    destino = nome;
    t = 0;
  }

  function atualizar(dt) {
    if (!atual) return;
    if (t < 1) t = Math.min(1, t + dt / DURACAO);
    atual = misturar(partida, poses[destino], suavizar(t));
    aplicar(camera, atual);
  }

  // 0 = posição fechada (inclinada), 1 = posição de leitura (de cima)
  function abertura() {
    if (!atual) return 0;
    return 1 - THREE.MathUtils.clamp(atual.inclinacao / INCLINACAO_FECHADA, 0, 1);
  }

  // vista de leitura (de cima), já parada
  function totalmenteAberta() {
    return (destino === "aberta" || destino === "esquerda" || destino === "direita") && t >= 1;
  }

  // ponto do plano da revista (z = 0) sob uma posição da tela
  function raioNoPlano(cam, nx, ny) {
    ndc.set(nx, ny);
    raycaster.setFromCamera(ndc, cam);
    const hit = raycaster.ray.intersectPlane(plano, ponto);
    return hit ? { x: hit.x, y: hit.y } : null;
  }

  function pontoNoLivro(clientX, clientY, elemento) {
    const r = elemento.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    const nx = ((clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((clientY - r.top) / r.height) * 2 - 1);
    return raioNoPlano(camera, nx, ny);
  }

  // os quatro cantos da tela projetados no chão, para uma das posições
  function cantosNoChao(nome) {
    aplicar(rascunho, poses[nome]);
    return [
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ].map(([x, y]) => raioNoPlano(rascunho, x, y));
  }

  return {
    camera,
    ajustar,
    definirEstado,
    atualizar,
    abertura,
    totalmenteAberta,
    parada: () => t >= 1, // já chegou à posição de destino
    pontoNoLivro,
    cantosNoChao,
    estado: () => destino,
  };
}
