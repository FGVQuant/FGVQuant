/**
 * Formulário para adicionar linhas: menu Site → "Adicionar linha nesta aba…" abre um painel ao lado da
 * planilha com um campo por coluna da aba aberta. Funciona em qualquer aba com o cabeçalho na linha 4.
 * Fica no mesmo projeto do Apps Script que atualizar-site.gs, junto com o arquivo HTML "Formulario".
 *
 * O painel é montado a partir da própria aba, então coluna nova aparece sozinha:
 *  - o comentário do cabeçalho vira a explicação do campo;
 *  - colunas com lista suspensa viram uma lista de opções;
 *  - colunas lilás com fórmula (ex.: Status em Membros) ficam de fora e são calculadas na planilha;
 *  - colunas "(inglês)" ficam num grupo opcional;
 *  - Foto, Logo e Artigo (PDF) aceitam um arquivo, que vai para a pasta 'Fotos do site'.
 * Os campos obrigatórios são os mesmos que o site exige (scripts/sync-sheet.mjs, need()).
 */

const ABAS_FIXAS = ["Painel", "Como usar", "Listas"];
const OBRIGATORIAS = {
  Membros: ["Nome", "Área", "Cargo"],
  Eventos: ["Data", "Tipo", "Título"],
  Projetos: ["Semestre", "Tipo", "Status", "Título", "Resumo"],
  Competições: ["Competição", "Organizador", "Ano", "Resumo"],
  Equipes: ["Competição", "Equipe", "Resultado"],
  Parceiros: ["Empresa", "O que fizemos juntos"],
  Depoimentos: ["Nome", "Depoimento"],
  "Fundo mensal": ["Mês", "Retorno (%)"],
  Estratégias: ["Estratégia", "Status", "Resumo", "Regras"],
  Newsletter: ["Edição", "Link"],
  Entidade: ["Campo", "Valor"],
};
const COL_ARQUIVO = ["Foto", "Logo", "Artigo (PDF)"];
const COL_DATA = ["Data"];
const COL_MES = ["Mês", "Edição"];
const COL_SEMESTRE = ["Semestre", "Entrada", "Saída", "Ingresso na FGV"];
const COL_NUMERO = ["Ano", "Nº", "Retorno (%)", "Exposição comprada (%)", "Exposição vendida (%)"];
const COL_LINK = ["Link", "Fonte", "LinkedIn", "Site"];
const COL_TEXTO_LONGO = [
  "Resumo",
  "Descrição",
  "Depoimento",
  "Texto",
  "Regras",
  "O que fizemos juntos",
  "Membros",
];

function abrirFormulario() {
  const aba = SpreadsheetApp.getActiveSheet();
  if (ABAS_FIXAS.includes(aba.getName()) || aba.getLastColumn() === 0)
    return SpreadsheetApp.getUi().alert(
      "Abra uma das abas de conteúdo (Membros, Eventos, Projetos…) e tente de novo.",
    );
  const html = HtmlService.createTemplateFromFile("Formulario");
  html.aba = aba.getName();
  SpreadsheetApp.getUi().showSidebar(html.evaluate().setTitle("Adicionar em " + aba.getName()));
}

/** Os campos do formulário, lidos do cabeçalho (linha 4) da aba. */
function camposDaAba(nome) {
  const aba = SpreadsheetApp.getActive().getSheetByName(nome);
  const n = aba.getLastColumn();
  const cabecalho = aba
    .getRange(4, 1, 1, n)
    .getValues()[0]
    .map((v) => String(v).trim());
  const notas = aba.getRange(4, 1, 1, n).getNotes()[0];
  const formulas = aba.getRange(5, 1, 1, n).getFormulas()[0];
  const obrigatorias = OBRIGATORIAS[nome] || [];
  return cabecalho
    .map((col, i) => {
      if (!col || formulas[i]) return null; // coluna vazia ou calculada pela planilha
      const base = col.replace(/ \(inglês\)$/, "");
      const regra = aba.getRange(5, i + 1).getDataValidation();
      let opcoes = null;
      if (regra) {
        const tipo = regra.getCriteriaType();
        const valores = regra.getCriteriaValues();
        if (tipo === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) opcoes = valores[0];
        if (tipo === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE)
          opcoes = valores[0]
            .getValues()
            .flat()
            .filter((v) => v !== "");
      }
      let tipo = "texto";
      if (opcoes) tipo = "lista";
      else if (COL_ARQUIVO.includes(col)) tipo = "arquivo";
      else if (COL_DATA.includes(col)) tipo = "data";
      else if (COL_MES.includes(col)) tipo = "mes";
      else if (COL_SEMESTRE.includes(col)) tipo = "semestre";
      else if (COL_NUMERO.includes(col)) tipo = "numero";
      else if (COL_LINK.includes(col)) tipo = "link";
      else if (COL_TEXTO_LONGO.includes(base)) tipo = "longo";
      return {
        coluna: i + 1,
        nome: col,
        nota: notas[i] || "",
        tipo: tipo,
        opcoes: opcoes,
        obrigatoria: obrigatorias.includes(col),
        ingles: col !== base,
      };
    })
    .filter(Boolean);
}

