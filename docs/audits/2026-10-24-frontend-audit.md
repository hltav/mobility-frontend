# Auditoria do frontend — 24/10/2026

## Parecer

A árvore local compila em produção e passa os **97 testes em 19 arquivos** pelo builder Angular. A documentação/governança foi consolidada, mas a publicação ainda depende de revisão do escopo, aceite integrado e aprovação explícita. Não se declara prontidão ponta a ponta a partir de unidades ou HTTP simulado.

Principais pendências: integração real com Laravel, decisão sobre prévias públicas com fixtures, conformidade mobile-only das telas públicas em desktop, instalação PWA real e atualização entre builds. O script padrão `npm test` continua quebrado por configuração preexistente. Há dívida de validação HTTP, código duplicado e orçamento CSS/bundle.

Somente README e novos arquivos de documentação/governança foram editados nesta execução. Nenhum código funcional, backend Laravel/Go, Docker Compose ou banco foi alterado. Não houve criação de branch, commit, push, PR, proteção, transição Linear ou sincronização administrativa. Leituras do conector Linear foram realizadas para verificar contexto; nenhuma operação remota de escrita ocorreu.

## Fontes, método e preservação

- Frontend oficial: `/home/hudson-tavares/Projects/OPEN_TRANSIT/mobility-frontend`.
- Referência visual: `mobility-frontend-COMPLETO-VISTORIADO` no mesmo diretório pai; package/rotas consultados em leitura. Usa versão própria 2.0.0, rotas em português e imports eager; não é arquitetura/versão do frontend oficial.
- Backend: `mobility_project/mobility_backend`, rotas, controllers, requests, modelo User e serviço de paradas consultados em leitura. Não representa comprovação do ambiente implantado ou de payload real.
- Relatórios [lote 1](../migration-v2-batch-1.md) e [lote 2](../migration-v2-batch-2.md), manifests/tars e evidências de navegador existentes.
- Git: status, remotes, branches, log, diffs contra HEAD, package/lock/config, arquivos atuais rastreados e não rastreados. Não houve fetch; referências de origin são locais e podem estar desatualizadas.
- Verificação SHA-256 dos conteúdos dos tars contra manifests: **72/72** arquivos da baseline pré-lote 1 e **86/86** da pré-lote 2, zero divergências. Arquivos comparados em memória, sem extração sobre a árvore.
- Snapshot de hashes dos arquivos existentes antes das edições em `/tmp/open-transit-audit-before.json`; cópia do README anterior em `/tmp/open-transit-README-before.md`. São artefatos temporários locais, sem credenciais e sem necessidade de versionamento. A comparação final confirmou que somente o README autorizado mudou entre os arquivos preexistentes; nenhum foi removido. Links locais e formatação dos 14 documentos conferidos, sem erros, assim como `git diff --check`.

### Estado Git de entrada

HEAD: `af4a148ed012f0085fe8acb58f0d1e8dfe2b74ee`, branch `master`, tracking `origin/master`; `origin/HEAD`→`origin/master`. Remote fetch/push `git@github.com:hltav/mobility-frontend.git`. Só master nas referências inspecionadas; log também contém `76e0e74` (initial commit). **44 arquivos rastreados modificados**, sem mudanças staged; o status compacto agrupa diretórios não rastreados, detalhados no inventário ao final.

O diff rastreado inicial contra HEAD registra 4.651 inserções/1.219 exclusões; esse número não inclui os não rastreados e não é o diff dos lotes. Nenhum arquivo local existente foi removido ou restaurado.

### Limites da atribuição temporal

HEAD é anterior a alterações locais que já existiam antes dos lotes. A baseline pré-lote 1 já continha mudanças em linhas/trajeto, favoritos e schemas. A pré-lote 2 aproxima o estado após lote 1, mas não há snapshot exclusivo e imutável do fim do lote 2. A árvore atual tem telas/prévias e alterações adicionais que contradizem pendências históricas. Portanto:

- **Preexistente**: constatado na baseline anterior ao lote 1 ou em HEAD.
- **Lote 1/2**: atribuição sustentada por relatório e comparação disponível, sem imputar todas as diferenças atuais ao lote.
- **Adicional/indeterminada**: presente agora, ausente das entregas declaradas ou sem snapshot final que permita atribuir sua introdução.

Não é possível provar ausência de toda regressão nem autoria exata de cada trecho apenas por diff contra HEAD. O inventário registra diferenças sem inventar sequência de commits.

## Arquitetura anterior e atual

HEAD já possuía core/shared/features, Angular standalone, rotas lazy, Zod, HttpClient, RxJS/Signals, autenticação e Leaflet. As rotas protegidas eram busca/detalhes/favoritos; entrada e fallback levavam a login. A referência visual usa rotas/versão diferentes e não deve substituir os serviços oficiais.

Lote 1 introduziu tema, tokens/fonte, shell, Home e barra com três itens. Lote 2 adicionou onboarding/guest guard, formulários, correções de auth e PWA. Atualmente a barra tem cinco itens, existem mapa/paradas/perfil e `/preview` público; login/cadastro levam a Home. A organização continua reconhecível, porém regras de rota/layout e preview se espalham pelo shell e features. [Arquitetura consolidada](../architecture.md).

## Matriz técnica

