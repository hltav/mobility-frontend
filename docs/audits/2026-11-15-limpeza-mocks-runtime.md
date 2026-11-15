# Limpeza dos mocks de runtime — Fase 4

## Baseline informada pelo responsável

A Fase 3 foi validada manualmente com 119 testes aprovados, build concluído,
lint sem erros e `git diff --check` limpo. Coverage informado:

| Métrica    | Cobertura |
| ---------- | --------: |
| Statements |    69,17% |
| Branches   |    67,72% |
| Functions  |    70,20% |
| Lines      |    73,05% |

Esses resultados são anteriores à Fase 4. Nenhuma validação executável foi
realizada nesta fase e não há novo percentual de cobertura. Não foram alterados
thresholds, exclusões ou contratos HTTP.

## Consumidores e migração

O consumidor restante dos providers e dados demonstrativos era `preview.spec.ts`;
o arquivo de rotas desconectado também importava os providers. Os cenários de
componentes agora usam `src/testing/providers/transit.providers.ts` e as fixtures
existentes em `src/testing/fixtures/transit.fixture.ts`, preservadas integralmente.

Os providers sintéticos são exclusivos de testes. Os cenários foram adaptados ao
comportamento oficial: favorito já salvo abre sua gestão, GPS depende do navegador,
estatísticas ausentes não são inventadas e logout usa o serviço de autenticação.
Os testes de indisponibilidade das URLs antigas foram preservados, inclusive os
de sessão e erros HTTP simulados. O antigo teste das configurações agora exercita
as rotas reais do aplicativo com e sem sessão.

## Remoções

- `src/app/features/preview/preview-data.ts`;
- `src/app/features/preview/preview-services.ts`;
- `src/app/features/preview/preview.routes.ts`;
- `src/app/preview.config.ts`;
- `src/app/preview.config.prod.ts`;
- substituição dessas configurações em `angular.json`;
- ramificações demonstrativas nas features fora da OPE-37;
- linha fictícia no estado vazio de Favoritos, substituída por acesso genérico à busca.

Os serviços reais, endpoints, interceptor e schemas HTTP não foram alterados.

## Pendências protegidas e limites

O shell `app.component.ts` mantém o reconhecimento legado de URLs `/preview`, pois
pertence à OPE-37. O input `preview` da barra inferior permanece para compatibilidade
com esse shell; os destinos continuam oficiais. Sua remoção depende de autorização
específica para alterar o arquivo protegido. Essas referências não registram rotas
nem fornecem dados simulados.

Landing, textos ilustrativos aprovados, moldura, CSS, temas, responsividade,
rolagem e script da OPE-37 permanecem intactos. Classes CSS antigas de demonstração
podem permanecer sem uso; não houve limpeza de estilos. Os documentos históricos
e instruções ainda descrevem etapas anteriores e precisam de consolidação futura.

As fixtures não comprovam integração Laravel. A API ainda precisa de aceite real,
incluindo identidades distintas de linha/favorito e telemetria opcional. Fallbacks
de erro para vazio e defaults de telemetria existentes não foram alterados.

## Validação manual pendente

```bash
npm run ng -- test --watch=false --coverage
npm run lint
npm run build
git diff --check
```

Conferir também GPS permitido/negado, favoritos, estados de erro/vazio, logout,
URLs antigas com e sem sessão e apresentação em ambos os temas. Sem commit,
publicação ou início automático de outra fase.
