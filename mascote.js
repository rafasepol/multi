// Mascote da ONU em 3D: um bichinho redondo no azul da ONU, com o emblema (o mapa-múndi visto
// do polo norte entre dois ramos de oliveira) na barriga, bracinhos, perninhas e um broto na
// cabeça. Ele respira, pisca, acena, pula e pode se virar e se inclinar.
//
// Este módulo só monta o boneco (criarMascote). Quem usa:
// - mascote3d.js: o mascote em pé na grama queimada, ao lado da contracapa da revista;
// - mascote-visor.js: a página mascote.html, para girar o boneco e salvar um PNG.
//
// O boneco é montado com y para cima e o rosto para +z; a origem fica no chão, entre os pés.
// Os módulos de exemplo do Three.js importam "three": a página precisa do importmap.

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm";

const COR = {
  azul: "#009edb", // azul da ONU
  branco: "#ffffff",
  olho: "#1b2233",
  bochecha: "#ff8fab",
  boca: "#3a1d2e",
  lingua: "#ff6f8d",
  broto: "#6dbb45",
  sombra: "#0b3a5c",
};

// medidas de montagem (o corpo é uma esfera de raio ~1 em volta da origem)
const CHAO = -1.36;   // sola dos pés
const QUADRIL = -0.9; // onde o tronco dobra para se inclinar
export const ALTURA_MASCOTE = 2.75; // do chão à ponta do broto

// ---------- Emblema da ONU, desenhado numa tela 2D ----------

// continentes (Natural Earth 1:110m), como lista de polígonos [anel externo, buracos...]
async function carregarTerra() {
  try {
    const topo = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json")).json();
    const terra = feature(topo, topo.objects.land);
    const formas = terra.type === "FeatureCollection" ? terra.features.map((f) => f.geometry) : [terra.geometry];
    return formas.flatMap((f) => (f.type === "Polygon" ? [f.coordinates] : f.coordinates));
  } catch (erro) {
    console.warn("Sem o contorno dos continentes; o emblema sai só com a grade.", erro);
    return [];
  }
}

// folha pontuda: sai de (x, y) na direção d, com comprimento L e largura w
function folha(g, x, y, [dx, dy], L, w) {
  const [nx, ny] = [-dy * w, dx * w];
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + dx * L * 0.5 + nx, y + dy * L * 0.5 + ny, x + dx * L, y + dy * L);
  g.quadraticCurveTo(x + dx * L * 0.5 - nx, y + dy * L * 0.5 - ny, x, y);
  g.fill();
}

function desenharEmblema(poligonos) {
  const T = 1024, c = T / 2, R = 300; // tela, centro e raio do mapa
  const tela = document.createElement("canvas");
  tela.width = tela.height = T;
  const g = tela.getContext("2d");
  g.fillStyle = g.strokeStyle = COR.branco;
  g.lineCap = g.lineJoin = "round";

  // Mapa: projeção azimutal equidistante centrada no polo norte, do polo até 60° S, com o
  // meridiano de Greenwich para baixo, como no emblema. A Antártida fica de fora.
  const projetar = ([lon, lat]) => {
    const r = ((90 - lat) / 150) * R, a = (lon * Math.PI) / 180;
    return [c + r * Math.sin(a), c + r * Math.cos(a)];
  };
  g.save();
  g.beginPath();
  g.arc(c, c, R, 0, Math.PI * 2);
  g.clip();
  g.beginPath();
  for (const poligono of poligonos) {
    if (Math.max(...poligono[0].map((p) => p[1])) < -58) continue;
    for (const anel of poligono) {
      anel.forEach((p, i) => (i ? g.lineTo(...projetar(p)) : g.moveTo(...projetar(p))));
      g.closePath();
    }
  }
  g.fill("evenodd");

  // grade: paralelos a cada 30° e meridianos a cada 45°
  g.lineWidth = 7;
  for (let k = 1; k <= 4; k++) {
    g.beginPath();
    g.arc(c, c, (R * k) / 5, 0, Math.PI * 2);
    g.stroke();
  }
  for (let k = 0; k < 4; k++) {
    const [dx, dy] = [R * Math.cos((k * Math.PI) / 4), R * Math.sin((k * Math.PI) / 4)];
    g.beginPath();
    g.moveTo(c - dx, c - dy);
    g.lineTo(c + dx, c + dy);
    g.stroke();
  }
  g.restore();
  g.lineWidth = 10;
  g.beginPath();
  g.arc(c, c, R, 0, Math.PI * 2);
  g.stroke();

  // Ramos de oliveira: os cabos se cruzam embaixo e cada ramo sobe por um lado, sem fechar
  // no alto. t é quanto o ramo já subiu (em radianos, contando de baixo).
  const Rr = R + 82;
  for (const lado of [-1, 1]) { // -1: ramo da esquerda; 1: da direita
    const ang = (t) => Math.PI / 2 - lado * t;
    const ponto = (t) => [c + Rr * Math.cos(ang(t)), c + Rr * Math.sin(ang(t))];
    const tangente = (t) => [lado * Math.sin(ang(t)), -lado * Math.cos(ang(t))];

    g.lineWidth = 10;
    g.beginPath();
    for (let i = 0; i <= 160; i++) {
      const t = -0.38 + (i / 160) * 3.2;
      i ? g.lineTo(...ponto(t)) : g.moveTo(...ponto(t));
    }
    g.stroke();

    // folhas aos pares, uma para fora e outra para dentro, diminuindo até a ponta
    const PARES = 7;
    for (let i = 0; i < PARES; i++) {
      const t = 0.22 + (i / PARES) * 2.6;
      const L = 76 - i * 3.5;
      for (const [s, atraso] of [[1, 0], [-1, 0.09]]) {
        const a = ang(t + atraso), [tx, ty] = tangente(t + atraso);
        const abertura = 0.62;
        const d = [tx * Math.cos(abertura) + s * Math.cos(a) * Math.sin(abertura),
                   ty * Math.cos(abertura) + s * Math.sin(a) * Math.sin(abertura)];
        folha(g, ...ponto(t + atraso), d, L, L * 0.34);
      }
    }
    folha(g, ...ponto(2.82), tangente(2.82), 54, 15);
  }
  return tela;
}

