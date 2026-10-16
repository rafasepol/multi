// Páginas vindas de um PDF: uma página do PDF = uma página da revista.
//
// Cada página do PDF já está salva como imagem (paginas/pagina-NN.png, gerada por
// ferramentas/pdf-para-imagens.ps1) e os endereços clicáveis vêm de paginas/paginas-pdf.js
// (ferramentas/links-do-pdf.py). Assim a revista não depende de biblioteca nenhuma para
// mostrar o PDF e abre também sem internet.

// Descritores de página no formato que script.js espera (sempre em número par)
export function paginasDoPdf(lista) {
  const paginas = lista.map((p, i) => ({ tipo: "pdf", pagina: i + 1, imagem: p.imagem, links: p.links }));
  if (paginas.length % 2 !== 0) paginas.push({ tipo: "vazia" });
  return paginas;
}

// Desenha a página (imagem) inteira e centralizada em `canvas`, que já tem o tamanho da
// textura, e preenche `links` com {x0,y0,x1,y1,url} em coordenadas 0–1 da textura.
// Devolve uma promessa: a imagem é carregada de forma assíncrona.
export function desenharPaginaPdf(p, canvas, links) {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => {
      const w = canvas.width;
      const h = canvas.height;
      const k = Math.min(w / img.naturalWidth, h / img.naturalHeight); // a página cabe inteira
      const dw = img.naturalWidth * k;
      const dh = img.naturalHeight * k;
      const ox = (w - dw) / 2; // sobra uma faixa branca dos lados
      const oy = (h - dh) / 2;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, ox, oy, dw, dh);
      for (const l of p.links) {
        links.push({
          x0: (ox + l.x0 * dw) / w,
          x1: (ox + l.x1 * dw) / w,
          y0: (oy + l.y0 * dh) / h,
          y1: (oy + l.y1 * dh) / h,
          url: l.url,
        });
      }
      ok();
    };
    img.onerror = () => erro(new Error(`não carregou ${p.imagem}`));
    img.src = p.imagem;
  });
}
