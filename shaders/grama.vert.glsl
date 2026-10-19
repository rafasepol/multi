// Grama — vertex shader.
// Cada folhinha é uma faixa afinada com 5 segmentos; dezenas de milhares delas
// são desenhadas de uma vez (instancing). Aqui cada vértice é posicionado
// conforme a curvatura natural da folha, o vento, a queimada e o papel por cima.

#include "comum.glsl"

attribute vec4 iBase;  // raiz (x, y), ângulo, semente (0–1)
attribute vec4 iForma; // altura, largura, curvatura, tom (-1 a 1)

uniform float uAlturaViva;
uniform float uAlturaQueimada;
uniform float uLarguraBase;
uniform vec2 uVentoDir;
uniform float uVentoForca;
uniform float uPixel; // tamanho de um pixel por unidade de distância da câmera

// Sopro do mouse: o rastro dos últimos pontos por onde o mouse passou no chão
uniform vec4 uSoproA[10]; // por ponto: posição (x, y) e força (0–1, vai se apagando)
uniform vec4 uSoproB[10]; // por ponto: direção em que o mouse andava (x, y)
uniform float uSoproRaio;  // alcance do sopro em volta de cada ponto
uniform float uSoproForca; // quanto a grama se curva no centro do sopro

varying vec3 vCor;
varying float vH;
varying vec3 vNormal;
varying vec3 vMundo;
varying float vSombra;
varying float vQueimado;
varying float vBrasa;

// Empurrão do sopro do mouse nesta raiz: para longe de cada ponto do rastro e
// na direção em que o mouse andava. `agito` (0–1) diz o quanto a folha está no sopro.
vec2 soproDoMouse(vec2 raiz, out float agito) {
  vec2 total = vec2(0.0);
  agito = 0.0;
  for (int i = 0; i < 10; i++) {
    float forca = uSoproA[i].z;
    if (forca <= 0.001) continue;
    vec2 d = raiz - uSoproA[i].xy;
    float dist = length(d);
    float k = forca * (1.0 - smoothstep(0.0, uSoproRaio, dist));
    if (k <= 0.0) continue;
    vec2 radial = dist > 1e-4 ? d / dist : vec2(0.0);
    total += (radial * 0.65 + uSoproB[i].xy * 0.5) * k;
    agito = max(agito, k);
  }
  return total;
}

