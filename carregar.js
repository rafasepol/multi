// Carrega os shaders (GLSL) da pasta shaders/.
// Um shader pode incluir outro com a linha:   #include "comum.glsl"
// (o GLSL do navegador não tem #include, então a troca é feita aqui).

const cache = new Map();

async function baixarTexto(nome) {
  if (!cache.has(nome)) {
    cache.set(
      nome,
      fetch(`./shaders/${nome}`).then((r) => {
        if (!r.ok) throw new Error(`Não consegui carregar o shader ${nome} (${r.status})`);
        return r.text();
      })
    );
  }
  return cache.get(nome);
}

export async function carregarShader(nome) {
  const texto = await baixarTexto(nome);
  const linhas = await Promise.all(
    texto.split("\n").map(async (linha) => {
      const m = linha.match(/^\s*#include\s+"(.+)"\s*$/);
      return m ? carregarShader(m[1]) : linha;
    })
  );
  return linhas.join("\n");
}