“Implementado” indica código observado e a evidência citada, sem presumir aceite real. Risco é avaliação desta auditoria. Pendências de execução não significam que o recurso esteja comprovadamente defeituoso.

| Funcionalidade/tema             | Evidência                                                                                   | Situação                                                               | Origem                                                     | Risco                                                 | Ação recomendada                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Design System/fonte             | `styles.css`, `styles/theme.css`, `public/fonts/OFL.txt`                                    | Implementado; paleta/overrides sobrepostos                             | Lote 1 + adicional                                         | Médio: manutenção/contraste                           | Consolidar tokens/overrides em tarefa própria; validar contraste                                 |
| Claro/escuro/sistema            | ThemeService, inicialização em index, testes de tema                                        | Implementado, persistência e listener                                  | Lote 1                                                     | Baixo residual                                        | Conferir mudança do sistema/reload em dispositivo                                                |
| Shell mobile                    | AppComponent, `dvh`, safe areas, skip-link                                                  | Implementado parcialmente conforme padrão desejado                     | Lote 1 + adicional                                         | Médio: corte/rolagem                                  | Validar teclado, zoom, rolagem e avisos                                                          |
| Mobile-only sem moldura         | Media queries em `styles.css` para `.entry-page`/`.auth-screen`, ≥1024 px                   | Divergente: moldura 390 px, raio 42 px e sombras em desktop browser    | Adicional/indeterminada; contraria “sem moldura” histórico | Médio, critério de produto                            | Aprovar correção funcional ou exceção explícita antes de publicar                                |
| Navegação inferior              | BottomNav, shell, testes                                                                    | Cinco itens; omitida em entradas/detalhes/paradas                      | Lote 1 + adicional                                         | Baixo/médio                                           | Validar destinos, ativo e retorno; relatório de três itens é histórico                           |
| Home e serviços                 | HomeComponent, BusLines/Favorites, testes                                                   | Implementada com loading/erro, query params, GPS                       | Lote 1 + adicional                                         | Médio, integração não exercitada                      | Aceitar com API real, sessão e permissão GPS                                                     |
| Onboarding                      | Rota `/`, guestGuard, componente                                                            | Implementado                                                           | Lote 2 + ajustes                                           | Baixo                                                 | Revisão visual atual em 320/360/390 px                                                           |
| Login/cadastro                  | Forms, Zod, AuthLayout, testes                                                              | Implementados; duplo envio/422/rede tratados                           | Lote 2 + ajustes                                           | Médio até teste real                                  | Validar conta real autorizada; resposta/redirect atual `/home`                                   |
| Envelope de cadastro            | AuthService usa mapAuthResponse como login                                                  | Correção implementada                                                  | Defeito preexistente corrigido no lote 2                   | Médio: schema de user exige campos nullable presentes | Capturar resposta real sanitizada de cadastro/login                                              |
| Bearer para terceiros           | authInterceptor calcula origem + prefixo API; testes                                        | Corrigido; exclui login/register                                       | Vazamento potencial preexistente corrigido no lote 2       | Alto se regredir                                      | Manter regressão externa/path boundary e produção `/api`                                         |
| 401 recursivo                   | invalidateSession sem HTTP; teste auth                                                      | Corrigido                                                              | Defeito preexistente corrigido no lote 2                   | Alto se regredir                                      | Manter teste 401 protegido e login inválido                                                      |
| Persistência/validade de sessão | AuthService localStorage e authGuard                                                        | Parcial: presença do token, sem `/me`/refresh/sincronização entre abas | Preexistente                                               | Médio: XSS/token expirado/UI desatualizada            | Definir política com backend; não mudar unilateralmente                                          |
| Storage indisponível            | getToken/saveAuthData/invalidateSession sem try/catch; getUser protegido                    | Parcial                                                                | Núcleo preexistente                                        | Médio: exceção ou gravação parcial                    | Testar indisponibilidade/quota e limpeza consistente em correção autorizada                      |
| Logout offline                  | Limpeza antes do POST e teste HTTP                                                          | Implementado localmente                                                | Lote 2                                                     | Médio: revogação remota não garantida                 | Documentar e testar reconexão/política de token                                                  |
| Busca/DTOs/trajeto              | SearchComponent, normalização e testes                                                      | Implementados; fallbacks safe convertem falhas em vazio                | Parte já na baseline pré-lote 1, UI adicional              | Médio: vazio mascara indisponibilidade                | Diferenciar falha e vazio; E2E com origem/destino                                                |
| IDs de favoritos                | getFavorites preserva favorite_id, tela exclui por ele, teste com 91/7/9000                 | Implementado no estado atual                                           | Adicional; relatório antigo ainda apontava defeito         | Alto se IDs confundidos                               | Aceitar POST/DELETE real; Home/busca/detalhes encaminham favorito existente à tela de favoritos  |
| Detalhes e paradas da linha     | getById/getStops, filtros e testes                                                          | Implementados estaticamente                                            | Serviços em parte preexistentes; UI adicional              | Médio: aliases/itens descartados                      | Validar contrato real e sentido, sem inventar IDs internos                                       |
| Mapa/tempo real                 | MapPage, Leaflet, polling 10 s                                                              | Implementado, não aceito com API real                                  | Adicional ao escopo declarado                              | Médio: rede externa/atualidade                        | Validar polling, troca de linha, destruição e estado stale                                       |
| Telemetria ausente              | RealTimeBusSchema defaults moving/accessible false; timestamp opcional                      | Parcial                                                                | Defaults preexistentes                                     | Médio: inferência exibida como estado real            | Distinguir desconhecido e medir freshness antes de prometer “Ao vivo”                            |
| Caminho OSRM                    | getRoutePath externo com fallback a pontos                                                  | Implementado com aproximação                                           | Preexistente na baseline pré-lote 1                        | Médio: caminho não é GTFS oficial                     | Rotular aproximação e testar indisponibilidade/volume                                            |
| Paradas próximas                | StopsService/schema, tela limita 500 m/5, testes                                            | Implementado; ETA só se fornecido                                      | Adicional                                                  | Médio até payload real                                | Validar point/stops null, linhas e ausência de previsão                                          |
| Perfil                          | Identidade local, contagem favoritos, placeholders de buscas/rotas e futuras opções         | Parcial de produto                                                     | Adicional                                                  | Baixo/médio                                           | Não anunciar edição, histórico, ajuda ou notificações como prontos                               |
| Fixtures em produção            | app.routes carrega preview sem condição; chunk preview-routes no build                      | Implementado/publicamente acessível por rota                           | Adicional, não presente nas entregas declaradas            | Médio: confusão de produto e bundle/cache             | Decisão explícita para excluir/isolar ou publicar demonstração identificada; não é bypass da API |
| Segurança de popups             | MapComponent usa DOM/textContent para prefixo/status                                        | Implementado estaticamente                                             | Estado adicional atual                                     | Baixo residual                                        | Preservar bindings seguros e revisar toda nova entrada dinâmica                                  |
| Manifest/ícones                 | JSON, leitura de dimensões PNG 192/512 any/maskable                                         | Implementados                                                          | Lote 2                                                     | Baixo                                                 | Revisar área segura/Apple e identidade final                                                     |
| Worker/cache                    | app.config/ngsw, build com 33+12 URLs, dataGroups vazio, sem API                            | Implementado/configuração validada                                     | Lote 2                                                     | Médio: hospedagem real não conferida                  | HTTPS/proxy/fallback/cache headers e ensaio do build atual                                       |
| Offline                         | JSON histórico do navegador e status PWA                                                    | Shell validado historicamente; atual só artefato                       | Lote 2                                                     | Médio: expectativa de dados offline                   | Repetir navegador com build atual; não prometer API offline                                      |
| Atualização PWA                 | PwaService + teste de eventos                                                               | Implementada por unidade                                               | Lote 2                                                     | Médio: dois builds instalados não ensaiados           | Testar versão nova/irrecuperável e formulário pendente                                           |
| Instalação standalone/Android   | JSON histórico `validated:false`                                                            | Pendente                                                               | Limite declarado no lote 2                                 | Médio                                                 | Instalar manualmente e registrar execução real                                                   |
| HTTP produção                   | environment.prod `/api`, preview proxy                                                      | Configurado; implantação não validada                                  | Lote 2                                                     | Alto se host não tiver proxy                          | Conferir contrato/infra sem mudar backend/Compose                                                |
| Legibilidade/duplicação         | Assinaturas de linha em busca/serviço; coordenadas em mapa/serviço; CSS/guards por URL      | Dívida                                                                 | Preexistente + expansão adicional                          | Médio                                                 | Extrair só semântica comum em tarefa com regressões; evitar refatoração incidental               |
| Tipagem/erros                   | `any` em favoritos/realtime/OSRM; envelopes e descartes safeParse                           | Parcial                                                                | Preexistente em parte comprovada                           | Médio: dado inválido oculto                           | Schemas/envelopes e observabilidade sanitizada                                                   |
| Descarte assíncrono             | takeUntilDestroyed predominante; GPS/reverse/favorites em busca ainda sem proteção uniforme | Parcial                                                                | Preexistente em busca                                      | Médio: callback após navegação                        | Uniformizar cancelamento/proteção com teste de destruição                                        |
| Testes padrão                   | Vitest aponta src/test-setup.ts ausente                                                     | Falha reproduzida                                                      | Preexistente na baseline pré-lote 1                        | Médio: colaboradores/CI podem usar comando errado     | Corrigir em escopo funcional; usar builder documentado                                           |
| Qualidade de evidência          | app.spec testa 1+1; alguns testes substituem templates/mapa                                 | Parcial                                                                | app.spec preexistente; testes adicionais mistos            | Médio: falsa cobertura                                | Contar testes sem equiparar a cobertura/E2E; priorizar cenários reais                            |