/**
 * Grava uma linha nova na primeira linha vazia da aba (coluna A vazia, a partir da linha 5).
 * `valores` vem do painel: { "número da coluna": valor }. `arquivos`: { "número da coluna": {nome, tipo, base64} }.
 */
function salvarLinha(nome, valores, arquivos) {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName(nome);
  const campos = camposDaAba(nome);
  const erros = [];
  campos.forEach((c) => {
    const v = valores[c.coluna];
    const vazio = v === undefined || v === "";
    if (c.obrigatoria && vazio && !arquivos[c.coluna])
      erros.push("'" + c.nome + "' é obrigatório.");
    if (vazio) return;
    if (c.tipo === "semestre" && !/^\d{4}\.[12]$/.test(v))
      erros.push("'" + c.nome + "': use o formato 2026.2.");
    if (c.tipo === "link" && !/^https?:\/\//.test(v))
      erros.push("'" + c.nome + "': o link precisa começar com https://.");
    if (c.tipo === "numero" && isNaN(Number(String(v).replace(",", "."))))
      erros.push("'" + c.nome + "': precisa ser um número.");
  });
  if (erros.length) throw new Error(erros.join("\n"));

  const lock = LockService.getDocumentLock();
  lock.waitLock(20000);
  try {
    const colA = aba.getRange(5, 1, Math.max(aba.getMaxRows() - 4, 1), 1).getValues();
    let i = colA.findIndex((r) => r[0] === "");
    if (i < 0) {
      aba.insertRowAfter(aba.getMaxRows());
      i = colA.length;
    }
    const linha = 5 + i;
    const pasta = pastaDeFotos(ss);
    campos.forEach((c) => {
      let v = valores[c.coluna];
      if (arquivos[c.coluna]) v = subirArquivo(pasta, arquivos[c.coluna], valores, campos);
      if (v === undefined || v === "") return;
      const celula = aba.getRange(linha, c.coluna);
      if (c.tipo === "data") {
        const [a, m, d] = v.split("-").map(Number); // vem do <input type="date"> como aaaa-mm-dd
        celula.setValue(new Date(a, m - 1, d)).setNumberFormat("dd/mm/yyyy");
      } else if (c.tipo === "mes") {
        const [a, m] = v.split("-"); // <input type="month">: aaaa-mm
        celula.setNumberFormat("@").setValue(m + "/" + a);
      } else if (c.tipo === "semestre") {
        celula.setNumberFormat("@").setValue(v);
      } else if (c.tipo === "numero") {
        celula.setValue(Number(String(v).replace(",", ".")));
      } else {
        celula.setValue(v);
      }
    });
    SpreadsheetApp.flush();
    return linha;
  } finally {
    lock.releaseLock();
  }
}

function pastaDeFotos(ss) {
  const pais = DriveApp.getFileById(ss.getId()).getParents();
  while (pais.hasNext()) {
    const filhas = pais.next().getFoldersByName("Fotos do site");
    if (filhas.hasNext()) return filhas.next();
  }
  throw new Error("Não achei a pasta 'Fotos do site' ao lado da planilha.");
}

/** Salva o arquivo na pasta com um nome limpo (nome-da-linha.ext) e devolve esse nome para a célula. */
function subirArquivo(pasta, arquivo, valores, campos) {
  const ext = (arquivo.nome.match(/\.[a-z0-9]+$/i) || [""])[0].toLowerCase();
  const titulo = campos.find((c) => !c.ingles && c.tipo !== "arquivo" && valores[c.coluna]);
  const base =
    String(titulo ? valores[titulo.coluna] : arquivo.nome.replace(/\.[^.]+$/, ""))
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "arquivo";
  let nome = base + ext;
  for (let n = 2; pasta.getFilesByName(nome).hasNext(); n++) nome = base + "-" + n + ext;
  const blob = Utilities.newBlob(Utilities.base64Decode(arquivo.base64), arquivo.tipo, nome);
  pasta.createFile(blob);
  return nome;
}
