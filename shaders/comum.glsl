// Código compartilhado pela grama e pelo chão.
// Coordenadas: o chão é o plano z = 0; a lombada da revista fica em x = 0;
// a página da direita ocupa x de 0 a uLargura, e y de -uAltura/2 a +uAltura/2.

uniform float uTempo;

// Queimada (contracapa): frente de fogo que avança em círculo a partir da revista
uniform vec2 uFogoCentro;
uniform float uFogoRaio;
uniform float uFogoBorda;  // largura da faixa entre viva e queimada
uniform float uBrasas;     // força das brasas (1 enquanto o fogo avança, depois se apagam)

// Luz do cenário
uniform vec3 uCorSol;
uniform vec3 uDirSol;      // direção que aponta PARA o sol (normalizada)
uniform vec3 uCorAmbiente;
uniform vec3 uCorNevoa;
uniform float uNevoa;

// Onde há papel em cima do chão
uniform float uLargura;    // largura de uma página
uniform float uAltura;     // altura da página
uniform float uPilhaEsq;   // 1 se há folhas paradas do lado esquerdo
uniform float uPilhaDir;   // 1 se há folhas paradas do lado direito
uniform int uNumDobras;    // folhas que estão sendo viradas agora
uniform vec4 uDobraA[16];  // por dobra: ponto F (x, y) e normal n (x, y) da linha de dobra
uniform vec4 uDobraB[16];  // por dobra: raio da curva, lado (+1 direita / -1 esquerda)

// ---------- Ruído ----------

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// ruído suave entre 0 e 1
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// ---------- Queimada ----------

// quanto a frente de fogo já passou deste ponto (negativo = o fogo ainda não chegou)
float avancoDoFogo(vec2 q) {
  float d = distance(q, uFogoCentro);
  // borda irregular: o fogo avança mais rápido em alguns lugares
  float irregular = (ruido(q * 1.1) - 0.5) * 0.9 + (ruido(q * 4.3 + 7.0) - 0.5) * 0.3;
  return uFogoRaio - (d + irregular);
}

// 0 = viva, 1 = queimada
float mascaraQueimada(vec2 q) {
  if (uFogoRaio <= 0.0) return 0.0;
  return smoothstep(0.0, uFogoBorda, avancoDoFogo(q));
}

// Brilho das brasas: uma linha acesa na frente do fogo, mais pontos que ficam
// queimando atrás dela e se apagam conforme o fogo se afasta
float brasas(vec2 q) {
  if (uFogoRaio <= 0.0 || uBrasas <= 0.0) return 0.0;
  float x = avancoDoFogo(q);
  float pisca = 0.55 + 0.45 * ruido(q * 7.0 + vec2(uTempo * 3.1, -uTempo * 2.3));
  float frente = smoothstep(-0.04, 0.04, x) * (1.0 - smoothstep(0.08, uFogoBorda + 0.25, x));
  float pontos = smoothstep(0.72, 0.9, ruido(q * 9.0 + 13.0));
  float residual = pontos * smoothstep(0.1, 0.3, x) * exp(-max(x - 0.3, 0.0) / 3.5);
  return (frente + residual * 0.7) * pisca * uBrasas;
}

// ---------- Papel sobre o chão ----------

// distância com sinal até um retângulo (negativa dentro)
float sdCaixa(vec2 p, vec2 meio) {
  vec2 d = abs(p) - meio;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// distância até as pilhas de folhas paradas (grande se não há nenhuma)
float distanciaPilhas(vec2 q) {
  vec2 meio = vec2(uLargura * 0.5, uAltura * 0.5);
  float d = 1000.0;
  if (uPilhaDir > 0.5) d = min(d, sdCaixa(q - vec2(uLargura * 0.5, 0.0), meio));
  if (uPilhaEsq > 0.5) d = min(d, sdCaixa(q - vec2(-uLargura * 0.5, 0.0), meio));
  return d;
}

// ponto (no referencial da folha) dentro da área da folha plana, com margem
bool naFolha(vec2 p, float m) {
  return p.x >= -m && p.x <= uLargura + m && abs(p.y) <= uAltura * 0.5 + m;
}

// Altura livre embaixo do papel neste ponto do chão (0 = papel encostado no chão).
// Para cada folha sendo virada: a parte ainda plana encosta no chão; embaixo da
// curva sobra o espaço até o ponto mais baixo do cilindro; a aba que já passou
// por cima fica suspensa à altura 2R enquanto a folha vira.
float tetoPapel(vec2 q) {
  const float PI = 3.14159265;
  const float m = 0.03;
  if (distanciaPilhas(q) < 0.005) return 0.0; // embaixo das folhas paradas
  float teto = 1000.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uNumDobras) break;
    vec2 F = uDobraA[i].xy;
    vec2 n = uDobraA[i].zw;
    float R = uDobraB[i].x;
    vec2 p = vec2(uDobraB[i].y * q.x, q.y); // referencial da folha
    float s = dot(p - F, n);
    if (s <= 0.0 && naFolha(p, m)) return 0.0;
    if (s > 0.0 && s < R && naFolha(p - n * s, m)) {
      teto = min(teto, R - sqrt(max(R * R - s * s, 0.0)));
    }
    if (s < 0.0 && naFolha(p + n * (PI * R - 2.0 * s), m)) {
      teto = min(teto, 2.0 * R);
    }
  }
  return teto;
}

// sombra suave em volta da revista (o papel "abafa" a luz junto às bordas)
float sombraRevista(vec2 q) {
  return mix(0.8, 1.0, smoothstep(0.0, 0.1, distanciaPilhas(q)));
}

// ---------- Vinheta ----------

// o campo escurece longe da revista, para o olho ir direto para ela
float vinheta(vec2 q) {
  return mix(1.0, 0.35, smoothstep(1.6, 5.0, length(q * vec2(0.75, 1.0))));
}

// ---------- Névoa ----------

// leve névoa quente no cenário seco, mais forte ao longe
vec3 aplicarNevoa(vec3 cor, vec3 mundo) {
  float longe = smoothstep(3.0, 12.0, distance(cameraPosition, mundo));
  return mix(cor, uCorNevoa, uNevoa * (0.35 + 0.65 * longe));
}
