// Conteúdo da revista: "Mudanças climáticas e justiça climática no Brasil".
// Versão resumida do texto da equipe (Revista_Mudancas_Climaticas_Atualizada.docx), com
// mais espaço para fotos, números e gráficos. Para mudar o texto, edite só este arquivo:
// diagramacao.js mede tudo e monta as páginas.
//
// `paginas` é o espelho da revista: as páginas de dentro, na ordem (a capa e a contracapa
// entram sozinhas). Modelos:
//   sumario    sumário, editorial e expediente
//   abertura   abre uma parte: foto no alto, faixa com número e título, matéria embaixo
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
//   numeros  { itens: [{ n, texto }], colunas, fundo, tam }
//   grafico  { titulo, barras: [[rótulo, valor, texto]], max, eixo, legenda }
//   citacao  { texto, autor, credito, fundo }    olho: fala em destaque
//   lista    { itens: [{ titulo, texto }], colunas }
//   fluxo    { itens: [{ titulo, texto }], sinais: ["+", "="] }
//   caixa    { blocos, fundo }                   bloco com fundo colorido
//   lado     { colunas: [[blocos], [blocos]], larguras: [2, 1] }
//   espaco   { h }
// Qualquer bloco aceita `antes` (espaço acima, em u). `resto: true` faz o bloco crescer até
// ocupar a sobra da página. Marcadores de fonte como [1] ou [1; 2] ficam no texto.
// Se algo não couber, o console do navegador avisa a página.

const VERMELHO = "#d22a1e";
const PRETO = "#1c1a18";
const CREME = "#f8f1e2";

const FOTO = {
  // imagens enviadas pela equipe (colagens e infográfico)
  mascara: "assets/fotos/colagem-mascara.jpg",
  fabrica: "assets/fotos/colagem-fabrica.jpg",
  cigarro: "assets/fotos/colagem-cigarro.jpg",
  ipam: "assets/fotos/ipam-fogo-no-brasil.jpg",
  // fotos documentais
  ribeirinha: "assets/fotos/abertura.jpg",
  pantanal: "assets/fotos/pantanal.jpg",
  rs: "assets/fotos/rio-grande-do-sul.jpg",
  xingu: "assets/fotos/xingu.jpg",
  marajo: "assets/fotos/marajo.jpg",
};

