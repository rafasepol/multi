// Conteúdo da revista: "Mudanças climáticas e justiça climática no Brasil".
// Versão resumida do texto da equipe (Revista_Mudancas_Climaticas_Atualizada.docx), com
// mais espaço para fotos, números e gráficos. Para mudar o texto, edite só este arquivo:
// diagramacao.js mede tudo e monta as páginas.
//
// `paginas` é o espelho da revista: as páginas de dentro, na ordem (a capa e a contracapa
// entram sozinhas). Modelos:
//   sumario    sumário, editorial e expediente
//   abertura   abre uma parte: foto no alto (ou `destaque`, uma frase grande, se não houver
//              foto), faixa com número e título, matéria embaixo
//   materia    página de matéria: uma pilha de blocos (pode ter uma coluna `lateral` colorida)
//   fontes     fontes e notas, em letra pequena (`paginas`: quantas páginas ocupa)
// `sumario: { titulo, sub }` numa página põe essa página no sumário.
//
// Blocos (campo t), empilhados de cima para baixo:
//   rotulo   { texto }                           etiqueta pequena com estrela
//   titulo   { texto, tam, cor, fundo }          título grande em caixa alta
//   lead     { texto, cor }                      frase de abertura em destaque
//   texto    { p: [parágrafos ou { inter }], colunas, capitular }
//   foto     { src, h ou resto, legenda, foco: [x, y], conter, mesclar }
//   mapa     { id }                              mapa "Fogo no Brasil" (dados em mapaFogo)
//   numeros  { itens: [{ n, texto }], colunas, fundo, tam }
//   grafico  { titulo, barras: [[rótulo, valor, texto]], max, eixo, legenda }
//   citacao  { texto, autor, credito, fundo }    olho: fala em destaque
//   lista    { itens: [{ titulo, texto }], colunas }
//   fluxo    { itens: [{ titulo, texto }], sinais: ["+", "="] }
//   caixa    { blocos, fundo }                   bloco com fundo colorido
//   lado     { colunas: [[blocos], [blocos]], larguras: [2, 1] }
//   espaco   { h }
// Qualquer bloco aceita `antes` (espaço acima, em u). `resto: true` faz o bloco crescer até
// ocupar a sobra da página. Marcadores de fonte como [1] ou [1; 2] ficam no texto e se
// referem à lista `fontes.itens`, numerada na ordem em que aparecem na revista.
// Texto curto em duas colunas: use um bloco `lado` com um parágrafo em cada coluna, para a
// frase não ser partida no meio. Se algo não couber, o console do navegador avisa a página.

// cores da paleta (as mesmas de paleta.js)
const VERMELHO = "#d22a1e";
const VINHO = "#8f2a1f";
const PRETO = "#1c1a18";
const CREME = "#f8f1e2";
const BEGE = "#e5d9c0";
const SUAVE = "#665e53";

const FOTO = {
  // colagens escolhidas pela equipe
  mascara: "assets/fotos/colagem-mascara.jpg",
  fabrica: "assets/fotos/colagem-fabrica.jpg",
  cigarro: "assets/fotos/colagem-cigarro.jpg",
  // fotos de contexto (sem pessoas identificáveis)
  queimada: "assets/fotos/queimada.jpg",
  rs: "assets/fotos/rio-grande-do-sul.jpg",
};

