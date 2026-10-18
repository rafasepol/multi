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

Sem nada no endereço, abre a revista diagramada: 18 páginas (o máximo), montadas a partir de `dados.js`.

- `?pdf` mostra a versão antiga, feita a partir do PDF
- `?pdf&semcapa` usa a página 1 do PDF como capa e a 14 como contracapa (14 páginas)
- `?fps` mostra os quadros por segundo

## Se o texto ou as fotos mudarem

Edite `dados.js`: lá estão o texto e o espelho das 18 páginas (quais blocos vão em cada página). As fotos ficam em `assets/fotos/`. Se algo não couber, o console do navegador (F12) avisa qual página passou do limite.

Se uma imagem de `assets/fotos/` faltar, a página mostra um bloco com o nome do arquivo.

### Mapa interativo ("Fogo no Brasil", página 5)

Ao passar o mouse no mapa, ele sai da página em 3D (`mapa3d.js`); sobre cada bioma aparece o gráfico de focos de calor do IPAM. Os biomas (nome, percentual, contorno aproximado e recorte do gráfico em `ipam-fogo-no-brasil.jpg`) ficam em `dados.js`, em `mapaFogo`.

### Versão antiga em PDF (`?pdf`)

1. Salve o .docx de novo como PDF e troque `revista.pdf`.
2. No terminal, na pasta do projeto:

```bash
powershell -ExecutionPolicy Bypass -File ferramentas\pdf-para-imagens.ps1 -Pdf revista.pdf -Saida paginas -Largura 1300
```

```bash
python -I -X utf8 ferramentas\links-do-pdf.py revista.pdf paginas paginas\paginas-pdf.js
```

A primeira linha cria as imagens das páginas; a segunda, a lista de páginas e links.