const REVISTA = {
  titulo: "Horizonte",
  edicao: "Germinare Tech • 2º F • Setembro de 2026",
  expediente: "Pesquisa e redação: Emanuelly Mendes, Guilherme Norcia, Matheus Botana, Rafael Lopes, Rafael Takematsu e Sophia Castro. Fotos e colagens: créditos a confirmar.",
  capa: {
    foto: FOTO.mascara,
    foco: [0.5, 0.35],
    chamada: "Clima em desequilíbrio, vidas desiguais",
    subtitulo: "Como as emissões, as decisões das grandes empresas e a desigualdade se cruzam na crise climática brasileira.",
    destaques: ["Quem sofre", "Quem causa", "Justiça climática"],
  },
  editorial: {
    titulo: "Editorial",
    chamada: "Clima, desigualdade e decisões no mesmo mapa",
    texto: [
      "Uma casa atingida pela água, uma comunidade cercada pelo fogo e uma criança exposta ao calor fazem parte da mesma discussão. A crise climática encontra um Brasil em que renda, moradia, infraestrutura e poder já são distribuídos de forma desigual.",
      "Nesta edição, juntamos dados e relatos para mostrar como clima, desigualdade e decisões econômicas se conectam — sem transformar vítimas em números nem culpar uma empresa sem evidência — e por que proteger pessoas precisa fazer parte da resposta climática.",
    ],
    assinatura: "A equipe editorial",
  },

  paginas: [
    // 2 — sumário e editorial
    { modelo: "sumario" },

    // 3 — parte 1
    {
      modelo: "abertura",
      sumario: { titulo: "Um planeta mais quente, um Brasil desigual", sub: "Emissões, aquecimento e mudanças no Brasil" },
      numero: 1,
      titulo: "Um planeta mais quente, um Brasil desigual",
      linhaFina: "Emissões, aquecimento e mudanças no Brasil",
      foto: FOTO.fabrica,
      mesclar: "multiply",
      foco: [0.5, 0.45],
      fotoAlt: 44,
      legenda: "Colagem: crédito a confirmar.",
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
              { t: "numeros", colunas: 1, tam: 9, itens: [{ n: "1,1 °C", texto: "foi quanto a média global de 2011 a 2020 ficou acima da de 1850 a 1900. É a média de um período, não de um ano. [1]" }] },
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
        { t: "titulo", texto: "Quando o aquecimento vira cotidiano", tam: 5.4, antes: 1 },
        {
          t: "texto", antes: 1.8,
          p: [
            "O aquecimento altera o ciclo da água e pode intensificar chuvas fortes, calor e secas. Mas nenhuma enchente ou incêndio se explica só pelo clima: o dano depende também da ocupação do território, da infraestrutura e da prevenção. [1]",
          ],
        },
        {
          t: "grafico", antes: 2.6,
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
          legenda: "Gráfico 1. SEEG, coleção 13, ano-base 2024 [2]: 2,145 bilhões de toneladas de CO₂e. São setores, não um ranking de empresas.",
        },
        {
          t: "texto", antes: 2,
          p: ["Uso da terra é o carbono liberado quando a vegetação é derrubada ou queimada. Na agropecuária pesam o metano do gado e os fertilizantes; na energia, os combustíveis de transportes e indústrias. [2]"],
        },
        {
          t: "numeros", fundo: VERMELHO, antes: 2.4, tam: 5,
          itens: [
            { n: "59% a 67%", texto: "é o corte nas emissões líquidas até 2035, em relação a 2005, prometido pelo Brasil na NDC. É meta, não resultado. [4]" },
            { n: "Mitigar + adaptar", texto: "Reduzir emissões não basta: também é preciso preparar casas, serviços e territórios para quem já sofre os efeitos." },
          ],
        },
      ],
    },

    // 5
    {
      modelo: "materia",
      secao: "1 · Um planeta mais quente",
      blocos: [
        { t: "rotulo", texto: "Um relato que aproxima o problema" },
        { t: "titulo", texto: "Fogo no Brasil", tam: 8, antes: 0.8 },
        {
          t: "foto", src: FOTO.ipam, h: 37, conter: true, antes: 1.4,
          legenda: "Focos de calor por bioma, de janeiro a setembro de 2020. Infográfico: IPAM — Instituto de Pesquisa Ambiental da Amazônia.",
        },
        {
          t: "lado", antes: 2.4, resto: true,
          colunas: [
            [
              {
                t: "citacao", resto: true,
                texto: "No dia seguinte, vi tudo acabado, queimado",
                autor: "Rosely, sobrevivente de um incêndio no Pantanal",
                credito: "O Globo, 27 jul. 2024 [3]",
              },
            ],
            [
              { t: "foto", src: FOTO.pantanal, h: 12, legenda: "Queimada em paisagem natural. Local e crédito a confirmar." },
              {
                t: "texto", colunas: 1, antes: 1.6,
                p: ["O relato mostra a perda concreta de um lugar de vida. Sozinho, ele não identifica quem causou o fogo nem a responsabilidade de uma empresa. [3]"],
              },
            ],
          ],
        },
      ],
    },

    // 6 — parte 2
    {
      modelo: "abertura",
      sumario: { titulo: "Quando o clima encontra a desigualdade", sub: "Vulnerabilidade, território e histórias reais" },
      numero: 2,
      titulo: "Quando o clima encontra a desigualdade",
      linhaFina: "Vulnerabilidade, território e histórias reais",
      foto: FOTO.rs,
      fotoAlt: 34,
      tamTitulo: 4.6,
      legenda: "Inundação no Rio Grande do Sul, 2024. Imagem de contexto; crédito a confirmar.",
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
          t: "texto", antes: 2.6,
          p: [
            "Vulnerabilidade climática é a dificuldade de evitar danos e de se recuperar deles. Envolve renda, saúde, moradia, infraestrutura e acesso à informação — e não é natural: é produzida por escolhas políticas, desigualdades históricas e pela forma como o território é ocupado. Separar perigo, exposição e vulnerabilidade evita tratar toda perda como inevitável.",
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
        { t: "titulo", texto: "Quem perde mais", tam: 8, antes: 0.8 },
        {
          t: "lista", colunas: 2, antes: 1.3, est: "numTexto",
          itens: [
            { titulo: "Periferias e baixa renda", texto: "Menos acesso a moradia segura, transporte, saneamento e reservas de dinheiro." },
            { titulo: "População negra", texto: "Desigualdades raciais organizam o acesso à renda e à cidade. O risco vem das condições, não da identidade." },
            { titulo: "Indígenas, quilombolas e ribeirinhos", texto: "Perdas em rios, florestas e roças atingem comida, trabalho e cultura." },
            { titulo: "Agricultores familiares", texto: "Dependem da chuva: a seca derruba renda e produção." },
            { titulo: "Crianças e idosos", texto: "Saúde e dependência de cuidados se somam às dificuldades econômicas." },
          ],
        },
        { t: "rotulo", texto: "A desigualdade aparece antes do desastre", antes: 2.4 },
        {
          t: "texto", antes: 1.2,
          p: ["Quem pode alugar outra casa ou parar de trabalhar sem perder toda a renda? A ideia de “oportunidades de vida”, de Max Weber, e os capitais de Pierre Bourdieu — dinheiro, redes de apoio, informação — ajudam a entender quem consegue se recuperar."],
        },
        {
          t: "lado", antes: 2.2, gap: 4,
          colunas: [
            [{
              t: "grafico", rotulos: 0.4, tamTitulo: 1.9,
              titulo: "Rendimento por pessoa (2023)",
              max: 2500,
              barras: [["Centro-Oeste", 2264, "R$ 2.264"], ["Brasil", 1893, "R$ 1.893"], ["Norte", 1314, "R$ 1.314"], ["Nordeste", 1155, "R$ 1.155"]],
              legenda: "Gráfico 2. IBGE, PNAD Contínua [5]. Médias regionais não medem, sozinhas, a vulnerabilidade.",
            }],
            [{
              t: "grafico", rotulos: 0.46, tamTitulo: 1.9,
              titulo: "Pobreza por cor ou raça (2019)",
              max: 40,
              barras: [["Pobreza — pretos e pardos", 32.3, "32,3%"], ["Pobreza — brancos", 14.7, "14,7%"], ["Extrema — pretos e pardos", 8.9, "8,9%"], ["Extrema — brancos", 3.4, "3,4%"]],
              legenda: "Gráfico 3. IBGE, Síntese de Indicadores Sociais [6]. Série histórica, não os níveis atuais.",
            }],
          ],
        },
        {
          t: "texto", antes: 2,
          p: ["A pobreza maior entre pretos e pardos é anterior aos eventos climáticos — e vira menos capacidade de resposta quando é preciso pagar por deslocamento e reconstrução. O gráfico não conta vítimas de desastres. [6]"],
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
            t: "numeros", colunas: 1, tam: 7, antes: 2, corNumero: CREME, corTexto: CREME,
            itens: [
              { n: "+1 °C", texto: "acima de 26 °C aumenta a chance de baixo peso e desnutrição infantil [9]" },
              { n: "26,65%", texto: "das crianças indígenas estudadas tinham atraso no crescimento [9]" },
              { n: "9,32%", texto: "entre as crianças pretas [9]" },
            ],
          },
          {
            t: "texto", colunas: 1, est: "numTexto", cor: CREME, antes: 2.4,
            p: ["Estudo do Cidacs/Fiocruz (mar. 2026) com mais de 6 milhões de crianças de 12 a 59 meses, dados de 2007 a 2017. As proporções descrevem os grupos, não casos causados pelo calor. Segundo a pesquisadora Priscila Ribas, o calor afeta apetite, metabolismo e diarreias. [9]"],
          },
        ],
      },
      blocos: [
        { t: "rotulo", texto: "Território e racismo ambiental" },
        { t: "titulo", texto: "O endereço também define a proteção", tam: 4.6, antes: 1 },
        {
          t: "numeros", antes: 2, tam: 6,
          itens: [
            { n: "16,4 mi", texto: "de pessoas viviam em favelas e comunidades urbanas no Censo 2022 — 8,1% da população [7]" },
            { n: "72,9%", texto: "desses moradores eram pretos ou pardos [7]" },
          ],
        },
        {
          t: "grafico", antes: 2.6, tamTitulo: 1.9, rotulos: 0.2,
          titulo: "Moradores em favelas e comunidades urbanas",
          eixo: "Milhões de pessoas",
          max: 20,
          barras: [["2010", 11.4, "11,4"], ["2022", 16.39, "16,4"]],
          legenda: "Gráfico 4. IBGE, Censos 2010 e 2022 [7]. Mudanças de identificação e cobertura também pesam na comparação.",
        },
        {
          t: "texto", colunas: 1, antes: 2.4,
          p: [
            "O território distribui serviços, oportunidades e riscos. Lúcio Kowarick (espoliação urbana) e Henri Lefebvre (o espaço como produto das relações sociais) ajudam a perguntar por que certas áreas recebem proteção e outras não.",
            "Isso não quer dizer que todos estejam em área de risco: é preciso cruzar os dados com a infraestrutura e a exposição de cada lugar. [7]",
          ],
        },
        {
          t: "caixa", antes: 2.4, fundo: PRETO, resto: true,
          blocos: [
            { t: "titulo", texto: "Racismo ambiental", tam: 3, cor: VERMELHO },
            {
              t: "texto", colunas: 1, est: "numTexto", cor: CREME, antes: 1,
              p: ["É a exposição desproporcional de grupos raciais ou étnicos a danos ambientais e à falta de proteção. Não exige intenção explícita: práticas e instituições também mantêm desigualdades."],
            },
          ],
        },
      ],
    },

    // 9
    {
      modelo: "materia",
      secao: "2 · Histórias reais",
      blocos: [
        { t: "titulo", texto: "Quando a água baixa, a perda continua", tam: 4.1 },
        {
          t: "lado", antes: 2, larguras: [1, 1.7],
          colunas: [
            [{ t: "citacao", resto: true, fundo: PRETO, tam: 3, texto: "Não tem onde morar", autor: "Júlia Almeida, 20 anos, Roca Sales (RS)", credito: "Agência Brasil, 23 jun. 2024 [8]" }],
            [{
              t: "texto", colunas: 1,
              p: [
                "Depois das enchentes de 2024, Júlia contou à Agência Brasil que ficou difícil achar moradia longe da água — e os preços subiram. Pequenos negócios que tinham se reerguido após a enchente de 2023 também enfrentavam dificuldades. [8] Para Raquel Rolnik, reconstruir exige pensar onde as pessoas poderão viver sem perder seus vínculos.",
              ],
            }],
          ],
        },
        { t: "titulo", texto: "No Xingu, a autonomia depende da floresta", tam: 4.6, antes: 3 },
        { t: "foto", src: FOTO.xingu, h: 11, foco: [0.5, 0.6], antes: 2, legenda: "Vida junto às águas. Foto de contexto; povo, aldeia e local a confirmar." },
        {
          t: "lado", antes: 2.2, larguras: [1.7, 1], resto: true,
          colunas: [
            [{
              t: "texto", colunas: 1,
              p: ["Na aldeia Tanguro, do povo Kalapalo, a floresta ficou mais seca e inflamável: há trechos de rio em que é preciso empurrar o barco, perdas de mandioca e mais dependência de cestas básicas. Yunak Yawalapiti conta que ficou difícil controlar o fogo das roças tradicionais. A reportagem não aponta uma empresa responsável. [13]"],
            }],
            [{ t: "citacao", resto: true, tam: 2.4, texto: "Hoje a gente está com escassez de alimentos", autor: "Sikan Kalapalo, estudante", credito: "((o))eco, 20 out. 2025 [13]" }],
          ],
        },
      ],
    },

    // 10
    {
      modelo: "materia",
      secao: "2 · Histórias reais",
      blocos: [
        { t: "titulo", texto: "No Marajó, a erosão leva mais que casas", tam: 4.6 },
        { t: "foto", src: FOTO.marajo, resto: true, min: 20, antes: 2, legenda: "Erosão e escombros em comunidade costeira. Local, autoria e autorização a confirmar; não é necessariamente a casa de Ivanil." },
        {
          t: "lado", antes: 2.2, larguras: [1, 1.4],
          colunas: [
            [{ t: "citacao", resto: true, tam: 2.6, texto: "Nunca pensei que veria algo assim, nem que teria tanto sofrimento", autor: "Ivanil Brito, Soure (PA)", credito: "((o))eco, 25 out. 2024 [14]" }],
            [{
              t: "texto", colunas: 1,
              p: ["Em fevereiro de 2024, a erosão levou a casa de Ivanil, na Vila do Pesqueiro, com animais, plantas, móveis, documentos e os materiais da faculdade dos filhos. A fotorreportagem de Alice Martins Morais e Matheus Melo mostra os manguezais como barreira natural e a percepção de mudanças nos rios e nas chuvas. O caso não permite atribuir a erosão a uma empresa. [14]"],
            }],
          ],
        },
        {
          t: "titulo", antes: 3, fundo: VERMELHO, cor: CREME, tam: 3.6, pad: 3,
          texto: "Falta o outro lado: quem sustenta as emissões que agravam o problema?",
        },
      ],
    },

    // 11 — parte 3
    {
      modelo: "abertura",
      sumario: { titulo: "As empresas, as emissões e o território", sub: "Grandes empresas, cadeias produtivas e poder econômico" },
      numero: 3,
      titulo: "As empresas, as emissões e o território",
      linhaFina: "Grandes empresas, cadeias produtivas e poder econômico",
      foto: FOTO.cigarro,
      foco: [0.5, 0.42],
      fotoAlt: 47,
      cor: PRETO,
      legenda: "Colagem: crédito a confirmar.",
      blocos: [
        { t: "rotulo", texto: "Por trás das emissões, decisões empresariais" },
        {
          t: "texto", antes: 1.4, capitular: true,
          p: [
            "A crise climática é impulsionada por atividades concretas: extrair e queimar combustíveis fósseis, derrubar vegetação, fabricar cimento e aço. Grandes empresas participam como produtoras, operadoras de empreendimentos e elos de cadeias de fornecimento.",
            "No mundo, carvão, petróleo e gás explicam a maior parte do aquecimento; no Brasil, a mudança no uso da terra pesa mais nas emissões brutas. São escalas diferentes, e uma não anula a outra. [1; 2; 11]",
          ],
        },
      ],
    },

    // 12
    {
      modelo: "materia",
      secao: "3 · Empresas e emissões",
      lateral: {
        largura: 22,
        blocos: [
          { t: "rotulo", texto: "Em números", cor: CREME },
          {
            t: "numeros", colunas: 1, tam: 7, antes: 2, corNumero: CREME, corTexto: CREME,
            itens: [
              { n: "32", texto: "empresas ligadas a mais da metade do CO₂ mundial de combustíveis fósseis e cimento em 2024 [10]" },
              { n: "214,3 mi t", texto: "de CO₂e vieram dos transportes no Brasil em 2024, de 431,3 mi t da matriz energética [12]" },
              { n: "4%", texto: "das emissões brutas vêm de processos industriais — mas a indústria também emite pela energia que usa [2]" },
            ],
          },
        ],
      },
      blocos: [
        { t: "titulo", texto: "Os gigantes do carvão, do petróleo e do gás", tam: 4.4 },
        {
          t: "texto", colunas: 1, antes: 2,
          p: ["Quando gasolina, diesel, carvão e gás são queimados em motores, indústrias e usinas, o carbono vira CO₂. O Carbon Majors atribui essas emissões à produção e ao uso dos produtos vendidos — o que liga a venda de combustíveis ao aquecimento, sem provar que uma empresa causou sozinha um incêndio ou uma enchente. [10; 11]"],
        },
        {
          t: "grafico", antes: 2.4, tamTitulo: 1.9, rotulos: 0.42,
          titulo: "Cinco grandes produtores (2024)",
          eixo: "% do CO₂ global de combustíveis fósseis e cimento",
          max: 5,
          barras: [["Saudi Aramco", 4.28, "4,28%"], ["Coal India", 3.92, "3,92%"], ["CHN Energy", 3.91, "3,91%"], ["National Iranian Oil Co.", 3.13, "3,13%"], ["Gazprom", 2.76, "2,76%"]],
          legenda: "Gráfico 5. Carbon Majors, ano-base 2024 [10]. Não inclui desmatamento e outras fontes.",
        },
        {
          t: "texto", colunas: 1, antes: 2,
          p: [
            { inter: "Indústria" },
            "O cimento libera CO₂ ao produzir clínquer; a siderurgia usa carvão; a petroquímica transforma matérias-primas fósseis em plásticos; a mineração depende de máquinas e transporte. [2; 11]",
            { inter: "Quando a vegetação desaparece" },
            "Derrubar e queimar a vegetação libera carbono e muda a vida local: menos sombra e umidade, mais erosão, margens de rios desprotegidas. Quando água, pesca e roça são afetadas, quem se sustentava passa a depender de compras e auxílio. [1; 2; 13; 21]",
          ],
        },
      ],
    },

    // 13
    {
      modelo: "materia",
      secao: "3 · Casos documentados",
      blocos: [
        { t: "rotulo", texto: "Norte Energia e Belo Monte" },
        { t: "titulo", texto: "Belo Monte e a disputa pelas águas do Xingu", tam: 4.6, antes: 0.8 },
        {
          t: "numeros", fundo: VERMELHO, antes: 2, tam: 4.4,
          itens: [
            { n: "238,1 ha", texto: "de vegetação com supressão autorizada pelo Ibama em 2011 numa etapa da obra; 64,5 ha em APPs [15]" },
            { n: "635", texto: "famílias da Volta Grande sem água potável adequada, segundo ação do MPF (jun. 2026) [16]" },
            { n: "Dez. 2025", texto: "a Justiça manda Norte Energia e Ibama revisarem a vazão do rio [17]" },
          ],
        },
        {
          t: "texto", antes: 2.2,
          p: [
            "A Norte Energia opera a hidrelétrica de Belo Monte, no Pará. Além do corte de árvores, o desvio de água para gerar energia muda o rio e as florestas alagáveis. O MPF relata poços e cacimbas secos — são alegações de uma ação civil pública. [15; 16]",
            "A Justiça Federal reconheceu danos à vida aquática, à navegação e às comunidades, com seca de igapós e prejuízo à reprodução dos peixes. Para quem depende do rio, menos água compromete deslocamento, pesca e comida. [17]",
          ],
        },
        { t: "titulo", texto: "Belo Sun: mineração em disputa", tam: 4.6, antes: 3.4 },
        {
          t: "texto", antes: 1.8,
          p: [
            "A Belo Sun quer extrair ouro na Volta Grande do Xingu. Em abril de 2026, o MPF contestou a retomada da licença, e lideranças Xikrin e de Marapanim apontaram riscos e falhas na consulta às comunidades. [18; 19]",
            "A empresa diz que o licenciamento é feito por etapas e que o projeto não desvia água do Xingu. Em junho, o TRF1 registrou uma conciliação: nenhuma obra durante a negociação. O MPF não aderiu. [27; 28]",
          ],
        },
        {
          t: "lead", est: "legenda", antes: 2, cor: "#665e53",
          texto: "Fatos com datas, não a situação atual dos processos. Posições do MPF não equivalem a condenação: a pergunta é preventiva — como os direitos das comunidades serão protegidos?",
        },
      ],
    },

    // 14
    {
      modelo: "materia",
      secao: "3 · Licenças e interesses",
      blocos: [
        { t: "titulo", texto: "Autorizado, questionado ou ilegal?", tam: 5.2 },
        {
          t: "fluxo", antes: 2, sinais: ["→", "→"], cores: [PRETO, "#8f2a1f", VERMELHO],
          itens: [
            { titulo: "Autorizado", texto: "a lei permite suprimir vegetação com autorização prévia; APPs têm regras mais restritas [20; 21]" },
            { titulo: "Questionado", texto: "licenças, estudos e consultas contestados na Justiça" },
            { titulo: "Ilegal", texto: "sem autorização ou fora dos limites: exige fiscalização e punição [24]" },
          ],
        },
        {
          t: "texto", antes: 2.4,
          p: [
            "Ter a terra ou estar no Cadastro Ambiental Rural não autoriza derrubar a vegetação, e a autorização não diz que a obra não terá efeitos: ela define limites e controles. [20; 21] A Convenção 169 da OIT exige consultar os povos afetados, de boa-fé — não basta informar uma decisão pronta. [22] O TCU aponta falhas na fiscalização e problemas fundiários que favorecem a grilagem. [24]",
          ],
        },
        { t: "rotulo", texto: "Os interesses que pesam nas decisões", antes: 3 },
        {
          t: "texto", antes: 1.2,
          p: [
            "Empresas buscam receita; governos falam em abastecimento e desenvolvimento. Em 2015, o Ministério de Minas e Energia justificou Belo Monte pela energia renovável e pelos custos. [25] Reservar mais água para o rio reduz a parcela das turbinas — o TCU discutiu os efeitos em geração e tarifas. [23] Na nossa leitura, os ganhos chegam a consumidores e investidores, e os custos ficam no território.",
          ],
        },
        {
          t: "lado", antes: 2.6, resto: true, larguras: [1.1, 1],
          colunas: [
            [{
              t: "titulo", resto: true, fundo: PRETO, cor: CREME, tam: 3, pad: 2.6,
              texto: "Renovável não quer dizer sem emissões nem sem efeitos",
            }],
            [{
              t: "texto", colunas: 1, est: "numTexto",
              p: ["Reservatórios podem emitir metano pela decomposição de matéria orgânica; não há medição específica para Belo Monte. [26] Já a falta de planejamento urbano amplia a exposição a enchentes, deslizamentos e calor."],
            }],
          ],
        },
      ],
    },

    // 15 — parte 4
    {
      modelo: "abertura",
      sumario: { titulo: "Quem precisa de proteção não pode esperar", sub: "Enfrentar a crise com justiça" },
      numero: 4,
      titulo: "Quem precisa de proteção não pode esperar",
      linhaFina: "Enfrentar a crise com justiça",
      foto: FOTO.ribeirinha,
      foco: [0.5, 0.6],
      fotoAlt: 25,
      tamTitulo: 4.4,
      legenda: "Comunidade ribeirinha em seu cotidiano. Crédito e localidade a confirmar.",
      blocos: [
        {
          t: "texto",
          p: [
            "Justiça climática é levar em conta quem causa o problema, quem sofre seus impactos e quem participa das decisões. Uma política pode cortar emissões e ainda distribuir mal seus custos. Nancy Fraser liga redistribuição, reconhecimento e representação; Bullard, Acselrad, Herculano e Porto-Gonçalves ajudam a ler riscos, desigualdade e território.",
            "A resposta precisa cortar emissões nas cadeias produtivas, proteger florestas e garantir moradia segura, saneamento, saúde e informação — com as comunidades nas decisões.",
          ],
        },
        {
          t: "fluxo", antes: 2.4, cores: ["#8f2a1f", VERMELHO],
          itens: [
            { titulo: "Igualdade", texto: "a mesma ajuda para todos, perdendo a casa ou não" },
            { titulo: "Equidade", texto: "ajuda conforme a perda e as condições de cada um" },
          ],
        },
        {
          t: "titulo", antes: 2.4, resto: true, fundo: PRETO, cor: CREME, tam: 2.9, pad: 2.6,
          texto: "Enfrentar a crise com justiça é reduzir o dano na origem e garantir que a proteção chegue a quem mais precisa.",
        },
      ],
    },

    // 16 e 17
    { modelo: "fontes", paginas: 2, sumario: { titulo: "Fontes e notas", sub: "Referências, links e critérios de checagem" } },
  ],

  fontes: {
    titulo: "Fontes e notas",
    intro: "Os números mantêm seus anos de referência. Os relatos são de reportagens publicadas, não de entrevistas do grupo. Links consultados em 14 de outubro de 2026.",
    itens: [
      { n: 1, texto: "IPCC. Climate Change 2023 — Synthesis Report.", url: "https://www.ipcc.ch/report/ar6/syr/longer-report/" },
      { n: 2, texto: "Observatório do Clima. SEEG, coleção 13. Emissões de gases de efeito estufa do Brasil, ano-base 2024.", url: "https://seeg.eco.br/wp-content/uploads/2026/03/SEEG13-relatorio-analitico-BR.pdf" },
      { n: 3, texto: "O Globo. “No dia seguinte, vi tudo acabado, queimado”, diz sobrevivente de incêndio no Pantanal. 27 jul. 2024.", url: "https://oglobo.globo.com/brasil/noticia/2024/07/27/no-dia-seguinte-vi-tudo-acabado-queimado-diz-sobrevivente-de-incendio-no-pantanal.ghtml" },
      { n: 4, texto: "Governo Federal. Brasil entrega à ONU nova NDC alinhada ao Acordo de Paris. Nov. 2024.", url: "https://www.gov.br/povosindigenas/pt-br/assuntos/noticias/2024/11/brasil-entrega-a-onu-nova-ndc-alinhada-ao-acordo-de-paris" },
      { n: 5, texto: "IBGE. Rendimento domiciliar per capita de 2023.", url: "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/40201-ibge-divulga-o-rendimento-domiciliar-per-capita-e-o-coeficiente-de-desequilibrio-regional-de-2023" },
      { n: 6, texto: "IBGE. Síntese de Indicadores Sociais — dados de 2019. 12 nov. 2020.", url: "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/29431-sintese-de-indicadores-sociais-em-2019-proporcao-de-pobres-cai-para-24-7-e-extrema-pobreza-se-mantem-em-6-5-da-populacao" },
      { n: 7, texto: "IBGE. Censo Demográfico 2022 — Favelas e Comunidades Urbanas.", url: "https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv102170.pdf" },
      { n: 8, texto: "Agência Brasil. Devastada pela água, Roca Sales vive entre migração e reconstrução. 23 jun. 2024 (UOL).", url: "https://noticias.uol.com.br/ultimas-noticias/agencia-brasil/2024/06/23/devastada-pela-agua-roca-sales-vive-entre-migracao-e-reconstrucao.htm" },
      { n: 9, texto: "Cidacs/Fiocruz Bahia. Aumento da temperatura ambiente eleva chance de desnutrição infantil. 27 mar. 2026.", url: "https://cidacs.bahia.fiocruz.br/2026/03/mudancas-climaticas-e-risco-a-infancia-aumento-da-temperatura-ambiente-eleva-chance-de-desnutricao-infantil/" },
      { n: 10, texto: "Carbon Majors / InfluenceMap. 2024 Data Update.", url: "https://carbonmajors.org/briefing/Carbon-Majors-2024-Data-Update-35466" },
      { n: 11, texto: "Nações Unidas. Causas e efeitos das mudanças climáticas.", url: "https://www.un.org/pt/climatechange/science/causes-effects-climate-change" },
      { n: 12, texto: "EPE. Relatório Síntese do Balanço Energético Nacional 2025 — dados de 2024.", url: "https://www.epe.gov.br/pt/imprensa/noticias/epe-publica-o-relatorio-sintese-do-balanco-energetico-nacional-2025" },
      { n: 13, texto: "FÁBIO, André Cabette. Indígenas brasileiros enfrentam floresta amazônica secando. ((o))eco, 20 out. 2025.", url: "https://oeco.org.br/reportagens/indigenas-brasileiros-enfrentam-floresta-amazonica-secando/" },
      { n: 14, texto: "MORAIS, Alice Martins; MELO, Matheus. Mudanças climáticas afetam comunidades do Marajó. ((o))eco, 25 out. 2024.", url: "https://oeco.org.br/fotografia/mudancas-climaticas-afetam-comunidades-do-marajo/" },
      { n: 15, texto: "FAINGUELERNT, Maíra Borges. A trajetória histórica do licenciamento ambiental de Belo Monte. Ambiente & Sociedade, v. XIX, n. 2, 2016.", url: "https://www.scielo.br/j/asoc/a/ThnyR8RrxkcBNSqVGKKxqqP/?format=pdf&lang=pt" },
      { n: 16, texto: "MPF. Pedidos para garantir água, saneamento e comunicação a famílias atingidas por Belo Monte. 18 jun. 2026.", url: "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/mpf-reforca-pedidos-para-garantir-agua-saneamento-e-comunicacao-a-familias-atingidas-por-belo-monte-no-para" },
      { n: 17, texto: "MPF. Justiça Federal ordena revisão do fluxo de água da UHE de Belo Monte. 16 dez. 2025.", url: "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/justica-federal-atende-mpf-e-ordena-revisao-urgente-do-fluxo-de-agua-da-uhe-de-belo-monte-pa" },
      { n: 18, texto: "MPF. Oposição à retomada do Projeto Volta Grande. 8 abr. 2026.", url: "https://www.mpf.mp.br/o-mpf/unidades/prr1/noticias/abril-indigena-mpf-se-opoe-a-retomada-do-projeto-volta-grande-do-xingu-pa-e-aponta-descumprimento-de-condicionantes-indigenas" },
      { n: 19, texto: "MPF. Lideranças pedem suspensão do Projeto Volta Grande. 10 abr. 2026.", url: "https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/abril-indigena-liderancas-pedem-suspensao-imediata-do-projeto-volta-grande-do-xingu-por-risco-de-danos-irreversiveis" },
      { n: 20, texto: "Ibama. Autorização de Supressão de Vegetação — ASV.", url: "https://www.gov.br/ibama/pt-br/servicos/autorizacoes/flora/asv" },
      { n: 21, texto: "BRASIL. Lei 12.651/2012 — Código Florestal.", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm" },
      { n: 22, texto: "BRASIL. Decreto 10.088/2019 — Convenção 169 da OIT.", url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10088.htm" },
      { n: 23, texto: "TCU. Impasse sobre o hidrograma de Belo Monte. Ago. 2025.", url: "https://portal.tcu.gov.br/imprensa/noticias/tcu-analisa-impasse-sobre-definicao-do-hidrograma-de-belo-monte" },
      { n: 24, texto: "TCU. Lista de Alto Risco — Controle do desmatamento ilegal na Amazônia.", url: "https://sites.tcu.gov.br/listadealtorisco/controle_do_desmatamento_ilegal_na_amazonia.html" },
      { n: 25, texto: "Ministério de Minas e Energia. Ibama autoriza enchimento de Belo Monte. Nov. 2015.", url: "https://www.gov.br/mme/pt-br/assuntos/noticias/ibama-autoriza-enchimento-de-belo-monte/" },
      { n: 26, texto: "Observatório do Clima / SEEG. Redução das emissões de metano no Brasil. 2024.", url: "https://seeg.eco.br/wp-content/uploads/2024/03/SEEG-METANO.pdf" },
      { n: 27, texto: "Belo Sun. Nota sobre licenciamento faseado do Projeto Volta Grande. 21 maio 2026.", url: "https://belosun.com.br/nota/" },
      { n: 28, texto: "TRF1. Conciliação sobre licença ambiental da Belo Sun. 26 jun. 2026.", url: "https://www.trf1.jus.br/trf1/noticias/conciliacao-do-trf1-promove-acordo-entre-partes-sobre-licenca-ambiental-de-mineradora-no-para-" },
    ],
    notas: [
      {
        titulo: "Referencial sociológico",
        texto: ["Marx, Weber, Bourdieu, Fraser, Bullard, Kowarick, Acselrad, Rolnik, Porto-Gonçalves, Lefebvre e Herculano aparecem pelos conceitos que ajudam a interpretar os casos. As aplicações são interpretações editoriais, não citações literais."],
      },
      {
        titulo: "Critérios de checagem",
        texto: [
          "Os relatos vêm de reportagens. Casos empresariais distinguem autorizações, decisões judiciais, alegações do MPF e posições das empresas.",
          "Usamos as emissões brutas do SEEG de 2024; o total da EPE (431,3 MtCO₂e) não foi somado a elas. Dados sem estudo identificado — contagens de desastres, mortes por calor, 74% de redução de chuvas — não entraram. Os marcos da Belo Sun têm datas e não indicam desfecho judicial.",
          "O infográfico do IPAM mostra focos de calor de 2020 e não se compara diretamente às séries de emissões.",
        ],
      },
    ],
  },

  contracapa: {
    texto: "Nenhuma meta climática está completa se as pessoas afetadas continuam sem condições de reconstruir a própria vida.",
  },
};
