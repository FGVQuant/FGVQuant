/**
 * Uso único: cria na aba "Fundo mensal" a coluna "Relatório (PDF)", logo depois de "Retorno (%)".
 * Extensões → Apps Script → cole este arquivo como um arquivo novo → escolha criarColunaRelatorio → Executar.
 * Pode rodar de novo sem problema: se a coluna já existir, só reaplica a nota e a largura. Depois, este
 * arquivo pode ser apagado.
 *
 * A coluna é opcional. Para publicar o relatório de gestão de um mês, ponha o PDF na pasta
 * 'Fotos do site' e escreva o nome exato do arquivo (ex.: relatorio-2026-08.pdf) na linha do mês.
 * O site mostra um botão de download na aba "Mês a mês" do painel do fundo.
 */

const NOTA_RELATORIO =
  "Nome do PDF do relatório de gestão deste mês, na pasta 'Fotos do site' (ex.: relatorio-2026-08.pdf). " +
  "Opcional. O site oferece o arquivo para download.";

function criarColunaRelatorio() {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName("Fundo mensal");
  if (!aba) throw new Error("Não achei a aba 'Fundo mensal'.");
  // cabeçalho na linha 4
  const coluna = (nome) =>
    aba
      .getRange(4, 1, 1, Math.max(aba.getLastColumn(), 1))
      .getValues()[0]
      .findIndex((v) => String(v).trim() === nome) + 1;

  let col = coluna("Relatório (PDF)");
  const nova = !col;
  if (nova) {
    const ancora = coluna("Retorno (%)");
    if (!ancora)
      throw new Error("Não achei a coluna 'Retorno (%)' na linha 4 da aba 'Fundo mensal'.");
    aba.insertColumnAfter(ancora); // herda o formato de "Retorno (%)"
    col = ancora + 1;
    aba.getRange(4, col).setValue("Relatório (PDF)");
    // texto, não percentual: o formato herdado de "Retorno (%)" estragaria o nome do arquivo
    aba
      .getRange(5, col, Math.max(aba.getMaxRows() - 4, 1), 1)
      .setNumberFormat("@")
      .setHorizontalAlignment("left");
  }
  aba.getRange(4, col).setNote(NOTA_RELATORIO);
  aba.setColumnWidth(col, 170);

  ss.toast(
    nova
      ? "Coluna 'Relatório (PDF)' criada na aba Fundo mensal."
      : "A coluna já existia; só reapliquei nota e largura.",
    "Pronto",
    10,
  );
}
