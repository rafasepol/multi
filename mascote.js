// Mascote da ONU em 3D: um boneco no azul da ONU, sóbrio (a revista trata de um tema sério),
// com o emblema (o mapa-múndi visto do polo norte entre dois ramos de oliveira) na barriga e
// um broto na cabeça, sinal de recomeço. Ele respira, pisca, acena, faz um gesto de apresentar
// e pode se virar e se inclinar.
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
  olho: "#14202e",   // olhos, sobrancelhas e boca
  sapato: "#1f2d3a",
  broto: "#5c9e3f",
  sombra: "#0b3a5c",
};

// medidas de montagem (o corpo é uma esfera de raio ~1 em volta da origem)
const CHAO = -1.44;    // sola dos pés
const QUADRIL = -0.95; // onde o tronco dobra para se inclinar
export const ALTURA_MASCOTE = 2.8; // do chão à ponta do broto

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

// corpo: um ovo em pé, um pouco mais largo embaixo
function geometriaCorpo() {
  let geo = new THREE.SphereGeometry(1, 128, 96);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const largura = 1 - 0.05 * v.y;
    p.setXYZ(i, v.x * largura * 0.94, v.y * 1.12, v.z * largura * 0.88);
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

  // acabamento fosco, de escultura pintada, e não de brinquedo de plástico
  const material = (cor, extra = {}) => new THREE.MeshPhysicalMaterial({
    color: cor, roughness: 0.58, clearcoat: 0.12, clearcoatRoughness: 0.5, envMap: estudio, envMapIntensity: reflexo, ...extra,
  });
  const azul = material(COR.azul);
  const escuro = material(COR.olho, { roughness: 0.35, clearcoat: 0.3, clearcoatRoughness: 0.3 });
  const sapato = material(COR.sapato, { roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  const verde = material(COR.broto, { side: THREE.DoubleSide });
  const esfera = new THREE.SphereGeometry(1, 48, 32);

  // raiz: no chão, entre os pés · boneco: gira a partir dos pés ·
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

  // olhos ovais e pequenos, sem brilhos desenhados (o reflexo vem da luz)
  const olhos = [-1, 1].map((lado) => {
    const olho = new THREE.Group();
    const globo = new THREE.Mesh(esfera, escuro);
    globo.scale.set(0.075, 0.1, 0.045);
    olho.add(globo);
    return colar(olho, lado * 0.26, 0.42, 0.022);
  });

  // sobrancelhas retas: olhar atento e calmo (inclinadas, de cima pareciam bravas)
  const geoTraco = new THREE.CapsuleGeometry(0.018, 0.11, 4, 12).rotateZ(Math.PI / 2);
  for (const lado of [-1, 1]) {
    const sobrancelha = new THREE.Group();
    sobrancelha.add(new THREE.Mesh(geoTraco, escuro));
    colar(sobrancelha, lado * 0.26, 0.56, 0.004);
  }

  // boca fechada, um arco raso: um sorriso discreto
  const boca = new THREE.Group();
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.013, 8, 32, 0.9), escuro);
  arco.rotation.z = -Math.PI / 2 - 0.45; // arco centrado embaixo
  arco.position.y = 0.16;
  boca.add(arco);
  colar(boca, 0, 0.2, 0.004);

  // emblema na barriga, projetado de frente sobre o corpo
  const emblema = new THREE.CanvasTexture(desenharEmblema(await carregarTerra()));
  emblema.colorSpace = THREE.SRGBColorSpace;
  emblema.anisotropy = renderer.capabilities.getMaxAnisotropy();
  corpo.add(new THREE.Mesh(
    new DecalGeometry(corpo, new THREE.Vector3(0, -0.36, 0.9), new THREE.Euler(), new THREE.Vector3(1.0, 1.0, 1.2)),
    material(COR.branco, {
      map: emblema, emissive: COR.branco, emissiveMap: emblema, emissiveIntensity: 0.1,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
    })
  ));

  // broto na cabeça: um cabinho e duas folhas pequenas
  const broto = new THREE.Group();
  broto.position.set(0, 1.1, -0.02);
  const cabo = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0.03, 0.16, 0)), 20, 0.02, 12),
    verde
  );
  const geoFolha = geometriaFolha();
  const folhaGrande = new THREE.Mesh(geoFolha, verde);
  folhaGrande.scale.setScalar(0.2);
  folhaGrande.position.set(0.03, 0.16, 0);
  folhaGrande.rotation.set(0.15, 0, 0.4);
  const folhaPequena = new THREE.Mesh(geoFolha, verde);
  folhaPequena.scale.setScalar(0.15);
  folhaPequena.position.set(0.025, 0.15, 0);
  folhaPequena.rotation.set(-0.15, Math.PI, 0.5);
  broto.add(cabo, folhaGrande, folhaPequena);
  corpo.add(broto);

  doTronco.add(corpo);

  // pontos de referência para quem usa o boneco: o meio do corpo e o alto da cabeça
  const centro = new THREE.Object3D();
  const topo = new THREE.Object3D();
  topo.position.y = 1.5;
  doTronco.add(centro, topo);

  // braços: o da esquerda (de quem olha) acena; o da direita faz o gesto de apresentar
  function braco(lado) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.86, -0.05, 0.02);
    const bracinho = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.36, 8, 24), azul);
    bracinho.position.y = -0.25;
    const mao = new THREE.Mesh(esfera, azul);
    mao.scale.set(0.135, 0.15, 0.12);
    mao.position.y = -0.5;
    ombro.add(bracinho, mao);
    doTronco.add(ombro);
    return ombro;
  }
  const bracoAceno = braco(-1);
  const bracoGesto = braco(1);

  // pernas e sapatos escuros, virados um pouco para fora
  for (const lado of [-1, 1]) {
    const perna = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.22, 8, 24), azul);
    perna.position.set(lado * 0.36, -1.13, 0.0);
    const pe = new THREE.Mesh(esfera, sapato);
    pe.scale.set(0.18, 0.11, 0.27);
    pe.position.set(lado * 0.37, CHAO + 0.11, 0.08);
    pe.rotation.y = lado * 0.18;
    pecas.add(perna, pe);
  }

  const materialSombra = new THREE.MeshBasicMaterial({
    map: texturaSombra(), color: corSombra, transparent: true, opacity: forcaSombra, depthWrite: false,
  });
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), materialSombra);
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.002;
  raiz.add(sombra);

  // ---------- Movimento ----------

  let tempo = 0;
  let faseAceno = 0;
  const suave = (x) => x * x * (3 - 2 * x);

  // dt: segundos desde a última pose. Pose:
  //   virar     giro do boneco inteiro, em radianos (positivo = para a esquerda dele)
  //   inclinar  quanto o tronco tomba para trás (para olhar para cima), em radianos
  //   aceno     0 = braço junto ao corpo; 1 = acenando (o braço da esquerda de quem olha)
  //   gesto     andamento (0 a 1) do gesto de apresentar: ele acena com a cabeça e estende
  //             o outro braço para a frente, com calma; fora disso, parado
  function posar(dt, { virar = 0, inclinar = 0, aceno = 0, gesto = -1 } = {}) {
    tempo += dt;
    faseAceno += dt * 5;
    const respiro = Math.sin(tempo * 1.5) * 0.007;
    corpo.scale.set(1 + respiro, 1 - respiro, 1 + respiro);
    broto.rotation.z = Math.sin(tempo * 1.2) * 0.05;
    // pisca a cada 5 s, por 0,15 s
    const fase = tempo % 5;
    const aberto = fase > 4.85 ? Math.abs(fase - 4.925) / 0.075 : 1;
    for (const o of olhos) o.scale.y = Math.max(0.08, aberto);

    const a = suave(THREE.MathUtils.clamp(aceno, 0, 1));
    bracoAceno.rotation.z = THREE.MathUtils.lerp(-0.25, -2.25 + Math.sin(faseAceno) * 0.2, a);

    // gesto: o braço sobe para a frente, segura um pouco e volta; a cabeça acena no começo
    let braco = 0;
    let aceneCabeca = 0;
    if (gesto >= 0 && gesto < 1) {
      braco = gesto < 0.3 ? suave(gesto / 0.3) : gesto < 0.75 ? 1 : 1 - suave((gesto - 0.75) / 0.25);
      if (gesto < 0.35) aceneCabeca = Math.sin((gesto / 0.35) * Math.PI) * 0.12;
    }
    bracoGesto.rotation.set(-1.2 * braco, 0, 0.25 + 0.15 * braco);

    boneco.rotation.y = virar;
    tronco.rotation.x = -inclinar + aceneCabeca;
  }
  posar(0);

  return { grupo: raiz, posar, centro, topo };
}
