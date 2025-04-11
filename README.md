# OpenAI CUA Exemplo

Este é um projeto de exemplo que demonstra a integração com a API da OpenAI para criar um assistente virtual (CUA).

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Visual Studio Code](https://code.visualstudio.com/) ou outro editor de código
- Uma chave de API válida da OpenAI

## Configuração

1. Clone este repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências do projeto:
```bash
npm install
```

3. Configure suas variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes configurações:
   ```
   OPENAI_API_KEY=sua_chave_aqui
   display_width=800
   display_height=600
   ```
   - Configure o prompt desejado no mesmo arquivo

## Executando o Projeto

Para iniciar o CUA, execute o seguinte comando no terminal:

```bash
node app.mjs
```

## Personalização

Você pode personalizar o comportamento do CUA editando:
- O arquivo `.env` para configurar:
  - A chave da API da OpenAI
  - As dimensões da tela (display_width e display_height)
  - O prompt desejado
- O arquivo `app.mjs` para modificar a lógica do programa

## Suporte

Em caso de dúvidas ou problemas, por favor abra uma issue no repositório. 