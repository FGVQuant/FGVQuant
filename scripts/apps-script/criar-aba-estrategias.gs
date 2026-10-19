/**
 * Uso único: cria a aba "Estratégias" na planilha do site, já com Pairs trading e Momentum como estão
 * hoje na página do fundo.
 * Extensões → Apps Script → cole este arquivo como um arquivo novo → escolha criarAbaEstrategias → Executar.
 * Se a aba já existir, o script não mexe em nada. Depois, este arquivo pode ser apagado do projeto do Apps Script.
 *
 * Colunas (o site lê pelo nome, na linha 4). Uma linha por estratégia; a ordem das linhas é a ordem na página.
 *  Estratégia               nome, obrigatório. "Pairs trading" e "Momentum" ligam a estratégia às tabelas do fundo
 *  Estratégia (inglês)      opcional; vazio = mesmo nome
 *  Status                   Ativa ou Encerrada. Só as ativas aparecem no site
 *  Resumo                   uma ou duas frases sob o título, obrigatório
 *  Resumo (inglês)
 *  Regras                   uma regra por linha (Ctrl+Enter quebra a linha na célula), no formato "Título: texto"
 *  Regras (inglês)          mesmo número de linhas que "Regras"
 *  Exposição comprada (%)   opcional, % do patrimônio na ponta comprada (ex.: 150). Com as duas colunas
 *  Exposição vendida (%)    preenchidas, a página desenha as barras de exposição
 */

const COLUNAS_ESTRATEGIAS = [
  "Estratégia",
  "Estratégia (inglês)",
  "Status",
  "Resumo",
  "Resumo (inglês)",
  "Regras",
  "Regras (inglês)",
  "Exposição comprada (%)",
  "Exposição vendida (%)",
];

const ESTRATEGIAS = [
  [
    "Pairs trading",
    "Pairs trading",
    "Ativa",
    "Uma estratégia de valor relativo: em vez de prever se o mercado sobe ou cai, ela aposta que a relação entre dois ativos parecidos volta ao normal.",
    "A relative-value strategy: instead of forecasting whether the market rises or falls, it bets that the relationship between two similar assets returns to normal.",
    "Universo de pares: Partimos de ações líquidas e buscamos pares com cointegração estatisticamente significativa e baixo SSD (soma das distâncias quadráticas entre os preços normalizados): ativos que historicamente se movem juntos.\nSinal: Para cada par, acompanhamos o spread entre os dois preços e o padronizamos em um z-score. Quanto mais longe de zero, maior o desvio em relação à relação histórica.\nEntrada e saída: A posição é aberta quando o z-score passa de cerca de 2 desvios-padrão: compramos o ativo relativamente barato e vendemos o caro. Ela é encerrada quando o spread volta para perto de 0,5 desvio.\nGestão das posições: Posições abertas podem atravessar a virada do mês (carry-over), com limite de 42 pregões. Pares selecionados que não atingem o gatilho de entrada não são operados.\nCustos: A simulação desconta 2,5 bps por entrada e por saída e 2 bps por dia sobre as posições vendidas, como aproximação do custo de aluguel.",
    "Pair universe: We start from liquid stocks and look for pairs with statistically significant cointegration and a low SSD (sum of squared distances between normalized prices): assets that have historically moved together.\nSignal: For each pair, we track the spread between the two prices and standardize it into a z-score. The further from zero, the larger the deviation from the historical relationship.\nEntry and exit: A position opens when the z-score moves past about 2 standard deviations: we buy the relatively cheap asset and sell the expensive one. It closes when the spread comes back to around 0.5 standard deviations.\nPosition management: Open positions can roll over the month end (carry-over), for up to 42 trading days. Selected pairs that never hit the entry trigger are not traded.\nCosts: The simulation charges 2.5 bps per entry and per exit, plus 2 bps per day on short positions as an approximation of borrow costs.",
    "",
    "",
  ],
  [
    "Momentum",
    "Momentum",
    "Ativa",
    "Uma estratégia de tendência: ela ordena as ações pela força do desempenho recente, compra as mais fortes e vende as mais fracas.",
    "A trend strategy: it ranks stocks by the strength of their recent performance, buys the strongest and sells the weakest.",
    "Ranking: Todo mês, as ações do universo são ordenadas por um score de momentum, que mede a força do desempenho relativo recente.\nCarteira long-short: Compramos os papéis de maior score e vendemos os de menor. A configuração recente usa 15 papéis em cada ponta, 30 posições no total.\nPesos assimétricos: A ponta comprada recebe 1,5x e a vendida 0,5x. O fundo fica líquido comprado no mercado, e a ponta vendida busca ganhar com a queda dos papéis mais fracos.\nRebalanceamento: Todas as posições são refeitas no primeiro pregão do mês. O tamanho da carteira e os pesos são revisados periodicamente pela gestão.",
    "Ranking: Every month, the stocks in the universe are ranked by a momentum score that measures the strength of recent relative performance.\nLong-short portfolio: We buy the highest-scoring names and sell the lowest-scoring ones. The recent configuration holds 15 names on each side, 30 positions in total.\nAsymmetric weights: The long leg gets 1.5x and the short leg 0.5x. The fund stays net long the market, while the short leg aims to profit from the weakest names falling.\nRebalancing: Every position is rebuilt on the first trading day of the month. Portfolio size and weights are reviewed periodically by the managers.",
    150,
    50,
  ],
];

function criarAbaEstrategias() {
  const ss = SpreadsheetApp.getActive();
  if (ss.getSheetByName("Estratégias")) {
    ss.toast("A aba 'Estratégias' já existe; nada foi alterado.", "Pronto", 10);
    return;
  }
  const modelo = ss.getSheetByName("Competições");
  const listas = ss.getSheetByName("Listas");
  const aba = ss.insertSheet("Estratégias", listas ? listas.getIndex() - 1 : ss.getNumSheets());
  const n = COLUNAS_ESTRATEGIAS.length;

  // mesmo visual das outras abas: título, descrição e cabeçalho copiados de "Competições"
  if (modelo)
    modelo
      .getRange(1, 1, 4, n)
      .copyTo(aba.getRange(1, 1, 4, n), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  aba
    .getRange("A1:A2")
    .setValues([
      ["Estratégias do fundo"],
      ["Uma linha por estratégia, na ordem da página. Só as com Status 'Ativa' aparecem no site."],
    ]);
  aba.getRange(4, 1, 1, n).setValues([COLUNAS_ESTRATEGIAS]);
  aba.getRange(5, 1, ESTRATEGIAS.length, n).setValues(ESTRATEGIAS);
  aba
    .getRange("C5:C")
    .setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(["Ativa", "Encerrada"], true).build(),
    );
  [150, 150, 100, 320, 320, 520, 520, 120, 120].forEach((w, i) => aba.setColumnWidth(i + 1, w));
  aba.getRange(5, 1, ESTRATEGIAS.length, n).setWrap(true).setVerticalAlignment("top");
  aba.setFrozenRows(4);
  ss.setActiveSheet(aba);
  ss.toast("Aba 'Estratégias' criada com " + ESTRATEGIAS.length + " estratégias.", "Pronto", 10);
}
