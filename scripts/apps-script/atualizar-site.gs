/**
 * Apps Script da planilha do site (Extensões → Apps Script). Cole este arquivo lá.
 * Adiciona o menu "Site" na planilha:
 *  - "Atualizar o site agora": pede ao Vercel um novo build, que lê a planilha (pnpm sync).
 *  - "Adicionar linha nesta aba…": abre o formulário (formulario.gs + Formulario.html).
 *  - "Formatar abas": aplica o visual padrão a todas as abas (formatar-planilha.gs).
 *  - "Configurar": guarda o Deploy Hook do Vercel e agenda uma atualização diária às 6h.
 * O link do Deploy Hook fica nas propriedades do script, não numa célula: quem só vê a planilha não o vê.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Site")
    .addItem("Atualizar o site agora", "atualizarSite")
    .addSeparator()
    .addItem("Adicionar linha nesta aba…", "abrirFormulario")
    .addItem("Formatar abas", "formatarAbas")
    .addSeparator()
    .addItem("Configurar", "configurar")
    .addToUi();
}

function atualizarSite() {
  const hook = PropertiesService.getScriptProperties().getProperty("DEPLOY_HOOK");
  if (!hook) throw new Error("Falta configurar: menu Site → Configurar.");
  const res = UrlFetchApp.fetch(hook, { method: "post", muteHttpExceptions: true });
  if (res.getResponseCode() >= 300)
    throw new Error("O Vercel recusou o pedido: " + res.getContentText());
  try {
    SpreadsheetApp.getActive().toast(
      "Em uns 3 minutos o site mostra o que está na planilha. Se não mudar, alguma linha está inválida: o e-mail do Vercel diz qual.",
      "Atualização iniciada",
      15,
    );
  } catch (e) {
    // rodando pelo agendamento diário, sem planilha aberta
  }
}

function configurar() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt(
    "Deploy Hook do Vercel",
    "Cole o link (Vercel → Settings → Git → Deploy Hooks):",
    ui.ButtonSet.OK_CANCEL,
  );
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const hook = r.getResponseText().trim();
  if (!/^https:\/\/api\.vercel\.com\//.test(hook))
    return ui.alert("Esse não parece um Deploy Hook do Vercel.");
  PropertiesService.getScriptProperties().setProperty("DEPLOY_HOOK", hook);
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("atualizarSite").timeBased().everyDays(1).atHour(6).create();
  ui.alert(
    "Pronto. Use o menu Site → Atualizar o site agora. O site também se atualiza sozinho todo dia às 6h.",
  );
}
