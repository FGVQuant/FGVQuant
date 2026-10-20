/**
 * Uso único: cria na planilha do site as colunas de curso e de ingresso na faculdade dos membros.
 * Extensões → Apps Script → cole este arquivo como um arquivo novo → escolha criarColunasCurso → Executar.
 * Pode rodar de novo sem problema: o que já existe fica como está, e cursos novos de CURSOS são
 * acrescentados ao fim da lista. Depois, este arquivo pode ser apagado.
 *
 * O que ele faz:
 *  - aba Listas: cria as colunas "Curso" e "Curso (inglês)" com os cursos de CURSOS (edite antes de rodar,
 *    ou complete depois direto na aba);
 *  - aba Membros: cria "Curso" (lista suspensa com os cursos da aba Listas) e "Ingresso na FGV"
 *    (semestre de entrada na faculdade, no formato 2024.1), logo depois da coluna "Saída".
 *
 * As duas colunas são opcionais. O site mostra "Economia · 6º semestre" no card de quem tiver os dados e
 * calcula o semestre atual sozinho. Não confunda com "Entrada", que é o semestre em que a pessoa entrou
 * na liga (é ela que agrupa os trainees).
 */

// [curso, em inglês] — confira e complete com os cursos dos membros
const CURSOS = [
  ["Administração de Empresas", "Business Administration"],
  ["Administração Pública", "Public Administration"],
  ["Direito", "Law"],
  ["Economia", "Economics"],
  ["Relações Internacionais", "International Relations"],
];

const NOTA_CURSO =
  "Curso de graduação. Opcional. Escolha da lista (aba Listas, coluna Curso); para um curso novo, " +
  "acrescente-o lá com a tradução em 'Curso (inglês)'.";
const NOTA_INGRESSO =
  "Semestre em que a pessoa entrou na faculdade, ex.: 2024.1. Opcional. O site calcula o semestre " +
  "atual (2024.1 → 6º semestre em 2026.2). Não é a 'Entrada', que é a entrada na liga.";

function criarColunasCurso() {
  const ss = SpreadsheetApp.getActive();
  const listas = ss.getSheetByName("Listas");
  const membros = ss.getSheetByName("Membros");
  if (!listas || !membros) throw new Error("Não achei as abas 'Listas' e 'Membros'.");
  const feito = [];

  // ── Listas: Curso / Curso (inglês), cabeçalho na linha 1 ──────────────────────
  let colCurso = colunaPorNome(listas, 1, "Curso");
  if (!colCurso) {
    colCurso = ultimaColunaUsada(listas, 1) + 1;
    listas.getRange(1, colCurso, 1, 2).setValues([["Curso", "Curso (inglês)"]]);
    // mesmo visual do cabeçalho vizinho
    if (colCurso > 1)
      listas
        .getRange(1, colCurso - 1)
        .copyTo(
          listas.getRange(1, colCurso, 1, 2),
          SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
          false,
        );
    listas.setColumnWidth(colCurso, 190).setColumnWidth(colCurso + 1, 190);
    feito.push("Listas: colunas Curso e Curso (inglês)");
  }
  // acrescenta ao fim da lista os cursos de CURSOS que ainda não estão lá (rodar de novo completa a lista)
  const atuais = listas
    .getRange(2, colCurso, Math.max(listas.getMaxRows() - 1, 1), 1)
    .getValues()
    .map((r) => String(r[0]).trim());
  const faltam = CURSOS.filter(([curso]) => !atuais.includes(curso));
  if (faltam.length) {
    const ultimo = atuais.reduce((n, v, i) => (v ? i + 1 : n), 0); // última linha preenchida (0 = vazia)
    listas.getRange(2 + ultimo, colCurso, faltam.length, 2).setValues(faltam);
    feito.push("Listas: " + faltam.map(([c]) => c).join(", "));
  }

  // ── Membros: Curso e Ingresso na FGV, cabeçalho na linha 4 ────────────────────
  const ancora = colunaPorNome(membros, 4, "Saída") || ultimaColunaUsada(membros, 4);
  const novas = ["Curso", "Ingresso na FGV"].filter((nome) => !colunaPorNome(membros, 4, nome));
  if (novas.length) {
    membros.insertColumnsAfter(ancora, novas.length); // herdam o formato da coluna "Saída"
    membros.getRange(4, ancora + 1, 1, novas.length).setValues([novas]);
    feito.push("Membros: " + novas.join(" e "));
  }
  const linhas = Math.max(membros.getMaxRows() - 4, 1);

  const cCurso = colunaPorNome(membros, 4, "Curso");
  membros.getRange(4, cCurso).setNote(NOTA_CURSO);
  membros.setColumnWidth(cCurso, 150);
  membros.getRange(5, cCurso, linhas, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInRange(listas.getRange(2, colCurso, listas.getMaxRows() - 1, 1), true)
      .setAllowInvalid(false)
      .setHelpText("Escolha um curso da aba Listas.")
      .build(),
  );

  const cIng = colunaPorNome(membros, 4, "Ingresso na FGV");
  const letra = membros.getRange(5, cIng).getA1Notation().replace(/\d+$/, "");
  membros.getRange(4, cIng).setNote(NOTA_INGRESSO);
  membros.setColumnWidth(cIng, 95);
  const faixa = membros.getRange(5, cIng, linhas, 1).setNumberFormat("@"); // texto: 2024.1 não vira número
  // O separador de argumentos segue o idioma da planilha: "," onde o decimal é ponto (inglês, japonês…),
  // ";" onde o decimal é vírgula (português). A regra só é conferida no fim da execução, então não dá
  // para tentar um e cair no outro com try/catch: o separador tem de ser escolhido antes.
  const decimalPonto = /^(en|ja|ko|zh|th|he|iw|hi|ms|fil|tl)(_|$)/.test(ss.getSpreadsheetLocale());
  const sep = decimalPonto ? "," : ";";
  faixa.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireFormulaSatisfied(`=REGEXMATCH(TO_TEXT(${letra}5)${sep} "^[0-9]{4}\\.[12]$")`)
      .setAllowInvalid(false)
      .setHelpText("Semestre no formato 2024.1 ou 2024.2.")
      .build(),
  );

  ss.toast(
    feito.length ? feito.join(" · ") : "As colunas já existiam; só reapliquei listas e notas.",
    "Pronto",
    10,
  );
}

/** Coluna (1-based) cujo cabeçalho na linha `linha` é `nome`; 0 se não houver. */
function colunaPorNome(aba, linha, nome) {
  if (aba.getLastColumn() === 0) return 0;
  const cab = aba.getRange(linha, 1, 1, aba.getLastColumn()).getValues()[0];
  return cab.findIndex((v) => String(v).trim() === nome) + 1;
}

/** Última coluna com algo no cabeçalho da linha `linha`. */
function ultimaColunaUsada(aba, linha) {
  if (aba.getLastColumn() === 0) return 0;
  const cab = aba.getRange(linha, 1, 1, aba.getLastColumn()).getValues()[0];
  for (let i = cab.length - 1; i >= 0; i--) if (String(cab[i]).trim()) return i + 1;
  return 0;
}
