# Revista Horizonte

Revista web em 3D do trabalho multidisciplinar do 2º ano: mudanças climáticas e justiça climática no Brasil. A revista fica sobre um campo de grama e as páginas viram como numa revista de verdade. Na capa a floresta está viva; na contracapa passa uma frente de fogo.

Feita com Three.js (pela CDN) e shaders GLSL, sem instalar nada.

**Ver online:** <https://rafasepol.github.io/multi/>. O site é publicado sozinho pelo GitHub Actions a cada push na `main`.

## Como abrir

Na pasta do projeto:

```bash
python -m http.server 5500
```

Depois abra <http://localhost:5500/> no navegador. Se parecer que nada mudou, recarregue com Ctrl+Shift+R.

## Modos (no final do endereço)

- `?semcapa` usa a página 1 do PDF como capa e a 14 como contracapa (14 páginas)
- `?texto` mostra a diagramação automática do texto (38 páginas)
- `?fps` mostra os quadros por segundo

## Se o texto mudar

1. Salve o .docx de novo como PDF e troque `revista.pdf`.
2. No terminal, na pasta do projeto:

```bash
powershell -ExecutionPolicy Bypass -File ferramentas\pdf-para-imagens.ps1 -Pdf revista.pdf -Saida paginas -Largura 1300
```

```bash
python -I -X utf8 ferramentas\links-do-pdf.py revista.pdf paginas paginas\paginas-pdf.js
```

A primeira linha cria as imagens das páginas; a segunda, a lista de páginas e links.
