// Páginas do PDF como imagens (geradas por ferramentas/pdf-para-imagens.ps1) e os links
// de cada página (ferramentas/links-do-pdf.py). Coordenadas dos links em 0–1 da página.
// Não edite à mão: gere de novo quando o PDF mudar.

const PAGINAS_PDF = [
  {
    "imagem": "paginas/pagina-01.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-02.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-03.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-04.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-05.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-06.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-07.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-08.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-09.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-10.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-11.png",
    "links": []
  },
  {
    "imagem": "paginas/pagina-12.png",
    "links": [
      {
        "x0": 0.0963,
        "x1": 0.4107,
        "y0": 0.1898,
        "y1": 0.217,
        "url": "https://www.ipcc.ch/report/ar6/syr/longer-report/"
      },
      {
        "x0": 0.0963,
        "x1": 0.6095,
        "y0": 0.2602,
        "y1": 0.2874,
        "url": "https://seeg.eco.br/wp-content/uploads/2026/03/SEEG13-relatorio-analitico-BR.pdf"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.3306,
        "y1": 0.3451,
        "url": "https://oglobo.globo.com/brasil/noticia/2024/07/27/no-dia-seguinte-vi-tudo-acabado-queimado-diz-sobrevivente-de-incendio-no-pantanal.ghtml"
      },
      {
        "x0": 0.0963,
        "x1": 0.1947,
        "y0": 0.3451,
        "y1": 0.3723,
        "url": "https://oglobo.globo.com/brasil/noticia/2024/07/27/no-dia-seguinte-vi-tudo-acabado-queimado-diz-sobrevivente-de-incendio-no-pantanal.ghtml"
      },
      {
        "x0": 0.0963,
        "x1": 0.8853,
        "y0": 0.3977,
        "y1": 0.4249,
        "url": "https://www.gov.br/povosindigenas/pt-br/assuntos/noticias/2024/11/brasil-entrega-a-onu-nova-ndc-alinhada-ao-acordo-de-paris"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.4503,
        "y1": 0.4648,
        "url": "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/40201-ibge-divulga-o-rendimento-domiciliar-per-capita-e-o-coeficiente-de-desequilibrio-regional-de-2023"
      },
      {
        "x0": 0.0963,
        "x1": 0.6069,
        "y0": 0.4648,
        "y1": 0.492,
        "url": "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/40201-ibge-divulga-o-rendimento-domiciliar-per-capita-e-o-coeficiente-de-desequilibrio-regional-de-2023"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.5174,
        "y1": 0.532,
        "url": "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/29431-sintese-de-indicadores-sociais-em-2019-proporcao-de-pobres-cai-para-24-7-e-extrema-pobreza-se-mantem-em-6-5-da-populacao"
      },
      {
        "x0": 0.0963,
        "x1": 0.7424,
        "y0": 0.532,
        "y1": 0.5592,
        "url": "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/29431-sintese-de-indicadores-sociais-em-2019-proporcao-de-pobres-cai-para-24-7-e-extrema-pobreza-se-mantem-em-6-5-da-populacao"
      },
      {
        "x0": 0.0963,
        "x1": 0.5187,
        "y0": 0.5845,
        "y1": 0.6117,
        "url": "https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv102170.pdf"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.6549,
        "y1": 0.6695,
        "url": "https://noticias.uol.com.br/ultimas-noticias/agencia-brasil/2024/06/23/devastada-pela-agua-roca-sales-vive-entre-migracao-e-reconstrucao.htm"
      },
      {
        "x0": 0.0963,
        "x1": 0.2105,
        "y0": 0.6695,
        "y1": 0.6967,
        "url": "https://noticias.uol.com.br/ultimas-noticias/agencia-brasil/2024/06/23/devastada-pela-agua-roca-sales-vive-entre-migracao-e-reconstrucao.htm"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.7399,
        "y1": 0.7544,
        "url": "https://cidacs.bahia.fiocruz.br/2026/03/mudancas-climaticas-e-risco-a-infancia-aumento-da-temperatura-ambiente-eleva-chance-de-desnutricao-infantil/"
      },
      {
        "x0": 0.0963,
        "x1": 0.2461,
        "y0": 0.7544,
        "y1": 0.7816,
        "url": "https://cidacs.bahia.fiocruz.br/2026/03/mudancas-climaticas-e-risco-a-infancia-aumento-da-temperatura-ambiente-eleva-chance-de-desnutricao-infantil/"
      },
      {
        "x0": 0.0963,
        "x1": 0.5603,
        "y0": 0.8248,
        "y1": 0.852,
        "url": "https://carbonmajors.org/briefing/Carbon-Majors-2024-Data-Update-35466"
      },
      {
        "x0": 0.0963,
        "x1": 0.5713,
        "y0": 0.8774,
        "y1": 0.9046,
        "url": "https://www.un.org/pt/climatechange/science/causes-effects-climate-change"
      }
    ]
  },
  {
    "imagem": "paginas/pagina-13.png",
    "links": [
      {
        "x0": 0.0963,
        "x1": 0.8008,
        "y0": 0.0981,
        "y1": 0.1253,
        "url": "https://www.epe.gov.br/pt/imprensa/noticias/epe-publica-o-relatorio-sintese-do-balanco-energetico-nacional-2025"
      },
      {
        "x0": 0.0963,
        "x1": 0.6726,
        "y0": 0.1685,
        "y1": 0.1957,
        "url": "https://oeco.org.br/reportagens/indigenas-brasileiros-enfrentam-floresta-amazonica-secando/"
      },
      {
        "x0": 0.0963,
        "x1": 0.6181,
        "y0": 0.2389,
        "y1": 0.266,
        "url": "https://oeco.org.br/fotografia/mudancas-climaticas-afetam-comunidades-do-marajo/"
      },
      {
        "x0": 0.0963,
        "x1": 0.603,
        "y0": 0.3092,
        "y1": 0.3364,
        "url": "https://www.scielo.br/j/asoc/a/ThnyR8RrxkcBNSqVGKKxqqP/?format=pdf&lang=pt"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.3796,
        "y1": 0.3942,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/mpf-reforca-pedidos-para-garantir-agua-saneamento-e-comunicacao-a-familias-atingidas-por-belo-monte-no-para"
      },
      {
        "x0": 0.0963,
        "x1": 0.3595,
        "y0": 0.3942,
        "y1": 0.4214,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/mpf-reforca-pedidos-para-garantir-agua-saneamento-e-comunicacao-a-familias-atingidas-por-belo-monte-no-para"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.4467,
        "y1": 0.4613,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/justica-federal-atende-mpf-e-ordena-revisao-urgente-do-fluxo-de-agua-da-uhe-de-belo-monte-pa"
      },
      {
        "x0": 0.0963,
        "x1": 0.2399,
        "y0": 0.4613,
        "y1": 0.4885,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/pr-pa/noticias/justica-federal-atende-mpf-e-ordena-revisao-urgente-do-fluxo-de-agua-da-uhe-de-belo-monte-pa"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.5317,
        "y1": 0.5462,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/prr1/noticias/abril-indigena-mpf-se-opoe-a-retomada-do-projeto-volta-grande-do-xingu-pa-e-aponta-descumprimento-de-condicionantes-indigenas"
      },
      {
        "x0": 0.0963,
        "x1": 0.4598,
        "y0": 0.5462,
        "y1": 0.5734,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/prr1/noticias/abril-indigena-mpf-se-opoe-a-retomada-do-projeto-volta-grande-do-xingu-pa-e-aponta-descumprimento-de-condicionantes-indigenas"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.6166,
        "y1": 0.6312,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/abril-indigena-liderancas-pedem-suspensao-imediata-do-projeto-volta-grande-do-xingu-por-risco-de-danos-irreversiveis"
      },
      {
        "x0": 0.0963,
        "x1": 0.5567,
        "y0": 0.6312,
        "y1": 0.6584,
        "url": "https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/abril-indigena-liderancas-pedem-suspensao-imediata-do-projeto-volta-grande-do-xingu-por-risco-de-danos-irreversiveis"
      },
      {
        "x0": 0.0963,
        "x1": 0.4952,
        "y0": 0.6837,
        "y1": 0.7109,
        "url": "https://www.gov.br/ibama/pt-br/servicos/autorizacoes/flora/asv"
      },
      {
        "x0": 0.0963,
        "x1": 0.5595,
        "y0": 0.7363,
        "y1": 0.7635,
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm"
      },
      {
        "x0": 0.0963,
        "x1": 0.5962,
        "y0": 0.7889,
        "y1": 0.8161,
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10088.htm"
      },
      {
        "x0": 0.0963,
        "x1": 0.7731,
        "y0": 0.8414,
        "y1": 0.8686,
        "url": "https://portal.tcu.gov.br/imprensa/noticias/tcu-analisa-impasse-sobre-definicao-do-hidrograma-de-belo-monte"
      },
      {
        "x0": 0.0963,
        "x1": 0.6721,
        "y0": 0.894,
        "y1": 0.9212,
        "url": "https://sites.tcu.gov.br/listadealtorisco/controle_do_desmatamento_ilegal_na_amazonia.html"
      }
    ]
  },
  {
    "imagem": "paginas/pagina-14.png",
    "links": [
      {
        "x0": 0.0963,
        "x1": 0.6774,
        "y0": 0.1159,
        "y1": 0.1431,
        "url": "https://www.gov.br/mme/pt-br/assuntos/noticias/ibama-autoriza-enchimento-de-belo-monte/"
      },
      {
        "x0": 0.0963,
        "x1": 0.5217,
        "y0": 0.1863,
        "y1": 0.2135,
        "url": "https://seeg.eco.br/wp-content/uploads/2024/03/SEEG-METANO.pdf"
      },
      {
        "x0": 0.0963,
        "x1": 0.2822,
        "y0": 0.2567,
        "y1": 0.2838,
        "url": "https://belosun.com.br/nota/"
      },
      {
        "x0": 0.0963,
        "x1": 0.9037,
        "y0": 0.3092,
        "y1": 0.3238,
        "url": "https://www.trf1.jus.br/trf1/noticias/conciliacao-do-trf1-promove-acordo-entre-partes-sobre-licenca-ambiental-de-mineradora-no-para-"
      },
      {
        "x0": 0.0963,
        "x1": 0.1351,
        "y0": 0.3238,
        "y1": 0.351,
        "url": "https://www.trf1.jus.br/trf1/noticias/conciliacao-do-trf1-promove-acordo-entre-partes-sobre-licenca-ambiental-de-mineradora-no-para-"
      }
    ]
  }
];
