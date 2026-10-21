// Página do mascote (mascote.html): o boneco de mascote.js sozinho, para girar e salvar.
//
// Arraste para girar; "Baixar PNG" salva o mascote, do ângulo que estiver na tela, com fundo
// transparente. Com ?exportar no endereço, a página mostra só o mascote parado e sem fundo,
// para virar assets/mascote/mascote-onu.png (veja o README).

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { criarMascote } from "./mascote.js";

const EXPORTAR = new URLSearchParams(location.search).has("exportar");
const TAMANHO_PNG = 2048; // lado da foto antes do recorte, em pixels

if (EXPORTAR) document.body.classList.add("exportar");

const canvas = document.getElementById("cena");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.NeutralToneMapping;

const scene = new THREE.Scene();
const sol = new THREE.DirectionalLight(0xffffff, 1.6);
sol.position.set(-3, 5, 4);
const contraluz = new THREE.DirectionalLight(0xcdeeff, 1.4);
contraluz.position.set(3, 2.5, -4);
scene.add(sol, contraluz);

// o boneco tem a origem nos pés; a câmera mira o meio dele
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
const ALVO = new THREE.Vector3(0, 1.34, 0);
camera.position.set(0.9, 1.76, 7.6);
camera.lookAt(ALVO);

const mascote = await criarMascote({ renderer });
scene.add(mascote.grupo);

function ajustar() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.zoom = Math.min(1, camera.aspect / 0.8); // tela em pé: afasta para caber
  camera.updateProjectionMatrix();
}
addEventListener("resize", ajustar);
ajustar();

// recorta a imagem no que não é transparente (a sombra conta), com uma folga pequena
function recortar(origem) {
  const tela = document.createElement("canvas");
  tela.width = origem.width;
  tela.height = origem.height;
  const g = tela.getContext("2d", { willReadFrequently: true });
  g.drawImage(origem, 0, 0);
  const { data, width, height } = g.getImageData(0, 0, tela.width, tela.height);
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= 2) continue;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  const folga = Math.round(width * 0.01);
  [x0, y0] = [Math.max(0, x0 - folga), Math.max(0, y0 - folga)];
  [x1, y1] = [Math.min(width, x1 + folga), Math.min(height, y1 + folga)];
  const recorte = document.createElement("canvas");
  recorte.width = x1 - x0;
  recorte.height = y1 - y0;
  recorte.getContext("2d").drawImage(tela, x0, y0, recorte.width, recorte.height, 0, 0, recorte.width, recorte.height);
  return recorte;
}

// PNG do ângulo atual, com fundo transparente e sem sobras em volta (data URL)
function fotografar() {
  const razao = renderer.getPixelRatio();
  renderer.setPixelRatio(1);
  renderer.setSize(TAMANHO_PNG, TAMANHO_PNG, false);
  camera.aspect = 1;
  camera.zoom = 1;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const png = recortar(canvas).toDataURL("image/png");
  renderer.setPixelRatio(razao);
  ajustar();
  return png;
}

if (EXPORTAR) {
  // a foto vai para um <img>: o Chrome sem janela (--dump-dom) devolve a página com ela
  const foto = new Image();
  foto.alt = "Mascote da ONU";
  foto.src = fotografar();
  foto.style.cssText = "display:block;width:100vmin;height:100vmin;margin:auto;object-fit:contain";
  canvas.replaceWith(foto);
  document.body.dataset.pronto = "sim";
} else {
  const controles = new OrbitControls(camera, canvas);
  controles.target.copy(ALVO);
  controles.enableDamping = true;
  controles.enablePan = false;
  controles.minDistance = 4;
  controles.maxDistance = 12;

  const relogio = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    mascote.posar(relogio.getDelta());
    controles.update();
    renderer.render(scene, camera);
  });

  document.getElementById("baixar").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = fotografar();
    link.download = "mascote-onu.png";
    link.click();
  });
}