void main() {
  vec2 raiz = iBase.xy;
  float angulo = iBase.z;
  float semente = iBase.w;
  float lado = position.x; // -1 / +1 nas bordas da folha, 0 na ponta
  float h = position.y;    // 0 na raiz, 1 na ponta

  // ---- queimada: a frente de fogo passa e a grama vira toco carbonizado ----
  float queimado = mascaraQueimada(raiz);
  float densidade = mix(1.0, 0.45, queimado); // boa parte das folhinhas queima inteira
  float aparece = clamp((densidade - semente) / 0.05, 0.0, 1.0);

  // ---- papel por cima: a grama só cresce até encostar no papel ----
  float dPilha = distanciaPilhas(raiz);
  // faixa junto à borda da revista: a grama ali foi amassada quando a revista caiu
  // (mais baixa, para não cobrir o que está escrito na capa)
  float borda = 1.0 - smoothstep(0.02, 0.2, dPilha);

  float altura = iForma.x * mix(uAlturaViva, uAlturaQueimada, queimado) * aparece * (1.0 - 0.4 * borda);
  altura = min(altura, max(tetoPapel(raiz) - 0.015, 0.0));

  // ---- direção e inclinação ----
  vec2 frente = vec2(cos(angulo), sin(angulo));
  vec2 lateral = vec2(-frente.y, frente.x);
  vec2 incl = frente * iForma.z * mix(1.0, 0.5, queimado); // toco queimado fica duro

  // sopro do mouse: a grama se curva para longe dele e treme mais forte e mais rápido
  float agito;
  vec2 sopro = soproDoMouse(raiz, agito);
  incl += sopro * uSoproForca * mix(1.0, 0.2, queimado);

  // vento: rajadas que atravessam o campo + um tremor próprio de cada folha
  vec2 pv = raiz * 0.45 - uVentoDir * uTempo * 0.9;
  float rajada = smoothstep(0.3, 0.9, ruido(pv) * 0.7 + ruido(pv * 2.3 + 11.0) * 0.3);
  float tremor = sin(uTempo * (2.5 + semente * 2.0 + agito * 9.0) + semente * 40.0) * (0.06 + agito * 0.25);
  incl += uVentoDir * (uVentoForca * (0.3 + 0.7 * rajada) + tremor) * mix(1.0, 0.15, queimado);

  // junto à revista, a grama se debruça um pouco sobre a borda do papel
  if (borda > 0.0) {
    vec2 e = vec2(0.01, 0.0);
    vec2 fora = vec2(
      distanciaPilhas(raiz + e.xy) - distanciaPilhas(raiz - e.xy),
      distanciaPilhas(raiz + e.yx) - distanciaPilhas(raiz - e.yx)
    );
    incl -= normalize(fora + 1e-5) * borda * 0.12;
  }

  float tombo = length(incl);
  vec2 dirIncl = tombo > 1e-4 ? incl / tombo : frente;
  tombo = min(tombo, 1.45); // no máximo quase deitada

  // a folha se curva: o ângulo cresce da raiz até a ponta
  float aPonto = tombo * pow(h, 1.5);
  float aMedio = aPonto * 0.4; // direção média do trecho raiz → ponto
  float s = h * altura;
  vec2 desloc = dirIncl * s * sin(aMedio);
  float z = s * cos(aMedio);

  // largura afina até a ponta; ao longe nunca fica mais fina que ~1 pixel
  float largura = uLarguraBase * iForma.y * (1.0 - h * 0.85);
  float dist = distance(cameraPosition, vec3(raiz, 0.0));
  largura = max(largura, dist * uPixel * 1.2 * (1.0 - h));
  largura *= step(1e-4, altura); // folhinha escondida não desenha nada

  vec3 pos = vec3(raiz + desloc + lateral * lado * largura * 0.5, z);

  // normal: perpendicular à folha curvada, um pouco "arredondada" nas bordas
  vec3 tangente = normalize(vec3(dirIncl * sin(aPonto), cos(aPonto)));
  vec3 lat3 = vec3(lateral, 0.0);
  vec3 n = normalize(cross(lat3, tangente));
  vNormal = normalize(n + lat3 * lado * 0.5);

  // cor: capim seco da estiagem (palha com manchas de verde-oliva, escuro na raiz)
  // ou carvão com ponta de cinza. "mancha" varia o tom em áreas grandes, como num
  // campo de verdade; o seco combina com o vermelho e o preto da revista e anuncia o fogo.
  float tom = iForma.w;
  float mancha = ruido(raiz * 0.35 + 3.0);
  vec3 vivaBase = vec3(0.07, 0.055, 0.03);
  vec3 palha = vec3(0.78, 0.6, 0.3);
  vec3 oliva = vec3(0.32, 0.38, 0.14);
  vec3 vivaPonta = mix(oliva, palha, smoothstep(0.3, 0.6, mancha + tom * 0.18))
                 * (1.0 + tom * 0.12) * mix(0.85, 1.1, mancha);
  vec3 queimadaBase = vec3(0.025, 0.024, 0.023);
  vec3 queimadaPonta = mix(vec3(0.08, 0.078, 0.075), vec3(0.55, 0.54, 0.52),
                           clamp(tom * 0.6 + mancha * 0.4, 0.0, 1.0)); // carvão / cinza
  float hc = pow(h, 0.8);
  vCor = mix(mix(vivaBase, vivaPonta, hc), mix(queimadaBase, queimadaPonta, hc), queimado);

  vH = h;
  vQueimado = queimado;
  // na frente de fogo, a ponta da folhinha que está queimando brilha
  vBrasa = brasas(raiz) * pow(h, 0.6) * aparece;
  vMundo = pos;
  vSombra = sombraRevista(raiz);
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
