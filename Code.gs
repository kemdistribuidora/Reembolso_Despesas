/**
 * Google Apps Script - Cadastro de Despesas
 *
 * Recebe os dados do formulário (index.html) e grava numa aba da planilha.
 * Veja README.md para o passo a passo de publicação.
 */

// Nome da aba onde as despesas serão gravadas
const NOME_ABA = 'Despesas';

// Cabeçalhos das colunas (a ordem define a ordem na planilha)
const CABECALHOS = ['Registrado em', 'Data', 'Nome', 'Descrição', 'Valor', 'Autorizado por'];

/**
 * Recebe o POST enviado pelo formulário e grava uma linha na planilha.
 */
function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents);

    const aba = obterAba();

    aba.appendRow([
      new Date(),                    // Registrado em (timestamp do servidor)
      dados.data || '',              // Data informada
      dados.nome || '',              // Nome
      dados.descricao || '',         // Descrição
      Number(dados.valor) || 0,      // Valor
      dados.autorizado || '',        // Autorizado por
    ]);

    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, error: String(err) });
  }
}

/**
 * Retorna a aba de despesas, criando-a com cabeçalhos se ainda não existir.
 */
function obterAba() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(CABECALHOS);
    aba.getRange(1, 1, 1, CABECALHOS.length).setFontWeight('bold');
    aba.setFrozenRows(1);
  }

  return aba;
}

/**
 * Monta uma resposta JSON.
 */
function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
