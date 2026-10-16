// Chão — fragment shader.
// Mistura o chão de floresta (capa, floresta viva) com o chão queimado
// (contracapa) usando a mesma máscara da queimada que a grama usa.

#include "comum.glsl"

uniform sampler2D uVivoCor;
uniform sampler2D uVivoNormal;
uniform sampler2D uQueimadoCor;
uniform sampler2D uQueimadoNormal;
uniform float uEscalaViva;     // tamanho de uma repetição da textura, em unidades do mundo
uniform float uEscalaQueimada;

varying vec3 vMundo;

void main() {
  vec2 q = vMundo.xy;
  float queimado = mascaraQueimada(q);

  vec2 uvViva = q / uEscalaViva;
  vec2 uvQueimada = q / uEscalaQueimada;
  vec3 corViva = texture2D(uVivoCor, uvViva).rgb;
  vec3 corQueimada = texture2D(uQueimadoCor, uvQueimada).rgb;
  vec3 nViva = texture2D(uVivoNormal, uvViva).xyz * 2.0 - 1.0;
  vec3 nQueimada = texture2D(uQueimadoNormal, uvQueimada).xyz * 2.0 - 1.0;

  // o chão é plano em z, então a normal da textura já está no espaço do mundo
  vec3 n = normalize(mix(nViva, nQueimada, queimado));

  // chão queimado: mais escuro e quase sem cor, com manchas de cinza clara
  float lum = dot(corQueimada, vec3(0.3, 0.59, 0.11));
  corQueimada = mix(corQueimada, vec3(lum), 0.85) * 0.45;
  float cinza = smoothstep(0.5, 0.8, ruido(q * 0.9 + 5.0)) * 0.6
              + smoothstep(0.55, 0.85, ruido(q * 3.7)) * 0.4;
  corQueimada = mix(corQueimada, vec3(0.5, 0.49, 0.47), cinza * 0.6);

  vec3 cor = mix(corViva * 0.85, corQueimada, queimado);

  // a grama densa escurece o chão embaixo dela; na queimada o chão fica exposto
  float oclusao = mix(0.5, 0.95, queimado);
  float difusa = max(dot(n, uDirSol), 0.0);
  float sombra = sombraRevista(q);
  vec3 luz = uCorAmbiente * oclusao + uCorSol * difusa * sombra * oclusao;
  vec3 final = aplicarNevoa(cor * luz, vMundo);

  // brasas no chão: pontinhos acesos que piscam na frente do fogo e atrás dela
  float b = brasas(q) * smoothstep(0.45, 0.75, ruido(q * 23.0 + uTempo * 0.5));
  vec3 corBrasa = mix(vec3(1.0, 0.2, 0.02), vec3(1.0, 0.7, 0.25), clamp(b, 0.0, 1.0));
  final += corBrasa * b * 1.8;

  gl_FragColor = vec4(final, 1.0);
}
