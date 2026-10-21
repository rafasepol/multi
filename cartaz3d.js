// Plaquinha fincada na grama queimada, ao lado da contracapa: o caminho para o vídeo da equipe.
//
// Discreta, de papelão claro (o papel da revista), com a chamada em preto e um pequeno play
// vermelho. Ela sai devagar da cinza quando a frente de fogo passa pelo lugar dela
// (cenario.js) e afunda de volta quando a revista sai da contracapa. Com o ponteiro em cima,
// ela se apruma e cresce um pouco; o clique (ou toque) abre o vídeo, o que script.js faz
// quando tocar() devolve true. Como as páginas, ela recebe o tom da luz do cenário (luzPagina).
//
// script.js chama atualizar() todo quadro e repassa o ponteiro em apontar() (mouse andando),
// tocar() (clique ou toque) e sair(), como no mapa (mapa3d.js).

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { COR } from "./paleta.js";

// medidas no mundo (a revista tem 2 de altura, ≈ 28 cm)
const LARG_PLACA = 0.6;      // ≈ 8 cm
const ALT_PLACA = 0.36;
const ESPESSURA = 0.016;
const ALT_ESTACA = 0.3;      // do chão até a borda de baixo da placa
const INCLINACAO = 0.55;     // tomba para trás (radianos): a câmera vê de cima
const APRUMAR = 0.12;        // com o ponteiro em cima, ela se endireita este tanto
const CRESCER = 0.05;        // e cresce esta fração
const MENOR = 0.6;           // se faltar espaço na tela, ela encolhe até esta fração
const MOLA = 50;             // sair da cinza e voltar, sem balanço
const FOLGA_FOGO = 0.45;     // o fogo precisa passar desta distância além da estaca

