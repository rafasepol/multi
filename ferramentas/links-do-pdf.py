# Lê os links (endereços) de um PDF e escreve paginas/paginas-pdf.js, que a revista usa
# para saber qual imagem é qual página e onde ficam os links clicáveis.
#
# Uso:  python -I -X utf8 ferramentas/links-do-pdf.py revista.pdf paginas paginas/paginas-pdf.js
#
# Só entende PDFs gerados pelo Word (objetos de página e anotações em texto simples).
import json
import os
import re
import sys

pdf_path, pasta_imagens, saida = sys.argv[1], sys.argv[2], sys.argv[3]
dados = open(pdf_path, "rb").read().decode("latin-1")

# objetos: "12 0 obj ... endobj"
objetos = {}
for m in re.finditer(r"(\d+) 0 obj(.*?)endobj", dados, re.S):
    objetos[int(m.group(1))] = m.group(2)

paginas = []  # (id, MediaBox, [ids das anotações])
for oid, corpo in objetos.items():
    if re.search(r"/Type\s*/Page(?![s\w])", corpo):
        caixa = re.search(r"/MediaBox\s*\[([^\]]+)\]", corpo)
        anot = re.search(r"/Annots\s*\[([^\]]*)\]", corpo)
        ids = [int(x) for x in re.findall(r"(\d+) 0 R", anot.group(1))] if anot else []
        paginas.append((oid, caixa.group(1) if caixa else None, ids, corpo))

# ordem das páginas: /Kids do nó /Pages
ordem = []
for oid, corpo in objetos.items():
    if re.search(r"/Type\s*/Pages", corpo):
        kids = re.search(r"/Kids\s*\[([^\]]*)\]", corpo)
        if kids:
            ordem = [int(x) for x in re.findall(r"(\d+) 0 R", kids.group(1))]
            break
por_id = {p[0]: p for p in paginas}
paginas = [por_id[i] for i in ordem if i in por_id] or sorted(paginas)

# caixa padrão do PDF (herdada do nó /Pages se a página não tiver)
herdada = None
for corpo in objetos.values():
    if re.search(r"/Type\s*/Pages", corpo):
        m = re.search(r"/MediaBox\s*\[([^\]]+)\]", corpo)
        if m:
            herdada = m.group(1)
            break


def numeros(txt):
    return [float(x) for x in txt.split()]


def desfaz_pdf_string(s):
    s = re.sub(r"\\([()\\])", r"\1", s)
    return s


resultado = []
for n, (oid, caixa, ids, _) in enumerate(paginas, 1):
    x0, y0, x1, y1 = numeros(caixa or herdada)
    larg, alt = x1 - x0, y1 - y0
    links = []
    for aid in ids:
        a = objetos.get(aid, "")
        if not re.search(r"/Subtype\s*/Link", a):
            continue
        uri = re.search(r"/URI\s*\(((?:\\.|[^\\)])*)\)", a)
        rect = re.search(r"/Rect\s*\[([^\]]+)\]", a)
        if not uri or not rect:
            continue
        ra, rb, rc, rd = numeros(rect.group(1))
        links.append({
            "x0": round((min(ra, rc) - x0) / larg, 4),
            "x1": round((max(ra, rc) - x0) / larg, 4),
            # o PDF mede o y de baixo para cima; a textura, de cima para baixo
            "y0": round(1 - (max(rb, rd) - y0) / alt, 4),
            "y1": round(1 - (min(rb, rd) - y0) / alt, 4),
            "url": desfaz_pdf_string(uri.group(1)),
        })
    resultado.append({"imagem": f"{pasta_imagens}/pagina-{n:02d}.png", "links": links})

cab = (
    "// Páginas do PDF como imagens (geradas por ferramentas/pdf-para-imagens.ps1) e os links\n"
    "// de cada página (ferramentas/links-do-pdf.py). Coordenadas dos links em 0–1 da página.\n"
    "// Não edite à mão: gere de novo quando o PDF mudar.\n\n"
)
os.makedirs(os.path.dirname(saida) or ".", exist_ok=True)
with open(saida, "w", encoding="utf-8", newline="\n") as f:
    f.write(cab + "const PAGINAS_PDF = " + json.dumps(resultado, ensure_ascii=False, indent=2) + ";\n")

print(f"{len(resultado)} páginas;", "links por página:", [len(p["links"]) for p in resultado])
