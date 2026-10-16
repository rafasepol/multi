// Páginas da revista — fragment shader.
// Frente e verso na mesma malha; a luz vem da normal real da superfície dobrada.
// As outras folhas recebem a sombra da dobra que está acontecendo.
// Perto da lombada o papel "desce" para dentro do vinco: em vez de mexer na malha,
// a normal é inclinada pixel a pixel, e a própria luz desenha o relevo.

uniform sampler2D frente;
uniform sampler2D verso;
uniform vec2 dobraP;
uniform vec2 dobraN;
uniform float dobraForca;
uniform float dobraLargura;
uniform float recebeSombra;
uniform vec3 uLuzPagina; // cor da luz do cenário (branco na leitura)
uniform float vinco;           // 0 = revista fechada (sem vinco), 1 = aberta
uniform float vincoLargura;    // largura da curva (fração da largura da página)
uniform float vincoInclinacao; // inclinação do papel no fundo do vinco (1 = 45°)

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vEixoVinco;

void main() {
  vec4 cor = gl_FrontFacing
    ? texture2D(frente, vUv)
    : texture2D(verso, vec2(1.0 - vUv.x, vUv.y));

  // vinco: r = 1 na lombada e 0 onde a curva termina (vUv.x = 0 na lombada nas duas faces).
  // A inclinação vem da curva z = -(1 - u)³: forte no fundo, some suave no fim.
  vec3 n0 = normalize(vNormal);
  float r = 1.0 - clamp(vUv.x / vincoLargura, 0.0, 1.0);
  vec3 n = normalize(vNormal + vEixoVinco * (vincoInclinacao * vinco * r * r));

  // luz difusa: a parte curvada escurece conforme inclina;
  // passa um pouco de 1 para o lado do vinco virado para a luz clarear
  vec3 luz = normalize(vec3(-0.35, 0.45, 1.0));
  float difusa = abs(dot(n, luz)) / dot(vec3(0.0, 0.0, 1.0), luz);
  float sombra = mix(0.5, 1.0, clamp(difusa, 0.0, 1.15));
  float brilho = pow(1.0 - abs(n.z), 3.0) * 0.12;

  // reflexo de papel brilhante na curva do vinco (câmera olhando de cima).
  // Só conta o que o vinco acrescenta: o resto da página fica igual.
  vec3 meio = normalize(luz + vec3(0.0, 0.0, 1.0));
  float reflexo = max(pow(abs(dot(n, meio)), 40.0) - pow(abs(dot(n0, meio)), 40.0), 0.0) * 0.25;

  // fundo do vinco: a luz quase não chega (escurece suave + uma linha fina no meio)
  sombra *= 1.0 - vinco * (0.22 * r * r * r * r + 0.3 * exp(-vUv.x / 0.006));

  // sombra projetada pela página que está sendo dobrada
  float s = dot(vPos.xy - dobraP, dobraN);
  float projetada = s > 0.0
    ? exp(-s / dobraLargura)
    : exp(s / (dobraLargura * 0.25)) * 0.5;
  sombra *= 1.0 - 0.5 * projetada * dobraForca * recebeSombra;

  gl_FragColor = vec4((cor.rgb * sombra + brilho + reflexo) * uLuzPagina, 1.0);
}
