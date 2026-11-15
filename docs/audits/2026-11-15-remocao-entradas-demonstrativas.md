# Remoção das entradas demonstrativas — Fase 3

## Escopo

Remover o registro de `/preview` e seus destinos de navegação, preservando as rotas
oficiais, autenticação, contratos HTTP e os arquivos da OPE-37. Serviços, dados e
fixtures de testes não são excluídos nesta fase.

## Evidência anterior informada pelo responsável

A validação manual da Fase 2 aprovou 117 testes. O lint apresentou zero erros e
13 warnings. Esses resultados não constituem validação das alterações da Fase 3.

A cobertura informada após a Fase 2 caiu para:

| Métrica    | Cobertura |
| ---------- | --------: |
| Statements |    64,86% |
| Branches   |    64,18% |
| Functions  |    62,61% |
| Lines      |    68,29% |

Não foram alterados thresholds, exclusões ou asserts para melhorar percentuais.
A recuperação depende de testes comportamentais dos serviços reais e da
investigação da instrumentação dos templates, em fases posteriores.

## Alteração preparada

- O roteador oficial não importa nem registra as rotas demonstrativas.
- A configuração de desenvolvimento também exporta entradas vazias e flag falsa;
  a substituição de configuração em produção permanece preservada.
- Home, Busca, Mapa e Paradas deixam de oferecer links de demonstração.
- Os destinos de navegação das features e da barra inferior são rotas oficiais.
- URLs antigas seguem o fallback existente: `/` sem sessão e `/home` com sessão.
- Os testes de roteamento passam a verificar a indisponibilidade com e sem sessão,
  e nas configurações de desenvolvimento e produção.
- Os testes com HTTP simulado verificam o uso dos serviços oficiais, preservação
  da sessão e erro visível ao acessar URLs antigas.

## Dependências restantes e preservação

`features/preview/preview-services.ts` e `preview-data.ts` continuam usados por
`preview.spec.ts`. O arquivo de rotas demonstrativas permanece no disco, sem
registro ou import pelo aplicativo. Ramificações `isPreview` permanecem nas
features para remoção posterior. Os arquivos da OPE-37, inclusive as referências
legadas no shell, foram mantidos. O input `preview` da barra inferior permanece
compatível com esse shell, mas não gera destinos demonstrativos.

As fixtures em `src/testing/fixtures/`, dependências locais, configurações do
editor e capturas em `docs/previews/` foram preservadas.

## Validação pendente

Somente inspeção estática nesta execução. Nenhum teste, lint, build, benchmark,
servidor ou chamada HTTP foi executado. Não há novo resultado de coverage.

Comandos para execução manual pelo responsável:

```bash
npm run ng -- test --watch=false --coverage
npm run lint
npm run build
git diff --check
```

No navegador autorizado, conferir URLs antigas com e sem sessão, estados de
erro/vazio e navegação oficial. Conferir moldura, rolagem e temas sem tomar
fixtures ou HTTP simulado como prova de integração Laravel.
