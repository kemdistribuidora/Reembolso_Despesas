# Cadastro de Despesas → Google Sheets

Tela simples para registrar despesas (DATA, NOME, DESCRIÇÃO, VALOR, AUTORIZADO POR)
que grava os dados numa planilha do Google via Apps Script.

## Arquivos

- `index.html` — a tela de cadastro (abra no navegador).
- `Code.gs` — código do Google Apps Script que recebe os dados e grava na planilha.

## Passo a passo

### 1. Crie a planilha e o Apps Script

1. Crie uma planilha nova em [sheets.google.com](https://sheets.google.com).
2. No menu, vá em **Extensões → Apps Script**.
3. Apague o conteúdo do arquivo `Código.gs` e cole todo o conteúdo de `Code.gs` deste projeto.
4. Salve (ícone de disquete).

> A aba **Despesas** com os cabeçalhos é criada automaticamente no primeiro envio.

### 2. Publique como Web App

1. No Apps Script, clique em **Implantar → Nova implantação**.
2. Em "Tipo", escolha **App da Web**.
3. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar** e autorize o acesso quando solicitado.
5. Copie a **URL do app da Web** (termina em `/exec`).

### 3. Conecte a tela

1. Abra `index.html`.
2. Na seção `CONFIGURAÇÃO`, cole a URL copiada em `WEB_APP_URL`:

   ```js
   const WEB_APP_URL = "https://script.google.com/macros/s/XXXXX/exec";
   ```

3. Salve e abra `index.html` no navegador. Pronto — cada envio vira uma linha na planilha.

## Anexos

- O campo **ANEXO** (comprovante) é opcional. Aceita imagens e PDF, até 25 MB.
- Os arquivos são salvos na pasta do Google Drive definida em `Code.gs` na constante
  `PASTA_ANEXOS_ID` (já configurada com a sua pasta). O link do arquivo é gravado
  na coluna **Anexo** da planilha.
- Na **primeira** vez que enviar um anexo, o Apps Script vai pedir autorização extra
  para acessar o Drive — aceite. (Se você já implantou antes de adicionar o anexo,
  refaça a autorização executando a função `doPost` uma vez no editor, ou reimplantando.)

## Observações

- Se você alterar o `Code.gs`, faça **Implantar → Gerenciar implantações → editar → Nova versão**
  para publicar as mudanças (ou crie uma nova implantação e atualize a URL).
- O envio usa `Content-Type: text/plain` de propósito, para evitar o preflight de CORS do navegador.
