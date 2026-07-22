/**
 * Google Apps Script - Cadastro de Despesas
 *
 * Recebe os dados do formulário (index.html) e grava numa aba da planilha.
 * Veja README.md para o passo a passo de publicação.
 */

// Nome da aba onde as despesas serão gravadas
const NOME_ABA = 'Despesas';

// ID da pasta do Google Drive onde os anexos serão salvos
const PASTA_ANEXOS_ID = '1XpI6Kpkd_o2TZGbXvw9ex7odEZsgpy3J';

// Cabeçalhos das colunas (a ordem define a ordem na planilha)
const CABECALHOS = ['Registrado em', 'Data', 'Nome', 'Descrição', 'Valor', 'Autorizado por', 'Anexo'];

/**
 * Recebe o POST enviado pelo formulário e grava uma linha na planilha.
 */
function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents);

    // Se veio anexo, salva na pasta do Drive e pega o link
    let linkAnexo = '';
    if (dados.anexoBase64) {
      linkAnexo = salvarAnexo(dados);
    }

    const aba = obterAba();

    aba.appendRow([
      new Date(),                    // Registrado em (timestamp do servidor)
      dados.data || '',              // Data informada
      dados.nome || '',              // Nome
      dados.descricao || '',         // Descrição
      Number(dados.valor) || 0,      // Valor
      dados.autorizado || '',        // Autorizado por
      linkAnexo,                     // Link do anexo no Drive
    ]);

    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, error: String(err) });
  }
}

/**
 * Rode esta função UMA VEZ no editor do Apps Script para conceder a
 * permissão de acesso ao Drive (aparece uma janela de autorização).
 * Depois disso, os anexos passam a ser salvos normalmente.
 */
function autorizar() {
  const pasta = DriveApp.getFolderById(PASTA_ANEXOS_ID);
  Logger.log('Autorizado! Pasta: ' + pasta.getName());
}

/**
 * Salva o anexo (base64) na pasta do Drive e retorna o link do arquivo.
 * O nome do arquivo é prefixado com data e nome para facilitar a busca.
 */
function salvarAnexo(dados) {
  const pasta = DriveApp.getFolderById(PASTA_ANEXOS_ID);

  const bytes = Utilities.base64Decode(dados.anexoBase64);
  const nomeBase = [dados.data, dados.nome, dados.anexoNome]
    .filter(String)
    .join(' - ');

  const blob = Utilities.newBlob(bytes, dados.anexoTipo, nomeBase);
  const arquivo = pasta.createFile(blob);

  return arquivo.getUrl();
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
