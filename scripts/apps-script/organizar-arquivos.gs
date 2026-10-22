/**
 * Move cada arquivo de 'Arquivos do site' para a subpasta da aba que o cita (Membros, Eventos, Fundo…),
 * e os History_Master_*.xlsx para Fundo. Arquivos que nenhuma aba cita ficam onde estão.
 * Fica no mesmo projeto que formulario.gs (usa COL_ARQUIVO, SUBPASTA e pastaDeFotos de lá).
 * Rode logado na conta dona dos arquivos: o Drive só deixa o dono mover um arquivo.
 */
function organizarArquivos() {
  const ss = SpreadsheetApp.getActive();
  const raiz = pastaDeFotos(ss);
  const destino = {}; // nome do arquivo → subpasta
  ss.getSheets().forEach((aba) => {
    if (aba.getLastRow() < 5 || aba.getLastColumn() === 0) return;
    const [cab, ...linhas] = aba.getRange(4, 1, aba.getLastRow() - 3, aba.getLastColumn()).getValues();
    cab.forEach((col, i) => {
      if (!COL_ARQUIVO.includes(String(col).trim())) return;
      linhas.forEach((l) => l[i] && (destino[String(l[i]).trim()] = SUBPASTA[aba.getName()] || aba.getName()));
    });
  });

  const pastas = {};
  const pasta = (nome) => {
    if (!pastas[nome]) {
      const achada = raiz.getFoldersByName(nome);
      pastas[nome] = achada.hasNext() ? achada.next() : raiz.createFolder(nome);
    }
    return pastas[nome];
  };
  const movidos = [];
  const falhas = [];
  for (const arqs = raiz.getFiles(); arqs.hasNext(); ) {
    const arq = arqs.next();
    const sub = /^History_Master_/.test(arq.getName()) ? "Fundo" : destino[arq.getName()];
    if (!sub) continue;
    try {
      arq.moveTo(pasta(sub));
      movidos.push(arq.getName());
    } catch (e) {
      falhas.push(arq.getName() + ": " + e.message);
    }
  }
  SpreadsheetApp.getUi().alert(
    movidos.length + " arquivos movidos." + (falhas.length ? "\n\nNão consegui mover:\n" + falhas.join("\n") : ""),
  );
}
