/**
 * Uso único: completa a aba "Fundo mensal" com os retornos mensais do FGV Quant Capital publicados no
 * Instagram (slide "Performance | FGV Quant Capital" de cada relatório, export de 17/10/2026).
 * Extensões → Apps Script → cole este arquivo como um arquivo novo → escolha preencherFundoMensal → Executar.
 * Só acrescenta os meses que faltam; um mês que já está na aba fica como está. No fim, ordena por mês.
 * Depois, este arquivo pode ser apagado do projeto do Apps Script.
 *
 * Ago/2025 e dez/2025 ficam de fora de propósito: a liga não publicou relatório desses meses.
 */

const RETORNOS = [
  ["07/2025", 1.67],
  ["09/2025", 3.56],
  ["10/2025", 1.18],
  ["11/2025", 5.37],
  ["01/2026", 1.14],
  ["02/2026", -0.75],
  ["03/2026", -1.97],
  ["04/2026", 0.02],
  ["05/2026", 0.75],
  ["06/2026", 2.17],
  ["07/2026", 0.29],
  ["08/2026", 3.84],
];

function preencherFundoMensal() {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName("Fundo mensal");
  if (!aba) throw new Error("Aba 'Fundo mensal' não encontrada.");

  // o site lê pelo nome da coluna, na linha 4
  const cabecalho = aba.getRange(4, 1, 1, aba.getLastColumn()).getValues()[0].map(String);
  const cMes = cabecalho.indexOf("Mês");
  const cRet = cabecalho.indexOf("Retorno (%)");
  if (cMes < 0 || cRet < 0) throw new Error("A linha 4 precisa ter as colunas 'Mês' e 'Retorno (%)'.");

  const tz = ss.getSpreadsheetTimeZone();
  const texto = (v) => (v instanceof Date ? Utilities.formatDate(v, tz, "MM/yyyy") : String(v).trim());
  const ultima = aba.getLastRow();
  const linhas = ultima < 5 ? [] : aba.getRange(5, 1, ultima - 4, cabecalho.length).getValues();
  const existentes = new Set(linhas.map((l) => texto(l[cMes])).filter(Boolean));

  const novos = RETORNOS.filter(([mes]) => !existentes.has(mes));
  if (novos.length) {
    const inicio = Math.max(ultima, 4) + 1;
    aba.getRange(inicio, cMes + 1, novos.length).setNumberFormat("@"); // mm/aaaa como texto
    novos.forEach(([mes, ret], i) => {
      aba.getRange(inicio + i, cMes + 1).setValue(mes);
      aba.getRange(inicio + i, cRet + 1).setValue(ret);
    });
  }

  // ordena por mês (aaaa-mm), sem mexer nas linhas 1-4
  const total = aba.getLastRow() - 4;
  if (total > 1) {
    const faixa = aba.getRange(5, 1, total, cabecalho.length);
    aba.getRange(5, cMes + 1, total).setNumberFormat("@");
    const chave = (l) => texto(l[cMes]).replace(/^(\d{1,2})\/(\d{4})$/, (_, m, a) => a + "-" + m.padStart(2, "0"));
    const ordenadas = faixa.getValues().sort((a, b) => chave(a).localeCompare(chave(b)));
    faixa.setValues(ordenadas.map((l) => l.map((v, c) => (c === cMes ? texto(v) : v))));
  }

  ss.setActiveSheet(aba);
  ss.toast(novos.length + " meses acrescentados; " + (RETORNOS.length - novos.length) + " já estavam na aba.", "Pronto", 10);
}