const REVISTA = {
  edicao: "Germinare Tech • 2º F • Outubro de 2026",
  // integrantes do grupo, na ordem em que aparecem; foto: null deixa o círculo vazio
  equipe: [
    { nome: "Rafael Lopes", foto: "assets/equipe/rafael-lopes.jpg" },
    { nome: "Matheus Botana", foto: "assets/equipe/matheus-botana.jpg" },
    { nome: "Guilherme Senatore", foto: "assets/equipe/guilherme-senatore.jpg" },
    { nome: "Emanuelly Mendes", foto: "assets/equipe/emanuelly-mendes.jpg" },
    { nome: "Sophia Castro", foto: null },
    { nome: "Rafael Manzato", foto: null },
  ],
  expediente: "Pesquisa, redação e design: a equipe. Imagens: seleção da equipe (créditos em verificação).",
  capa: {
    foto: FOTO.mascara,
    foco: [0.5, 0],
    chamada: "Clima em desequilíbrio, vidas desiguais",
    subtitulo: "Como as emissões, as decisões das grandes empresas e a desigualdade se cruzam na crise climática brasileira.",
    destaques: ["Quem sofre", "Quem causa", "Justiça climática"],
  },
  editorial: {
    titulo: "Editorial",
    chamada: "Clima, desigualdade e decisões no mesmo mapa",
    texto: [
      "Uma casa levada pela água, uma aldeia cercada pela seca e uma criança exposta ao calor fazem parte da mesma discussão. A crise climática encontra um Brasil em que renda, moradia, infraestrutura e poder já são distribuídos de forma desigual.",
      "Nesta edição, ligamos as duas pontas: quem sofre e quem sustenta as emissões que agravam o problema. No fim, mostramos o que já existe para proteger as pessoas — e o que ainda falta.",
    ],
    assinatura: "A equipe editorial",
  },

  paginas: [
    // 2 — sumário e editorial
    { modelo: "sumario" },

    // 3 — parte 1
    {
      modelo: "abertura",
      sumario: { titulo: "Um planeta mais quente, um Brasil desigual", sub: "Emissões, calor e fogo" },
      numero: 1,
      titulo: "Um planeta mais quente, um Brasil desigual",
      linhaFina: "Emissões, aquecimento e fogo no Brasil",
      foto: FOTO.fabrica,
      mesclar: "multiply",
      foco: [0.5, 0.45],
      fotoAlt: 44,
      blocos: [
        {
          t: "lado", larguras: [2, 1], gap: 3.4,
          colunas: [
            [
              { t: "rotulo", texto: "O aquecimento começa nas emissões" },
              {
                t: "texto", colunas: 1, capitular: true, antes: 1.4,
                p: [
                  "Mudanças climáticas são alterações duradouras nos padrões do clima, e a ação humana tem papel central. A queima de carvão, petróleo e gás e o desmatamento lançam CO₂ na atmosfera; metano e óxido nitroso, ligados à agropecuária, também retêm calor. [1; 2]",
                  "CO₂ é um gás específico. CO₂e soma vários gases numa unidade comparável pelo efeito de aquecimento — por isso um total em CO₂e não é só gás carbônico. [2]",
                ],
              },
            ],
            [
              { t: "numeros", colunas: 1, tam: 8.4, itens: [{ n: "1,1 °C", texto: "foi quanto a média global de 2011 a 2020 ficou acima da média de 1850 a 1900. [1]" }] },
            ],
          ],
        },
      ],
    },

    // 4
    {
      modelo: "materia",
      secao: "1 · Um planeta mais quente",
      blocos: [
        { t: "rotulo", texto: "Do aquecimento aos impactos" },
        { t: "titulo", texto: "Quando o aquecimento vira cotidiano", tam: 6, antes: 1 },
        {
          t: "texto", colunas: 1, antes: 1.4,
          p: [
            "O aquecimento altera o ciclo da água e pode intensificar chuvas fortes, ondas de calor e secas. O tamanho do estrago, porém, depende também de como e onde as pessoas vivem: da ocupação do território, da infraestrutura e da prevenção. [1]",
          ],
        },
        {
          t: "grafico", antes: 2.2,
          titulo: "De onde vêm as emissões brasileiras (2024)",
          eixo: "% do total de emissões brutas",
          max: 50,
          barras: [
            ["Uso da terra", 42, "42%"],
            ["Agropecuária", 29, "29%"],
            ["Energia", 20, "20%"],
            ["Resíduos", 5, "5%"],
            ["Processos industriais", 4, "4%"],
          ],
          legenda: "Gráfico 1. SEEG, coleção 13, ano-base 2024 [2]: 2,145 bilhões de toneladas de CO₂e, divididas por setor da economia.",
        },
        {
          t: "lado", antes: 1.6, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["Uso da terra é o carbono liberado quando a vegetação é derrubada ou queimada, sobretudo para abrir pastos e lavouras. Na agropecuária pesam o metano do gado e os fertilizantes; na energia, os combustíveis de transportes e indústrias. [2]"],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["Somando o desmatamento ligado a ela, a agropecuária responde por cerca de dois terços das emissões brutas do país. No mundo, pesam mais os combustíveis fósseis (parte 3). [2]"],
            }],
          ],
        },
        {
          t: "numeros", fundo: VERMELHO, antes: 1.8, tam: 3.6, resto: true,
          itens: [
            { n: "59% a 67%", texto: "é o corte nas emissões líquidas até 2035, em relação a 2005, prometido pelo Brasil na NDC. É meta, não resultado. [3]" },
            { n: "Mitigar + adaptar", texto: "Reduzir emissões não basta: também é preciso preparar casas, serviços e territórios para quem já sofre os efeitos." },
          ],
        },
      ],
    },

    // 5 — o mapa é interativo: o mapa 3D de mapa3d.js aparece por cima (dados em REVISTA.mapaFogo)
    {
      modelo: "materia",
      secao: "1 · Um planeta mais quente",
      blocos: [
        { t: "rotulo", texto: "Focos de calor por bioma" },
        { t: "titulo", texto: "Fogo no Brasil", tam: 8.4, antes: 0.8 },
        {
          t: "lado", antes: 1.2, larguras: [1.32, 1], gap: 3,
          colunas: [
            [{ t: "mapa", id: "fogo" }],
            [
              { t: "rotulo", texto: "Passe o mouse ou toque no mapa" },
              {
                t: "lead", est: "numTexto", antes: 0.8,
                texto: "Em 2024, o fogo atingiu 30 milhões de hectares, recorde do MapBiomas; 72,7% era vegetação nativa. [5] Esses incêndios lançaram 241 milhões de t de CO₂e, que nem entram na conta oficial. [2]",
              },
              {
                t: "grafico", antes: 2.2, tamTitulo: 1.8, rotulos: 0.46,
                titulo: "% dos focos de calor do país (2024)",
                max: 55,
                barras: [["Amazônia", 50.6, "50,6"], ["Cerrado", 29.6, "29,6"], ["Mata Atlântica", 7.7, "7,7"], ["Caatinga", 6.5, "6,5"], ["Pantanal", 5.3, "5,3"], ["Pampa", 0.2, "0,2"]],
                legenda: "INPE, focos até o início de dezembro de 2024 [4].",
              },
            ],
          ],
        },
        { t: "lead", est: "legenda", antes: 1, cor: SUAVE, texto: "Mapa da equipe (limites do IBGE; biomas aproximados). Cor mais clara: mais focos." },
        {
          t: "lado", antes: 2.2, resto: true,
          colunas: [
            [{ t: "foto", src: FOTO.queimada, resto: true, min: 10, legenda: "Queimada em área de vegetação nativa." }],
            [{
              t: "citacao", resto: true, tam: 2.8,
              texto: "No dia seguinte, vi tudo acabado, queimado",
              autor: "Rosely, sobrevivente de um incêndio no Pantanal",
              credito: "O Globo, 27 jul. 2024 [6]",
            }],
          ],
        },
      ],
    },

    // 6 — parte 2
    {
      modelo: "abertura",
      sumario: { titulo: "Quando o clima encontra a desigualdade", sub: "Território e histórias reais" },
      numero: 2,
      titulo: "Quando o clima encontra a desigualdade",
      linhaFina: "Vulnerabilidade, território e histórias reais",
      foto: FOTO.rs,
      fotoAlt: 34,
      tamTitulo: 4.6,
      legenda: "Inundação no Rio Grande do Sul, maio de 2024.",
      blocos: [
        { t: "rotulo", texto: "Por que algumas pessoas perdem mais" },
        {
          t: "fluxo", antes: 1.6, sinais: ["+", "+", "="],
          itens: [
            { titulo: "Perigo", texto: "uma chuva intensa" },
            { titulo: "Exposição", texto: "casas onde ela pode inundar" },
            { titulo: "Vulnerabilidade", texto: "faltam drenagem, moradia segura e recursos" },
            { titulo: "Risco", texto: "o desastre vem quando os três se somam" },
          ],
        },
        {
          t: "lado", antes: 2.6, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["Vulnerabilidade climática é a dificuldade de evitar danos e de se recuperar deles. Envolve renda, saúde, moradia, infraestrutura e acesso à informação."],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["E ela não é natural: é produzida por escolhas políticas, desigualdades históricas e pela ocupação do território. [1] Para Émile Durkheim, um fato social se explica por outros fatos sociais: o risco desigual não é azar individual, é um padrão da sociedade."],
            }],
          ],
        },
      ],
    },

    // 7
    {
      modelo: "materia",
      secao: "2 · Clima e desigualdade",
      blocos: [
        { t: "rotulo", texto: "Quem enfrenta a crise com menos proteção" },
        { t: "titulo", texto: "Quem perde mais", tam: 6, antes: 0.8 },
        {
          t: "lista", colunas: 2, antes: 1.1, est: "numTexto",
          itens: [
            { titulo: "Periferias e baixa renda", texto: "Menos acesso a moradia segura, transporte, saneamento e reservas de dinheiro." },
            { titulo: "População negra", texto: "Desigualdades raciais organizam o acesso à renda e à cidade: o risco vem das condições impostas, não da identidade." },
            { titulo: "Indígenas, quilombolas e ribeirinhos", texto: "Perdas em rios, florestas e roças atingem comida, trabalho e cultura." },
            { titulo: "Agricultores familiares", texto: "Dependem da chuva: a seca derruba renda e produção." },
            { titulo: "Crianças e idosos", texto: "Saúde e dependência de cuidados se somam às dificuldades econômicas." },
          ],
        },
        { t: "rotulo", texto: "A desigualdade aparece antes do desastre", antes: 1.8 },
        {
          t: "texto", colunas: 1, antes: 1.2,
          p: ["Quem pode alugar outra casa ou parar de trabalhar sem perder a renda? Para Max Weber, isso depende das “chances de vida” de cada um; Pierre Bourdieu lembra que elas não se medem só em dinheiro: redes de apoio e informação também decidem quem se reergue."],
        },
        {
          t: "lado", antes: 1.8, gap: 4,
          colunas: [
            [{
              t: "grafico", rotulos: 0.4, tamTitulo: 1.8,
              titulo: "Renda por pessoa (2023)",
              max: 2500,
              barras: [["Sudeste", 2237, "R$ 2.237"], ["Centro-Oeste", 2202, "R$ 2.202"], ["Sul", 2167, "R$ 2.167"], ["Norte", 1302, "R$ 1.302"], ["Nordeste", 1146, "R$ 1.146"]],
              legenda: "Gráfico 2. IBGE, PNAD Contínua: rendimento domiciliar mensal por pessoa; média do Brasil, R$ 1.848 [7].",
            }],
            [{
              t: "grafico", rotulos: 0.4, tamTitulo: 1.8,
              titulo: "Pessoas na pobreza (2024)",
              max: 35,
              barras: [["Pardos", 29.8, "29,8%"], ["Pretos", 25.8, "25,8%"], ["Brasil", 23.1, "23,1%"], ["Brancos", 15.1, "15,1%"]],
              legenda: "Gráfico 3. IBGE, Síntese de Indicadores Sociais 2025: até US$ 6,85 por dia, em paridade de poder de compra [8].",
            }],
          ],
        },
        {
          t: "texto", colunas: 1, antes: 1.6,
          p: ["O Sul tem renda acima da média e, mesmo assim, viveu a pior enchente da sua história (pág. 9): a vulnerabilidade se mede rua a rua, não por região. E a pobreza, quase duas vezes maior entre pardos do que entre brancos, existe antes do desastre. [7; 8]"],
        },
      ],
    },

    // 8
    {
      modelo: "materia",
      secao: "2 · Clima e desigualdade",
      lateral: {
        largura: 22,
        blocos: [
          { t: "rotulo", texto: "O calor também alcança o corpo", cor: CREME },
          {
            t: "numeros", colunas: 1, tam: 6, antes: 2, corNumero: CREME, corTexto: CREME,
            itens: [
              { n: "+10%", texto: "na chance de baixo peso infantil, associada ao calor acima de 26 °C [9]" },
              { n: "26,65%", texto: "das crianças indígenas estudadas tinham atraso no crescimento [9]" },
              { n: "9,32%", texto: "era o índice entre as crianças pretas [9]" },
            ],
          },
          {
            t: "texto", colunas: 1, est: "numTexto", cor: CREME, antes: 2.4,
            p: ["Estudo do Cidacs/Fiocruz (mar. 2026) com mais de 6 milhões de crianças de 12 a 59 meses, dados de 2007 a 2017. Segundo a pesquisadora Priscila Ribas, o calor reduz o apetite, altera o metabolismo e aumenta as diarreias: funciona como um multiplicador de vulnerabilidades. [9]"],
          },
        ],
      },
      blocos: [
        { t: "rotulo", texto: "Território e racismo ambiental" },
        { t: "titulo", texto: "O endereço também define a proteção", tam: 4.6, antes: 1 },
        {
          t: "numeros", antes: 2, tam: 6,
          itens: [
            { n: "16,4 mi", texto: "de pessoas viviam em favelas e comunidades urbanas no Censo 2022 — 8,1% da população [10]" },
            { n: "72,9%", texto: "desses moradores eram pretos ou pardos [10]" },
          ],
        },
        {
          t: "texto", colunas: 1, antes: 2.4,
          p: [
            "Quem tem menos renda ocupa as áreas que sobram — encostas, beiras de rio, várzeas — e recebe menos drenagem, saneamento e transporte. O sociólogo Lúcio Kowarick chamou isso de espoliação urbana: a cidade cobra mais de quem já tem menos.",
            "Depois do desastre, o risco continua. A urbanista Raquel Rolnik, ex-relatora da ONU para o direito à moradia, alerta que a reconstrução costuma afastar as comunidades pobres e entregar as áreas a usos mais lucrativos. [11]",
          ],
        },
        {
          t: "caixa", antes: 2.6, fundo: PRETO, resto: true,
          blocos: [
            { t: "titulo", texto: "Racismo ambiental", tam: 2.8, cor: VERMELHO },
            {
              t: "texto", colunas: 1, cor: CREME, antes: 1.2,
              p: ["É a exposição desproporcional de grupos raciais ou étnicos a danos ambientais e à falta de proteção. O termo ganhou força com o sociólogo Robert Bullard, nos Estados Unidos; no Brasil, Henri Acselrad fala em injustiça ambiental. Não exige intenção explícita: práticas e instituições bastam para manter a desigualdade."],
            },
          ],
        },
      ],
    },

    // 9 — três histórias, sem fotos (as falas são de reportagens)
    {
      modelo: "materia",
      secao: "2 · Histórias reais",
      blocos: [
        { t: "titulo", texto: "Roca Sales (RS): a água baixa, a perda fica", tam: 3.6 },
        {
          t: "lado", antes: 1.3, larguras: [1, 1.8],
          colunas: [
            [{ t: "citacao", resto: true, fundo: PRETO, tam: 2.2, texto: "Não tem onde morar", autor: "Júlia Almeida, 20 anos", credito: "Agência Brasil, 23 jun. 2024 [12]" }],
            [{
              t: "texto", colunas: 1,
              p: ["Depois das enchentes de 2024, Júlia contou que ficou difícil achar moradia longe da água, e os aluguéis subiram. [12] Segundo o World Weather Attribution, o aquecimento global dobrou a chance de chuvas como aquelas e as deixou de 6% a 9% mais intensas. [13]"],
            }],
          ],
        },
        { t: "titulo", texto: "Xingu (MT): a floresta em volta seca", tam: 3.6, antes: 2.4 },
        {
          t: "lado", antes: 1.3, larguras: [1.8, 1],
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["Na aldeia Tanguro, do povo Kalapalo, há trechos de rio em que é preciso empurrar o barco, e a mandioca rende menos. O território é cercado por pastos e soja; um estudo citado pela reportagem atribui ao desmatamento 74% da queda das chuvas na estação seca desde 1985. [14]"],
            }],
            [{ t: "citacao", resto: true, tam: 2.2, texto: "Hoje a gente está com escassez de alimentos", autor: "Sikan Kalapalo, estudante", credito: "((o))eco, 20 out. 2025 [14]" }],
          ],
        },
        { t: "titulo", texto: "Marajó (PA): a erosão levou a casa", tam: 3.6, antes: 2.4 },
        {
          t: "lado", antes: 1.3, larguras: [1, 1.8],
          colunas: [
            [{ t: "citacao", resto: true, fundo: PRETO, tam: 2.2, texto: "Nunca pensei que veria algo assim", autor: "Ivanil Brito, Soure (PA)", credito: "((o))eco, 25 out. 2024 [15]" }],
            [{
              t: "texto", colunas: 1,
              p: ["Em fevereiro de 2024, a erosão levou em três dias a casa de Ivanil, na Vila do Pesqueiro: animais, móveis, documentos e os materiais da faculdade dos filhos. Outras quatro famílias também perderam a casa. O Serviço Geológico do Brasil tinha apontado o risco na vila cerca de dez anos antes. [15]"],
            }],
          ],
        },
      ],
    },

    // 10 — parte 3
    {
      modelo: "abertura",
      sumario: { titulo: "As empresas, as emissões e o território", sub: "Cadeias produtivas e poder" },
      numero: 3,
      titulo: "As empresas, as emissões e o território",
      linhaFina: "Grandes empresas, cadeias produtivas e poder econômico",
      foto: FOTO.cigarro,
      foco: [0.5, 0.3],
      fotoAlt: 47,
      cor: PRETO,
      blocos: [
        { t: "rotulo", texto: "O outro lado: quem sustenta as emissões" },
        {
          t: "lado", antes: 1.4, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1, capitular: true,
              p: ["A crise climática é impulsionada por atividades concretas: extrair e queimar petróleo, gás e carvão, derrubar vegetação, fabricar cimento e aço. Grandes empresas participam como produtoras, operadoras e elos de cadeias de fornecimento. [16]"],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["As histórias da parte 2 mostram as duas pontas. A chuva extrema no RS foi agravada pelo aquecimento global, puxado pelos combustíveis fósseis; a seca no Xingu, pelo desmatamento em volta do território, aberto para pasto e soja. [13; 14]"],
            }],
          ],
        },
      ],
    },

    // 11
    {
      modelo: "materia",
      secao: "3 · Empresas e emissões",
      lateral: {
        largura: 22,
        blocos: [
          { t: "rotulo", texto: "Em números", cor: CREME },
          {
            t: "numeros", colunas: 1, tam: 6, antes: 2, corNumero: CREME, corTexto: CREME,
            itens: [
              { n: "32", texto: "empresas ligadas a mais da metade do CO₂ mundial de combustíveis fósseis e cimento em 2024 [17]" },
              { n: "214,3 mi t", texto: "de CO₂e vieram dos transportes no Brasil em 2024, de 431,3 mi t da matriz energética [18]" },
              { n: "97%", texto: "ou mais da vegetação nativa perdida no Brasil em seis anos teve a agropecuária como vetor [19]" },
            ],
          },
        ],
      },
      blocos: [
        { t: "titulo", texto: "Quem está por trás das emissões", tam: 4.6 },
        {
          t: "texto", colunas: 1, antes: 2,
          p: [
            { inter: "No mundo: carvão, petróleo e gás" },
            "Quando gasolina, diesel, carvão e gás são queimados, o carbono vira CO₂. O Carbon Majors atribui essas emissões a quem produziu e vendeu os combustíveis: em 2024, cinco estatais somaram 18% do total mundial. [17] Na edição anterior do levantamento, a Petrobras estava entre as 36 empresas que respondiam por mais da metade das emissões de 2023. [20]",
          ],
        },
        {
          t: "grafico", antes: 2.2, tamTitulo: 1.8, rotulos: 0.42,
          titulo: "Cinco grandes produtores (2024)",
          eixo: "% do CO₂ global de combustíveis fósseis e cimento",
          max: 5,
          barras: [["Saudi Aramco", 4.28, "4,28%"], ["Coal India", 3.92, "3,92%"], ["CHN Energy", 3.91, "3,91%"], ["National Iranian Oil Co.", 3.13, "3,13%"], ["Gazprom", 2.76, "2,76%"]],
          legenda: "Gráfico 4. Carbon Majors, ano-base 2024 [17]. Não inclui o desmatamento.",
        },
        {
          t: "texto", colunas: 1, antes: 2.2,
          p: [
            { inter: "No Brasil: a fronteira agropecuária" },
            "Aqui, o maior peso vem da terra: cerca de 80% das emissões por uso da terra saem da Amazônia e do Cerrado, onde a vegetação dá lugar a pastos e lavouras. [2; 19] Na nossa leitura, a responsabilidade não é só de quem derruba a floresta: passa também por quem compra, financia e vende o que sai dessas áreas.",
          ],
        },
      ],
    },

    // 12
    {
      modelo: "materia",
      secao: "3 · Casos documentados",
      blocos: [
        { t: "lead", est: "numTexto", cor: SUAVE, texto: "Rio abaixo da aldeia Kalapalo, no Pará, o Xingu mostra outro lado do problema: decisões sobre energia e mineração também mudam a vida de quem depende do rio." },
        { t: "rotulo", texto: "Norte Energia e Belo Monte", antes: 2 },
        { t: "titulo", texto: "Belo Monte e a disputa pelas águas do Xingu", tam: 4.6, antes: 0.8 },
        {
          t: "numeros", fundo: VERMELHO, antes: 2, tam: 4.6,
          itens: [
            { n: "238,1 ha", texto: "de vegetação com supressão autorizada pelo Ibama em 2011 numa etapa da obra; 64,5 ha em APPs [21]" },
            { n: "635", texto: "famílias da Volta Grande sem água potável adequada, segundo ação do MPF (jun. 2026) [22]" },
            { n: "Dez. 2025", texto: "a Justiça manda Norte Energia e Ibama revisarem a vazão do rio [23]" },
          ],
        },
        {
          t: "lado", antes: 2.2, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["A Norte Energia opera a hidrelétrica de Belo Monte, no Pará. Além do corte de árvores, o desvio de água para gerar energia muda o rio e as florestas alagáveis. Numa ação civil pública, o MPF relata poços e cacimbas secos. [21; 22]"],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["A Justiça Federal reconheceu danos à vida aquática, à navegação e às comunidades, com seca de igapós e prejuízo à reprodução dos peixes. Para quem depende do rio, menos água compromete deslocamento, pesca e comida. [23]"],
            }],
          ],
        },
        { t: "titulo", texto: "Belo Sun: mineração em disputa", tam: 4.6, antes: 3.4 },
        {
          t: "lado", antes: 1.8, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["A Belo Sun quer extrair ouro na Volta Grande do Xingu. Em abril de 2026, o MPF contestou a retomada da licença, e lideranças Xikrin e de Marapanim apontaram riscos e falhas na consulta às comunidades. [24; 25]"],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["A empresa diz que o licenciamento é feito por etapas e que o projeto não desvia água do Xingu. Em junho, o TRF1 registrou uma conciliação: nenhuma obra durante a negociação. O MPF não aderiu. [26; 27]"],
            }],
          ],
        },
        {
          t: "lead", est: "legenda", antes: 2.4, cor: SUAVE,
          texto: "Situação dos processos em junho de 2026. Alegações do MPF não equivalem a condenação.",
        },
      ],
    },

    // 13
    {
      modelo: "materia",
      secao: "3 · Licenças e interesses",
      blocos: [
        { t: "titulo", texto: "Autorizado, questionado ou ilegal?", tam: 4.6 },
        {
          t: "fluxo", antes: 2, sinais: ["→", "→"], cores: [PRETO, VINHO, VERMELHO],
          itens: [
            { titulo: "Autorizado", texto: "a lei permite suprimir vegetação com autorização prévia; APPs têm regras mais restritas [28; 29]" },
            { titulo: "Questionado", texto: "licenças, estudos e consultas contestados na Justiça" },
            { titulo: "Ilegal", texto: "sem autorização ou fora dos limites: exige fiscalização e punição [31]" },
          ],
        },
        {
          t: "lado", antes: 2.4, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["Ter a terra ou estar no Cadastro Ambiental Rural não autoriza derrubar a vegetação. E a autorização não significa que a obra não terá efeitos: ela define limites e controles. [28; 29]"],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["A Convenção 169 da OIT exige consultar os povos afetados, de boa-fé, antes da decisão. [30] O TCU aponta falhas na fiscalização e problemas fundiários que favorecem a grilagem. [31]"],
            }],
          ],
        },
        { t: "rotulo", texto: "Os interesses que pesam nas decisões", antes: 3 },
        {
          t: "lado", antes: 1.2, gap: 3,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["Empresas buscam receita; governos falam em abastecimento e desenvolvimento. Em 2015, o Ministério de Minas e Energia justificou Belo Monte pela energia renovável e pelos custos. [32]"],
            }],
            [{
              t: "texto", colunas: 1,
              p: ["Reservar mais água para o rio reduz a parcela das turbinas, e o TCU discutiu os efeitos em geração e tarifas. [33] Na nossa leitura, os ganhos chegam a consumidores e investidores; os custos ficam no território."],
            }],
          ],
        },
        {
          t: "lado", antes: 2.8, resto: true, gap: 3,
          colunas: [
            [{
              t: "titulo", resto: true, fundo: PRETO, cor: CREME, tam: 2.8, pad: 2.6,
              texto: "Renovável não quer dizer sem emissões nem sem efeitos",
            }],
            [{
              t: "texto", colunas: 1,
              p: ["Reservatórios podem emitir metano pela decomposição da matéria orgânica alagada; não há medição específica para Belo Monte. [34] E os efeitos sobre o rio, a pesca e as comunidades existem mesmo quando a energia é limpa."],
            }],
          ],
        },
      ],
    },

    // 14 — parte 4 (sem foto: a abertura usa uma frase grande no alto)
    {
      modelo: "abertura",
      sumario: { titulo: "Quem precisa de proteção não pode esperar", sub: "Justiça climática" },
      numero: 4,
      titulo: "Quem precisa de proteção não pode esperar",
      linhaFina: "Enfrentar a crise com justiça",
      destaque: "Proteger quem mais perde também é política climática.",
      tamDestaque: 4.6,
      fotoAlt: 26,
      tamTitulo: 4.6,
      blocos: [
        {
          t: "texto", colunas: 1,
          p: ["Justiça climática é levar em conta quem causa o problema, quem sofre seus impactos e quem participa das decisões. Uma política pode cortar emissões e, mesmo assim, distribuir mal os custos. A filósofa Nancy Fraser ajuda a ver três frentes:"],
        },
        {
          t: "lista", colunas: 3, antes: 1.6, est: "numTexto", tamTitulo: 1.8,
          itens: [
            { titulo: "Redistribuição", texto: "ajuda e reconstrução chegam primeiro a quem perdeu mais, como as famílias de Roca Sales." },
            { titulo: "Reconhecimento", texto: "os saberes e modos de vida de povos como os Kalapalo contam na decisão." },
            { titulo: "Representação", texto: "os afetados participam, como exige a consulta da Convenção 169. [30]" },
          ],
        },
        {
          t: "fluxo", antes: 2.4, cores: [VINHO, VERMELHO],
          itens: [
            { titulo: "Igualdade", texto: "a mesma ajuda para todos, perdendo a casa ou não" },
            { titulo: "Equidade", texto: "ajuda conforme a perda e as condições de cada um" },
          ],
        },
        {
          t: "titulo", antes: 2.4, resto: true, fundo: PRETO, cor: CREME, tam: 2.2, pad: 2.4,
          texto: "A pergunta deixa de ser quanto o Brasil emite e passa a ser quem paga a conta.",
        },
      ],
    },

    // 15 — propostas da equipe e conclusão
    {
      modelo: "materia",
      secao: "4 · Propostas e conclusão",
      sumario: { titulo: "Propostas e conclusão", sub: "O que fazer com os dados" },
      blocos: [
        { t: "rotulo", texto: "Propostas da equipe" },
        { t: "titulo", texto: "Do dado à proposta", tam: 4.6, antes: 0.8 },
        {
          t: "texto", colunas: 1, antes: 1.4,
          p: ["O Brasil já tem um ponto de partida: o Plano Clima, aprovado em dezembro de 2025, traz 16 planos de adaptação e reconhece que a crise atinge mais os vulneráveis; a Lei 14.904/2024 dá as diretrizes desses planos. [35; 36] A partir dos dados desta revista, propomos:"],
        },
        {
          t: "lista", colunas: 2, antes: 1.8, est: "numTexto", tamTitulo: 1.8,
          itens: [
            { titulo: "Adaptação onde a renda é menor", texto: "verba dos planos primeiro para favelas e comunidades, onde vivem 16,4 milhões de pessoas, 72,9% pretas ou pardas (pág. 8). [10]" },
            { titulo: "Desmatamento na conta da cadeia", texto: "rastrear gado e soja até a origem: a agropecuária responde por cerca de dois terços das emissões do país (pág. 4). [2]" },
            { titulo: "Prevenir antes de reconstruir", texto: "manter diques e drenagem e agir onde o risco já foi mapeado, como no Marajó (pág. 9). [13; 15]" },
            { titulo: "Alerta que chegue a todos", texto: "levar o Defesa Civil Alerta a todo o país; até lá, o SMS 40199 avisa pelo CEP. [37]" },
            { titulo: "Reconstruir sem expulsar", texto: "moradia nova perto do trabalho e da escola de quem perdeu a casa (pág. 8). [11]" },
            { titulo: "Consulta antes da obra", texto: "ouvir os povos afetados antes de licenciar, como exige a Convenção 169 (pág. 13). [30]" },
          ],
        },
        {
          t: "caixa", antes: 2.6, fundo: PRETO, resto: true,
          blocos: [
            { t: "rotulo", texto: "Conclusão", cor: CREME },
            { t: "titulo", texto: "Uma crise de renda, raça e território", tam: 2.8, cor: CREME, antes: 1 },
            {
              t: "texto", colunas: 1, cor: CREME, antes: 1.2,
              p: [
                "Os dados desta revista mostram um padrão. As emissões vêm de atividades concretas: os combustíveis fósseis no mundo e, no Brasil, sobretudo o desmatamento para pasto e lavoura. Os danos caem com mais força sobre quem tem menos renda, sobre a população preta, parda e indígena e sobre quem tem menos voz nas decisões.",
                "E quem decide raramente é quem paga, como mostram Belo Monte e Belo Sun. Por isso, a crise climática brasileira não é só ambiental: o risco desigual é um fato social (pág. 6), produzido por escolhas — e escolhas podem ser refeitas. Cortar as emissões na origem e proteger quem já sofre são partes da mesma resposta.",
              ],
            },
          ],
        },
      ],
    },

    // 16 e 17
    { modelo: "fontes", paginas: 2, sumario: { titulo: "Fontes e notas", sub: "Referências e checagem" } },
  ],

  fontes: {
    titulo: "Fontes e notas",
    intro: "Os números mantêm seus anos de referência. Os relatos são de reportagens publicadas, não de entrevistas do grupo. Fontes numeradas na ordem em que aparecem; links consultados até 18 de outubro de 2026.",
    itens: [
      { n: 1, texto: "IPCC. Climate Change 2023 — Synthesis Report.", url: "https://www.ipcc.ch/report/ar6/syr/longer-report/" },
      { n: 2, texto: "Observatório do Clima. SEEG, coleção 13. Emissões de gases de efeito estufa do Brasil, ano-base 2024.", url: "https://seeg.eco.br/wp-content/uploads/2026/03/SEEG13-relatorio-analitico-BR.pdf" },
      { n: 3, texto: "Governo Federal. Brasil entrega à ONU nova NDC alinhada ao Acordo de Paris. Nov. 2024.", url: "https://www.gov.br/povosindigenas/pt-br/assuntos/noticias/2024/11/brasil-entrega-a-onu-nova-ndc-alinhada-ao-acordo-de-paris" },
      { n: 4, texto: "Agência Brasil. Amazônia tem o maior número de queimadas e incêndios em 17 anos (dados do Programa Queimadas, Inpe). 14 dez. 2024.", url: "https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2024-12/amazonia-tem-o-maior-numero-de-queimadas-e-incendios-em-17-anos" },
      { n: 5, texto: "Exame. Brasil bate recorde histórico com área queimada 62% acima da média em 2024 (Relatório Anual do Fogo, MapBiomas). 24 jun. 2025.", url: "https://exame.com/esg/brasil-bate-recorde-historico-com-area-queimada-62-acima-da-media-em-2024-alerta-mapbiomas/" },
      { n: 6, texto: "O Globo. “No dia seguinte, vi tudo acabado, queimado”, diz sobrevivente de incêndio no Pantanal. 27 jul. 2024.", url: "https://oglobo.globo.com/brasil/noticia/2024/07/27/no-dia-seguinte-vi-tudo-acabado-queimado-diz-sobrevivente-de-incendio-no-pantanal.ghtml" },
      { n: 7, texto: "IBGE. PNAD Contínua — Rendimento de todas as fontes 2023.", url: "https://biblioteca.ibge.gov.br/visualizacao/livros/liv102079_informativo.pdf" },
      { n: 8, texto: "IBGE. Síntese de Indicadores Sociais 2025 — dados de 2024. 3 dez. 2025.", url: "https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/71016b2eb0a5feb8f7685271b1233db7.pdf" },
      { n: 9, texto: "Cidacs/Fiocruz Bahia. Aumento da temperatura ambiente eleva chance de desnutrição infantil. 27 mar. 2026.", url: "https://cidacs.bahia.fiocruz.br/2026/03/mudancas-climaticas-e-risco-a-infancia-aumento-da-temperatura-ambiente-eleva-chance-de-desnutricao-infantil/" },
      { n: 10, texto: "IBGE. Censo Demográfico 2022 — Favelas e Comunidades Urbanas.", url: "https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv102170.pdf" },
      { n: 11, texto: "ROLNIK, Raquel. Os desafios da reconstrução das cidades no Rio Grande do Sul. LabCidade; republicado pelo IHU Unisinos, 24 maio 2024.", url: "https://ihu.unisinos.br/categorias/639708-os-desafios-da-reconstrucao-das-cidades-no-rio-grande-do-sul-artigo-de-raquel-rolnik" },
      { n: 12, texto: "Agência Brasil. Devastada pela água, Roca Sales vive entre migração e reconstrução. 23 jun. 2024 (UOL).", url: "https://noticias.uol.com.br/ultimas-noticias/agencia-brasil/2024/06/23/devastada-pela-agua-roca-sales-vive-entre-migracao-e-reconstrucao.htm" },
      { n: 13, texto: "IHU Unisinos. Mudança do clima tornou chuvas históricas no RS duas vezes mais prováveis, conclui estudo (World Weather Attribution). 4 jun. 2024.", url: "https://ihu.unisinos.br/639968-mudanca-do-clima-tornou-chuvas-historicas-no-rs-duas-vezes-mais-provaveis-conclui-estudo" },
      { n: 14, texto: "FÁBIO, André Cabette. Indígenas brasileiros enfrentam floresta amazônica secando. ((o))eco, 20 out. 2025.", url: "https://oeco.org.br/reportagens/indigenas-brasileiros-enfrentam-floresta-amazonica-secando/" },
      { n: 15, texto: "MORAIS, Alice Martins; MELO, Matheus. Mudanças climáticas afetam comunidades do Marajó. ((o))eco, 25 out. 2024.", url: "https://oeco.org.br/fotografia/mudancas-climaticas-afetam-comunidades-do-marajo/" },
      { n: 16, texto: "Nações Unidas. Causas e efeitos das mudanças climáticas.", url: "https://www.un.org/pt/climatechange/science/causes-effects-climate-change" },
      { n: 17, texto: "Carbon Majors / InfluenceMap. 2024 Data Update. Jan. 2026.", url: "https://carbonmajors.org/briefing/Carbon-Majors-2024-Data-Update-35466" },
      { n: 18, texto: "EPE. Relatório Síntese do Balanço Energético Nacional 2025 — dados de 2024.", url: "https://www.epe.gov.br/pt/imprensa/noticias/epe-publica-o-relatorio-sintese-do-balanco-energetico-nacional-2025" },
      { n: 19, texto: "O Povo. Desmatamento no Brasil caiu 32,4% em 2024 (Relatório Anual do Desmatamento, MapBiomas). 15 maio 2025.", url: "https://www.opovo.com.br/noticias/brasil/2025/05/15/desmatamento-no-brasil-caiu-324-em-2024.html" },
      { n: 20, texto: "IHU Unisinos. Metade das emissões globais vem de 36 empresas de combustíveis fósseis, incluindo a Petrobras. 8 mar. 2025.", url: "https://ihu.unisinos.br/649126-metade-das-emissoes-globais-vem-de-36-empresas-de-combustiveis-fosseis-incluindo-a-petrobras" },
      { n: 21, texto: "FAINGUELERNT, Maíra Borges. A trajetória histórica do licenciamento ambiental de Belo Monte. Ambiente & Sociedade, v. XIX, n. 2, 2016.", url: "https://www.scielo.br/j/asoc/a/ThnyR8RrxkcBNSqVGKKxqqP/?format=pdf&lang=pt" },
      { n: 22, texto: "MPF. Pedidos para garantir água, saneamento e comunicação a famílias atingidas por Belo Monte. 18 jun. 2026.", url: "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/mpf-reforca-pedidos-para-garantir-agua-saneamento-e-comunicacao-a-familias-atingidas-por-belo-monte-no-para" },
      { n: 23, texto: "MPF. Justiça Federal ordena revisão do fluxo de água da UHE de Belo Monte. 16 dez. 2025.", url: "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/justica-federal-atende-mpf-e-ordena-revisao-urgente-do-fluxo-de-agua-da-uhe-de-belo-monte-pa" },
      { n: 24, texto: "MPF. Oposição à retomada do Projeto Volta Grande. 8 abr. 2026.", url: "https://www.mpf.mp.br/o-mpf/unidades/prr1/noticias/abril-indigena-mpf-se-opoe-a-retomada-do-projeto-volta-grande-do-xingu-pa-e-aponta-descumprimento-de-condicionantes-indigenas" },
      { n: 25, texto: "MPF. Lideranças pedem suspensão do Projeto Volta Grande. 10 abr. 2026.", url: "https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/abril-indigena-liderancas-pedem-suspensao-imediata-do-projeto-volta-grande-do-xingu-por-risco-de-danos-irreversiveis" },
      { n: 26, texto: "Belo Sun. Nota sobre licenciamento faseado do Projeto Volta Grande. 21 maio 2026.", url: "https://belosun.com.br/nota/" },
      { n: 27, texto: "TRF1. Conciliação sobre licença ambiental da Belo Sun. 26 jun. 2026.", url: "https://www.trf1.jus.br/trf1/noticias/conciliacao-do-trf1-promove-acordo-entre-partes-sobre-licenca-ambiental-de-mineradora-no-para-" },
      { n: 28, texto: "Ibama. Autorização de Supressão de Vegetação — ASV.", url: "https://www.gov.br/ibama/pt-br/servicos/autorizacoes/flora/asv" },
      { n: 29, texto: "BRASIL. Lei 12.651/2012 — Código Florestal.", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm" },
      { n: 30, texto: "BRASIL. Decreto 10.088/2019 — Convenção 169 da OIT.", url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10088.htm" },
      { n: 31, texto: "TCU. Lista de Alto Risco — Controle do desmatamento ilegal na Amazônia.", url: "https://sites.tcu.gov.br/listadealtorisco/controle_do_desmatamento_ilegal_na_amazonia.html" },
      { n: 32, texto: "Ministério de Minas e Energia. Ibama autoriza enchimento de Belo Monte. Nov. 2015.", url: "https://www.gov.br/mme/pt-br/assuntos/noticias/ibama-autoriza-enchimento-de-belo-monte/" },
      { n: 33, texto: "TCU. Impasse sobre o hidrograma de Belo Monte. Ago. 2025.", url: "https://portal.tcu.gov.br/imprensa/noticias/tcu-analisa-impasse-sobre-definicao-do-hidrograma-de-belo-monte" },
      { n: 34, texto: "Observatório do Clima / SEEG. Redução das emissões de metano no Brasil. 2024.", url: "https://seeg.eco.br/wp-content/uploads/2024/03/SEEG-METANO.pdf" },
      { n: 35, texto: "Alma Preta. Governo aprova Plano Clima e define metas para reduzir emissões até 2035. 16 dez. 2025.", url: "https://almapreta.com.br/sessao/politica/governo-aprova-plano-clima-e-define-metas-para-reduzir-emissoes-ate-2035/" },
      { n: 36, texto: "BRASIL. Lei 14.904, de 27 de junho de 2024 — diretrizes para planos de adaptação à mudança do clima.", url: "https://www2.camara.leg.br/legin/fed/lei/2024/lei-14904-27-junho-2024-795864-norma-pl.html" },
      { n: 37, texto: "Estado de Minas. Como funcionam os alertas de desastres da Defesa Civil no seu celular. 25 fev. 2026.", url: "https://www.em.com.br/trends/2026/02/7362378-como-funcionam-os-alertas-de-desastres-da-defesa-civil-no-seu-celular.html" },
    ],
    notas: [
      {
        titulo: "Referencial e checagem",
        texto: [
          "Durkheim, Weber, Bourdieu, Kowarick, Rolnik, Bullard, Acselrad e Fraser aparecem pelos conceitos aplicados aos casos (págs. 6, 7, 8 e 14); são interpretações da equipe, não citações literais.",
          "Relatos vêm de reportagens. Casos com empresas separam autorizações, decisões judiciais, alegações do MPF e posições das empresas. Emissões: SEEG brutas de 2024. Focos de 2024: até o início de dezembro [4]. Mapa da pág. 5: limites do IBGE e biomas aproximados.",
        ],
      },
    ],
  },

  // Mapa interativo da página "Fogo no Brasil" (mapa-biomas.js desenha; mapa3d.js anima).
  // parte: % dos focos de calor do país; focos: número de focos; area: frase do cartão.
  // A forma de cada bioma fica em biomas-mapa.js (ferramentas/gerar-biomas.py).
  mapaFogo: {
    periodo: "dos focos de calor do Brasil em 2024 (até o início de dezembro)",
    fonte: "Focos: Inpe, via Agência Brasil [4]. Área queimada: MapBiomas, via Exame [5].",
    biomas: [
      { nome: "Amazônia", parte: 50.6, focos: 137538, area: "15,6 milhões de hectares queimados em 2024, 117% acima da média do bioma." },
      { nome: "Cerrado", parte: 29.6, focos: 80408, area: "10,6 milhões de hectares queimados em 2024: 35% de toda a área queimada no país.", desvioRotulo: [0.035, -0.02] },
      { nome: "Mata Atlântica", parte: 7.7, focos: 21051, area: "1,2 milhão de hectares queimados: o pior ano do bioma desde 1985.", desvioRotulo: [0.03, 0.01] },
      { nome: "Caatinga", parte: 6.5, focos: 17736, area: "404 mil hectares queimados, 16% abaixo da média do bioma." },
      { nome: "Pantanal", parte: 5.3, focos: 14489, area: "Área queimada 157% acima da média do bioma.", desvioRotulo: [-0.05, 0.035] },
      { nome: "Pampa", parte: 0.2, focos: 419, area: "A menor área queimada entre os biomas, abaixo da média." },
    ],
  },

  contracapa: {
    texto: "A crise não é natural.\nA desigualdade também não.",
  },
};
