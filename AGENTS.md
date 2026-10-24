# Instruções operacionais — Open Transit

## Escopo e preservação

- Use Open Transit como nome oficial provisório na documentação. A identidade visual atual é referência aprovada de desenvolvimento; identidade comercial é decisão futura. Não promova candidatos a marca definitiva nem altere textos/assets da aplicação em tarefa documental.
- Trabalhe no frontend oficial. Antes de editar, leia status, branch, remotes e diffs; inspecione também arquivos não rastreados. Preserve alterações locais, inclusive no mesmo arquivo. Não use reset/clean, restauração global ou checkout destrutivo.
- Leia [arquitetura](docs/architecture.md), [engenharia](docs/engineering.md), [contratos](docs/api-contracts.md) e a auditoria pertinente. Diferencie estado observado de padrão futuro. Relatórios de lote são históricos.
- Faça correções legítimas dentro do escopo autorizado. Peça autorização quando a ação exceder esse escopo; não transforme regras de organização em impedimento a correções necessárias. Evite refatoração independente da tarefa.
- Backend Laravel/Go, Docker Compose, GTFS, sincronizações administrativas e migrações exigem autorização específica. Referências fora do frontend são somente leitura por padrão. `/lines/search` chama sincronização no processor: não o acione como simples verificação.
- Não exponha credenciais, tokens, dados pessoais ou localização em logs, fixtures, capturas e documentos. Baselines e perfis em `.migration-baselines/` são locais, não publicáveis.
- Use cards reais da equipe OPE no [Linear Open Transit](https://linear.app/open-transit) como referência do escopo aprovado. A gestão do workspace cabe ao responsável do projeto; não altere cards ou configurações incidentalmente. Veja [rastreabilidade](docs/linear-workflow.md).

## Etapas de trabalho

- Implementação altera comportamento somente no escopo aprovado e preserva funcionalidades reais e contratos existentes.
- Auditoria inspeciona e valida; documentar um problema não autoriza corrigi-lo fora do escopo.
- Documentação consolida fatos e políticas; não altera código, textos da aplicação, assets ou contratos para fazê-los coincidir com o documento.
- Publicação é etapa separada: prepare conteúdo, evidências e riscos para revisão. Não faça commits, push, abertura/merge de PR, proteção ou alteração de branch automaticamente. Execute apenas operações explicitamente autorizadas; nesta consolidação, nenhuma delas está autorizada.

## Arquitetura e Angular

- Aplicação standalone com rotas lazy. `core/`: sessão, guards, interceptors, HTTP, schemas e mappers. `shared/`: apresentação reutilizável e toast. `features/`: páginas e fluxos. Evite dependências de core/shared para features.
- Use componentes pequenos, templates declarativos e `@if`/`@for` com identidade estável. Separe template/CSS conforme a complexidade. Preserve semântica, teclado, labels, autocomplete e foco. Prefira `inject` e APIs de inputs já adotadas no projeto.
- Mantenha `strict` e `strictTemplates`. Use `unknown` nas fronteiras, Zod e tipos inferidos. Evite novos `any`, casts que substituam validação e non-null assertions sem invariante comprovada. Dívida legada não justifica sua expansão.
- Signals para estado síncrono; `computed` para derivados; RxJS para HTTP, eventos e polling. Use cancelamento de resultados obsoletos, `switchMap` quando adequado e `takeUntilDestroyed`/descarte explícito. Callbacks GPS devem verificar destruição e liberar loading. Não copie estado derivável por effects.

## HTTP, sessão e erros

- Centralize HTTP nos serviços e URLs no environment. Valide DTOs com Zod; normalize em mappers. Declaração TypeScript não valida payload. Preserve `database_id`, `sptrans_id` e `favorite_id` como identidades diferentes.
- Confira código do contrato e backend em leitura antes de mudar envelope/payload. Mudança de backend ou da política de sessão exige escopo próprio. Não invente endpoints, ETA, velocidade, estatísticas ou dados de transporte.
- Bearer somente na origem/caminho da API, excluindo login/cadastro. 401 protegido invalida localmente sem logout recursivo. Nunca envie token a OSRM, tiles ou terceiros.
- Sessão atual usa `auth_token` e `user` em localStorage; presença não comprova validade e mantém risco de XSS. Não amplie armazenamento sensível nem migre unilateralmente para cookies. Logout offline não garante revogação remota. Não registre senha ou resposta de autenticação.
- Distinga rede, 401, 404, 422, schema inválido, vazio e carregamento. Apresente recuperação e previna duplo envio. Não transforme indisponibilidade silenciosamente em sucesso/vazio sem decisão explícita.
- Use bindings seguros. Em Leaflet, dados dinâmicos em `textContent`/DOM; não interpole entrada externa em HTML nem introduza bypass de sanitização.

## Mobile-only, temas e PWA

- Trabalhe mobile-only e PWA-first: considere instalação, ciclo de atualização, conectividade e recuperação ao projetar a experiência, preservando os limites atuais de cache e os dados reais.
- A experiência mobile é o produto. Preserve uso da mesma experiência em viewport grande, sem versão desktop paralela ou moldura de aparelho. Registre divergências legadas antes de corrigi-las.
- Valide 320/360/390 px, teclado virtual, zoom, orientação, safe areas, foco, rolagem e redução de movimento. Use viewport dinâmica; evite altura fixa que corte conteúdo. Mire controles de toque de pelo menos 44 px; seletores atuais de 26 px são dívida a avaliar.
- Reutilize tokens de `src/styles/theme.css` e componentes compartilhados. Tema único em `ThemeService`: claro/escuro/sistema, chave `mobility-theme`, migração de `theme` e descarte do listener. Não duplique paletas/controle de tema por página.
- Não introduza mocks silenciosos nem substitua falha da API por dados fictícios. `/preview` é exclusivo de desenvolvimento: preserve a substituição de `preview.config.ts` por `preview.config.prod.ts` no build de produção e a ocultação dos links. Não importe fixtures/providers de `features/preview` em fluxos reais; testes podem usá-los explicitamente. A identidade demonstrativa não lê/grava sessão e favoritos ficam em memória. Não trate prévias como prova de integração real nem reabra sua exposição em produção sem autorização específica.
- Worker somente em produção; cache estático por allowlist, `dataGroups: []` e `/api` fora do fallback. Não adicionar cache de sessão, favoritos, GPS, posições, tiles ou OSRM sem revisão explícita.
- Atualização por ação do usuário e recarga; preserve formulários em andamento. Teste primeira carga online, offline, retorno da rede e versão nova. Manifest válido não comprova instalação standalone.
- Scripts CDP existentes limpam armazenamento da origem de teste: somente perfil descartável dedicado, nunca navegador pessoal. Não sobrescreva evidência histórica para simular nova validação.

## Validação e entrega

- Para código funcional: `npm run ng -- test --watch=false`, `npm run build` e `git diff --check`, com regressões comportamentais relevantes. Para documentação: links, comandos e consistência; não exija testes sem relação com a alteração.
- Vitest direto está quebrado por setup; use o builder Angular até correção autorizada. Não declare suíte aprovada com base em subconjunto. Unidade, template substituído e HTTP mockado não são E2E.
- Para UI, registre rota, viewport, tema, build e uso de fixtures. Declare limites. E2E com API/conta reais requer ambiente autorizado; não crie contas nem execute sincronizações incidentalmente.
- Não afrouxe budgets ou asserts para ocultar falhas. Separe warnings e problemas preexistentes de regressões. Revise segredos por padrões sem imprimir valores, artefatos, licenças e arquivos grandes.
- Siga [Git](docs/git-workflow.md): card real confirmado, Conventional Commits, PR para `develop`, release para `master`. Após a exceção inicial autorizada, sem push direto em master. Não use `git add .` em árvore com trabalho de terceiros.
- Todo PR de feature tem `develop` como destino. Merge depende dos checks definidos e da autorização do mantenedor responsável; não presuma aprovação formal do próprio PR pelo autor. Confira acesso e estados reais da equipe OPE antes de qualquer transição autorizada; não presuma integração GitHub–Linear. Entregue evidências para revisão e mantenha pendências explícitas.
