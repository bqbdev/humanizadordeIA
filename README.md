# Clareia — Editor Universal de Texto IA

Editor profissional de texto em português, preparado para GitHub Pages. O Clareia funciona integralmente no navegador, sem chaves de API, contas ou envio do texto a serviços externos.

## Recursos

- Reescrita completa e adaptação de público/estilo, sem acrescentar ideias.
- Geração de novas variações preservando as informações originais.
- Parser e tokenizer próprios, sem enviar dados para análise.
- Métricas de palavras, frases, parágrafos, diversidade lexical, legibilidade e leitura.
- Alertas para frases/parágrafos longos, repetições, redundâncias, voz passiva e advérbios.
- Comparação por palavras, com adições e remoções destacadas.
- Limite de 2.000 caracteres por operação para revisão e validação mais seguras.
- Processamento por parágrafo, com bloqueio de resultados que apresentem sinais conhecidos de falha de concordância.
- Exportação para TXT, Markdown, DOCX e PDF, além de cópia.
- Histórico de 20 versões, auto save e preferências no LocalStorage.
- Tema claro/escuro, layout responsivo e atalho `Ctrl/Cmd + Enter`.
- Modo de revisão local quando o usuário não quiser usar uma API.

## Funcionamento sem chaves

O motor local ajusta repetição, uniformidade de frases, conectivos, redundâncias, variação estrutural, clareza e ritmo. Esses sinais são semelhantes aos observados por classificadores de texto, mas nenhum resultado pode garantir uma classificação específica: detectores de IA são probabilísticos e podem errar inclusive com textos humanos.

## Arquitetura local

A aplicação usa regras linguísticas determinísticas no navegador. O motor reduz redundâncias, quebra períodos excessivamente longos, varia conectivos, ajusta vocabulário conforme público e estilo e controla compressão ou expansão. Não há chamadas a APIs, contas, cotas ou custos de inferência.
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

## Uso`n`nAbra o editor, cole o texto e clique em **Aprimorar texto**. Nenhuma configuração, conta ou chave é necessária.`n`n## Publicar no GitHub Pages

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

## Privacidade e limitações

- Métricas, histórico e modo local são processados no dispositivo.
- Todo o processamento textual ocorre no navegador; o texto não é enviado a terceiros.
- As heurísticas locais de legibilidade e voz passiva são indicativas; não substituem revisão humana.
- DOCX e PDF carregam bibliotecas de exportação sob demanda. A primeira exportação exige conexão.
- A IA pode alterar nuances. O comparador existe para facilitar a revisão antes de usar o resultado.

## Licença

Uso privado ou comercial conforme as necessidades do proprietário do projeto.


## Modelo no navegador

A reescrita contextual usa Transformers.js e Qwen2.5-0.5B-Instruct. Em navegadores com WebGPU, a aplicação prioriza a variante q4f16 (aproximadamente 483 MB). Não é necessária chave de API. O desempenho depende do equipamento e o primeiro processamento é mais demorado devido ao download do modelo.
