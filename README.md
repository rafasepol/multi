# Revista

Revista web em 3D do trabalho multidisciplinar do 2º ano: mudanças climáticas e justiça climática no Brasil. A revista fica sobre um campo de grama e as páginas viram como numa revista de verdade. Na capa a floresta está viva; na contracapa passa uma frente de fogo.

Feita com Three.js (pela CDN) e shaders GLSL, sem instalar nada.

**Ver online:** <https://rafasepol.github.io/multi/>. O site é publicado sozinho pelo GitHub Actions a cada push na `main`.

## Três jeitos de ler

- **Revista em 3D** (`index.html`): 18 páginas, montadas a partir de `dados.js`. No computador aparecem as duas páginas abertas; com a tela em pé (celular), uma página por vez.
- **Versão em texto** (`texto.html`): o mesmo conteúdo em HTML comum, para celular, leitor de tela, tradutor e busca. Monta-se sozinha a partir de `dados.js`.
- **PDF** (`revista.pdf`): as 18 páginas, para imprimir ou mandar por e-mail.

## Como abrir

Na pasta do projeto:

```bash
python -m http.server 5500
```

Depois abra <http://localhost:5500/> no navegador. Se parecer que nada mudou, recarregue com Ctrl+Shift+R.

Com `?fps` no fim do endereço, aparecem os quadros por segundo.

## Se o texto ou as fotos mudarem

Edite `dados.js`: lá estão o texto, as fontes e o espelho das 18 páginas (quais blocos vão em cada página). As fotos ficam em `assets/fotos/`. Se algo não couber, o console do navegador (F12) avisa qual página passou do limite. A versão em texto muda junto.

Depois, gere o PDF de novo: abra <http://localhost:5500/imprimir.html>, espere aparecer "Pronto" e use **Imprimir → Salvar como PDF** (margens: nenhuma; gráficos de fundo: ligados). Salve por cima de `revista.pdf`.

Os marcadores `[n]` no texto apontam para a lista `fontes.itens`, numerada na ordem em que as fontes aparecem na revista.

Se uma imagem de `assets/fotos/` faltar, a página mostra um bloco com o nome do arquivo.

### Mapa interativo ("Fogo no Brasil", página 5)

O mapa é desenhado pelo próprio site (`mapa-biomas.js`): cada bioma é pintado pela sua parte dos focos de calor. Ao passar o mouse (ou tocar), ele sai da página em 3D (`mapa3d.js`) e mostra um cartão com os focos e a área queimada do bioma.

- Os números ficam em `dados.js`, em `mapaFogo`.
- As formas ficam em `biomas-mapa.js`, gerado por `ferramentas/gerar-biomas.py` a partir do contorno do Brasil (limites estaduais do IBGE, em `ferramentas/brasil-contorno.json`) e de contornos aproximados dos biomas. Para mudar uma forma, edite o script e rode `python -I -X utf8 ferramentas/gerar-biomas.py` (precisa de `pip install shapely`).

### Antes de publicar

As colagens e fotos ainda estão com os créditos em verificação (página 2). As fotos da equipe ficam em `assets/equipe/` e a lista em `dados.js`, em `equipe` (`foto: null` deixa o círculo vazio). Confirme autor e permissão de cada imagem em `assets/fotos/` e coloque o crédito na legenda (`legenda` em `dados.js`).
