# [OPE-<número>] — Título objetivo da entrega

<!-- Modelo oficial obrigatório. Substitua instruções/placeholders por informações reais antes de publicar. Preserve todas as seções e subseções; quando não aplicável, justifique objetivamente. Não invente card, resultado, evidência ou aceite. -->

Descrição resumida da alteração e do resultado esperado.

**Linear:** identificador real e link completo do card no workspace Open Transit.

**Origem:** branch real da entrega.

**Destino:** `develop` para desenvolvimento; `master` somente para release de `develop`.

**Tipo:** feature / fix / refactor / chore / docs / build / ci / test / release.

<!-- O card deve aparecer fora de comentários HTML e corresponder ao ID da branch em PR para develop. Em release com vários cards, liste vínculos reais; não invente um card agregador. Tipo da entrega não define automaticamente o prefixo da branch: siga docs/git-workflow.md. -->

## Objetivo

<!-- Problema, contexto, resultado esperado e critérios de aceite do card. Diferencie o escopo deste PR do aceite global de um card maior e identifique entregas parciais. -->

## Principais entregas

### Funcionalidades e alterações

<!-- Mudanças efetivamente implementadas, correções e módulos/componentes impactados. Não apresentar planejamento como implementação concluída. -->

### Arquitetura e integrações

<!-- Estrutura e dependências; impacto em contratos HTTP (endpoints, métodos, payloads, envelopes, IDs, schemas Zod, erros e compatibilidade), autenticação/sessão e cache PWA. Declare explicitamente quando não houver mudança. -->

### Infraestrutura e governança

<!-- CI/CD, hooks, configuração, Docker quando no escopo autorizado e impacto no desenvolvimento. Separe implementado localmente, preparado e efetivamente ativo no serviço remoto. -->

### Documentação

<!-- Documentos criados/atualizados, ADRs e relatórios existentes. Não inventar ADR, issue ou link. -->

## Fluxo de integração

<!-- Desenvolvimento: feature/fix/docs/refactor/test/chore por card real → develop. Release: develop do próprio repositório → master. Informe o fluxo aplicável. Uma exceção formal não contorna os checks atuais: exige decisão e eventual ajuste autorizado da política em tarefa própria. -->

<!-- Para release: relacionar cards/PRs/commits, versão ou SHA, validação integrada em develop, efeitos de deploy e atualização PWA quando aplicável. Não declarar integração ou publicação ainda não realizada. -->

## Validações realizadas

<!-- Marque apenas verificações realmente executadas. Para itens não executados/não aplicáveis, mantenha desmarcados e justifique na tabela ou no texto. Identifique SHA/árvore, ambiente e data; evidência histórica não é nova execução. -->

- [ ] Instalação reproduzível de dependências.
- [ ] Lint e verificações de formatação pertinentes.
- [ ] Typecheck, quando aplicável; distinguir execução isolada de validação pelo build.
- [ ] Testes unitários.
- [ ] Testes de integração, quando aplicável.
- [ ] Build.
- [ ] Testes E2E, quando aplicável.
- [ ] Validação de contratos, quando aplicável.
- [ ] Verificações de segurança de produção e desenvolvimento.
- [ ] Validação manual da interface, quando aplicável.

| Comando ou roteiro | Resultado real | SHA/árvore, ambiente, data e limitações |
| ------------------ | -------------- | --------------------------------------- |
|                    |                |                                         |

<!-- Frontend funcional: registrar npm ci, npm run lint, npm run build, npm run ng -- test --watch=false, npm run test:governance e os dois audits conforme impacto. Não declarar Vitest direto corrigido sem evidência. Em documentação, justificar comandos funcionais não executados. Unidade e HTTP simulado não são E2E; manifest válido não comprova instalação standalone. -->

### Evidências técnicas

<!-- Diffs, arquivos, logs sanitizados, contagem de testes e condições reproduzíveis. Distinguir fixtures, HTTP simulado e API real. -->

### Evidências visuais

<!-- Quando aplicável: rota, viewport, tema, captura, build e fixtures/API real. Avaliar mobile-only/PWA-first, teclado, foco e acessibilidade conforme impacto. Se não aplicável, justificar. Não incluir dados pessoais ou capturas locais sem revisão. -->

### Resultado do build

<!-- Comando/configuração, resultado, tamanho quando relevante, avisos e falhas. Se não executado ou não aplicável, explicar o motivo. Não afrouxar budgets para ocultar regressões. -->

## Segurança

- [ ] Nenhuma credencial ou segredo incluído no conteúdo do PR.
- [ ] Nenhum arquivo .env sensível, baseline ou perfil pessoal incluído.
- [ ] Nenhum artefato de build ou arquivo temporário indevido incluído.
- [ ] Dependências e vulnerabilidades de produção/desenvolvimento avaliadas.
- [ ] Permissões, autenticação, sessão e cache revisados quando afetados; justificar não aplicabilidade.
- [ ] Riscos novos e preexistentes identificados e documentados.

<!-- Registrar alcance e limites da busca por segredos, advisories e overrides; audit limpo não é garantia universal de segurança. Não ocultar falha nem ampliar permissões incidentalmente. -->

## Limitações conhecidas

<!-- Problemas conhecidos, avisos, riscos/regressões, testes não executados, restrições de ambiente e limites das evidências. Para cada pendência, indicar responsável e condição de encerramento. Referenciar somente issues reais. -->

## Fora do escopo

<!-- O que não foi implementado, funcionalidades adiadas e tasks relacionadas reais. Distinguir fora do escopo de critério do próprio PR ainda não atendido. -->

## Revisão antes do merge

- [ ] Branch de origem correta e diff/commits reais conferidos.
- [ ] Branch de destino correta; desenvolvimento para develop, release de develop para master.
- [ ] Card Linear real vinculado e escopo/critério de aceite lidos.
- [ ] Critérios deste PR atendidos; aceite global parcial e pendências explicitados quando existirem.
- [ ] Todas as seções e subseções do template preenchidas, sem placeholders; não aplicabilidades justificadas.
- [ ] Alterações locais de terceiros e arquivos retidos preservados; conteúdo selecionado revisado.
- [ ] Evidências, testes e resultados do build registrados com avisos e limites reais.
- [ ] PR policy, Security, Install, Build, Angular tests e Lint comprovados no GitHub conforme política ativa; distinguir configuração preparada de proteção ativa.
- [ ] Arquivos sensíveis, artefatos, contratos HTTP e riscos revisados conforme impacto.
- [ ] Documentação, contratos e changelog atualizados conforme impacto.
- [ ] Conversas resolvidas e revisão formal por pessoa elegível atendida quando exigida; autor não aprova formalmente o próprio PR.
- [ ] Merge autorizado explicitamente pelo mantenedor responsável; não executar merge automaticamente.
- [ ] Rastreabilidade conferida; Done somente após integração e aceite, pela gestão responsável do Linear.
- [ ] Rollback descrito ou não aplicabilidade justificada.

<!-- Para releases develop → master, confirmar adicionalmente validação integrada em develop e efeitos de deploy. Checks verdes não substituem autorização do mantenedor. -->

## Rollback

<!-- Descrever reversão e validação segura; preferir novo PR de revert, preservando histórico. Considerar dependências vulneráveis reintroduzidas, contratos/dados e clientes PWA com worker anterior. Não usar reset ou force push nas branches protegidas. Se não aplicável, justificar objetivamente. -->

## Referências

<!-- Card real, issues relacionadas, PRs/commits, documentação técnica, ADRs/relatórios existentes e evidências pertinentes. Se não houver issue adicional/ADR, declarar isso. -->
