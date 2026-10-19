// Cenário em volta da revista: chão, grama, luz e a queimada.
//
// A história: na capa o campo está seco, na estiagem (capim cor de palha); ao chegar na contracapa,
// uma frente de fogo se espalha a partir da revista e deixa tudo queimado,
// como nas queimadas que vêm depois do desmatamento.
// Os efeitos visuais ficam nos shaders (pasta shaders/); aqui só controlamos
// os valores que eles recebem a cada quadro.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { carregarShader } from "./carregar.js";

// Escala do mundo: a revista tem altura 2 ≈ 28 cm, então 1 unidade ≈ 14 cm
const CM = 1 / 14;
const ESCALA_VIVA = 300 * CM;     // a foto do chão de floresta cobre 3 m
const ESCALA_QUEIMADA = 100 * CM; // a foto do chão queimado cobre 1 m

// Grama (dá para testar outra quantidade pela URL, ex.: ?grama=30000)
const QUANTIDADE_GRAMA = Number(new URLSearchParams(location.search).get("grama")) || 60000;
const ALTURA_VIVA = 5.5 * CM;     // gramado verde ≈ 4–7 cm
const ALTURA_QUEIMADA = 1.2 * CM; // tocos queimados ≈ 1 cm
const LARGURA_FOLHA = 0.35 * CM; // ≈ 3,5 mm
const SEGMENTOS = 5;             // segmentos de cada folhinha
const VENTO_DIRECAO = new THREE.Vector2(0.8, 0.6).normalize();
const VENTO_FORCA = 0.35;        // inclinação extra (radianos) numa rajada

// Sopro do mouse: por onde o mouse passa a grama se curva e treme, deixando um rastro
const SOPRO_PONTOS = 10;      // tamanho do rastro (precisa bater com o shader)
const SOPRO_RAIO = 0.6;       // alcance em volta do mouse (≈ 8 cm)
const SOPRO_FORCA = 1.0;      // curvatura extra (radianos) no centro do sopro
const SOPRO_PASSO = 0.12;     // distância que o mouse anda até deixar um novo ponto no rastro
const SOPRO_CALMA = 0.35;     // quão rápido o rastro se acalma (segundos; some em ~1 s)
const SOPRO_PARADO = 0.35;    // agitação que fica em volta do mouse parado

// Queimada (frente de fogo na contracapa)
const ATRASO_FOGO = 0.6;   // segundos depois de confirmar a ida para a contracapa
const DURACAO_FOGO = 5.5;  // segundos para o fogo atravessar toda a área
const BORDA_FOGO = 0.35;   // largura da faixa entre viva e queimada
const BRASAS_RESTO = 0.35; // brasas que continuam acesas depois que o fogo passa

// Luz nos dois momentos da história (cores em 0–1)
const LUZ_VIVA = {
  sol: [1.0, 0.9, 0.74],        // sol baixo de fim de tarde, quente
  ambiente: [0.42, 0.4, 0.38],
  direcao: [-0.35, 0.4, 0.85],
  nevoa: [0.8, 0.88, 0.92],
  forcaNevoa: 0.0,
  pagina: [1.0, 0.99, 0.96],    // tom que a luz dá à revista
};
const LUZ_QUEIMADA = {
  sol: [0.85, 0.66, 0.52],      // sol alaranjado e fraco, atrás da fumaça
  ambiente: [0.3, 0.29, 0.28],  // ambiente cinza (o chão queimado fica preto, não marrom)
  direcao: [-0.6, 0.4, 0.62],
  nevoa: [0.4, 0.39, 0.39],     // fumaça cinza
  forcaNevoa: 0.3,
  pagina: [1.0, 0.8, 0.64],
};

const MAX_DOBRAS = 16;

function misturar(a, b, k) {
  return a.map((v, i) => v + (b[i] - v) * k);
}

