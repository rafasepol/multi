// Paleta da revista: 4 cores principais e 5 neutros. Todo o resto (revista, mapa, cartão
// do mapa e as páginas HTML) usa só estas cores. Em CSS, os mesmos valores estão em
// style.css e texto.css.
export const COR = {
  // principais
  vermelho: "#d22a1e",
  vinho: "#8f2a1f",
  laranja: "#ec5c16",
  ambar: "#ffb834",
  // neutros
  preto: "#1c1a18",
  papel: "#f2ead9",
  creme: "#f8f1e2",
  bege: "#e5d9c0",
  suave: "#665e53",
  // variações transparentes dos neutros
  cremeSuave: "rgba(248,241,226,.82)",
};

// "#rrggbb" -> [r, g, b]
export const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
