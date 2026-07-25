# Clareia — Editor Universal de Texto IA

Editor profissional de texto em português, preparado para GitHub Pages. O Clareia combina análise linguística local em tempo real com reescrita por IA, controle de público, estilo e tamanho, comparação visual, histórico e exportações.

## Recursos

- Reescrita, expansão, compressão e adaptação de público/estilo.
- Meta personalizada de palavras e geração de novas variações.
- Parser e tokenizer próprios, sem enviar dados para análise.
- Métricas de palavras, frases, parágrafos, diversidade lexical, legibilidade e leitura.
- Alertas para frases/parágrafos longos, repetições, redundâncias, voz passiva e advérbios.
- Comparação por palavras, com adições e remoções destacadas.
- Exportação para TXT, Markdown, DOCX e PDF, além de cópia.
- Histórico de 20 versões, auto save e preferências no LocalStorage.
- Tema claro/escuro, layout responsivo e atalho `Ctrl/Cmd + Enter`.
- Modo de revisão local quando o usuário não quiser usar uma API.

## Escolha da IA

O provedor principal é o **Google Gemini**, usando por padrão `gemini-3.5-flash` (o nome do modelo é configurável na interface).

Ele foi escolhido porque oferece boa qualidade de escrita em português, janela de contexto ampla, baixa latência, API REST simples e modelos elegíveis à camada gratuita. A alternativa Hugging Face oferece apenas uma pequena quantidade de créditos mensais para contas gratuitas, enquanto modelos locais de qualidade comparável exigiriam downloads grandes, muita memória e teriam desempenho inconsistente em celulares.

Como o GitHub Pages é uma hospedagem puramente estática, não há backend para proteger uma chave central. Por isso, **cada usuário informa sua própria chave**, que permanece no LocalStorage do navegador e é enviada somente ao endpoint oficial do Gemini. Nunca inclua uma chave no repositório. Para um produto público com chave financiada pelo proprietário, adicione futuramente um backend/proxy com autenticação e limites.

Os limites exatos da camada gratuita variam por modelo, região e conta. Consulte a página oficial de preços e o painel do Google AI Studio antes de publicar em produção:

- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits

## Arquitetura

```text
.
├── public/                   # arquivos servidos sem transformação
├── src/
│   ├── analysis/            # diagnóstico e métricas linguísticas
│   ├── components/          # espaço para componentes de UI futuros
│   ├── editor/              # espaço para controladores do editor
│   ├── engines/             # parser, tokenizer e reescrita local
│   ├── prompt/              # todos os prompts e diretrizes
│   ├── providers/           # adaptadores de provedores de IA
│   ├── services/            # IA, persistência e exportação
│   ├── styles/              # sistema visual responsivo
│   ├── utils/               # diff e ícones
│   └── main.js              # composição da aplicação
├── index.html
├── package.json
└── vite.config.js
```

Os módulos têm responsabilidade única. A interface depende de `aiService`, e não diretamente do Gemini; isso permite trocar o provedor sem alterar o editor.

## Rodar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal. Para validar a versão final:

```bash
npm run build
npm run preview
```

## Configurar a API

1. Acesse https://aistudio.google.com/apikey e crie uma chave.
2. Abra o Clareia e clique no ícone de engrenagem.
3. Selecione **Google Gemini**, cole a chave e salve.
4. Caso o modelo padrão deixe de estar disponível, altere o campo **Modelo** para um modelo atual compatível com `generateContent`.

A chave é salva apenas no navegador atual. Limpar os dados do site remove a chave, o texto e o histórico.

## Publicar no GitHub Pages

### Pela interface do GitHub

1. Envie o projeto para um repositório.
2. Execute `npm run build`.
3. Publique o conteúdo da pasta `dist` em uma branch `gh-pages`.
4. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `gh-pages`, pasta `/ (root)`.

Você também pode usar uma GitHub Action. Salve como `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

Depois selecione **GitHub Actions** como fonte em **Settings → Pages**. O `base: "./"` do Vite faz os assets funcionarem tanto em domínio próprio quanto em subpastas.

## Trocar o provedor de IA

1. Crie um adaptador em `src/providers/` que receba `{ prompt, signal, ...credenciais }` e retorne apenas uma string.
2. Registre-o em `src/services/aiService.js`.
3. Adicione os campos do provedor na gaveta de configurações.
4. Mantenha prompts exclusivamente em `src/prompt/prompts.js`.
5. Nunca salve segredos no código ou no repositório. Em implantação pública com chave compartilhada, use um proxy seguro.

## Privacidade e limitações

- Métricas, histórico e modo local são processados no dispositivo.
- No modo Gemini, o texto é enviado ao Google após ação explícita do usuário.
- As heurísticas locais de legibilidade e voz passiva são indicativas; não substituem revisão humana.
- DOCX e PDF carregam bibliotecas de exportação sob demanda. A primeira exportação exige conexão.
- A IA pode alterar nuances. O comparador existe para facilitar a revisão antes de usar o resultado.

## Licença

Uso privado ou comercial conforme as necessidades do proprietário do projeto.