### Observação de segurança no backend de referência

`routes/api.php` declara `/admin/sync/valkey` e rotas `/internal/*` fora do grupo `auth:sanctum`. Isso é evidência estática de ausência desse middleware no arquivo, **não comprovação de exposição externa**, pois infraestrutura/outros controles não foram auditados. Preexistente fora dos lotes frontend; encaminhar para revisão de plataforma em tarefa própria. Nenhum endpoint foi acionado e nenhuma correção de backend foi feita.

## Validações executadas nesta auditoria

| Comando/verificação                | Resultado e limite                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run ng -- test --watch=false` | Exit 0; 19 arquivos, 97 testes; builder Angular com compilação de templates, Vitest 4.1.5. Não há cobertura E2E comprovada                             |
| `npm run build`                    | Exit 0; produção, inicial 645,69 kB, transferência estimada 142,07 kB; dist gerado localmente/ignorado                                                 |
| `npm test -- --run`                | Exit 1; 19 suítes falham no setup ausente; nenhum teste executado nessa tentativa                                                                      |
| `git diff --check`                 | Sem erros no estado inspecionado; repetido depois da documentação                                                                                      |
| `npm ls --depth=0`                 | Exit 0; dependências resolvidas coerentes com core/worker, cinco extraneous: emnapi core/runtime/wasi-threads, napi-rs wasm-runtime, tybys wasm-util   |
| Hashes das baselines               | 72/72 e 86/86 conferidos, sem recuperar arquivos sobre a árvore                                                                                        |
| Manifest/PNGs                      | Dimensões declaradas 192/512 conferem para any e maskable                                                                                              |
| `dist/.../ngsw.json`               | 33 URLs app-shell + 12 static-assets, dataGroups vazio, sem `/api` no hashTable                                                                        |
| Scan de segredos                   | Padrões em arquivos rastreados + candidatos não ignorados e nos dois commits alcançáveis; nenhum candidato nos padrões usados. Não é garantia absoluta |
| Artefatos/tamanho                  | Nenhum candidato não ignorado acima de 1.000.000 bytes; sem dist/node_modules/baselines/.env/.aws rastreados                                           |

Node 22.22.0/npm 10.9.4; Angular core/worker 21.2.11, CLI/build 21.2.9 e TypeScript 5.9.3. Nenhuma dependência foi instalada/atualizada. `npm ci`, auditoria de vulnerabilidades online e teste de instalação limpa não foram executados.

### Avisos do build atual

- Inicial: 645,69 kB, acima do warning 500 kB em 145,69 kB, abaixo do limite de erro 1 MB.
- CSS: perfil 5,63 kB; paradas 5,12 kB; mapa 4,91 kB; Home 4,29 kB; detalhes 7,82 kB; onboarding 5,23 kB. Warning por componente 4 kB, erro 8 kB. Detalhes está próximo do limite de erro.
- Leaflet CommonJS: bailout de otimização.

O warning inicial e o CommonJS já constam dos relatórios/baseline. Warnings CSS atuais não foram mencionados nas validações históricas; não é possível atribuir cada um a um lote sem recompilar seu snapshot final, indisponível. Não se alteraram budgets.

### Evidência histórica versus atual

O lote 1 relata 21 testes selecionados/5 arquivos e build de 643,32 kB; lote 2 relata 42/10 e 655,47 kB. São resultados históricos de subconjuntos e de árvores diferentes, não números atuais. O [JSON do navegador](../previews/pwa-browser-validation.json) registra worker/manifest/login offline com hash anterior; o [standalone](../previews/pwa-standalone-validation.json) registra limitação explícita. Nenhum navegador/API real/Android foi reexecutado nesta auditoria. Screenshots existentes foram inventariadas; não houve novo aceite de fidelidade visual, contraste ou teclado.

## Auditoria da documentação anterior

| Documento/configuração anterior | Informação válida preservada                                       | Desatualização/lacuna                                                                                        | Tratamento                                                                   |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| README Angular genérico         | Uso de serve/build, artefatos dist e testes Angular                | Inglês, sem produto/HTTP/PWA; `ng e2e` sem target; CLI confundível com core                                  | Reescrito em PT-BR com comandos npm locais, limitações e índice              |
| Relatório lote 1                | Baseline, fonte/licença, escopo, testes selecionados e limites     | Três itens e telas futuras não descrevem árvore atual; “sem mocks nas rotas” não vale para preview atual     | Preservado integralmente como histórico; divergências registradas aqui       |
| Relatório lote 2                | Envelope, interceptor, cache/worker e evidências/limite standalone | Redirect `/search` agora é `/home`; busca/mapa/perfil já têm código; portas/processos são contexto histórico | Preservado integralmente; comportamento atual em arquitetura/desenvolvimento |
| JSON/capturas em docs/previews  | Evidências de momentos anteriores e fixtures                       | Sem vínculo uniforme com SHA/tema/viewport/ambiente de cada captura; não aprovam backend                     | Inventário preservado; próximos registros devem ter contexto                 |
| VS Code tasks/launch            | Configuração de desenvolvimento existe                             | Task npm test quebrada; URL Chrome 9876 é legado; setup/test runner divergentes                              | Não editado; alerta em desenvolvimento, correção pendente                    |
| package/lock/environments       | Fontes reais de versões e URLs                                     | Faixas não são versões instaladas; produção agora `/api`; versão visual 2.0.0 não oficial                    | Versões observadas e responsabilidades de proxy documentadas                 |
| Baselines locais                | Recuperação seletiva, manifests válidos                            | Snapshot/perfil não é documento publicável nem material para Git                                             | Mantidos ignorados; sem extração destrutiva                                  |

Antes desta auditoria não existiam AGENTS, CONTRIBUTING, CHANGELOG, arquitetura/engenharia/desenvolvimento/contratos/PWA/Design System/Git/Linear consolidados nem template de PR. Não havia contrato uniformizado de paginação, IDs, fallbacks, autenticação ou erro. Os relatórios tinham boa informação de PWA, mas não um guia operacional separado e atual.

## Documentos entregues e padrão de colaboração

README atualizado; criados [AGENTS](../../AGENTS.md), [CONTRIBUTING](../../CONTRIBUTING.md), [CHANGELOG](../../CHANGELOG.md), [arquitetura](../architecture.md), [engenharia](../engineering.md), [desenvolvimento](../development.md), [contratos](../api-contracts.md), [PWA](../pwa.md), [Design System](../design-system.md), [Git](../git-workflow.md), [Linear](../linear-workflow.md), [template de PR](../../.github/PULL_REQUEST_TEMPLATE.md) e este relatório. Os dois relatórios históricos e suas evidências não foram sobrescritos.

AGENTS define arquitetura, componentes, strict, Signals/RxJS/Zod, sessão/erros, mobile-only, temas, PWA, validação, preservação e limites de backend/Git. Regras não impedem correções legítimas dentro do escopo. Docs separam política futura, comportamento observado e pendências.

Git proposto: master estável, develop de integração, branches feature/fix/docs por card confirmado, Conventional Commits e PR para develop; release develop→master. Após exceção inicial aprovada, sem push direto em master. CI/proteções ainda não configuradas nesta árvore nem verificadas remotamente.

Linear somente leitura retornou workspace `<Cand!date!>` e equipe PAV, sem Open Transit/OPE. Estados/permissões/integração GitHub–Linear de Open Transit **não verificados**; nenhum card vinculado/alterado. In Progress/In Review/Done são fluxo desejado, com Done condicionado à integração e aceite real.

## Pendências priorizadas para decisão

| Prioridade                     | Pendência                                                             | Condição de encerramento                                                             |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Alta para aceite               | Login/cadastro e fluxos HTTP reais, envelopes nullable, favoritos/IDs | Roteiro integrado com conta autorizada e evidência sanitizada                        |
| Alta para escopo da publicação | Trabalho adicional e preview público com fixtures                     | Responsável aprova composição exata; isolamento/remoção só com autorização funcional |
| Alta para critério mobile-only | Moldura nas telas públicas desktop e uso em 320/360 px                | Revisão e correção autorizada ou exceção explícita de produto                        |
| Média                          | Instalação PWA, Android e atualização entre builds                    | Execução real do roteiro PWA com builds identificados                                |
| Média                          | npm test/VS Code, cobertura útil e CI ausente                         | Configuração corrigida em tarefa própria e checks reais definidos                    |
| Média                          | Defaults/fallbacks, schemas/envelopes, tipagem, descarte GPS          | Contratos reais validados e regressões comportamentais                               |
| Média                          | CSS duplicado/budgets e toque 26 px                                   | Revisão de acessibilidade/performance sem ocultar avisos                             |
| Média                          | Sessão localStorage, falha de storage, token expirado/abas            | Política revisada com backend e cenários documentados/testados                       |
| Posterior à publicação         | develop/proteções/Linear correto                                      | Operações autorizadas, configurações reais verificadas e evidência de aplicação      |

Responsáveis e cards dessas pendências ainda precisam ser confirmados; não se associaram números ilustrativos nem promessas de entrega.

## Preparação da entrega inicial

O [plano Git](../git-workflow.md) detalha staging seletivo, agrupamento de commits, aprovação excepcional em master e criação posterior de develop. Antes da operação remota, revisar conteúdo exato, atualizar referências com autorização, resolver divergências sem force push, verificar segredos/artefatos, validar a combinação selecionada e aprovar riscos. Os checks desta auditoria pertencem à árvore completa local, não a um subconjunto hipotético de commits.

Scan por padrões: chaves privadas PEM/OpenSSH, prefixos GitHub/AWS, valores longos Bearer e atribuições literais de password/secret/api key/access token. Nenhum candidato encontrado; verificou-se também histórico alcançável dos dois commits. Isso não inspeciona credenciais ignoradas, objetos inalcançáveis ou sistemas remotos. `.vscode/mcp.json` rastreado contém configuração Angular CLI sem segredo identificado. `.env` é ignorado exatamente; variantes `.env.*` precisam de inspeção antes de staging.

Nenhum candidato publicável supera 1 MB. Capturas/licença/fonte/ícones são binários ou auxiliares legítimos, sujeitos à seleção/sanitização. Baselines contêm tars/patches, tooling baixado e perfis de navegador: devem permanecer fora do Git. Dist, node_modules, caches e temporários não devem ser publicados. Não foi removido nenhum desses arquivos.

Publicação só após revisão e aprovação; a exceção de master não foi concedida por este documento. Depois, criar develop no SHA efetivamente publicado, verificar/ativar CI e proteções com autorização e só então validar integração Linear no workspace correto.

## Inventário dos arquivos locais anteriores às edições

Gerado a partir do status de entrada e dos hashes comparados com as baselines. “Pré-L1”/“Pré-L2” indicam presença ou diferença do conteúdo atual **antes da documentação desta auditoria** contra o manifest, não autoria. `igual`, `alterado` e `novo` são comparações exatas de hash/presença. A coluna Git usa HEAD: M = rastreado modificado, ? = não rastreado. Arquivos sem mudança contra HEAD não aparecem.

| Arquivo                                                                | Git | Pré-L1   | Pré-L2   |
| ---------------------------------------------------------------------- | --- | -------- | -------- |
| `.cspell/custom-dictionary-workspace.txt`                              | M   | alterado | alterado |
| `.gitignore`                                                           | M   | alterado | igual    |
| `.vscode/settings.json`                                                | M   | alterado | alterado |
| `README.md`                                                            | M   | igual    | igual    |
| `angular.json`                                                         | M   | alterado | alterado |
| `docs/migration-v2-batch-1.md`                                         | ?   | novo     | igual    |
| `docs/migration-v2-batch-2.md`                                         | ?   | novo     | novo     |
| `docs/previews/details-mobile-dark.png`                                | ?   | novo     | novo     |
| `docs/previews/details-mobile-light.png`                               | ?   | novo     | novo     |
| `docs/previews/details-stops-dark.png`                                 | ?   | novo     | novo     |
| `docs/previews/details-stops-light.png`                                | ?   | novo     | novo     |
| `docs/previews/favorites-mobile-dark.png`                              | ?   | novo     | novo     |
| `docs/previews/favorites-mobile-light.png`                             | ?   | novo     | novo     |
| `docs/previews/home-mobile-dark.png`                                   | ?   | novo     | novo     |
| `docs/previews/home-mobile-light.png`                                  | ?   | novo     | novo     |
| `docs/previews/home-mock-dark.png`                                     | ?   | novo     | novo     |
| `docs/previews/login-mobile-dark.png`                                  | ?   | novo     | novo     |
| `docs/previews/login-mobile-light.png`                                 | ?   | novo     | novo     |
| `docs/previews/login-offline.png`                                      | ?   | novo     | novo     |
| `docs/previews/map-mobile-dark.png`                                    | ?   | novo     | novo     |
| `docs/previews/map-mobile-light.png`                                   | ?   | novo     | novo     |
| `docs/previews/nearby-stops-mobile-dark.png`                           | ?   | novo     | novo     |
| `docs/previews/nearby-stops-mobile-light.png`                          | ?   | novo     | novo     |
| `docs/previews/onboarding-desktop.png`                                 | ?   | novo     | novo     |
| `docs/previews/onboarding-mobile.png`                                  | ?   | novo     | novo     |
| `docs/previews/onboarding-theme-dark.png`                              | ?   | novo     | novo     |
| `docs/previews/onboarding-theme-light.png`                             | ?   | novo     | novo     |
| `docs/previews/profile-mobile-dark.png`                                | ?   | novo     | novo     |
| `docs/previews/profile-mobile-light.png`                               | ?   | novo     | novo     |
| `docs/previews/pwa-browser-validation.json`                            | ?   | novo     | novo     |
| `docs/previews/pwa-standalone-validation.json`                         | ?   | novo     | novo     |
| `docs/previews/register-mobile-dark.png`                               | ?   | novo     | novo     |
| `docs/previews/search-mobile-dark.png`                                 | ?   | novo     | novo     |
| `docs/previews/search-mobile-light.png`                                | ?   | novo     | novo     |
| `docs/previews/search-mock-dark.png`                                   | ?   | novo     | novo     |
| `docs/previews/search-mock-light.png`                                  | ?   | novo     | novo     |
| `ngsw-config.json`                                                     | ?   | novo     | novo     |
| `package-lock.json`                                                    | M   | alterado | alterado |
| `package.json`                                                         | M   | alterado | alterado |
| `public/fonts/OFL.txt`                                                 | ?   | novo     | igual    |
| `public/fonts/plus-jakarta-sans.ttf`                                   | ?   | novo     | igual    |
| `public/icons/icon-128x128.png`                                        | ?   | novo     | novo     |
| `public/icons/icon-144x144.png`                                        | ?   | novo     | novo     |
| `public/icons/icon-152x152.png`                                        | ?   | novo     | novo     |
| `public/icons/icon-192x192.png`                                        | ?   | novo     | novo     |
| `public/icons/icon-384x384.png`                                        | ?   | novo     | novo     |
| `public/icons/icon-512x512.png`                                        | ?   | novo     | novo     |
| `public/icons/icon-72x72.png`                                          | ?   | novo     | novo     |
| `public/icons/icon-96x96.png`                                          | ?   | novo     | novo     |
| `public/icons/maskable-192x192.png`                                    | ?   | novo     | novo     |
| `public/icons/maskable-512x512.png`                                    | ?   | novo     | novo     |
| `public/manifest.webmanifest`                                          | ?   | novo     | novo     |
| `scripts/check-pwa-standalone.mjs`                                     | ?   | novo     | novo     |
| `scripts/check-pwa.mjs`                                                | ?   | novo     | novo     |
| `scripts/preview-pwa.mjs`                                              | ?   | novo     | novo     |
| `src/app/app-shell.spec.ts`                                            | ?   | novo     | alterado |
| `src/app/app.component.ts`                                             | M   | alterado | alterado |
| `src/app/app.config.ts`                                                | M   | alterado | alterado |
| `src/app/app.routes.ts`                                                | M   | alterado | alterado |
| `src/app/core/guards/guest.guard.ts`                                   | ?   | novo     | novo     |
| `src/app/core/guards/public-entry.spec.ts`                             | ?   | novo     | novo     |
| `src/app/core/interceptors/auth.interceptor.ts`                        | M   | alterado | alterado |
| `src/app/core/mappers/normalize-bus-line.mapper.ts`                    | M   | alterado | alterado |
| `src/app/core/schemas/auth.schema.ts`                                  | M   | alterado | alterado |
| `src/app/core/schemas/bus-line-service.schema.ts`                      | ?   | alterado | alterado |
| `src/app/core/schemas/bus-line.schema.ts`                              | M   | alterado | alterado |
| `src/app/core/schemas/nearby-stop.schema.ts`                           | ?   | novo     | novo     |
| `src/app/core/schemas/real-timeBus.schema.ts`                          | M   | alterado | alterado |
| `src/app/core/services/auth.service.spec.ts`                           | ?   | novo     | novo     |
| `src/app/core/services/auth.service.ts`                                | M   | alterado | alterado |
| `src/app/core/services/bus-lines.service.ts`                           | M   | igual    | igual    |
| `src/app/core/services/favorites.service.spec.ts`                      | ?   | novo     | novo     |
| `src/app/core/services/favorites.service.ts`                           | M   | alterado | alterado |
| `src/app/core/services/pwa.service.spec.ts`                            | ?   | novo     | novo     |
| `src/app/core/services/pwa.service.ts`                                 | ?   | novo     | novo     |
| `src/app/core/services/real-time.service.ts`                           | M   | igual    | igual    |
| `src/app/core/services/stops.service.spec.ts`                          | ?   | novo     | novo     |
| `src/app/core/services/stops.service.ts`                               | ?   | novo     | novo     |
| `src/app/core/services/theme.service.spec.ts`                          | ?   | novo     | igual    |
| `src/app/core/services/theme.service.ts`                               | ?   | novo     | igual    |
| `src/app/features/auth/auth-form-errors.ts`                            | ?   | novo     | novo     |
| `src/app/features/auth/auth-layout/auth-layout.component.ts`           | ?   | novo     | novo     |
| `src/app/features/auth/login/login.component.html`                     | M   | alterado | alterado |
| `src/app/features/auth/login/login.component.ts`                       | M   | alterado | alterado |
| `src/app/features/auth/login/login.spec.ts`                            | M   | alterado | alterado |
| `src/app/features/auth/register/register.component.ts`                 | M   | alterado | alterado |
| `src/app/features/auth/register/register.html`                         | M   | alterado | alterado |
| `src/app/features/auth/register/register.spec.ts`                      | M   | alterado | alterado |
| `src/app/features/favorites/favorites.component.ts`                    | M   | alterado | alterado |
| `src/app/features/favorites/favorites.css`                             | M   | alterado | alterado |
| `src/app/features/favorites/favorites.html`                            | M   | alterado | alterado |
| `src/app/features/favorites/favorites.spec.ts`                         | M   | alterado | alterado |
| `src/app/features/home/home.component.css`                             | ?   | novo     | alterado |
| `src/app/features/home/home.component.html`                            | ?   | novo     | alterado |
| `src/app/features/home/home.component.spec.ts`                         | ?   | novo     | alterado |
| `src/app/features/home/home.component.ts`                              | ?   | novo     | alterado |
| `src/app/features/line-details/line-details-light.css`                 | ?   | novo     | novo     |
| `src/app/features/line-details/line-details.component.html`            | M   | alterado | alterado |
| `src/app/features/line-details/line-details.component.ts`              | M   | alterado | alterado |
| `src/app/features/line-details/line-details.css`                       | M   | alterado | alterado |
| `src/app/features/line-details/line-details.spec.ts`                   | M   | alterado | alterado |
| `src/app/features/map/map-page.component.css`                          | ?   | novo     | novo     |
| `src/app/features/map/map-page.component.html`                         | ?   | novo     | novo     |
| `src/app/features/map/map-page.component.spec.ts`                      | ?   | novo     | novo     |
| `src/app/features/map/map-page.component.ts`                           | ?   | novo     | novo     |
| `src/app/features/nearby-stops/nearby-stops.component.css`             | ?   | novo     | novo     |
| `src/app/features/nearby-stops/nearby-stops.component.html`            | ?   | novo     | novo     |
| `src/app/features/nearby-stops/nearby-stops.component.spec.ts`         | ?   | novo     | novo     |
| `src/app/features/nearby-stops/nearby-stops.component.ts`              | ?   | novo     | novo     |
| `src/app/features/onboarding/onboarding.component.css`                 | ?   | novo     | novo     |
| `src/app/features/onboarding/onboarding.component.html`                | ?   | novo     | novo     |
| `src/app/features/onboarding/onboarding.component.ts`                  | ?   | novo     | novo     |
| `src/app/features/preview/preview-data.ts`                             | ?   | novo     | novo     |
| `src/app/features/preview/preview-services.ts`                         | ?   | novo     | novo     |
| `src/app/features/preview/preview.routes.ts`                           | ?   | novo     | novo     |
| `src/app/features/preview/preview.spec.ts`                             | ?   | novo     | novo     |
| `src/app/features/profile/profile.component.css`                       | ?   | novo     | novo     |
| `src/app/features/profile/profile.component.html`                      | ?   | novo     | novo     |
| `src/app/features/profile/profile.component.spec.ts`                   | ?   | novo     | novo     |
| `src/app/features/profile/profile.component.ts`                        | ?   | novo     | novo     |
| `src/app/features/search/search.component.html`                        | M   | alterado | alterado |
| `src/app/features/search/search.component.ts`                          | M   | alterado | alterado |
| `src/app/features/search/search.css`                                   | M   | alterado | alterado |
| `src/app/features/search/search.spec.ts`                               | M   | alterado | alterado |
| `src/app/shared/components/bottom-nav/bottom-nav.component.spec.ts`    | ?   | novo     | alterado |
| `src/app/shared/components/bottom-nav/bottom-nav.component.ts`         | ?   | novo     | alterado |
| `src/app/shared/components/icon/icon.component.ts`                     | ?   | novo     | alterado |
| `src/app/shared/components/line-card/line-card.component.css`          | ?   | novo     | novo     |
| `src/app/shared/components/line-card/line-card.component.ts`           | M   | alterado | alterado |
| `src/app/shared/components/map/map.component.ts`                       | M   | alterado | alterado |
| `src/app/shared/components/navbar/navbar.component.ts`                 | M   | alterado | alterado |
| `src/app/shared/components/pwa-status/pwa-status.component.ts`         | ?   | novo     | novo     |
| `src/app/shared/components/theme-switcher/theme-switcher.component.ts` | ?   | novo     | igual    |
| `src/app/shared/components/toast/toast.component.ts`                   | M   | alterado | igual    |
| `src/environments/environment.prod.ts`                                 | M   | alterado | alterado |
| `src/index.html`                                                       | M   | alterado | alterado |
| `src/styles.css`                                                       | M   | alterado | alterado |
| `src/styles/theme.css`                                                 | ?   | novo     | novo     |

Total: 138 arquivos com diferença contra HEAD na entrada, sendo 44 rastreados modificados e 94 não rastreados. A documentação criada nesta auditoria está listada na seção de entregáveis.

## Adendo — consolidação documental após a auditoria

Este adendo registra decisões documentais posteriores, sem substituir o parecer, a matriz, os resultados ou o inventário históricos acima. Não constitui nova auditoria funcional. Os dois relatórios de lote e as evidências existentes foram preservados integralmente.

Open Transit é o nome oficial provisório informado pelo responsável. A identidade visual atual está aprovada como referência de desenvolvimento; a identidade comercial permanece aberta. Nomes antigos em código, manifest, assets e relatórios não estabelecem marca definitiva e não foram alterados nesta etapa.

O responsável informou o workspace oficial [Linear Open Transit](https://linear.app/open-transit), equipe OPE. Isso atualiza a referência documental sem invalidar a ocorrência histórica de acesso do conector a outro workspace. Não houve nova consulta remota, alteração de card ou confirmação de integração automática GitHub–Linear. Classificações e cadeia card→branch→commit→PR→release estão no [fluxo Linear consolidado](../linear-workflow.md).

A política Git está definida: develop é base dos novos trabalhos e destino de PRs de funcionalidades; master é estável e receberá releases por PR depois da publicação excepcional inicial autorizada. A configuração operacional de branches, CI e proteções continua pendente. Merge depende dos checks definidos e da autorização do mantenedor, sem presumir aprovação formal do próprio PR pelo autor. Os [checklists de publicação e develop](../git-workflow.md) não autorizam operações por sua existência.

Documentos consolidados: README, AGENTS, CONTRIBUTING, CHANGELOG, arquitetura, engenharia, desenvolvimento, contratos HTTP, Design System, PWA, Git, Linear, template de PR e este adendo, totalizando 14 arquivos existentes. Nenhum novo documento foi criado. AGENTS distingue implementação, auditoria, documentação e publicação; preserva funcionalidades, HTTP/Zod e alterações locais, exige mobile-only/PWA-first e proíbe mocks silenciosos e publicação automática.

O [estado das entregas](../../README.md) distingue entregue, parcialmente implementado, pendente e bloqueio de verificação no contexto da auditoria. Build de produção e 97 testes em 19 arquivos são resultados daquela auditoria. A falha do Vitest alternativo continua sem correção no código consultado. Integração ponta a ponta Laravel, instalação real/Android, atualização entre builds e questões de preview/layout permanecem abertas.

Na revisão de contratos foi esclarecido um ponto de precisão: AuthApiResponseSchema exige campos de perfil presentes mesmo quando nullable; ele usa z.object, sem z.strictObject, e não rejeita por esse motivo propriedades desconhecidas. O risco documentado é de ausência dos campos exigidos. Nenhum schema ou contrato funcional foi alterado.

A validação desta etapa é documental: links internos, caminhos, Markdown, versões no lockfile, padrões de dados sensíveis e integridade dos arquivos anteriores. Build/testes funcionais não foram reexecutados, pois não houve alteração funcional. O fechamento depende de revisão do responsável antes de qualquer publicação; nenhum commit, push, PR, merge ou alteração de branch foi realizado.

Resultado da consolidação: 80 links locais resolvidos, 13 caminhos de fontes existentes conferidos e versões documentadas coerentes com o lockfile. Prettier aprovou os 14 documentos revisados e git diff --check não encontrou erros. A busca por padrões de segredos nos documentos não encontrou candidatos; não equivale a garantia absoluta. Foram preservados por SHA-256 os 164 arquivos fora do escopo documental, incluindo código, assets, evidências e relatórios de lote. O conteúdo anterior desta auditoria permanece como prefixo integral, seguido apenas deste adendo. Nenhum arquivo foi criado ou removido; HEAD, branch, referências e index permaneceram inalterados.