// ---------- Formas ----------

// corpo: uma esfera esticada, um pouco mais larga embaixo, como uma bala de goma
function geometriaCorpo() {
  let geo = new THREE.SphereGeometry(1, 128, 96);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const largura = 1 - 0.06 * v.y;
    p.setXYZ(i, v.x * largura, v.y * 1.04, v.z * largura * 0.9);
  }
  // junta a costura da esfera, para a luz não marcar uma linha nas costas
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  geo = mergeVertices(geo);
  geo.computeVertexNormals();
  return geo;
}

// folha 3D: pontuda nas duas pontas, levemente em concha; nasce na origem e cresce em +x
function geometriaFolha() {
  const geo = new THREE.SphereGeometry(1, 40, 20);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const s = (v.x + 1) / 2; // 0 no cabo, 1 na ponta
    const largura = Math.pow(Math.sin(Math.PI * s), 0.75);
    p.setXYZ(i, s, v.y * 0.1 * largura + 0.12 * s * s, v.z * 0.4 * largura);
  }
  geo.computeVertexNormals();
  return geo;
}

// sombra no chão: um degradê redondo, que o plano achata em elipse
function texturaSombra() {
  const tela = document.createElement("canvas");
  tela.width = tela.height = 256;
  const g = tela.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(tela);
}

// ---------- Montagem ----------