export async function criarCenario({ scene, renderer, altura, luzPagina }) {
  const carregador = new THREE.TextureLoader();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const textura = async (nome) => {
    const t = await carregador.loadAsync(`./assets/texturas/${nome}`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
    return t;
  };

  const [chaoVert, chaoFrag, gramaVert, gramaFrag, vivoCor, vivoNormal, queimadoCor, queimadoNormal] =
    await Promise.all([
      carregarShader("chao.vert.glsl"),
      carregarShader("chao.frag.glsl"),
      carregarShader("grama.vert.glsl"),
      carregarShader("grama.frag.glsl"),
      textura("chao_floresta_cor.jpg"),
      textura("chao_floresta_normal.jpg"),
      textura("chao_queimado_cor.jpg"),
      textura("chao_queimado_normal.jpg"),
    ]);

  // Uniforms compartilhados pelo chão e pela grama (mesmos objetos = mesmos valores)
  const u = {
    uTempo: { value: 0 },
    uFogoCentro: { value: new THREE.Vector2() },
    uFogoRaio: { value: 0 },
    uFogoBorda: { value: BORDA_FOGO },
    uBrasas: { value: 1 },
    uCorSol: { value: new THREE.Vector3() },
    uDirSol: { value: new THREE.Vector3() },
    uCorAmbiente: { value: new THREE.Vector3() },
    uCorNevoa: { value: new THREE.Vector3() },
    uNevoa: { value: 0 },
    uLargura: { value: 1 },
    uAltura: { value: altura },
    uPilhaEsq: { value: 0 },
    uPilhaDir: { value: 1 },
    uNumDobras: { value: 0 },
    uDobraA: { value: Array.from({ length: MAX_DOBRAS }, () => new THREE.Vector4()) },
    uDobraB: { value: Array.from({ length: MAX_DOBRAS }, () => new THREE.Vector4()) },
  };

  // ---------- Chão ----------

  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms: {
        ...u,
        uVivoCor: { value: vivoCor },
        uVivoNormal: { value: vivoNormal },
        uQueimadoCor: { value: queimadoCor },
        uQueimadoNormal: { value: queimadoNormal },
        uEscalaViva: { value: ESCALA_VIVA },
        uEscalaQueimada: { value: ESCALA_QUEIMADA },
      },
      vertexShader: chaoVert,
      fragmentShader: chaoFrag,
    })
  );
  chao.frustumCulled = false;
  scene.add(chao);

  // ---------- Grama ----------

  const uPixel = { value: 0.001 };
  const materialGrama = new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uAlturaViva: { value: ALTURA_VIVA },
      uAlturaQueimada: { value: ALTURA_QUEIMADA },
      uLarguraBase: { value: LARGURA_FOLHA },
      uVentoDir: { value: VENTO_DIRECAO },
      uVentoForca: { value: VENTO_FORCA },
      uPixel,
      uSoproA: { value: Array.from({ length: SOPRO_PONTOS }, () => new THREE.Vector4()) },
      uSoproB: { value: Array.from({ length: SOPRO_PONTOS }, () => new THREE.Vector4()) },
      uSoproRaio: { value: SOPRO_RAIO },
      uSoproForca: { value: SOPRO_FORCA },
    },
    vertexShader: gramaVert,
    fragmentShader: gramaFrag,
    side: THREE.DoubleSide,
  });
  const grama = new THREE.Mesh(new THREE.BufferGeometry(), materialGrama);
  grama.frustumCulled = false;
  scene.add(grama);

  // Uma folhinha "modelo": pares de vértices (esquerda/direita) subindo, e a ponta.
  // position.x = lado (-1/+1, 0 na ponta); position.y = altura relativa (0 a 1).
  function folhinhaModelo(geo) {
    const pos = [];
    const indices = [];
    for (let i = 0; i < SEGMENTOS; i++) pos.push(-1, i / SEGMENTOS, 0, 1, i / SEGMENTOS, 0);
    pos.push(0, 1, 0);
    for (let i = 0; i < SEGMENTOS - 1; i++) {
      const a = i * 2;
      indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
    const ultimo = (SEGMENTOS - 1) * 2;
    indices.push(ultimo, ultimo + 1, SEGMENTOS * 2);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(indices);
  }

  // Espalha as folhinhas pela área vista: uma por célula de uma grade, em posição
  // sorteada dentro da célula (fica uniforme, sem buracos nem amontoados).
  function plantarGrama(caixa) {
    const geo = new THREE.InstancedBufferGeometry();
    folhinhaModelo(geo);

    const w = caixa.x1 - caixa.x0;
    const h = caixa.y1 - caixa.y0;
    const nx = Math.ceil(Math.sqrt((QUANTIDADE_GRAMA * w) / h));
    const ny = Math.ceil(QUANTIDADE_GRAMA / nx);
    const total = nx * ny;
    const base = new Float32Array(total * 4);
    const forma = new Float32Array(total * 4);
    for (let j = 0, k = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++, k++) {
        base[k * 4] = caixa.x0 + ((i + Math.random()) / nx) * w;
        base[k * 4 + 1] = caixa.y0 + ((j + Math.random()) / ny) * h;
        base[k * 4 + 2] = Math.random() * Math.PI * 2; // para onde a folha "olha"
        base[k * 4 + 3] = Math.random();               // semente (decide quem queima inteira)
        forma[k * 4] = 0.65 + Math.random() * 0.7;     // altura
        forma[k * 4 + 1] = 0.7 + Math.random() * 0.6;  // largura
        forma[k * 4 + 2] = 0.12 + Math.random() * 0.45; // curvatura natural (rad)
        forma[k * 4 + 3] = Math.random() * 2 - 1;      // variação de tom
      }
    }
    geo.setAttribute("iBase", new THREE.InstancedBufferAttribute(base, 4));
    geo.setAttribute("iForma", new THREE.InstancedBufferAttribute(forma, 4));
    geo.instanceCount = total;
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);

    grama.geometry.dispose();
    grama.geometry = geo;
  }

  // ---------- Tamanho ----------

  let raioMax = 10;

  // caixa = área do chão que a câmera enxerga com a revista fechada
  // pixel = tamanho de um pixel da tela por unidade de distância da câmera
  function ajustar(largura, caixa, pixel) {
    u.uLargura.value = largura;
    uPixel.value = pixel;
    plantarGrama(caixa);
    u.uFogoCentro.value.set(-largura / 2, 0); // o fogo começa no centro da contracapa

    // o chão é bem maior que a área vista, para a borda nunca aparecer
    const w = (caixa.x1 - caixa.x0) * 3;
    const h = (caixa.y1 - caixa.y0) * 3;
    chao.scale.set(w, h, 1);
    chao.position.set((caixa.x0 + caixa.x1) / 2, (caixa.y0 + caixa.y1) / 2, -0.01);

    // o fogo termina quando passa do canto mais distante da área vista
    // (com folga para a borda irregular da frente de fogo)
    const c = u.uFogoCentro.value;
    raioMax =
      Math.max(
        Math.hypot(caixa.x0 - c.x, caixa.y0 - c.y),
        Math.hypot(caixa.x1 - c.x, caixa.y0 - c.y),
        Math.hypot(caixa.x0 - c.x, caixa.y1 - c.y),
        Math.hypot(caixa.x1 - c.x, caixa.y1 - c.y)
      ) + BORDA_FOGO * 1.5 + 0.6;
  }

  // ---------- Papel sobre o chão ----------

  // esq/dir: há folhas paradas daquele lado; dobras: folhas sendo viradas
  function definirPapel({ esq, dir, dobras }) {
    u.uPilhaEsq.value = esq ? 1 : 0;
    u.uPilhaDir.value = dir ? 1 : 0;
    const n = Math.min(dobras.length, MAX_DOBRAS);
    u.uNumDobras.value = n;
    for (let i = 0; i < n; i++) {
      const d = dobras[i];
      u.uDobraA.value[i].set(d.F.x, d.F.y, d.n.x, d.n.y);
      u.uDobraB.value[i].set(d.R, d.sgn, 0, 0);
    }
  }

  // ---------- Queimada e luz ----------

  let tempoFogo = 0;

  function atualizarFogo(dt, estado, visivel) {
    if (estado === "contracapa") {
      tempoFogo += dt;
      const t = tempoFogo - ATRASO_FOGO;
      // o fogo avança em velocidade constante a partir da revista
      u.uFogoRaio.value = THREE.MathUtils.clamp(t / DURACAO_FOGO, 0, 1) * raioMax;
      // brasas acesas enquanto o fogo avança; depois vão se apagando até sobrar um resto
      const depois = Math.max(0, t - DURACAO_FOGO);
      u.uBrasas.value = BRASAS_RESTO + (1 - BRASAS_RESTO) * Math.exp(-depois / 3);
      return;
    }
    tempoFogo = 0;
    u.uBrasas.value = 1;
    if (!visivel) {
      u.uFogoRaio.value = 0; // escondido atrás das páginas: a floresta volta a estar viva
    } else {
      // saiu da contracapa ainda à vista: volta ao verde rapidamente
      u.uFogoRaio.value = Math.max(0, u.uFogoRaio.value - (raioMax / 1.2) * dt);
    }
  }

  const vetor = (destino, valores) => destino.set(valores[0], valores[1], valores[2]);

  function atualizarLuz(abertura) {
    // a luz fica enfumaçada junto com o avanço do fogo
    const k = THREE.MathUtils.smoothstep(u.uFogoRaio.value / raioMax, 0.05, 0.6);
    vetor(u.uCorSol.value, misturar(LUZ_VIVA.sol, LUZ_QUEIMADA.sol, k));
    vetor(u.uCorAmbiente.value, misturar(LUZ_VIVA.ambiente, LUZ_QUEIMADA.ambiente, k));
    vetor(u.uDirSol.value, misturar(LUZ_VIVA.direcao, LUZ_QUEIMADA.direcao, k)).normalize();
    vetor(u.uCorNevoa.value, misturar(LUZ_VIVA.nevoa, LUZ_QUEIMADA.nevoa, k));
    u.uNevoa.value = THREE.MathUtils.lerp(LUZ_VIVA.forcaNevoa, LUZ_QUEIMADA.forcaNevoa, k);

    // na leitura (abertura = 1) a revista fica com luz branca: cores fiéis
    const tom = misturar(LUZ_VIVA.pagina, LUZ_QUEIMADA.pagina, k);
    vetor(luzPagina.value, misturar(tom, [1, 1, 1], abertura));
  }

  // ---------- Sopro do mouse ----------

  // Rastro: os últimos pontos do chão por onde o mouse passou (lista circular).
  // Cada ponto tem força que vai se apagando; o shader curva a grama em volta deles.
  const rastro = materialGrama.uniforms.uSoproA.value; // x, y, força
  const direcoes = materialGrama.uniforms.uSoproB.value; // direção do movimento
  let mouse = null; // ponto do chão sob o mouse (null = fora da tela)
  let ultimo = -1;  // índice do ponto mais recente do rastro

  function definirMouse(ponto) {
    mouse = ponto;
  }

  function atualizarSopro(dt) {
    const calma = Math.exp(-dt / SOPRO_CALMA);
    for (const p of rastro) p.z *= calma;
    if (!mouse) return;

    const atual = ultimo >= 0 ? rastro[ultimo] : null;
    const andou = atual ? Math.hypot(mouse.x - atual.x, mouse.y - atual.y) : Infinity;
    if (andou > SOPRO_PASSO) {
      // o mouse andou: deixa pontos novos no rastro, apontando na direção do movimento.
      // Se andou muito de um quadro para outro, preenche o caminho para não ficar buraco.
      const x0 = atual ? atual.x : mouse.x;
      const y0 = atual ? atual.y : mouse.y;
      const dx = mouse.x - x0;
      const dy = mouse.y - y0;
      const n = Math.hypot(dx, dy) || 1;
      const passos = atual ? Math.min(4, Math.ceil(andou / SOPRO_RAIO)) : 1;
      for (let k = 1; k <= passos; k++) {
        const t = k / passos;
        ultimo = (ultimo + 1) % SOPRO_PONTOS;
        rastro[ultimo].set(x0 + dx * t, y0 + dy * t, 1, 0);
        direcoes[ultimo].set(dx / n, dy / n, 0, 0);
      }
    } else {
      // parado ou quase (ainda perto do último ponto): mantém uma agitação leve ali.
      // O ponto não acompanha o mouse; senão a distância nunca cresceria e o rastro não se formaria.
      atual.z = Math.max(atual.z, SOPRO_PARADO);
    }
  }

  // estado: posição da câmera ("capa", "aberta", "contracapa")
  // abertura: 0 = revista fechada, 1 = vista de leitura
  // visivel: se o cenário aparece na tela neste quadro
  function atualizar(dt, { estado, abertura, visivel }) {
    u.uTempo.value += dt;
    chao.visible = visivel;
    grama.visible = visivel;
    atualizarFogo(dt, estado, visivel);
    atualizarLuz(abertura);
    atualizarSopro(dt);
  }

  return { ajustar, definirPapel, definirMouse, atualizar, uniforms: u, objetos: { chao, grama } };
}