// placa (textura): play pequeno à esquerda; à direita, a chamada em preto e, embaixo, o
// título e a duração; a borda de baixo fica suja de fuligem
function desenharCartaz(cfg) {
  const W = 1000, H = 600;
  const tela = document.createElement("canvas");
  tela.width = W;
  tela.height = H;
  const g = tela.getContext("2d");
  g.fillStyle = COR.papel;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = COR.preto;
  g.lineWidth = 6;
  g.strokeRect(28, 28, W - 56, H - 56);

  // play: triângulo vermelho num círculo de contorno preto
  const cx = 190, cy = H / 2;
  g.lineWidth = 10;
  g.beginPath();
  g.arc(cx, cy, 105, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = COR.vermelho;
  g.beginPath();
  g.moveTo(cx - 32, cy - 55);
  g.lineTo(cx + 58, cy);
  g.lineTo(cx - 32, cy + 55);
  g.closePath();
  g.fill();

  // chamada, uma linha por linha de `chamada`, diminuindo a letra até caber
  const x0 = 350, larg = W - x0 - 70;
  const linhas = cfg.chamada.split("\n").map((t) => t.toUpperCase());
  let tam = 110;
  const cabe = () => linhas.every((t) => g.measureText(t).width <= larg);
  do g.font = `400 ${tam}px "Anton", Impact, sans-serif`; while (!cabe() && (tam -= 4) > 40);
  g.fillStyle = COR.preto;
  g.textBaseline = "alphabetic";
  const alt = tam * 1.05;
  let y = cy - (linhas.length * alt) / 2 + tam * 0.8 - 26;
  for (const t of linhas) {
    g.fillText(t, x0, y);
    y += alt;
  }
  g.fillStyle = COR.suave;
  g.font = '600 34px "Inter", system-ui, sans-serif';
  g.fillText([cfg.titulo, cfg.duracao].filter(Boolean).join(" · "), x0, y + 18);

  const fuligem = g.createLinearGradient(0, H * 0.8, 0, H);
  fuligem.addColorStop(0, "rgba(28,26,24,0)");
  fuligem.addColorStop(1, "rgba(28,26,24,.35)");
  g.fillStyle = fuligem;
  g.fillRect(0, H * 0.8, W, H * 0.2);

  const textura = new THREE.CanvasTexture(tela);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  return textura;
}

// sombra no chão: um degradê redondo, que o plano achata em elipse
function texturaSombra() {
  const tela = document.createElement("canvas");
  tela.width = tela.height = 128;
  const g = tela.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(tela);
}

// cada face de uma caixa com um tom (a luz vem de cima à esquerda), como nas barras dos
// gráficos; ordem do BoxGeometry: +x, -x, +y, -y, +z, -z
function materiaisDeCaixa(cor) {
  const base = new THREE.Color(cor);
  return [0.62, 0.85, 0.5, 0.75, 1.1, 0.45].map((k) => new THREE.MeshBasicMaterial({ color: base.clone().multiplyScalar(k) }));
}

export function criarCartaz3D({ scene, camera, canvas, cenario, luzPagina, largura, cfg }) {
  // Montagem em pé, com z para cima e a frente virada para -y: a estaca nasce no chão e o
  // cartaz fica preso nela, na frente.
  const fincado = new THREE.Group(); // gira para a câmera e tomba para trás a partir do chão
  fincado.rotation.order = "ZXY";
  fincado.visible = false;
  scene.add(fincado);

  const estaca = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, ALT_ESTACA + ALT_PLACA * 0.7), materiaisDeCaixa("#4a3626"));
  estaca.position.set(0, 0.03, (ALT_ESTACA + ALT_PLACA * 0.7) / 2 - 0.02);
  const placa = new THREE.Mesh(new THREE.BoxGeometry(LARG_PLACA, ESPESSURA, ALT_PLACA), materiaisDeCaixa("#a8916c"));
  placa.position.set(0, 0, ALT_ESTACA + ALT_PLACA / 2);
  const materialCartaz = new THREE.MeshBasicMaterial({ map: desenharCartaz(cfg) });
  const cartaz = new THREE.Mesh(new THREE.PlaneGeometry(LARG_PLACA * 0.97, ALT_PLACA * 0.97), materialCartaz);
  cartaz.rotation.x = Math.PI / 2; // de pé, virado para -y
  cartaz.position.set(0, -ESPESSURA / 2 - 0.001, ALT_ESTACA + ALT_PLACA / 2);
  fincado.add(estaca, placa, cartaz);
  const pecas = [estaca, placa, cartaz];
  const coresBase = [...estaca.material, ...placa.material].map((m) => m.color.clone());

  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: texturaSombra(), color: "#000000", transparent: true, opacity: 0.5, depthWrite: false })
  );
  sombra.visible = false;
  scene.add(sombra);

  // ---------- Lugar ----------

  // Encostado na contracapa (deitada em x de -largura a 0, y de -1 a 1), do lado em que ele
  // cabe maior na tela, nesta ordem de preferência: esquerda, direita, acima, abaixo.
  // Calculado com a câmera parada na contracapa: ele só muda de lugar escondido.
  const lugar = new THREE.Vector2(); // pé da estaca, no chão
  let fator = 1;                     // fração do tamanho inteiro que cabe na tela
  let lugarPronto = false;           // lugar calculado nesta ida à contracapa, com a câmera parada
  const FOLGA = 0.14;                // distância até a revista
  const lados = [
    (k) => [-largura - FOLGA - (LARG_PLACA * k) / 2, -0.15],
    (k) => [FOLGA + (LARG_PLACA * k) / 2, -0.15],
    (k) => [-largura / 2, 1 + FOLGA],
    (k) => [-largura / 2, -1 - FOLGA - 0.35 * k],
  ];
  const camChao = new THREE.Vector3();

  // giro (em torno de z) que vira a frente (-y) para o ponto (x, y) do chão
  const giroPara = (x, y, de) => Math.atan2(x - de.x, -(y - de.y));

  // posiciona o cartaz em pé no lugar `em`, no tamanho k (aprumar: 0 a 1)
  function posicionar(em, k, aprumar = 0) {
    camChao.setFromMatrixPosition(camera.matrixWorld);
    fincado.position.set(em.x, em.y, 0);
    fincado.rotation.set(-INCLINACAO + APRUMAR * aprumar, 0, giroPara(camChao.x, camChao.y, em));
    fincado.scale.setScalar(k);
    fincado.updateMatrixWorld(true);
  }

  // o cartaz inteiro fica na tela no tamanho k? (embaixo ficam os botões da revista)
  const caixa = new THREE.Box3();
  const ponta = new THREE.Vector3();
  const tentativa = new THREE.Vector2();
  function cabe(lado, k) {
    posicionar(tentativa.set(...lado(k)), k);
    caixa.setFromObject(fincado);
    for (let i = 0; i < 8; i++) {
      ponta.set(i & 1 ? caixa.max.x : caixa.min.x, i & 2 ? caixa.max.y : caixa.min.y, i & 4 ? caixa.max.z : caixa.min.z).project(camera);
      if (Math.abs(ponta.x) > 0.96 || ponta.y < -0.78 || ponta.y > 0.94) return false;
    }
    return true;
  }

  function definirLugar() {
    let melhor = null;
    for (const lado of lados) {
      // maior tamanho que cabe (busca binária entre MENOR e 1)
      let k = cabe(lado, 1) ? 1 : 0;
      if (!k && cabe(lado, MENOR)) {
        let a = MENOR, b = 1;
        for (let i = 0; i < 7; i++) {
          const m = (a + b) / 2;
          if (cabe(lado, m)) a = m; else b = m;
        }
        k = a;
      }
      if (!melhor || k > melhor.k + 0.02) melhor = { lado, k };
    }
    fator = Math.max(melhor.k, MENOR); // nada coube inteiro: fica no menor tamanho, à esquerda
    lugar.set(...melhor.lado(fator));
  }

  // ---------- Ponteiro ----------

  const raio = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let s = 0, vs = 0;   // quanto ela já saiu da cinza (0 = enterrada, 1 = em pé) e velocidade
  let sobre = false;   // ponteiro em cima dela
  let aprumado = 0;    // 0 = tombado, 1 = aprumado (ponteiro em cima)

  function acertou(x, y) {
    if (!fincado.visible || s < 0.6) return false;
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -(((y - r.top) / r.height) * 2 - 1));
    raio.setFromCamera(ndc, camera);
    return raio.intersectObjects(pecas, false).length > 0;
  }

  // ---------- Quadro a quadro ----------

  const u = cenario.uniforms;

  // estado: posição da câmera; cameraParada: se ela já chegou lá; visivel: se o cenário aparece
  function atualizar(dt, { estado, cameraParada, visivel }) {
    // só muda de lugar escondido, para não pular de um canto para outro na frente de quem lê
    if (s < 0.01) {
      if (estado !== "contracapa") lugarPronto = false;
      else if (cameraParada) {
        definirLugar();
        lugarPronto = true;
      }
    }

    // sai da cinza depois que o fogo passa por ele; afunda ao sair da contracapa
    const queimado = u.uFogoRaio.value > lugar.distanceTo(u.uFogoCentro.value) + FOLGA_FOGO;
    const alvo = estado === "contracapa" && visivel && lugarPronto && queimado ? 1 : 0;
    const k = alvo ? MOLA : MOLA * 2;
    for (let i = 0; i < 4; i++) { // passos pequenos: a mola não dispara com quadros lentos
      vs += (k * (alvo - s) - 2 * Math.sqrt(k) * vs) * (dt / 4);
      s += vs * (dt / 4);
    }
    if (!alvo && s < 0.01) { s = 0; vs = 0; }

    fincado.visible = sombra.visible = s > 0.001;
    if (!fincado.visible) {
      sobre = false;
      aprumado = 0;
      return;
    }

    aprumado += ((sobre ? 1 : 0) - aprumado) * (1 - Math.exp(-10 * dt));
    posicionar(lugar, fator * (1 + CRESCER * aprumado), aprumado);
    // sai do chão de baixo para cima (o chão esconde o que ainda está enterrado)
    fincado.position.z = -(ALT_ESTACA + ALT_PLACA) * fator * (1 - s);

    sombra.position.set(lugar.x + 0.08 * fator, lugar.y + 0.12 * fator, 0.002);
    sombra.rotation.z = fincado.rotation.z;
    sombra.scale.set(LARG_PLACA * 1.5 * fator, 0.55 * fator, 1);
    sombra.material.opacity = 0.5 * Math.min(1, s);

    // tom da luz do cenário, como nas páginas
    const luz = luzPagina.value;
    materialCartaz.color.setRGB(luz.x, luz.y, luz.z);
    [...estaca.material, ...placa.material].forEach((m, i) => m.color.copy(coresBase[i]).multiply(materialCartaz.color));
  }

  return {
    atualizar,
    // mouse andando (sem botão apertado): devolve true se está sobre o cartaz
    apontar(x, y) {
      sobre = acertou(x, y);
      return sobre;
    },
    // clique ou toque: devolve true se foi no cartaz
    tocar: acertou,
    sair() {
      sobre = false;
    },
    // para testes no console (revista.cartaz.estado())
    estado: () => ({ lugar: lugar.toArray(), fator, saida: s, sobre }),
  };
}
