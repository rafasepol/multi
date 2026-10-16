// Páginas da revista — vertex shader.
// A malha já chega dobrada (a deformação é feita no JavaScript);
// aqui só repassamos UV, posição no mundo, normal e a direção do vinco para o fragment shader.

attribute vec3 eixoVinco; // para onde a normal inclina perto da lombada (calculado no JS)

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vEixoVinco;

void main() {
  vUv = uv;
  vNormal = normal;
  vEixoVinco = eixoVinco;
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vPos = mundo.xyz;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
