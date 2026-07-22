/**
 * Google Apps Script - Cadastro de Despesas
 *
 * Recebe os dados do formulário (index.html) e grava numa aba da planilha.
 * Veja README.md para o passo a passo de publicação.
 */

// ID da planilha do Google Sheets (pego da URL da planilha)
const PLANILHA_ID = '1pQM2uOrlzE9mcO5N_sryUsUHHnGzeIk5HolCerJ0YXM';

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
  // Cria e apaga um arquivo de teste para forçar o escopo de ESCRITA no Drive
  const teste = pasta.createFile('teste_autorizacao.txt', 'ok', 'text/plain');
  teste.setTrashed(true);
  Logger.log('Autorizado (leitura + escrita)! Pasta: ' + pasta.getName());
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
 * Prepara a tabela: cria a aba "Despesas" (se não existir) e monta a linha
 * de cabeçalhos com as colunas. Pode rodar manualmente no editor a qualquer
 * momento — é seguro, não apaga dados existentes.
 */
function prepararTabela() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  let aba = planilha.getSheetByName(NOME_ABA);

  // Cria a aba se ainda não existir
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
  }

  // (Re)escreve os cabeçalhos na primeira linha e formata
  const faixa = aba.getRange(1, 1, 1, CABECALHOS.length);
  faixa.setValues([CABECALHOS]);
  faixa.setFontWeight('bold');
  faixa.setBackground('#1B2A4A');
  faixa.setFontColor('#ffffff');
  aba.setFrozenRows(1);
  aba.autoResizeColumns(1, CABECALHOS.length);

  Logger.log('Tabela pronta na aba "' + NOME_ABA + '".');
  return aba;
}

/**
 * Retorna a aba de despesas, garantindo que ela exista com os cabeçalhos.
 */
function obterAba() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  let aba = planilha.getSheetByName(NOME_ABA);

  // Se a aba não existe (ou está vazia), prepara a tabela
  if (!aba || aba.getLastRow() === 0) {
    aba = prepararTabela();
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
