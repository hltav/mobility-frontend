## Card Linear

- Identificador real da equipe OPE:
- Link completo do card no workspace [Open Transit](https://linear.app/open-transit):
- Classificação e escopo aprovado:
- Destino: `develop` para funcionalidade/correção/documentação; `master` somente para release aprovada de develop.

<!-- Não usar OPE-XX ou IDs ilustrativos como cards reais. Todo PR de feature aponta para develop. -->

## Resumo da mudança

<!-- Objetivo, problema concreto e comportamento/documentação resultante. -->

## Contexto

<!-- Critérios de aceite, dependências e limites do card. -->

## Alterações realizadas

<!-- Listar mudanças efetivamente implementadas. -->

## Evidências técnicas

<!-- Arquivos, resultados, logs sanitizados e verificações relevantes; identificar build/SHA e ambiente quando disponíveis. -->

## Evidências visuais

<!-- Quando necessário: rota, viewport, tema, captura, build e indicação de fixtures ou API real. Caso contrário, justificar não aplicável. -->

## Testes executados

| Comando/roteiro | Resultado | Ambiente e limitações |
| --------------- | --------- | --------------------- |
|                 |           |                       |

<!-- Distinguir unidade, HTTP simulado, navegador e E2E real. Indicar explicitamente testes não executados e o motivo. -->

## Resultado do build

- Comando/configuração:
- Resultado:
- Avisos, falhas ou justificativa para não execução:

<!-- Não apresentar resultado histórico como nova execução. Em documentação, justificar quando build não se aplica. -->

## Impacto em contratos HTTP

<!-- Endpoints, métodos, envelopes, schemas Zod, IDs, erros e compatibilidade. Se nenhum, declarar. -->

## Riscos e regressões

<!-- Separar dívida anterior, regressão nova, impacto de sessão/cache e dependências externas. -->

## Pendências

<!-- Responsável, impacto e condição de encerramento; declarar quando não houver. -->

## Checklist de aceite

- [ ] Card real, link e escopo correspondem à mudança.
- [ ] Branch de destino correta: features para develop; release develop→master.
- [ ] Critérios atendidos ou pendências explicitadas.
- [ ] Alterações locais de terceiros preservadas; conteúdo selecionado revisado.
- [ ] Evidências técnicas e visuais pertinentes apresentadas, com fixtures identificadas.
- [ ] Testes e resultado do build registrados, com limitações e avisos.
- [ ] Mobile-only/PWA-first, temas e acessibilidade avaliados quando afetados.
- [ ] Sessão, dados sensíveis, HTTP/Zod e PWA avaliados quando afetados.
- [ ] Documentação, contratos e changelog atualizados conforme impacto.
- [ ] Sem segredos, baselines, perfis pessoais ou artefatos indevidos.
- [ ] Checks definidos para o repositório atendidos antes do merge.
- [ ] Autorização do mantenedor responsável registrada e revisão formal atendida quando exigida; não presumir autoaprovação formal pelo autor.
- [ ] Rastreabilidade Linear conferida; Done somente após integração e aceite, pela gestão responsável.
- [ ] Rollback descrito ou não aplicabilidade justificada.

## Procedimento de rollback

<!-- Quando aplicável: commit/release a reverter, impacto e validação. Para PWA, considerar assets coerentes e clientes com worker anterior. Justificar quando não aplicável. Não executar operações destrutivas incidentalmente. -->
