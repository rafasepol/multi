# Revista

Revista web em 3D do trabalho multidisciplinar do 2º ano: mudanças climáticas e justiça climática no Brasil. A revista fica sobre um campo de grama e as páginas viram como numa revista de verdade. Na capa a floresta está viva; na contracapa passa uma frente de fogo.

Feita com Three.js (pela CDN) e shaders GLSL, sem instalar nada.

**Ver online:** <https://rafasepol.github.io/multi/>. O site é publicado sozinho pelo GitHub Actions a cada push na `main`.

## Checklist da atividade

Requisitos do PDF "Análise e Reflexão Crítica sobre Temas Globais da ONU e do Contexto Brasileiro" (2026) e onde cada um está na revista. Tema do grupo: **Mudança Climática**.

### Pesquisa e dados (estatística)

- [x] **Fontes confiáveis** (IBGE, IPEA, ONU, Banco Mundial ou equivalentes): IBGE (renda, pobreza, favelas), ONU/IPCC, SEEG, INPE, MapBiomas, Fiocruz, EPE, TCU e MPF — 37 fontes com link e data (págs. 16–17).
- [x] **Dados atualizados**: emissões, fogo, pobreza e desmatamento de 2024; renda de 2023.
- [x] **Gráficos, tabelas ou infográficos**: 4 gráficos (págs. 4, 7 e 11), mapa interativo do fogo (pág. 5) e blocos de números (págs. 4, 8, 11, 12 e 15).
- [x] **Interpretação dos dados**: cada gráfico tem legenda com a fonte e um texto que explica o que ele mostra.

### Análise sociológica

- [x] **Causas sociais, econômicas e políticas**: emissões por setor e fronteira agropecuária (págs. 4 e 11), ocupação do território (pág. 8), licenças e interesses (pág. 13).
- [x] **Consequências sociais** (desigualdade, exclusão): quem perde mais (pág. 7), racismo ambiental (pág. 8), histórias reais (pág. 9). *Violência, citada como exemplo no PDF, não é tratada.*
- [x] **Teoria sociológica ligada à realidade brasileira**: Durkheim (pág. 6), Weber e Bourdieu (pág. 7), Kowarick, Rolnik, Bullard e Acselrad (pág. 8), Fraser (pág. 14).
- [x] **Políticas públicas propostas**: 6 propostas da equipe, cada uma ligada a um dado (pág. 15).

### Estrutura da revista

- [x] **Introdução**: editorial e parte 1 (págs. 2–3).
- [x] **Análise de dados**: págs. 4, 5, 7, 8 e 11.
- [x] **Perspectiva sociológica**: partes 2 e 3 (págs. 6–13).
- [x] **Soluções possíveis**: parte 4 e propostas (págs. 14–15).
- [x] **Conclusão**: "Uma crise de renda, raça e território" (pág. 15) e contracapa.
- [x] **Gênero revista, em português**: capa, sumário, editorial, seções, olhos, legendas, expediente e equipe.

### Requisitos técnicos

- [x] **Frame de 1440 × 1024 px**: as duas páginas cabem inteiras nesse tamanho (testado).
- [x] **No máximo 2 famílias tipográficas**: Anton e Inter.
- [x] **Escala fixa de tamanhos de fonte**: 5 tamanhos de texto e 8 de título (`ESCALA_TEXTO` e `ESCALA_TITULO` em `diagramacao.js`).
- [x] **Mínimo de 5 componentes reutilizáveis**: rótulo, título, texto, números, gráfico, citação, lista, fluxo, caixa, foto, mapa e retrato (blocos de `dados.js`).
- [x] **Paleta com até 5 cores principais, além de neutros**: 4 principais (vermelho, vinho, laranja, âmbar) + neutros, em `paleta.js`.
- [ ] **Imagens em boa resolução, sem distorção**: nenhuma é distorcida, mas `rio-grande-do-sul.jpg` e `colagem-fabrica.jpg` têm só 690 px de largura — trocar pelos originais em resolução maior.
- [x] **Navegação entre capa, sumário e matérias**: setas, teclado, arrastar as páginas e toque no celular.
- [x] **Sumário com links internos**: cada item leva à sua seção (na revista 3D e na versão em texto).

### Pendências da equipe

- [ ] **Créditos das imagens**: confirmar autor e permissão das colagens e fotos em `assets/fotos/` e colocar nas legendas.
- [x] **Fotos da equipe** (pág. 2): os seis integrantes.
- [ ] **Vídeo em inglês** (5 a 7 min), simulando a apresentação do Brasil na ONU.
- [ ] **Apresentação da revista** (até 10 min).

### Critérios de avaliação

| Critério | Pontos | Onde está |
|---|---|---|
| Qualidade da pesquisa e uso de fontes confiáveis | 1,0 | Fontes e notas (págs. 16–17) |
| Clareza e profundidade da análise sociológica | 2,0 | Partes 2 a 4 (págs. 6–15) |
| Arquitetura da informação, padrão visual e navegação | 2,0 | Sumário com links, escala, paleta, componentes |
| Revista digital / apresentação | 3,0 | Revista 3D, versão em texto e PDF |
| Vídeo em inglês | 2,0 | Pendente |

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

## Padrão visual

- **Fontes:** só duas, Anton (títulos, números e aspas) e Inter (texto).
- **Tamanhos:** escala fixa em `diagramacao.js` (`ESCALA_TEXTO` e `ESCALA_TITULO`). Um título que pede outro tamanho recebe o degrau mais próximo abaixo.
- **Cores:** `paleta.js` — 4 principais (vermelho, vinho, laranja e âmbar, as duas últimas só no mapa) e neutros (preto, papel, creme, bege e cinza). O CSS repete os mesmos valores.

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

As fotos da equipe ficam em `assets/equipe/` e a lista em `dados.js`, em `equipe` (`foto: null` deixa o círculo vazio). Confirme autor e permissão de cada imagem em `assets/fotos/` e coloque o crédito na legenda (`legenda` em `dados.js`).
