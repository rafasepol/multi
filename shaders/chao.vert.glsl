// Chão — vertex shader: só repassa a posição no mundo.

varying vec3 vMundo;

void main() {
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vMundo = mundo.xyz;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
