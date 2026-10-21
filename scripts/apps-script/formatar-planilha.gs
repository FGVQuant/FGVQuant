/**
 * Menu Site → "Formatar abas": aplica o mesmo visual a todas as abas de conteúdo (as com cabeçalho na
 * linha 4). Pode rodar quantas vezes quiser: só mexe na aparência, nunca nos valores, nas listas suspensas
 * ou nos comentários que já existem. Fica no mesmo projeto do Apps Script que atualizar-site.gs.
 *
 * O padrão é o que a planilha já usava (ver a aba "Como usar"):
 *  - linha 1: título; linha 2: descrição em cinza; linha 4: cabeçalho;
 *  - cabeçalho roxo = preencha; lilás = tradução para o inglês ou cálculo automático (coluna com fórmula);
 *  - linhas alternadas em lilás bem claro, texto Arial 10 alinhado no topo;
 *  - larguras pelo tipo de coluna (textos longos largos, datas e números estreitos);
 *  - as 4 primeiras linhas e a 1ª coluna ficam congeladas.
 * Colunas que ainda não têm comentário ganham a explicação de EXPLICACOES, se houver.
 */

const ROXO = "#230042";
const LILAS = "#efe8f8";
const ZEBRA = "#f8f5fc";
const CINZA = "#8a8a8a";
const FORMULA_ZEBRA = "=MOD(ROW();2)=0";
const ABAS_SEM_FORMATO = ["Painel", "Como usar", "Listas"];

// largura (px) pelo nome da coluna, sem o " (inglês)"
const LARGURA = {
  Data: 95,
  Mês: 90,
  Edição: 90,
  Semestre: 85,
  Ano: 60,
  Nº: 50,
  Entrada: 85,
  Saída: 85,
  "Ingresso na FGV": 95,
  Curso: 150,
  Tipo: 120,
  Status: 110,
  Área: 140,
  Cargo: 120,
  Resultado: 110,
  "Equipe da liga?": 95,
  "Autorizou uso do nome?": 110,
  "Retorno (%)": 95,
  "Exposição comprada (%)": 120,
  "Exposição vendida (%)": 120,
  Nome: 180,
  Título: 260,
  Competição: 220,
  Equipe: 150,
  Organizador: 170,
  Empresa: 170,
  Estratégia: 170,
  Campo: 200,
  Valor: 360,
  Parceiro: 170,
  Parceiros: 180,
  Mentor: 150,
  Líder: 150,
  Local: 150,
  Personalidade: 150,
  Prêmio: 170,
  "Quem é": 260,
  Tags: 200,
  Foto: 170,
  Logo: 160,
  "Artigo (PDF)": 170,
  "Relatório (PDF)": 170,
  Link: 260,
  Fonte: 220,
  LinkedIn: 240,
  Site: 200,
  Resumo: 380,
  Descrição: 380,
  Depoimento: 460,
  Membros: 280,
  "O que fizemos juntos": 340,
  Regras: 460,
  Texto: 460,
};
const LARGURA_PADRAO = 150;
// textos muito longos ficam cortados na célula (o conteúdo continua inteiro): senão a linha fica gigante
const CORTAR = ["Texto", "Regras"];

const EXPLICACOES = {
  "Fundo mensal": {
    "Relatório (PDF)":
      "Nome do PDF do relatório de gestão deste mês, na pasta 'Fotos do site'. Opcional. O site oferece para download.",
  },
  Newsletter: {
    Edição: "mm/aaaa da edição. Obrigatório.",
    Link: "Publicação no LinkedIn ou no Substack. Obrigatório.",
    Nº: "Número da edição, se houver.",
    Título: 'Opcional. Vazio = "FGV Quant Insights: Mês de Ano".',
    Resumo:
      'Uma ou duas frases (até 400 caracteres), mostradas nos cards. Vazio = "resumo em breve".',
    Tags: "Separadas por ponto e vírgula. Ex.: Volatilidade; Opções",
    Personalidade: "A personalidade da edição, se houver.",
    Texto:
      "Resumo completo da página da edição, em markdown (- item, ## título, **negrito**, _itálico_).",
  },
  Estratégias: {
    Estratégia:
      'Nome. "Pairs trading" e "Momentum" ligam a estratégia às tabelas do fundo. Obrigatório.',
    Status: "Ativa ou Encerrada. Só as ativas aparecem no site.",
    Resumo: "Uma ou duas frases sob o título. Obrigatório.",
    Regras:
      'Uma regra por linha (Ctrl+Enter quebra a linha), no formato "Título: texto". Obrigatório.',
    "Regras (inglês)": "Mesmo número de linhas que 'Regras'.",
    "Exposição comprada (%)":
      "% do patrimônio na ponta comprada (ex.: 150). Preencha junto com a vendida.",
    "Exposição vendida (%)":
      "% do patrimônio na ponta vendida (ex.: 50). Com as duas, o site desenha as barras.",
  },
};