// reflexo: força dos reflexos de estúdio (só nos materiais do boneco)
// corSombra, forcaSombra: a sombra redonda no chão, embaixo dos pés
export async function criarMascote({ renderer, reflexo = 0.9, corSombra = COR.sombra, forcaSombra = 0.32 }) {
  const estudio = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  // plástico macio, como um boneco de vinil
  const material = (cor, extra = {}) => new THREE.MeshPhysicalMaterial({
    color: cor, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3, envMap: estudio, envMapIntensity: reflexo, ...extra,
  });
  const azul = material(COR.azul, { sheen: 0.6, sheenRoughness: 0.45, sheenColor: new THREE.Color("#c4ecff") });
  const branco = material(COR.branco, { roughness: 0.5 });
  const verde = material(COR.broto, { roughness: 0.5, side: THREE.DoubleSide });
  const esfera = new THREE.SphereGeometry(1, 48, 32);

  // raiz: no chão, entre os pés · boneco: pula, gira e amassa a partir dos pés ·
  // pecas: tudo nas medidas de montagem · tronco: corpo e braços, que dobram no quadril
  const raiz = new THREE.Group();
  const boneco = new THREE.Group();
  const pecas = new THREE.Group();
  pecas.position.y = -CHAO;
  const tronco = new THREE.Group();
  tronco.position.y = QUADRIL;
  tronco.rotation.order = "YXZ"; // inclina e depois gira
  const doTronco = new THREE.Group();
  doTronco.position.y = -QUADRIL;
  tronco.add(doTronco);
  pecas.add(tronco);
  boneco.add(pecas);
  raiz.add(boneco);

  // O corpo é montado parado na origem: as peças do rosto e o emblema são coladas na pele
  // antes de ele entrar na hierarquia.
  const corpo = new THREE.Mesh(geometriaCorpo(), azul);

  // Um raio vindo da frente acha o ponto do corpo em (x, y); a peça é virada para fora e
  // afundada um pouco.
  const raio = new THREE.Raycaster();
  const FRENTE = new THREE.Vector3(0, 0, 1);
  function colar(peca, x, y, afundar) {
    raio.set(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1));
    const [{ point, face }] = raio.intersectObject(corpo, false);
    peca.position.copy(point).addScaledVector(face.normal, -afundar);
    peca.quaternion.setFromUnitVectors(FRENTE, face.normal);
    corpo.add(peca);
    return peca;
  }

  // olhos grandes com dois brilhos
  function olho() {
    const grupo = new THREE.Group();
    const globo = new THREE.Mesh(esfera, material(COR.olho, { roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }));
    globo.scale.set(0.13, 0.165, 0.075);
    const luz = new THREE.MeshBasicMaterial({ color: COR.branco });
    const brilho = new THREE.Mesh(esfera, luz);
    brilho.scale.set(0.036, 0.042, 0.014);
    brilho.position.set(0.037, 0.06, 0.062);
    const brilhinho = new THREE.Mesh(esfera, luz);
    brilhinho.scale.set(0.018, 0.018, 0.01);
    brilhinho.position.set(-0.043, -0.062, 0.06);
    grupo.add(globo, brilho, brilhinho);
    return grupo;
  }
  const olhos = [-1, 1].map((lado) => colar(olho(), lado * 0.31, 0.33, 0.038));

  // bochechas rosadas
  for (const lado of [-1, 1]) {
    const bochecha = new THREE.Mesh(esfera, material(COR.bochecha, { roughness: 0.7, clearcoat: 0, transparent: true, opacity: 0.85 }));
    bochecha.scale.set(0.1, 0.058, 0.014);
    colar(bochecha, lado * 0.55, 0.16, 0.006);
  }

  // boca aberta em "D", com a língua
  const boca = new THREE.Group();
  const meiaLua = new THREE.Mesh(
    new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    material(COR.boca, { roughness: 0.6, clearcoat: 0, side: THREE.DoubleSide })
  );
  meiaLua.scale.set(0.09, 0.074, 0.034);
  const lingua = new THREE.Mesh(esfera, material(COR.lingua, { roughness: 0.55, clearcoat: 0 }));
  lingua.scale.set(0.043, 0.02, 0.022);
  lingua.position.set(0, -0.038, 0.014);
  boca.add(meiaLua, lingua);
  colar(boca, 0, 0.17, 0.016);

  // emblema na barriga, projetado de frente sobre o corpo
  const emblema = new THREE.CanvasTexture(desenharEmblema(await carregarTerra()));
  emblema.colorSpace = THREE.SRGBColorSpace;
  emblema.anisotropy = renderer.capabilities.getMaxAnisotropy();
  corpo.add(new THREE.Mesh(
    new DecalGeometry(corpo, new THREE.Vector3(0, -0.37, 0.9), new THREE.Euler(), new THREE.Vector3(1.02, 1.02, 1.2)),
    material(COR.branco, {
      map: emblema, emissive: COR.branco, emissiveMap: emblema, emissiveIntensity: 0.12,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
    })
  ));

  // broto na cabeça: um cabinho e duas folhas
  const broto = new THREE.Group();
  broto.position.set(0, 1.02, -0.02);
  const cabo = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0, 0.12, 0), new THREE.Vector3(0.04, 0.2, 0)), 20, 0.026, 12),
    verde
  );
  const geoFolha = geometriaFolha();
  const folhaGrande = new THREE.Mesh(geoFolha, verde);
  folhaGrande.scale.setScalar(0.27);
  folhaGrande.position.set(0.04, 0.2, 0);
  folhaGrande.rotation.set(0.15, 0, 0.45);
  const folhaPequena = new THREE.Mesh(geoFolha, verde);
  folhaPequena.scale.setScalar(0.21);
  folhaPequena.position.set(0.035, 0.19, 0);
  folhaPequena.rotation.set(-0.15, Math.PI, 0.55);
  broto.add(cabo, folhaGrande, folhaPequena);
  corpo.add(broto);

  doTronco.add(corpo);

  // pontos de referência para quem usa o boneco: o meio do corpo e o alto da cabeça
  const centro = new THREE.Object3D();
  const topo = new THREE.Object3D();
  topo.position.y = 1.45;
  doTronco.add(centro, topo);

  // braços: o da esquerda (de quem olha) acena; o da direita fica solto
  function braco(lado) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.86, -0.1, 0.05);
    const bracinho = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.28, 8, 24), azul);
    bracinho.position.y = -0.22;
    const mao = new THREE.Mesh(esfera, branco);
    mao.scale.set(0.16, 0.16, 0.145);
    mao.position.y = -0.46;
    ombro.add(bracinho, mao);
    doTronco.add(ombro);
    return ombro;
  }
  const bracoAceno = braco(-1);
  const bracoSolto = braco(1);
  bracoSolto.rotation.x = -0.25;

  // pernas curtinhas e pés brancos, virados um pouco para fora
  for (const lado of [-1, 1]) {
    const perna = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.2, 8, 24), azul);
    perna.position.set(lado * 0.38, -1.05, 0.02);
    const pe = new THREE.Mesh(esfera, branco);
    pe.scale.set(0.2, 0.13, 0.28);
    pe.position.set(lado * 0.4, CHAO + 0.13, 0.1);
    pe.rotation.y = lado * 0.25;
    pecas.add(perna, pe);
  }

  const materialSombra = new THREE.MeshBasicMaterial({
    map: texturaSombra(), color: corSombra, transparent: true, opacity: forcaSombra, depthWrite: false,
  });
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.35), materialSombra);
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.002;
  raiz.add(sombra);

  // ---------- Movimento ----------

  const ALTURA_PULO = 0.9;
  let tempo = 0;
  let faseAceno = 0;

  // dt: segundos desde a última pose. Pose:
  //   virar     giro do boneco inteiro, em radianos (positivo = para a esquerda dele)
  //   inclinar  quanto o tronco tomba para trás (para olhar para cima), em radianos
  //   pulo      andamento de um pulo, de 0 a 1 (fora disso, parado no chão)
  //   animo     0 = calmo; 1 = animado (acena mais rápido e levanta o outro braço)
  function posar(dt, { virar = 0, inclinar = 0, pulo = -1, animo = 0 } = {}) {
    tempo += dt;
    faseAceno += dt * (7 + 6 * animo);
    const respiro = Math.sin(tempo * 2.2) * 0.015;
    corpo.scale.set(1 + respiro, 1 - respiro, 1 + respiro);
    bracoAceno.rotation.z = -2.3 + Math.sin(faseAceno) * (0.28 + 0.12 * animo);
    bracoSolto.rotation.z = 0.55 + Math.sin(tempo * 2.2) * 0.03 + 0.6 * animo;
    broto.rotation.z = Math.sin(tempo * 1.6) * 0.1;
    // pisca a cada 4 s, por 0,15 s
    const fase = tempo % 4;
    const aberto = fase > 3.85 ? Math.abs(fase - 3.925) / 0.075 : 1;
    for (const o of olhos) o.scale.y = Math.max(0.08, aberto);

    boneco.rotation.y = virar;
    tronco.rotation.x = -inclinar;

    // pulo: agacha, sobe esticado e cai amassando
    let altura = 0;
    let estica = 0;
    if (pulo >= 0 && pulo < 1) {
      if (pulo < 0.18) estica = -0.16 * Math.sin((pulo / 0.18) * Math.PI);
      else if (pulo < 0.82) {
        const v = (pulo - 0.18) / 0.64;
        altura = 4 * v * (1 - v) * ALTURA_PULO;
        estica = 0.1 * Math.sin(v * Math.PI);
      } else estica = -0.14 * Math.sin(((pulo - 0.82) / 0.18) * Math.PI);
    }
    boneco.position.y = altura;
    boneco.scale.set(1 - estica * 0.5, 1 + estica, 1 - estica * 0.5);
    const longe = altura / ALTURA_PULO;
    sombra.scale.setScalar(1 - 0.3 * longe);
    materialSombra.opacity = forcaSombra * (1 - 0.5 * longe);
  }
  posar(0);

  return { grupo: raiz, posar, centro, topo };
}
