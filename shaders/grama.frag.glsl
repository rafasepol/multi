// Grama — fragment shader: luz do sol, contraluz (o sol atravessando a folha),
// raiz mais escura (pouca luz chega ao pé da grama), sombra junto à revista
// e o brilho das brasas na queimada.

#include "comum.glsl"

varying vec3 vCor;
varying float vH;
varying vec3 vNormal;
varying vec3 vMundo;
varying float vSombra;
varying float vQueimado;
varying float vBrasa;

void main() {
  vec3 v = normalize(cameraPosition - vMundo);
  vec3 n = normalize(vNormal);
  if (dot(n, v) < 0.0) n = -n; // a folha tem dois lados

  // luz "envolvente": a folha é fina e translúcida, o lado de trás nunca fica preto
  float difusa = clamp(dot(n, uDirSol) * 0.6 + 0.4, 0.0, 1.0);
  float contraluz = pow(max(dot(-v, uDirSol), 0.0), 3.0) * 0.5 * vH;
  // pé da grama mais escuro (na queimada sobra pouca grama, então chega mais luz embaixo)
  float ao = mix(mix(0.28, 0.6, vQueimado), 1.0, smoothstep(0.0, 0.8, vH));

  vec3 luz = uCorAmbiente * ao * (0.6 + 0.4 * vSombra)
           + uCorSol * (difusa * 0.9 + contraluz) * ao * vSombra;
  vec3 cor = vCor * luz;

  // brilho suave do sol na ponta das folhas
  vec3 meio = normalize(uDirSol + v);
  cor += uCorSol * pow(max(dot(n, meio), 0.0), 20.0) * 0.06 * vH;

  // brasas: luz própria (não depende do sol nem some na névoa); vermelho → amarelo
  vec3 corBrasa = mix(vec3(1.0, 0.25, 0.02), vec3(1.0, 0.75, 0.3), clamp(vBrasa, 0.0, 1.0));
  gl_FragColor = vec4(aplicarNevoa(cor, vMundo) + corBrasa * vBrasa * 1.6, 1.0);
}
