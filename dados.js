// Conteúdo da revista: "Mudanças climáticas e justiça climática no Brasil".
// Gerado a partir do texto da equipe (Revista_Mudancas_Climaticas_Atualizada.docx).
// Para mudar o texto, edite só este arquivo: diagramacao.js reparte tudo em páginas.
//
// Blocos dentro de cada parte (partes[].blocos):
//   inter    intertítulo
//   p        parágrafo
//   citacao  olho: fala em destaque, com autor e crédito da reportagem
//   nota     crédito pequeno (caso documentado, explicação de especialista)
//   grafico  gráfico de barras (barras: [rótulo, valor, texto exibido]; max = fim do eixo)
// Marcadores de fonte como [1] ou [1; 2] ficam no texto e são desenhados menores.
// O total de páginas é completado sozinho para ser PAR (cada folha tem frente e verso).

const REVISTA = {
  titulo: "Horizonte",
  edicao: "Germinare Tech • 2º F • Setembro de 2026",
  capa: {
    chamada: "Mudanças climáticas e justiça climática no Brasil",
    subtitulo: "Como a mudança do clima se transforma em perdas tão diferentes para pessoas que vivem no mesmo país?",
    destaques: ["Quem sofre", "Quem causa", "Enfrentar a crise com justiça"],
    cor: "#1f3a5f",
  },
  expediente: "Pesquisa e redação: Emanuelly Mendes, Guilherme Norcia, Matheus Botana, Rafael Lopes, Rafael Takematsu e Sophia Castro.",
  editorial: {
    titulo: "Editorial",
    texto: [
      "Uma casa atingida pela água, uma comunidade cercada pelo fogo e uma criança exposta ao calor fazem parte da mesma discussão. A crise climática altera as condições de vida, mas encontra um Brasil em que renda, moradia, infraestrutura e poder já são distribuídos de forma desigual. Por isso, entender o aquecimento do planeta exige olhar também para as relações sociais que tornam alguns grupos mais expostos e menos protegidos.",
      "Nesta revista, partimos de uma pergunta: como a mudança do clima se transforma em perdas tão diferentes para pessoas que vivem no mesmo país? Primeiro, explicamos a relação entre emissões e aquecimento. Depois, examinamos quem sofre e por quais razões. Na terceira parte, voltamos o olhar às grandes empresas e às cadeias econômicas que sustentam as emissões. Encerramos discutindo o que significa enfrentar essa crise com justiça.",
      "Os dados ajudam a dimensionar o problema; os relatos mostram o que ele significa na vida de alguém. Aproximamos essas duas formas de compreender a realidade sem transformar vítimas em números nem atribuir a uma empresa a responsabilidade por um desastre sem evidência específica. Nossa proposta é mostrar como clima, desigualdade e decisões econômicas se conectam — e por que proteger pessoas precisa fazer parte da resposta climática.",
    ],
    assinatura: "A equipe editorial",
  },
  partes: [
    {
      numero: 1,
      titulo: "Contextualização",
      linhaFina: "Emissões, aquecimento e mudanças no Brasil",
      cor: "#2f5d46",
      blocos: [
        { t: "inter", texto: "Como as emissões mudam o clima" },
        {
          t: "p",
          texto: "Mudanças climáticas são alterações duradouras nos padrões do clima. No aquecimento atual, a ação humana tem papel central: atividades que liberam gases de efeito estufa intensificam a retenção de calor na atmosfera. O IPCC concluiu que a temperatura média global de 2011 a 2020 ficou cerca de 1,1 °C acima da média de 1850 a 1900. Esse valor descreve um período histórico, não a temperatura de um ano atual. [1]",
        },
        {
          t: "p",
          texto: "O efeito estufa natural permite que a Terra mantenha temperaturas compatíveis com a vida. O problema é sua intensificação. A queima de carvão, petróleo e gás acrescenta CO₂ à atmosfera; o desmatamento libera carbono armazenado na vegetação e reduz sua capacidade de absorção. Mais CO₂ acumulado significa mais aquecimento. Metano e óxido nitroso também contribuem, inclusive na agropecuária. [1; 2]",
        },
        {
          t: "p",
          texto: "CO₂ e CO₂ equivalente não são a mesma medida. O primeiro é um gás específico; CO₂e reúne diferentes gases em uma unidade comparável segundo seu efeito de aquecimento. Assim, um total de emissões em CO₂e não representa somente gás carbônico. Essa distinção será importante ao comparar empresas e setores econômicos. [2]",
        },
        { t: "inter", texto: "Do aquecimento aos impactos" },
        {
          t: "p",
          texto: "O aquecimento modifica o ciclo da água e as condições em que ocorrem eventos extremos. Pode intensificar chuvas fortes e aumentar a exposição a calor e secas, com diferenças entre regiões. Isso não autoriza atribuir qualquer enchente ou incêndio exclusivamente à mudança climática: o dano também depende da ocupação do território, da infraestrutura, do manejo ambiental e da prevenção. [1]",
        },
        {
          t: "p",
          texto: "O Brasil reúne situações que tornam essa relação visível: secas que comprometem água e produção, incêndios que atingem ecossistemas e comunidades, chuvas que inundam moradias e calor que afeta a saúde. Os casos apresentados nesta edição mostram como esses perigos encontram condições sociais muito diferentes.",
        },
        { t: "inter", texto: "Um relato que aproxima o problema" },
        {
          t: "p",
          texto: "“No dia seguinte, vi tudo acabado, queimado”. A frase de Rosely, sobrevivente de um incêndio no Pantanal, foi publicada por O Globo em 27 de julho de 2024. O testemunho aproxima o debate climático da perda concreta de um lugar de vida. Ele documenta uma experiência; sozinho, não identifica o autor do incêndio nem demonstra a responsabilidade de uma empresa. [3]",
        },
        {
          t: "citacao",
          texto: "No dia seguinte, vi tudo acabado, queimado",
          autor: "Rosely, sobrevivente de um incêndio no Pantanal",
          credito: "Relato publicado por O Globo, 27 jul. 2024. Fonte completa em [3]. A fala é de uma reportagem, não de uma entrevista realizada pelo grupo.",
        },
        { t: "inter", texto: "O perfil brasileiro de emissões" },
        {
          t: "p",
          texto: "Para entender as causas no país, é preciso observar os setores. O panorama setorial desta revista utiliza emissões brutas de 2024 do SEEG, coleção 13. Uso da terra e agropecuária têm grande peso. Seus totais descrevem setores, e não um ranking de empresas. [2]",
        },
        {
          t: "grafico",
          titulo: "Distribuição das emissões brutas brasileiras em 2024",
          eixo: "Percentual do total",
          max: 50,
          barras: [
            ["Uso da terra", 42, "42%"],
            ["Agropecuária", 29, "29%"],
            ["Energia", 20, "20%"],
            ["Resíduos", 5, "5%"],
            ["Processos industriais", 4, "4%"],
          ],
          legenda: "Gráfico 1. Fonte: SEEG, coleção 13, ano-base 2024 [2]. Participações arredondadas: 42%, 29%, 20%, 5% e 4%. Total estimado: 2,145 bilhões de toneladas de CO₂e. Os setores não representam um ranking de empresas.",
        },
        {
          t: "p",
          texto: "O uso da terra inclui a liberação de carbono relacionada à conversão de vegetação. Na agropecuária, destacam-se o metano da digestão dos bovinos e gases associados ao manejo e aos fertilizantes. Na energia, o uso de combustíveis em transportes e atividades produtivas contribui para as emissões. Esse perfil exige discutir tanto combustíveis fósseis quanto cadeias que dependem da terra. [2]",
        },
        { t: "inter", texto: "O compromisso brasileiro" },
        {
          t: "p",
          texto: "A NDC apresentada pelo Brasil em novembro de 2024 estabelece reduzir emissões líquidas entre 59% e 67% até 2035, em relação a 2005. O intervalo corresponde a 850 milhões a 1,05 bilhão de toneladas de CO₂e. É uma meta, não um resultado já alcançado. Emissões líquidas descontam remoções; por isso, não devem ser comparadas diretamente com o gráfico de emissões brutas. [4]",
        },
        {
          t: "p",
          texto: "Reduzir emissões é mitigação. Preparar moradias, serviços e territórios para os impactos é adaptação. As duas respostas precisam caminhar juntas: o compromisso de reduzir gases não elimina a necessidade de proteger quem já enfrenta os efeitos da crise.",
        },
        {
          t: "p",
          texto: "Para entender essa proteção, o próximo passo é olhar para a vulnerabilidade. O perigo pode alcançar muita gente; as condições de enfrentá-lo variam profundamente.",
        },
      ],
    },
    {
      numero: 2,
      titulo: "Quem sofre",
      linhaFina: "Vulnerabilidade, território e histórias reais",
      cor: "#8a6a2a",
      blocos: [
        { t: "inter", texto: "O que é vulnerabilidade climática" },
        {
          t: "p",
          texto: "Vulnerabilidade climática é a propensão a sofrer danos e a dificuldade de lidar com seus efeitos. Ela envolve condições como renda, saúde, moradia, infraestrutura, acesso à informação e capacidade de recuperação. Não é uma característica natural de uma população. É produzida também por escolhas políticas, desigualdades históricas e formas de ocupação do território.",
        },
        {
          t: "p",
          texto: "Uma chuva intensa é um perigo. Pessoas e casas localizadas onde ela pode causar inundação estão expostas. Se faltam drenagem, moradia segura e recursos para sair ou reconstruir, a vulnerabilidade aumenta. O risco resulta da interação entre perigo, exposição e vulnerabilidade; o desastre ocorre quando essa interação produz danos graves e compromete a capacidade de resposta. Separar esses conceitos evita tratar toda perda como inevitável.",
        },
        { t: "inter", texto: "Quem é mais afetado e por quê" },
        {
          t: "p",
          texto: "Famílias de baixa renda e moradores de periferias podem enfrentar maior dificuldade de acessar moradia segura, transporte, saneamento e reservas financeiras. Populações negras sofrem os efeitos de desigualdades raciais que também organizam o acesso à renda e ao espaço urbano. Não é a identidade dessas pessoas que produz o risco: são as condições desiguais de proteção e de acesso a direitos.",
        },
        {
          t: "p",
          texto: "Povos indígenas, comunidades quilombolas e ribeirinhas enfrentam ameaças que atingem também seus territórios e modos de vida. Quando rios, florestas e áreas de cultivo são afetados, as perdas podem comprometer alimentação, trabalho, vínculos culturais e continuidade comunitária. Agricultores familiares dependentes das condições de chuva também podem ter sua renda e produção prejudicadas pela seca.",
        },
        {
          t: "p",
          texto: "Crianças e idosos exigem atenção à saúde e aos cuidados. A condição de saúde e a dependência de apoio podem se somar às dificuldades econômicas e territoriais. Esses fatores se cruzam: uma criança de uma comunidade com serviços precários enfrenta condições diferentes das de outra com atendimento e proteção disponíveis.",
        },
        { t: "inter", texto: "A desigualdade aparece antes do desastre" },
        {
          t: "p",
          texto: "A estratificação social ajuda a entender por que as pessoas não partem das mesmas condições. A ideia de “oportunidades de vida”, de Max Weber, orienta perguntas concretas: quem pode alugar outra casa, interromper o trabalho sem perder toda a renda ou acessar serviços? O conceito de capitais de Pierre Bourdieu amplia a leitura: além de dinheiro, redes de apoio e acesso à informação influenciam a recuperação. Esses autores são ferramentas de interpretação, não fontes dos dados climáticos.",
        },
        {
          t: "grafico",
          titulo: "Rendimento mensal domiciliar por pessoa em 2023",
          eixo: "Reais",
          max: 2500,
          barras: [
            ["Centro-Oeste", 2264, "R$ 2.264"],
            ["Brasil", 1893, "R$ 1.893"],
            ["Norte", 1314, "R$ 1.314"],
            ["Nordeste", 1155, "R$ 1.155"],
          ],
          legenda: "Gráfico 2. Fonte: IBGE, PNAD Contínua, divulgação de 2023 [5]. Médias regionais não descrevem cada família nem medem, sozinhas, a vulnerabilidade climática.",
        },
        {
          t: "p",
          texto: "O indicador mostra recursos desiguais entre regiões. Ele ajuda a contextualizar a capacidade de enfrentar perdas, mas não prova que toda pessoa de uma região será mais atingida do que alguém de outra. Essa análise exige combinar renda com o perigo e as condições locais.",
        },
        {
          t: "grafico",
          titulo: "Pobreza e extrema pobreza por cor ou raça em 2019",
          eixo: "Percentual de cada grupo",
          max: 40,
          barras: [
            ["Pobreza — pretos e pardos", 32.3, "32,3%"],
            ["Pobreza — brancos", 14.7, "14,7%"],
            ["Extrema — pretos e pardos", 8.9, "8,9%"],
            ["Extrema — brancos", 3.4, "3,4%"],
          ],
          legenda: "Gráfico 3. Fonte: IBGE, Síntese de Indicadores Sociais, divulgação de 2020 com dados de 2019 [6]. Série histórica; não retrata os níveis atuais de pobreza.",
        },
        {
          t: "p",
          texto: "A maior incidência de pobreza entre pretos e pardos evidencia uma desigualdade anterior aos eventos climáticos. Quando perdas ambientais exigem dinheiro para deslocamento e reconstrução, essa desigualdade pode se transformar em menor capacidade de resposta. O gráfico não é uma contagem de vítimas de desastres. [6]",
        },
        { t: "inter", texto: "Território e racismo ambiental" },
        {
          t: "p",
          texto: "O território é mais do que um endereço: nele se distribuem serviços, oportunidades e riscos. A discussão de Lúcio Kowarick sobre espoliação urbana ajuda a interpretar a privação de infraestrutura nas periferias. Henri Lefebvre contribui ao tratar o espaço como resultado das relações sociais. Aplicados ao tema, esses conceitos ajudam a perguntar por que certas áreas recebem proteção e outras convivem com serviços insuficientes.",
        },
        {
          t: "p",
          texto: "Racismo ambiental descreve a exposição desproporcional de grupos raciais ou étnicos a danos ambientais e à falta de proteção. No Brasil, a desigualdade histórica no acesso à terra, à renda e à infraestrutura ajuda a compreender esse processo. O conceito não exige que toda situação resulte de uma intenção explícita; é preciso observar também como práticas e instituições mantêm desigualdades.",
        },
        {
          t: "p",
          texto: "O Censo 2022 registrou 16.390.815 moradores em favelas e comunidades urbanas, ou 8,1% da população. Pretos e pardos eram 72,9% dos moradores desses territórios. Isso não significa que todas essas pessoas estejam em área de risco: a composição racial deve ser relacionada a indicadores locais de infraestrutura e exposição. [7]",
        },
        {
          t: "grafico",
          titulo: "Moradores em favelas e comunidades urbanas",
          eixo: "Milhões de pessoas",
          max: 20,
          barras: [
            ["2010", 11.4, "11,40"],
            ["2022", 16.39, "16,39"],
          ],
          legenda: "Gráfico 4. Fonte: IBGE, Censos 2010 e 2022 [7 e pesquisa original]. Comparação descritiva entre levantamentos; alterações de identificação e cobertura devem ser consideradas, além da mudança populacional.",
        },
        { t: "inter", texto: "Quando a água baixa a perda continua" },
        {
          t: "p",
          texto: "O material pesquisado pelo grupo destaca as enchentes de 2024 no Rio Grande do Sul. A escala do desastre importa, mas o período de reconstrução revela outra dimensão: o impacto continua quando a família não encontra moradia segura, perde trabalho ou já gastou suas economias em uma enchente anterior.",
        },
        {
          t: "p",
          texto: "Em Roca Sales, a vendedora Júlia Almeida, de 20 anos, relatou à Agência Brasil a dificuldade de encontrar moradia fora do alcance da água e o aumento de preços. “Não tem onde morar”, afirmou. A reportagem de 23 de junho de 2024 registrou ainda dificuldades de pequenos negócios que haviam investido na recuperação após a enchente de 2023. [8]",
        },
        {
          t: "citacao",
          texto: "Não tem onde morar",
          autor: "Júlia Almeida, vendedora, Roca Sales",
          credito: "Relato: Júlia Almeida, Roca Sales, Agência Brasil, 23 jun. 2024; reprodução consultada no UOL [8].",
        },
        {
          t: "p",
          texto: "A experiência ajuda a explicar vulnerabilidade: estar disposto a reconstruir não basta quando faltam recursos e alternativas seguras. Políticas de solo e de habitação entram nessa discussão, como mostra a contribuição de Raquel Rolnik para pensar moradia e remoções. Reconstruir exige considerar onde as pessoas poderão viver e manter seus vínculos.",
        },
        { t: "inter", texto: "No Xingu perder vegetação também é perder autonomia" },
        {
          t: "p",
          texto: "Na aldeia Tanguro, do povo Kalapalo, a mudança na paisagem alcança práticas cotidianas. A reportagem de André Cabette Fábio, publicada por ((o))eco em outubro de 2025, relata uma floresta mais seca e inflamável, dificuldades na pesca e perdas de mandioca. O estudante Sikan Kalapalo descreve trechos de rio em que é necessário empurrar o barco e maior dependência de cestas básicas. “Hoje a gente está com escassez de alimentos. E as plantações não estão dando mais”, disse. [13]",
        },
        {
          t: "p",
          texto: "O agricultor Yunak Yawalapiti relatou a dificuldade de controlar o fogo usado nas roças tradicionais. A reportagem registra o apoio do PrevFogo nesse manejo. A experiência mostra como condições ambientais alteradas dificultam práticas antes adaptadas ao território. Não equipara o manejo tradicional à derrubada em larga escala. [13]",
        },
        {
          t: "p",
          texto: "O impacto envolve comida, mobilidade e continuidade cultural, além de renda. A reportagem relaciona o ressecamento à mudança climática e à transformação da vegetação no entorno, mas não identifica uma empresa específica como responsável por todas as perdas descritas. [13]",
        },
        {
          t: "citacao",
          texto: "Hoje a gente está com escassez de alimentos. E as plantações não estão dando mais",
          autor: "Sikan Kalapalo, estudante, aldeia Tanguro",
          credito: "Relatos: Sikan Kalapalo e Yunak Yawalapiti. André Cabette Fábio, Thomson Reuters Foundation/Context, publicado por ((o))eco em 20 out. 2025 [13].",
        },
        { t: "inter", texto: "No Marajó a perda também leva documentos e memórias" },
        {
          t: "p",
          texto: "Na Vila do Pesqueiro, em Soure, Ivanil Brito perdeu a casa pela erosão em fevereiro de 2024. A fotoreportagem de Alice Martins Morais e Matheus Melo registra perdas de animais, plantas, móveis, documentos e materiais universitários dos filhos. “Nunca pensei que veria algo assim, nem que teria tanto sofrimento”, declarou. [14]",
        },
        {
          t: "p",
          texto: "A matéria também destaca manguezais como barreiras naturais e registra a percepção de moradores sobre mudanças nos rios e nas chuvas. O caso mostra como proteção ambiental, moradia e trabalho se conectam. Ele não oferece evidência para atribuir a erosão da casa de Ivanil a uma empresa ou a uma remoção específica de vegetação. [14]",
        },
        {
          t: "citacao",
          texto: "Nunca pensei que veria algo assim, nem que teria tanto sofrimento",
          autor: "Ivanil Brito, Vila do Pesqueiro, Soure",
          credito: "Relato: Ivanil Brito. ((o))eco, Mudanças climáticas afetam comunidades do Marajó, 25 out. 2024 [14].",
        },
        { t: "inter", texto: "O calor também alcança o corpo" },
        {
          t: "p",
          texto: "Um estudo divulgado pelo Cidacs/Fiocruz em março de 2026 associou cada aumento de 1 °C acima de 26 °C a maior chance de baixo peso e desnutrição infantil. A análise reuniu registros de mais de 6 milhões de crianças de 12 a 59 meses, com informações de 2007 a 2017. Entre as crianças indígenas estudadas, 26,65% apresentavam atraso no crescimento; entre as crianças pretas, 9,32%. [9]",
        },
        {
          t: "p",
          texto: "Essas proporções descrevem os grupos analisados; não são percentuais de casos comprovadamente causados pelo calor. A pesquisadora Priscila Ribas explicou que temperaturas elevadas podem afetar apetite, metabolismo e episódios de diarreia, prejudicando a nutrição. Essa explicação aproxima saúde e ambiente sem reduzir a desnutrição a uma única causa. [9]",
        },
        {
          t: "nota",
          texto: "Explicação de especialista: Priscila Ribas, pesquisadora citada pelo Cidacs/Fiocruz, 27 mar. 2026 [9]. Síntese em discurso indireto.",
        },
        {
          t: "p",
          texto: "As histórias e os indicadores mostram por que a resposta precisa considerar necessidades diferentes. Resta investigar o outro lado da relação: quais atividades e decisões empresariais sustentam as emissões que agravam o problema?",
        },
      ],
    },
    {
      numero: 3,
      titulo: "Quem causa",
      linhaFina: "Grandes empresas, cadeias produtivas e poder econômico",
      cor: "#b5472a",
      blocos: [
        { t: "inter", texto: "Das fontes de emissão às decisões das empresas" },
        {
          t: "p",
          texto: "A crise climática é impulsionada por atividades concretas: extração e queima de combustíveis fósseis, retirada da vegetação e processos industriais. As grandes empresas participam dessas atividades como produtoras de combustíveis, operadoras de empreendimentos e integrantes de cadeias de fornecimento. Identificar responsabilidades exige acompanhar o que cada uma produz, transforma ou modifica no território.",
        },
        {
          t: "p",
          texto: "No mundo, carvão, petróleo e gás são centrais para explicar o aquecimento. No Brasil, a mudança de uso da terra tem um peso especialmente elevado nas emissões brutas. São escalas diferentes: o predomínio global dos combustíveis fósseis não contradiz a importância do desmatamento no perfil brasileiro. [1; 2; 11]",
        },
        { t: "inter", texto: "Combustíveis fósseis e empresas que sustentam essa cadeia" },
        {
          t: "p",
          texto: "Quando gasolina, diesel, carvão e gás natural são queimados em motores, instalações industriais e usinas, o carbono dos combustíveis é liberado como CO₂. A geração elétrica é apenas parte desse uso: transporte e produção industrial também dependem de energia. A ONU destaca essas atividades entre as causas das mudanças climáticas. [11]",
        },
        {
          t: "p",
          texto: "O Carbon Majors relacionou mais da metade do CO₂ mundial de combustíveis fósseis e cimento em 2024 à produção de 32 empresas. Entre os grandes produtores estão Saudi Aramco, Coal India, CHN Energy, National Iranian Oil Company e Gazprom. O método acompanha emissões operacionais e o uso dos produtos vendidos; não mede somente o que sai das instalações dessas companhias. [10]",
        },
        {
          t: "grafico",
          titulo: "Cinco grandes produtores no levantamento de 2024",
          eixo: "% do CO₂ global de combustíveis fósseis e cimento",
          max: 5,
          barras: [
            ["Saudi Aramco", 4.28, "4,28%"],
            ["Coal India", 3.92, "3,92%"],
            ["CHN Energy", 3.91, "3,91%"],
            ["National Iranian Oil Co.", 3.13, "3,13%"],
            ["Gazprom", 2.76, "2,76%"],
          ],
          legenda: "Gráfico 5. Carbon Majors, ano-base 2024 [10]. Emissões atribuídas à produção e ao uso dos produtos. O denominador exclui desmatamento e outras fontes de gases de efeito estufa.",
        },
        {
          t: "p",
          texto: "Essa atribuição conecta a comercialização de combustíveis ao aquecimento, mas não demonstra que uma dessas empresas causou sozinha um incêndio ou uma enchente específica. A responsabilidade por um empreendimento e a contribuição para o clima global são perguntas relacionadas, com evidências diferentes.",
        },
        { t: "inter", texto: "Transportes e indústria no Brasil" },
        {
          t: "p",
          texto: "Segundo a EPE, em 2024 os transportes geraram 214,3 milhões de toneladas de CO₂e, dentro de um total de 431,3 milhões associado à matriz energética brasileira. O dado inclui o uso de energia no deslocamento de cargas e pessoas; não representa a participação dos transportes no conjunto de todas as emissões nacionais. [12]",
        },
        {
          t: "grafico",
          titulo: "Emissões associadas à matriz energética em 2024",
          eixo: "Milhões de toneladas de CO₂e",
          max: 250,
          barras: [
            ["Transportes", 214.3, "214,3"],
            ["Demais usos de energia", 217, "217"],
          ],
          legenda: "Gráfico 6. EPE, Balanço Energético Nacional 2025, ano-base 2024 [12]. Demais usos = 431,3 − 214,3 = 217,0 MtCO₂e. A série da EPE tem metodologia própria e não deve ser somada à série setorial do SEEG.",
        },
        {
          t: "p",
          texto: "A indústria emite pela energia consumida e também por transformações químicas. Na fabricação de cimento, a produção de clínquer libera CO₂ além das emissões dos combustíveis usados nos fornos. Na siderurgia, o uso de carvão em rotas tradicionais de produção de ferro e aço contribui para as emissões. A química e a petroquímica usam energia e matérias-primas fósseis na fabricação de produtos como plásticos. A mineração demanda máquinas, transporte e infraestrutura. [2; 11]",
        },
        {
          t: "p",
          texto: "Os processos industriais representaram cerca de 4% das emissões brutas brasileiras em 2024. Esse percentual não corresponde a toda a contribuição climática da indústria: parte das emissões industriais relacionadas aos combustíveis aparece no setor de energia. Por isso, uma parcela pequena nessa categoria não significa impacto industrial desprezível. [2]",
        },
        { t: "inter", texto: "A retirada da vegetação modifica o clima e a vida local" },
        {
          t: "p",
          texto: "Florestas e outras formações nativas armazenam carbono e participam da circulação de água. A derrubada, a queima e a decomposição da vegetação removida liberam carbono; a degradação também pode comprometer sua absorção futura. No Brasil, a mudança de uso da terra respondeu por cerca de 42% das emissões brutas em 2024. [1; 2]",
        },
        {
          t: "p",
          texto: "Para quem vive nesses territórios, a perda não se resume às toneladas emitidas. Menos cobertura vegetal pode significar menos sombra e umidade, alteração do escoamento da água e maior erosão. A retirada da vegetação próxima a rios pode prejudicar a proteção das margens. Quando essas mudanças afetam água, pesca e cultivo, atingem a alimentação e a renda; quando impõem deslocamentos, atingem vínculos comunitários e culturais. A intensidade depende do lugar, da intervenção e das condições de proteção existentes. [1; 13; 21]",
        },
        {
          t: "p",
          texto: "Ameaçar a produção de alimentos também reduz a autonomia. Uma família que pescava e cultivava para se sustentar pode passar a depender de compras e de auxílio. Essas perdas não são inteiramente substituídas por indenizações, porque o território também guarda conhecimentos, relações de cuidado e práticas transmitidas entre gerações.",
        },
        { t: "inter", texto: "Norte Energia e Belo Monte do desmate autorizado à disputa pela água" },
        {
          t: "p",
          texto: "A Norte Energia é a concessionária da hidrelétrica de Belo Monte, no Pará. O estudo de Maíra Borges Fainguelernt sobre o licenciamento registra que uma autorização concedida pelo Ibama em 2011 permitia a supressão de 238,1 hectares, incluindo 64,5 hectares de Áreas de Preservação Permanente. O número se refere a uma autorização daquela etapa da obra, não ao desmatamento total do empreendimento. [15]",
        },
        {
          t: "p",
          texto: "Esse caso identifica uma empresa, uma intervenção e uma autorização. Seus efeitos territoriais, porém, não se limitam ao corte de árvores: o desvio de água para geração de eletricidade modifica a dinâmica do rio e das florestas alagáveis. Segundo o MPF, em junho de 2026 uma ação cobrava da Norte Energia água potável e outros serviços para 635 famílias da Volta Grande do Xingu. O órgão relatou poços e cacimbas secos e problemas nas medidas de abastecimento. Trata-se de alegações e pedidos de uma ação civil pública. [16]",
        },
        {
          t: "p",
          texto: "Há também uma decisão judicial documentada. Em dezembro de 2025, a Justiça Federal determinou que Norte Energia e Ibama revisassem o modelo de vazão, reconhecendo danos à vida aquática, à navegação e às comunidades. A notícia do MPF destaca seca de igapós e prejuízos à reprodução dos peixes. [17]",
        },
        {
          t: "p",
          texto: "Para uma comunidade que depende do rio, menos água pode comprometer o deslocamento, a pesca e o preparo dos alimentos. O exemplo mostra como uma mudança planejada para gerar energia pode transferir parte de seus custos à vida cotidiana. Não se deve confundir o impacto do desvio de água de Belo Monte com o desmatamento no entorno das aldeias Kalapalo relatado na parte anterior: são processos e localidades distintos.",
        },
        {
          t: "nota",
          texto: "Caso documentado: Norte Energia e Belo Monte. Autorização histórica: Fainguelernt, 2016 [15]. Impactos e cobrança: MPF, 18 jun. 2026 [16]. Decisão sobre vazão: MPF, 16 dez. 2025 [17].",
        },
        { t: "inter", texto: "Belo Sun e a disputa por um projeto de mineração" },
        {
          t: "p",
          texto: "A Belo Sun pretende desenvolver o Projeto Volta Grande de mineração de ouro, também no Pará. Aqui, o debate envolve os riscos da instalação e quem deve participar da avaliação. Em abril de 2026, o MPF contestou a retomada da licença e apontou lacunas nas exigências socioambientais. Em reunião com o órgão, lideranças Xikrin e da comunidade de Marapanim alertaram para riscos e falhas na consulta às populações atingidas. Essas posições não equivalem a uma condenação definitiva da empresa. [18; 19]",
        },
        {
          t: "p",
          texto: "A empresa afirma que o licenciamento é realizado por etapas, condicionado a estudos e aprovações, e que o projeto não prevê captação ou desvio de água do Rio Xingu. Em junho de 2026, o TRF1 registrou uma conciliação sobre a inclusão de comunidades no Plano Básico Ambiental: a empresa assumiu o compromisso de não fazer intervenções físicas de instalação durante o período de negociação estabelecido. O MPF não aderiu ao acordo. [27; 28]",
        },
        {
          t: "p",
          texto: "Esses registros mostram uma disputa sobre salvaguardas, não um caso em que esta revista possa afirmar que todos os danos temidos já ocorreram. A pergunta central é preventiva: antes de modificar o território, quais estudos existem, quais comunidades foram consideradas e como seus direitos serão protegidos?",
        },
        {
          t: "nota",
          texto: "Caso documentado: Belo Sun. Posições do MPF e das lideranças em abril de 2026 [18; 19]; manifestação empresarial de maio [27]; conciliação registrada pelo TRF1 em junho [28]. Os fatos são apresentados com suas datas e não como um boletim da situação processual atual.",
        },
        { t: "inter", texto: "Se há impactos por que a retirada pode ser autorizada" },
        {
          t: "p",
          texto: "A legislação não proíbe toda mudança no uso do solo. O Código Florestal prevê autorização prévia para supressão de vegetação nativa destinada a uso alternativo do solo. Em Áreas de Preservação Permanente, as hipóteses são mais restritas, como utilidade pública, interesse social ou baixo impacto previstos na lei. Ter a propriedade ou estar inscrito no Cadastro Ambiental Rural não é, por si só, permissão para derrubar a vegetação. [21]",
        },
        {
          t: "p",
          texto: "No licenciamento federal, o Ibama utiliza a Autorização de Supressão de Vegetação, a ASV, para controlar essa intervenção em empreendimentos de interesse público ou social. O órgão exige processo de licenciamento ativo e documentação específica de flora. Assim, a autorização ambiental não é uma declaração de que a intervenção não terá efeitos: ela estabelece os limites e controles para a atividade. [20]",
        },
        {
          t: "p",
          texto: "A proteção das comunidades é outra obrigação. A Convenção 169 da OIT prevê consulta aos povos interessados, por procedimentos adequados e por suas instituições representativas, quando medidas possam afetá-los diretamente. A consulta deve ocorrer de boa-fé e buscar acordo ou consentimento. Não se reduz a informar uma decisão pronta, nem deve ser confundida com uma audiência genérica. [22]",
        },
        { t: "inter", texto: "Qual é a motivação econômica e política" },
        {
          t: "p",
          texto: "Empresas buscam viabilizar atividades que geram receita, como vender energia ou explorar minérios. Para governos, os argumentos podem envolver abastecimento, infraestrutura e desenvolvimento. No caso de Belo Monte, o Ministério de Minas e Energia justificou a autorização de enchimento em 2015 pela necessidade de energia renovável, custos e suporte ao desenvolvimento. Essa é uma justificativa oficial identificável, não uma suposição sobre intenções ocultas. [25]",
        },
        {
          t: "p",
          texto: "A disputa pela vazão mostra o conflito de forma concreta: reservar mais água para manter o rio vivo reduz a parcela disponível às turbinas. Em 2025, o TCU discutiu efeitos dessa decisão sobre geração, uso de termelétricas e tarifas. O documento coloca lado a lado a preservação ambiental, as atividades tradicionais e os custos do sistema elétrico. [23]",
        },
        {
          t: "p",
          texto: "Nossa leitura é que a decisão pública envolve uma disputa sobre quais benefícios e perdas recebem mais peso. Os ganhos de um projeto podem chegar a consumidores e investidores, enquanto seus efeitos se concentram nas comunidades do território. Isso ajuda a explicar por que conhecer um risco não leva automaticamente à rejeição de uma obra. Não justifica ignorar direitos: exige avaliar alternativas, cumprir condições e assegurar participação.",
        },
        { t: "inter", texto: "Quando acontece ilegalmente a explicação é outra" },
        {
          t: "p",
          texto: "Desmatamento sem autorização ou em desacordo com seus limites não se torna permitido porque uma autoridade sabe que ele existe. O TCU identificou dificuldades de coordenação, recursos e pessoal na fiscalização, além de problemas de gestão fundiária que favorecem a grilagem. São falhas de controle que ajudam a explicar a continuidade de danos ilegais. [24]",
        },
        {
          t: "p",
          texto: "É preciso distinguir, portanto, intervenção autorizada, autorização questionada e atividade ilegal. A primeira exige avaliar se os controles protegem de fato o território; a segunda envolve contestação técnica ou judicial; a terceira exige fiscalização e responsabilização. Os casos desta matéria mostram por que o nome de uma empresa deve vir acompanhado de documentos, da intervenção específica e da situação em que ela foi identificada.",
        },
        { t: "inter", texto: "Uma fonte renovável também precisa de avaliação" },
        {
          t: "p",
          texto: "Reservatórios hidrelétricos podem emitir metano pela decomposição de matéria orgânica. A quantidade varia conforme características e condições de cada reservatório; não foi encontrada nesta pesquisa uma medição que permita atribuir um valor específico a Belo Monte. O ponto é que renovável não significa ausência de emissões ou de efeitos territoriais. [26]",
        },
        {
          t: "p",
          texto: "Por fim, a falta de planejamento urbano pertence a outra dimensão do problema: ela amplia exposição e vulnerabilidade a enchentes, deslizamentos e calor. Não deve ser misturada ao ranking de setores emissores. Conectar essas dimensões significa investigar tanto o que intensifica o aquecimento quanto o que deixa algumas pessoas sem proteção.",
        },
        {
          t: "p",
          texto: "A questão que atravessa a revista é quem recebe os benefícios das escolhas econômicas e quem enfrenta seus custos. Reduzir gases de efeito estufa e proteger os direitos das comunidades são partes da mesma resposta, mas nenhuma delas pode ser presumida apenas porque um empreendimento tem uma licença.",
        },
      ],
    },
    {
      numero: 4,
      titulo: "Finalização",
      linhaFina: "Enfrentar a crise com justiça",
      cor: "#2e2a28",
      blocos: [
        { t: "inter", texto: "O que significa enfrentar a crise com justiça" },
        {
          t: "p",
          texto: "Justiça climática significa levar em conta quem contribui para o problema, quem sofre seus impactos e quem participa das decisões. Uma política pode reduzir emissões e ainda distribuir seus custos de forma injusta. Também pode oferecer o mesmo apoio a todos e deixar para trás quem enfrenta perdas maiores e dispõe de menos recursos.",
        },
        {
          t: "p",
          texto: "Por isso, igualdade e equidade não se confundem. Oferecer a mesma quantia a duas famílias não garante a mesma possibilidade de recuperação se uma perdeu a moradia e a outra tem recursos próprios. A equidade exige considerar necessidades e condições de partida, sem tratar as populações afetadas apenas como destinatárias de ajuda.",
        },
        {
          t: "p",
          texto: "A contribuição de Nancy Fraser ajuda a conectar redistribuição, reconhecimento e representação: como se distribuem recursos e danos, quais modos de vida são respeitados e quem tem voz. Robert Bullard, Henri Acselrad e Selene Herculano contribuem para a leitura das relações entre riscos ambientais e desigualdade. Carlos Walter Porto-Gonçalves ajuda a compreender o território como espaço de vida e de poder. Esses conceitos ajudam a interpretar os conflitos entre proteção ambiental, direitos territoriais e distribuição de recursos.",
        },
        {
          t: "p",
          texto: "Uma resposta coerente precisa reduzir emissões nas cadeias produtivas, proteger florestas e ampliar a capacidade de adaptação. Precisa também garantir moradia segura, saneamento, informação acessível, atendimento de saúde e participação das comunidades nas decisões. A análise das grandes empresas deve cobrar transparência sobre produção, fornecedores e compromissos, com evidências que permitam acompanhar resultados.",
        },
        {
          t: "p",
          texto: "A casa de uma família não volta a existir quando sai do noticiário. A dificuldade de Júlia em encontrar onde morar e a lembrança de Rosely diante do território queimado mostram que o desastre permanece na vida de quem o atravessou. A recuperação precisa reconhecer essas pessoas como sujeitos de direitos, com histórias, escolhas e vínculos.",
        },
        {
          t: "p",
          texto: "A crise climática não termina na contagem de toneladas emitidas. Ela alcança a água disponível, a comida, a saúde e a possibilidade de continuar vivendo em um território. Enfrentá-la com justiça é reduzir o dano na origem e garantir que a proteção chegue a quem mais precisa. Nenhuma meta climática está completa se as pessoas afetadas continuam sem condições de reconstruir a própria vida.",
        },
      ],
    },
  ],
  fontes: {
    titulo: "Fontes e notas para a edição",
    intro: "Os números mantêm seus anos de referência. Os relatos são de fontes publicadas e estão identificados junto ao texto; não foram realizados pelo grupo. Links consultados em 14 de outubro de 2026. Esta seção acompanha o texto como apoio à checagem e à diagramação.",
    itens: [
      {
        n: 1,
        texto: "IPCC. Climate Change 2023 — Synthesis Report. Síntese científica sobre causas, impactos e respostas.",
        url: "https://www.ipcc.ch/report/ar6/syr/longer-report/",
      },
      {
        n: 2,
        texto: "Observatório do Clima. SEEG, coleção 13. Análise das emissões de gases de efeito estufa e suas implicações para as metas climáticas do Brasil, ano-base 2024.",
        url: "https://seeg.eco.br/wp-content/uploads/2026/03/SEEG13-relatorio-analitico-BR.pdf",
      },
      {
        n: 3,
        texto: "O Globo. “No dia seguinte, vi tudo acabado, queimado”, diz sobrevivente de incêndio no Pantanal. 27 jul. 2024. Fala de Rosely.",
        url: "https://oglobo.globo.com/brasil/noticia/2024/07/27/no-dia-seguinte-vi-tudo-acabado-queimado-diz-sobrevivente-de-incendio-no-pantanal.ghtml",
      },
      {
        n: 4,
        texto: "Governo Federal. Brasil entrega à ONU nova NDC alinhada ao Acordo de Paris. Nov. 2024.",
        url: "https://www.gov.br/povosindigenas/pt-br/assuntos/noticias/2024/11/brasil-entrega-a-onu-nova-ndc-alinhada-ao-acordo-de-paris",
      },
      {
        n: 5,
        texto: "IBGE. Rendimento domiciliar per capita e Coeficiente de Desequilíbrio Regional de 2023.",
        url: "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/40201-ibge-divulga-o-rendimento-domiciliar-per-capita-e-o-coeficiente-de-desequilibrio-regional-de-2023",
      },
      {
        n: 6,
        texto: "IBGE. Síntese de Indicadores Sociais — dados de 2019, divulgação em 12 nov. 2020.",
        url: "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/29431-sintese-de-indicadores-sociais-em-2019-proporcao-de-pobres-cai-para-24-7-e-extrema-pobreza-se-mantem-em-6-5-da-populacao",
      },
      {
        n: 7,
        texto: "IBGE. Censo Demográfico 2022 — Favelas e Comunidades Urbanas.",
        url: "https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv102170.pdf",
      },
      {
        n: 8,
        texto: "Agência Brasil. Devastada pela água, Roca Sales vive entre migração e reconstrução. 23 jun. 2024. Reprodução consultada no UOL.",
        url: "https://noticias.uol.com.br/ultimas-noticias/agencia-brasil/2024/06/23/devastada-pela-agua-roca-sales-vive-entre-migracao-e-reconstrucao.htm",
      },
      {
        n: 9,
        texto: "Cidacs/Fiocruz Bahia. Mudanças Climáticas e risco à infância — aumento da temperatura ambiente eleva chance de desnutrição infantil. 27 mar. 2026.",
        url: "https://cidacs.bahia.fiocruz.br/2026/03/mudancas-climaticas-e-risco-a-infancia-aumento-da-temperatura-ambiente-eleva-chance-de-desnutricao-infantil/",
      },
      {
        n: 10,
        texto: "Carbon Majors / InfluenceMap. Carbon Majors — 2024 Data Update. Dados sobre produção e emissões empresariais.",
        url: "https://carbonmajors.org/briefing/Carbon-Majors-2024-Data-Update-35466",
      },
      {
        n: 11,
        texto: "Nações Unidas. Causas e efeitos das mudanças climáticas.",
        url: "https://www.un.org/pt/climatechange/science/causes-effects-climate-change",
      },
      {
        n: 12,
        texto: "EPE. Relatório Síntese do Balanço Energético Nacional 2025 — dados de 2024.",
        url: "https://www.epe.gov.br/pt/imprensa/noticias/epe-publica-o-relatorio-sintese-do-balanco-energetico-nacional-2025",
      },
      {
        n: 13,
        texto: "FÁBIO, André Cabette. Indígenas brasileiros enfrentam floresta amazônica secando. Thomson Reuters Foundation/Context; ((o))eco, 20 out. 2025.",
        url: "https://oeco.org.br/reportagens/indigenas-brasileiros-enfrentam-floresta-amazonica-secando/",
      },
      {
        n: 14,
        texto: "MORAIS, Alice Martins; MELO, Matheus. Mudanças climáticas afetam comunidades do Marajó. ((o))eco, 25 out. 2024.",
        url: "https://oeco.org.br/fotografia/mudancas-climaticas-afetam-comunidades-do-marajo/",
      },
      {
        n: 15,
        texto: "FAINGUELERNT, Maíra Borges. A trajetória histórica do processo de licenciamento ambiental da usina hidrelétrica de Belo Monte. Ambiente & Sociedade, v. XIX, n. 2, p. 247–266, 2016.",
        url: "https://www.scielo.br/j/asoc/a/ThnyR8RrxkcBNSqVGKKxqqP/?format=pdf&lang=pt",
      },
      {
        n: 16,
        texto: "MPF. Pedidos para garantir água, saneamento e comunicação a famílias atingidas por Belo Monte. 18 jun. 2026.",
        url: "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/mpf-reforca-pedidos-para-garantir-agua-saneamento-e-comunicacao-a-familias-atingidas-por-belo-monte-no-para",
      },
      {
        n: 17,
        texto: "MPF. Justiça Federal ordena revisão do fluxo de água da UHE de Belo Monte. 16 dez. 2025.",
        url: "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/justica-federal-atende-mpf-e-ordena-revisao-urgente-do-fluxo-de-agua-da-uhe-de-belo-monte-pa",
      },
      {
        n: 18,
        texto: "MPF. Oposição à retomada do Projeto Volta Grande e alegado descumprimento de condicionantes. 8 abr. 2026.",
        url: "https://www.mpf.mp.br/o-mpf/unidades/prr1/noticias/abril-indigena-mpf-se-opoe-a-retomada-do-projeto-volta-grande-do-xingu-pa-e-aponta-descumprimento-de-condicionantes-indigenas",
      },
      {
        n: 19,
        texto: "MPF. Lideranças pedem suspensão do Projeto Volta Grande por risco de danos irreversíveis. 10 abr. 2026.",
        url: "https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/abril-indigena-liderancas-pedem-suspensao-imediata-do-projeto-volta-grande-do-xingu-por-risco-de-danos-irreversiveis",
      },
      {
        n: 20,
        texto: "Ibama. Autorização de Supressão de Vegetação — ASV.",
        url: "https://www.gov.br/ibama/pt-br/servicos/autorizacoes/flora/asv",
      },
      {
        n: 21,
        texto: "BRASIL. Lei 12.651/2012 — Código Florestal. Especialmente artigos 8, 26 e 29.",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm",
      },
      {
        n: 22,
        texto: "BRASIL. Decreto 10.088/2019, Anexo LXXII — Convenção 169 da OIT. Especialmente artigos 6 e 7.",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10088.htm",
      },
      {
        n: 23,
        texto: "TCU. Impasse sobre definição do hidrograma de Belo Monte. Ago. 2025.",
        url: "https://portal.tcu.gov.br/imprensa/noticias/tcu-analisa-impasse-sobre-definicao-do-hidrograma-de-belo-monte",
      },
      {
        n: 24,
        texto: "TCU. Lista de Alto Risco — Controle do desmatamento ilegal na Amazônia.",
        url: "https://sites.tcu.gov.br/listadealtorisco/controle_do_desmatamento_ilegal_na_amazonia.html",
      },
      {
        n: 25,
        texto: "Ministério de Minas e Energia. Ibama autoriza enchimento de Belo Monte. Nov. 2015. Justificativa oficial para o empreendimento.",
        url: "https://www.gov.br/mme/pt-br/assuntos/noticias/ibama-autoriza-enchimento-de-belo-monte/",
      },
      {
        n: 26,
        texto: "Observatório do Clima / SEEG. Desafios e oportunidades para redução das emissões de metano no Brasil. 2024.",
        url: "https://seeg.eco.br/wp-content/uploads/2024/03/SEEG-METANO.pdf",
      },
      {
        n: 27,
        texto: "Belo Sun. Nota sobre licenciamento faseado do Projeto Volta Grande. 21 maio 2026. Posição da empresa.",
        url: "https://belosun.com.br/nota/",
      },
      {
        n: 28,
        texto: "TRF1. Conciliação sobre licença ambiental da Belo Sun. 26 jun. 2026.",
        url: "https://www.trf1.jus.br/trf1/noticias/conciliacao-do-trf1-promove-acordo-entre-partes-sobre-licenca-ambiental-de-mineradora-no-para-",
      },
    ],
    notas: [
      {
        titulo: "Referencial sociológico da pesquisa",
        texto: [
          "Marx, Weber, Bourdieu, Fraser, Bullard, Kowarick, Acselrad, Rolnik, Porto-Gonçalves, Lefebvre e Herculano foram preservados pelos conceitos que ajudam a interpretar os casos. O arquivo original não informa referências bibliográficas completas, edições e páginas para todos eles. As aplicações no texto são interpretações editoriais; não são citações literais nem declarações de que esses autores formularam, todos, uma teoria de justiça climática.",
        ],
      },
      {
        titulo: "Critérios de checagem da edição",
        texto: [
          "Os relatos de Xingu, Marajó, Pantanal e Rio Grande do Sul são de reportagens, não de entrevistas realizadas pelo grupo. Casos empresariais distinguem autorizações, decisões judiciais, alegações do MPF e posições das empresas. As relações entre interesses econômicos e distribuição dos danos são interpretações editoriais apoiadas nesses registros.",
          "Foi adotada a distribuição das emissões brutas do SEEG para 2024. Os valores de 38% de uso da terra e 23% de energia, sem ano e base compatíveis no material enviado, não foram combinados com essa série. Em 2024, energia não foi o segundo maior setor no recorte bruto: ficou atrás de uso da terra e agropecuária.",
          "O total energético da EPE, 431,3 MtCO₂e, é apresentado separadamente das estimativas do SEEG. Não foi acrescentado às emissões nacionais nem usado para recalcular seus percentuais. A presença de fontes renováveis na matriz energética e na matriz elétrica também não foi tratada como a mesma medida.",
          "As contagens de desastres de 2020 a 2023 e de mortes por calor de 2000 a 2018 não entraram como fatos confirmados, pois os trechos enviados não identificam completamente os estudos. Comparar quatro anos com uma década exige explicitar períodos e taxas; estimativas de mortes associadas ao calor não equivalem necessariamente a mortes registradas como ondas de calor.",
          "A alegação de que 74% da redução de chuvas decorreu do desmatamento não foi reproduzida sem consultar o estudo científico e seu recorte. O mesmo vale para generalizações de ausência de consulta em todos os grandes empreendimentos ou para atribuição de danos do Xingu a uma empresa não identificada pela reportagem.",
          "Os marcos de licenciamento da Belo Sun são apresentados com datas, sem afirmar um desfecho judicial atual. O compromisso de junho tinha prazo próprio; não foi descrito como suspensão permanente. A edição não afirma que o projeto já provocou todos os impactos temidos pelas comunidades.",
        ],
      },
    ],
  },
  contracapa: {
    texto: "Nenhuma meta climática está completa se as pessoas afetadas continuam sem condições de reconstruir a própria vida.",
    cor: "#1f3a5f",
  },
};