function formatarAbas() {
  const ss = SpreadsheetApp.getActive();
  const feitas = [];
  ss.getSheets().forEach((aba) => {
    if (ABAS_SEM_FORMATO.includes(aba.getName())) return;
    if (formatarAba(aba)) feitas.push(aba.getName());
  });
  ss.toast(feitas.length + " abas formatadas: " + feitas.join(", "), "Pronto", 10);
}

function formatarAba(aba) {
  const n = ultimaColuna(aba);
  if (n === 0) return false;
  const nome = aba.getName();
  const linhas = Math.max(aba.getMaxRows(), 303);
  if (aba.getMaxRows() < linhas) aba.insertRowsAfter(aba.getMaxRows(), linhas - aba.getMaxRows());
  const cabecalho = aba
    .getRange(4, 1, 1, n)
    .getValues()[0]
    .map((v) => String(v).trim());
  const formulas = aba.getRange(5, 1, 1, n).getFormulas()[0];

  // título, descrição e espaçador
  aba
    .getRange(1, 1)
    .setFontFamily("Arial")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor(ROXO);
  aba
    .getRange(2, 1)
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontWeight("normal")
    .setFontColor(CINZA);
  aba.getRange(1, 1, 3, n).setBackground(null).setWrap(false).setVerticalAlignment("middle");
  aba.setRowHeight(1, 40).setRowHeight(2, 20).setRowHeight(3, 12).setRowHeight(4, 42);

  // cabeçalho
  const head = aba.getRange(4, 1, 1, n);
  head
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontWeight("bold")
    .setWrap(true)
    .setVerticalAlignment("middle");
  cabecalho.forEach((col, i) => {
    const lilas = / \(inglês\)$/.test(col) || Boolean(formulas[i]);
    aba
      .getRange(4, i + 1)
      .setBackground(lilas ? LILAS : ROXO)
      .setFontColor(lilas ? ROXO : "#ffffff");
  });

  // corpo
  const corpo = aba.getRange(5, 1, linhas - 4, n);
  corpo.setFontFamily("Arial").setFontSize(10).setVerticalAlignment("top").setWrap(true);
  cabecalho.forEach((col, i) => {
    const base = col.replace(/ \(inglês\)$/, "");
    aba.setColumnWidth(i + 1, LARGURA[base] || LARGURA_PADRAO);
    if (CORTAR.includes(base))
      aba.getRange(5, i + 1, linhas - 4, 1).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    // colunas calculadas em cinza, para ninguém escrever por cima
    if (formulas[i]) aba.getRange(5, i + 1, linhas - 4, 1).setFontColor(CINZA);
  });

  // zebra: troca a regra antiga (se houver) por uma que cobre todas as colunas atuais
  const regras = aba.getConditionalFormatRules().filter((r) => {
    const c = r.getBooleanCondition();
    return !(c && c.getCriteriaValues()[0] === FORMULA_ZEBRA);
  });
  regras.unshift(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(FORMULA_ZEBRA)
      .setBackground(ZEBRA)
      .setRanges([corpo])
      .build(),
  );
  aba.setConditionalFormatRules(regras);

  // explicações nos cabeçalhos que ainda não têm
  const notas = head.getNotes()[0];
  const extras = EXPLICACOES[nome] || {};
  cabecalho.forEach((col, i) => {
    if (!notas[i] && extras[col]) aba.getRange(4, i + 1).setNote(extras[col]);
  });

  aba.setFrozenRows(4);
  aba.setFrozenColumns(1);
  return true;
}

/** Última coluna com nome no cabeçalho (linha 4), ignorando colunas vazias à direita. */
function ultimaColuna(aba) {
  if (aba.getLastColumn() === 0 || aba.getMaxRows() < 4) return 0;
  const cabecalho = aba.getRange(4, 1, 1, aba.getLastColumn()).getValues()[0];
  for (let i = cabecalho.length - 1; i >= 0; i--) if (String(cabecalho[i]).trim()) return i + 1;
  return 0;
}
