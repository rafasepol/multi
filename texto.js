// Versão em texto da revista (texto.html). Lê o mesmo REVISTA de dados.js que a revista em
// 3D usa, então qualquer mudança no texto aparece nas duas. Aqui não há diagramação: os
// blocos viram HTML comum (títulos, parágrafos, tabelas), que leitores de tela, tradutores,
// a busca do navegador e o zoom do celular entendem.

const R = REVISTA;
const raiz = document.getElementById("revista");

// ---------- Utilidades ----------

function el(tag, attrs = {}, ...filhos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else e.setAttribute(k, v);
  }
  for (const f of filhos.flat(Infinity)) if (f != null && f !== false) e.append(f);
  return e;
}

// texto com marcadores de fonte [1] ou [1; 2] -> nós com links para a lista de fontes
function comFontes(texto) {
  const partes = [];
  for (const pedaco of texto.split(/(\[[^\]]+\])/)) {
    if (!pedaco) continue;
    const m = pedaco.match(/^\[([^\]]+)\]$/);
    if (!m) {
      partes.push(pedaco);
      continue;
    }
    const nums = m[1].split(/\s*;\s*/);
    const sup = el("sup", { class: "fonte" }, "[");
    nums.forEach((n, i) => {
      if (i) sup.append("; ");
      sup.append(el("a", { href: `#fonte-${n}`, "aria-label": `fonte ${n}` }, n));
    });
    sup.append("]");
    partes.push(sup);
  }
  return partes;
}

const fmt = (n, casas = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

// ---------- Blocos (os mesmos tipos de dados.js) ----------

function bloco(b, nivel = 3) {
  switch (b.t) {
    case "rotulo":
      return el("p", { class: "rotulo" }, b.texto);
    case "titulo":
      if (b.fundo) return el("p", { class: `destaque${b.fundo === "#d22a1e" ? " vermelho" : ""}` }, b.texto);
      return el(`h${nivel}`, {}, b.texto);
    case "lead":
      return el("p", { class: b.est === "legenda" ? "legenda" : "lead" }, ...comFontes(b.texto));
    case "texto":
      return b.p.map((p) => (typeof p === "object" ? el("p", { class: "inter" }, p.inter) : el("p", {}, ...comFontes(p))));
    case "foto":
      return el("figure", {}, el("img", { src: b.src, alt: b.legenda ?? "", loading: "lazy" }), b.legenda ? el("figcaption", {}, b.legenda) : null);
    case "mapa":
      return mapa();
    case "numeros":
      return el("ul", { class: "numeros" }, b.itens.map((it) => el("li", {}, el("strong", {}, it.n), el("span", {}, ...comFontes(it.texto ?? "")))));
    case "grafico":
      return grafico(b);
    case "citacao":
      return el(
        "blockquote", {},
        el("p", {}, `“${b.texto}”`),
        el("footer", {}, b.autor ? `${b.autor}. ` : "", ...comFontes(b.credito ?? "")),
      );
    case "lista":
      return el("ul", { class: "lista" }, b.itens.map((it) => el("li", {}, el("strong", {}, it.titulo), it.texto ? [": ", ...comFontes(it.texto)] : null)));
    case "fluxo": {
      const itens = [];
      b.itens.forEach((it, i) => {
        itens.push(el("li", {}, el("strong", {}, it.titulo), it.texto ? comFontes(it.texto) : null));
        const s = b.sinais?.[i];
        if (s && i < b.itens.length - 1) itens.push(el("li", { class: "sinal", "aria-hidden": "true" }, s));
      });
      return el("ul", { class: "fluxo" }, itens);
    }
    case "caixa": {
      const tom = b.fundo === "#1c1a18" ? " escura" : b.fundo === "#d22a1e" ? " vermelha" : "";
      return el("div", { class: `caixa${tom}` }, b.blocos.map((x) => bloco(x, nivel)));
    }
    case "lado":
      return b.colunas.flat().map((x) => bloco(x, nivel));
    default:
      return null;
  }
}

function grafico(b) {
  const max = b.max ?? Math.max(...b.barras.map(([, v]) => v));
  const linhas = b.barras.map(([rotulo, valor, texto]) =>
    el("tr", {},
      el("th", { scope: "row" }, rotulo),
      el("td", {}, el("span", { class: "barra" },
        el("i", { style: `width:${Math.max(0.5, (valor / max) * 70)}%`, "aria-hidden": "true" }),
        el("b", {}, texto),
      )),
    ),
  );
  return el("figure", { class: "grafico" },
    el("table", {}, el("caption", {}, b.titulo), el("tbody", {}, linhas)),
    b.eixo ? el("p", { class: "legenda" }, b.eixo) : null,
    b.legenda ? el("figcaption", {}, ...comFontes(b.legenda)) : null,
  );
}

// o mapa vira uma tabela com os mesmos números do cartão interativo
function mapa() {
  const m = R.mapaFogo;
  const linhas = m.biomas.map((b) =>
    el("tr", {}, el("th", { scope: "row" }, b.nome), el("td", {}, b.area ?? ""), el("td", {}, b.focos.toLocaleString("pt-BR")), el("td", {}, `${fmt(b.parte)}%`)),
  );
  return el("figure", {},
    el("table", { class: "mapa-tabela" },
      el("caption", { class: "legenda" }, `Focos de calor e área queimada por bioma, ${m.periodo.replace(/^dos /, "")}.`),
      el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "Bioma"), el("th", { scope: "col" }, "Área queimada"), el("th", { scope: "col" }, "Focos"), el("th", { scope: "col" }, "% do país"))),
      el("tbody", {}, linhas),
    ),
    el("figcaption", {}, ...comFontes(m.fonte)),
  );
}

// ---------- Montagem ----------

// número de página de cada entrada do espelho (capa = 1; "fontes" ocupa várias páginas)
const numeros = [];
{
  let n = 2;
  for (const p of R.paginas) {
    numeros.push(n);
    n += p.modelo === "fontes" ? (p.paginas ?? 2) : 1;
  }
}

const c = R.capa;
raiz.append(
  el("section", { class: "capa" },
    el("p", { class: "edicao" }, R.edicao),
    el("h1", {}, c.chamada),
    el("p", { class: "sub" }, c.subtitulo),
    el("figure", {},
      el("img", { src: c.foto, alt: "Mulheres Kayapó com pintura vermelha no rosto seguram a faixa “Sem justiça climática, não há direitos indígenas. Sem a floresta, não há futuro”, diante de um globo inflável." }),
      c.credito ? el("figcaption", {}, c.credito) : null,
    ),
  ),
);

R.paginas.forEach((p, i) => {
  const pg = numeros[i];
  if (p.modelo === "sumario") {
    const itens = R.paginas
      .map((q, k) => (q.sumario ? el("li", {}, el("span", { class: "pg" }, String(numeros[k]).padStart(2, "0")), el("a", { href: `#pagina-${numeros[k]}` }, q.sumario.titulo), ` — ${q.sumario.sub}`) : null))
      .filter(Boolean);
    const ed = R.editorial;
    raiz.append(
      el("nav", { class: "sumario pagina", "aria-label": "Sumário" }, el("h2", {}, "Sumário"), el("ol", {}, itens)),
      el("section", { class: "pagina" },
        el("p", { class: "rotulo" }, ed.titulo),
        el("h2", {}, ed.chamada),
        ed.texto.map((t) => el("p", {}, t)),
        el("p", { class: "lead" }, `— ${ed.assinatura}`),
      ),
      el("section", { class: "pagina equipe", "aria-label": "Equipe" },
        el("p", { class: "rotulo" }, "Equipe"),
        el("ul", {}, (R.equipe ?? []).map((m) =>
          el("li", {},
            m.foto ? el("img", { src: m.foto, alt: m.nome, loading: "lazy" }) : el("span", { class: "sem-foto", "aria-hidden": "true" }),
            el("span", { class: "nome" }, m.nome),
          ),
        )),
        R.expediente ? el("p", { class: "legenda" }, R.expediente) : null,
      ),
    );
    return;
  }
  if (p.modelo === "abertura") {
    raiz.append(
      el("section", { class: "parte", id: `pagina-${pg}` },
        el("p", { class: "num" }, `Parte ${p.numero}`),
        el("h2", {}, p.titulo),
        el("p", { class: "linha-fina" }, p.linhaFina),
        p.foto ? el("figure", {}, el("img", { src: p.foto, alt: p.legenda ?? "", loading: "lazy" }), p.legenda ? el("figcaption", {}, p.legenda) : null) : null,
        p.destaque ? el("p", { class: "destaque" }, p.destaque) : null,
        (p.blocos ?? []).map((b) => bloco(b)),
      ),
    );
    return;
  }
  if (p.modelo === "materia") {
    raiz.append(
      el("section", { class: "pagina", id: `pagina-${pg}` },
        p.secao ? el("p", { class: "secao" }, p.secao) : null,
        p.blocos.map((b) => bloco(b)),
        p.lateral ? el("aside", { class: "caixa vermelha" }, p.lateral.blocos.map((b) => bloco(b))) : null,
      ),
    );
    return;
  }
  if (p.modelo === "fontes") {
    const f = R.fontes;
    raiz.append(
      el("section", { class: "fontes parte", id: `pagina-${pg}` },
        el("h2", {}, f.titulo),
        el("p", {}, f.intro),
        el("ol", {}, f.itens.map((it) =>
          el("li", { id: `fonte-${it.n}` }, el("span", { class: "n" }, `[${it.n}]`), it.texto, it.url ? [el("br"), el("a", { href: it.url, rel: "noopener" }, it.url)] : null),
        )),
        f.notas.map((n) => [el("h3", {}, n.titulo), n.texto.map((t) => el("p", {}, ...comFontes(t)))]),
      ),
    );
  }
});

raiz.append(el("p", { class: "contracapa" }, R.contracapa.texto));

// vídeo da equipe (na revista em 3D, abre pelo cartaz da contracapa)
if (R.video?.youtube) {
  raiz.append(el("p", { class: "video-link" }, el("a", { href: R.video.youtube, rel: "noopener" }, `▶ Assistir ao ${R.video.titulo.toLowerCase()}`, R.video.duracao ? ` (${R.video.duracao})` : "")));
}
