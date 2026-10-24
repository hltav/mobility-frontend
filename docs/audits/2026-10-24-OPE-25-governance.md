# Governança e CI — OPE-25 — 24/10/2026

Estado mais recente: bundle otimizado para 415,28 kB, audit de produção sem vulnerabilidades, 101 testes Angular e 25 de governança aprovados. Resultados anteriores abaixo são preservados por etapa; a seção final registra a revisão do bundle. Sem commits ou publicação.

## Escopo e Git

Card OPE-25 — Criar CI de lint, testes, build e segurança — confirmado pelo mantenedor. Branch de trabalho: `feature/OPE-25-governanca-ci-protecao-branches`, criada a partir de develop no SHA `39bcec9277499804b9134d6199a8b10c9e9acba8`. Master/develop não foram modificadas. Nenhum commit, staging no repositório original, push, PR ou merge foi realizado nesta entrega.

Os 23 arquivos retidos foram registrados por checksum antes do trabalho e conferidos depois. Preferências cspell/VS Code e 21 capturas continuam locais. Nenhuma alteração em src, backend, banco ou identidade visual.

## Arquivos da entrega

Além da preparação inicial, esta correção acrescenta eslint.config.mjs e scripts/governance/lint.test.mjs; o inventário passa a 22 arquivos, sem contar os 23 retidos.

Atualizados: AGENTS.md, CONTRIBUTING.md, README.md, docs/git-workflow.md, docs/engineering.md, docs/linear-workflow.md, .github/PULL_REQUEST_TEMPLATE.md, package.json e package-lock.json.

Criados: .husky/pre-commit, .husky/commit-msg, .github/workflows/pr-policy.yml, .github/workflows/angular-ci.yml, .github/rulesets/protect-develop.json, .github/rulesets/protect-master.json, scripts/governance/commit-message.mjs, scripts/governance/staged-check.mjs, scripts/governance/policy.test.mjs, scripts/governance/staged-check.test.mjs e este relatório. Arquivos gerados em .husky/\_ são ignorados, não candidatos.

## Resultado local inicial (histórico)

| Verificação                                | Resultado e limites                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| npm ci em diretório temporário com HUSKY=0 | Aprovado; 517 pacotes instalados a partir dos arquivos atuais                              |
| npm run prepare                            | Aprovado; Husky 9.1.7, core.hooksPath=.husky/\_; só havia hooks de exemplo, preservados    |
| npm run test:governance                    | 21 testes aprovados; matriz de destinos/cards, Rulesets, mensagens e staging parcial       |
| Hook pre-commit instalado                  | Aprovado com index vazio; isolamento com index não vazio provado em repositório temporário |
| Hook commit-msg instalado                  | Mensagem OPE-25 válida aceita; mensagem sem card rejeitada com exit 1 esperado             |
| npm run build                              | Aprovado; avisos preexistentes de budgets/CSS e Leaflet CommonJS                           |
| npm run ng -- test --watch=false           | 101 testes aprovados em 21 arquivos                                                        |
| npm audit --omit=dev --audit-level=high    | Reprovado, exit 1: 6 altas e 2 moderadas, 8 entradas de pacotes no relatório               |
| Lint Angular                               | Não configurado; lint:staged verifica formatação/sintaxe Prettier e whitespace, não ESLint |
| Vitest direto                              | Falha anterior de setup permanece sem correção; não apresentado como aprovado              |
| Checks e bloqueio de merge no GitHub       | Não executados; dependem de publicação autorizada e ativação posterior                     |

Os testes locais da política executam o próprio bloco github-script do workflow, sem duplicar as regras. Rejeitam feature/fix/docs→master, develop de fork→master, card ausente, somente em comentário ou divergente, placeholder e destino desconhecido. Aceitam feature/fix/docs/refactor/test/chore→develop com card correspondente e develop do próprio repositório→master com card. Falhas de comandos técnicos não são mascaradas; bloqueio real de merge ainda exige confirmação no GitHub após ativação.

## Segurança e bloqueios iniciais (histórico)

O npm audit reportou vulnerabilidades nas entradas @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @angular/service-worker e zod. Severidades são do relatório npm, não prova de exploração na aplicação. Alguns avisos têm contexto SSR; este frontend não tem SSR, o que não autoriza ignorar todos os alertas. O relatório completo consultado fica local em /tmp/open-transit-governance/audit-production.json.

A comparação do lock com develop mostra somente alteração da entrada raiz para adicionar Husky e nova entrada node_modules/husky; nenhuma versão de dependência de produção mudou. Os alertas são preexistentes. Nenhum audit fix ou atualização Angular/Zod foi executado. O workflow inclui Security reprovando em vulnerabilidade alta; não ativar a proposta completa antes de resolver esse bloqueio e validar resultados remotos. DevDependencies não foram abrangidas por esse audit de produção.

## Estado remoto consultado por leitura

GitHub hltav/mobility-frontend: público, proprietário User, branch padrão master. Rulesets retornaram lista vazia; branches master/develop retornaram o SHA consolidado, protected=false e checks off. Nenhuma regra ou permissão foi alterada. O conector utilizado tem apenas leitura, sem administração. Plano pago não confirmado; regras de branch em repositório público estão disponíveis inclusive no GitHub Free, conforme fontes do fluxo Git.

## Aprovação e ativação pendentes

As propostas de Protect develop e Protect master estão Disabled, sem bypass, com PR, conversas resolvidas, zero aprovações formais, seis checks candidatos, base atualizada, bloqueio de force push e exclusão. Não há bloqueio remoto implementado por existir JSON na branch. Autor não aprova formalmente o próprio PR; zero aprovações evita bloquear o único mantenedor, mas autorização explícita continua necessária. Restrição técnica adicional por ator em repositório pessoal não foi simulada com bypass genérico.

O workflow seguro de política usa pull_request_target sem checkout/código de head. Sua introdução precisa alcançar a branch padrão antes da comprovação remota; a primeira passagem feature→develop e release develop→master requer revisão manual explícita da política enquanto o check não existir. Não ativar checks inexistentes. Publicação da feature, abertura de PR, releases e ativação de Rulesets precisam de autorização separada.

Instruções, matriz, fontes oficiais e checklist de ativação estão no [fluxo Git](../git-workflow.md). Integração automática GitHub–Linear continua não confirmada; nenhum card foi alterado.

## Verificação documental da preparação inicial

Os 20 arquivos desta entrega passaram pela conferência de escopo e caminhos. Links Markdown relativos válidos; Prettier aprovado; YAML parseado; hooks aprovados por sh -n; git diff --check sem ocorrências. Busca por padrões comuns de chaves/tokens não encontrou candidatos nos arquivos da entrega (não é garantia de detecção de todo segredo). Checksum dos 23 retidos preservado, index vazio, src sem alterações e HEAD/master/develop no SHA consolidado. As validações técnicas não substituem execução dos workflows ou teste de bloqueio de merge no GitHub.

## Correção autorizada de segurança e lint — antes da otimização do bundle

Esta seção substitui o estado inicial de vulnerabilidades e lint ausente, preservado acima como histórico. Não houve alteração de src, comportamento da aplicação, configurações de cache, backend ou banco. Branch, HEAD, master/develop e os 23 retidos permanecem preservados, sem staging/commit/push/PR/merge ou ativação de Rulesets.

### Dependências e impacto

O audit inicial de produção retornou 8 entradas de pacotes afetados (6 altas e 2 moderadas); não são necessariamente 8 advisories distintos. Todos os oito pacotes são dependências diretas. Forms/platform-browser recebem a classificação pela cadeia de dependências. A tabela registra a versão corrigida disponível e adotada; não afirma que ela é o primeiro patch corrigido de cada advisory.

| Pacote direto             | Severidade inicial | Instalada antes | Corrigida adotada | Impacto e ação                                                                                                                      |
| ------------------------- | ------------------ | --------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| @angular/common           | high               | 21.2.11         | 21.2.25           | Formatação, cache e exposição de dados; inclui avisos condicionados a SSR. Patch alinhado ao core.                                  |
| @angular/compiler         | high               | 21.2.11         | 21.2.25           | Sanitização de templates/bindings e XSS; patch alinhado a core/compiler-cli.                                                        |
| @angular/core             | high               | 21.2.11         | 21.2.25           | Sanitização, namespaces e hidratação/cache; patch sem mudança de major.                                                             |
| @angular/forms            | moderate           | 21.2.11         | 21.2.25           | Efeito da cadeia Angular; alinhado aos peers exatos do core/common.                                                                 |
| @angular/platform-browser | moderate           | 21.2.11         | 21.2.25           | Efeito da cadeia Angular; mantém runtime/compilador alinhados.                                                                      |
| @angular/router           | high               | 21.2.11         | 21.2.25           | DoS em cenários SSR; aplicação sem SSR, mas pacote atualizado para sair da faixa afetada.                                           |
| @angular/service-worker   | high               | 21.2.11         | 21.2.25           | Vazamento de headers em redirecionamentos e perda de credenciais/política de cache; worker atualizado sem alterar ngsw-config.json. |
| zod                       | high               | 4.4.1           | 4.6.7             | Exaustão de memória em coleções grandes; minor 4.6.7 mantém major 4, schemas e contratos existentes.                                |

Compiler-cli também passou de 21.2.11 para 21.2.25: é dependência direta de desenvolvimento e exige compiler na mesma versão. CLI/build permanecem em 21.2.9, TypeScript em 5.9.3, Node em 22.22.0 e Vitest em 4.1.5. Não houve upgrade major de dependência preexistente. O compiler-cli novo exige Babel core 7.29.7 (antes 7.29.0 na sua cadeia); o lock também atualizou patches de helpers Babel e acrescentou os pacotes transitivos necessários ao lint. Nenhum pacote de produto sem relação com Angular/Zod foi atualizado diretamente.

Novas dependências de lint, todas dev e fixadas: eslint 10.13.0, @eslint/js 10.0.1, typescript-eslint 8.72.0 e @angular-eslint/eslint-plugin, eslint-plugin-template e template-parser 21.4.0. Não havia ESLint instalado: 10 é uma ferramenta nova, não upgrade major da aplicação. Os peers publicados do Angular ESLint 21.4 aceitam ESLint 10 e TypeScript ESLint 8; Node atual atende aos engines. ESLint 9 está fora de manutenção, conforme [suporte oficial](https://eslint.org/version-support/). Angular ESLint deve manter a major correspondente ao Angular; veja [suporte oficial](https://github.com/angular-eslint/angular-eslint/blob/main/docs/ANGULAR_VERSION_SUPPORT.md) e [compatibilidade Angular](https://angular.dev/reference/versions).

### Advisories identificados pelo audit inicial

As referências abaixo vieram do npm audit; versões corrigidas adotadas estão na tabela anterior. As faixas são as publicadas no relatório consultado, não comprovação de explorabilidade no frontend. Não foi deduzido que ausência de SSR ou um teste unitário elimina todos os riscos.

| Advisory                                                                                                                                                                             | Severidade do advisory | Pacotes com referência direta no relatório | Faixa afetada              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------ | -------------------------- |
| [@angular/common: Weak 32-Bit Cache Key Hashing in `HttpTransferCache` Leading to Cross-Request Data Leakage and State Poisoning](https://github.com/advisories/GHSA-39pv-4j6c-2g6v) | high                   | @angular/common                            | `>=21.0.0-next.0 <21.2.17` |
| [@angular/common: Denial of Service (DoS) via OOM in Date Formatting (formatDate)](https://github.com/advisories/GHSA-48r7-hpm6-gfxm)                                                | high                   | @angular/common                            | `>=21.0.0-next.0 <21.2.17` |
| [@angular/router: Denial of Service via RouterLink Query Parameter Retention in Server-Side Rendering (SSR)](https://github.com/advisories/GHSA-57xq-rjx2-v5xh)                      | high                   | @angular/router                            | `>=21.2.0 <21.2.25`        |
| [@angular/compiler: Two-Way Property Binding Sanitization Bypass (XSS)](https://github.com/advisories/GHSA-58w9-8g37-x9v5)                                                           | moderate               | @angular/compiler                          | `>=21.0.0-next.0 <21.2.17` |
| [@angular/router: Denial of Service via Unmatched Empty-Path Outlet Route Matching in Server-Side Rendering (SSR)](https://github.com/advisories/GHSA-62vg-58rm-qff7)                | high                   | @angular/router                            | `>=21.0.0 <21.2.25`        |
| [@angular/core: Angular Template and Dynamic Component Namespace Bypass leading to Cross-Site Scripting (XSS)](https://github.com/advisories/GHSA-692r-grfm-v8x7)                    | moderate               | @angular/core                              | `>=21.0.0-next.0 <21.2.15` |
| [@angular/service-worker: Request Credential & Cache Policy Stripping](https://github.com/advisories/GHSA-95qp-cmmw-mgqv)                                                            | moderate               | @angular/service-worker                    | `>=21.0.0-next.0 <21.2.15` |
| [Angular: Template and Attribute Namespace Sanitization Bypass (XSS)](https://github.com/advisories/GHSA-f3m7-gqxr-g87x)                                                             | moderate               | @angular/compiler, @angular/core           | `>=21.0.0-next.0 <21.2.15` |
| [Angular Server-Side Rendering (SSR): Denial of Service via Numeric URL Matrix Parameters](https://github.com/advisories/GHSA-ff3f-86qr-9cv3)                                        | high                   | @angular/router                            | `>=21.0.0 <21.2.24`        |
| [Angular Service Worker Policy-Bypass & Credential-Stripping Vulnerabilities](https://github.com/advisories/GHSA-gv2q-mqqv-365m)                                                     | moderate               | @angular/service-worker                    | `>=21.0.0-next.0 <21.2.15` |
| [Angular: Sanitization bypass via directive host bindings on concrete host elements in @angular/core and @angular/compiler](https://github.com/advisories/GHSA-hh8m-fm6v-7cvg)       | moderate               | @angular/compiler, @angular/core           | `>=21.0.0 <21.2.20`        |
| [Angular: Cache-Key Ambiguity in HttpTransferCache Leading to Cross-Request Response Reuse and State Poisoning](https://github.com/advisories/GHSA-jhpw-976m-542j)                   | high                   | @angular/common                            | `>=21.0.0-next.0 <21.2.19` |
| [Angular i18n: Cross-Site Scripting (XSS) via event-handler attributes](https://github.com/advisories/GHSA-jj27-h5hq-8x99)                                                           | high                   | @angular/compiler, @angular/core           | `>=21.0.0-next.0 <21.2.19` |
| [Zod can exhaust memory while validating oversized constrained collections](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)                                                       | high                   | zod                                        | `<4.6.6`                   |
| [Angular: Information Leak via `HttpTransferCache` Bypass When Using `withRequestsMadeViaParent`](https://github.com/advisories/GHSA-p297-fm68-3q8c)                                 | moderate               | @angular/common                            | `>=21.0.0 <21.2.20`        |
| [@angular/common: Denial of Service (DoS) via OOM in Number Formatting (digitsInfo)](https://github.com/advisories/GHSA-p3vc-36g9-x9gr)                                              | high                   | @angular/common                            | `>=21.0.0-next.0 <21.2.15` |
| [@angular/common: Information Leak via Default Caching of Credentialed Requests in HttpTransferCache](https://github.com/advisories/GHSA-q6f4-qqrg-jv6x)                             | high                   | @angular/common                            | `>=21.0.0-next.0 <21.2.15` |
| [@angular/service-worker: Sensitive Header Leakage on Cross-Origin Redirects in Angular Service Worker](https://github.com/advisories/GHSA-qxh6-94w6-9r5p)                           | high                   | @angular/service-worker                    | `>=21.0.0-next.0 <21.2.17` |
| [Angular Client Hydration DOM Clobbering & Response-Cache Poisoning](https://github.com/advisories/GHSA-rgjc-h3x7-9mwg)                                                              | high                   | @angular/core                              | `>=21.0.0-next.0 <21.2.17` |

### Resolução reproduzível

Npm recusou inicialmente a atualização sobre o lock antigo por conflito entre peers 21.2.11/21.2.25. A resolução foi refeita em cópia temporária de package/lock, mantendo as demais resoluções e descartando nessa cópia apenas as entradas antigas dos pacotes alvo para o npm recalcular integridade/dependências. O npm gerou o lock novo; não foram fabricados checksums. Não foi usado audit fix, force ou legacy-peer-deps. Depois, npm ci no próprio frontend instalou 604 pacotes com sucesso e executou prepare/Husky; o lock é versionável, diretórios temporários não.

### Lint implantado sem alteração funcional

`npm run lint` executa ESLint sobre src/**/\*.ts e src/**/\*.html. Flat config em eslint.config.mjs: regras recomendadas de JS, TypeScript e Angular, templates externos/inline e acessibilidade. Configuração sem análise de tipos por projeto e sem regras de formatação que causem reescrita massiva. Comparações intencionais com null/undefined são permitidas; parâmetros de interface prefixados por \_ podem ser ignorados. ESLint não é usado com --fix.

A primeira análise recomendada revelou dívida anterior; esta etapa não altera contratos HTTP ou componentes para eliminá-la artificialmente. Mantidos 13 avisos visíveis em overrides explícitos por arquivo; a execução tem --max-warnings=13. Demais regras continuam como erro. Novos arquivos com any, por exemplo, reprovam. O teto impede aumento do total, mas não distingue substituição de um aviso antigo por outro no mesmo arquivo: revisão continua necessária. Não ampliar exceções/teto para acomodar novas dívidas; planejar correções próprias e reduzir o teto.

| Arquivo relativo a src/app                 | Dívida atual                                               |
| ------------------------------------------ | ---------------------------------------------------------- |
| core/services/bus-lines.service.ts         | 1 any                                                      |
| core/services/favorites.service.ts         | 4 any e 1 interface não utilizada                          |
| core/services/real-time.service.ts         | 2 any                                                      |
| shared/components/map/map.component.ts     | 1 any no ajuste Leaflet                                    |
| features/profile/profile.component.spec.ts | 1 any de DOM em teste                                      |
| features/favorites/favorites.spec.ts       | 1 tipo {} em teste                                         |
| shared/components/toast/toast.component.ts | 1 constructor injection e 1 ngIf legado no template inline |

O hook lint:staged agora executa também ESLint nos blobs src TS/HTML, além de Prettier/whitespace, sem escrita nem alteração de staging. O CI executa lint completo e o teto global. O teste de staging parcial comprova que ESLint rejeita any staged mesmo que o working tree já esteja corrigido, sem sobrescrever essa correção local.

### Validação atual

| Comando/verificação                     | Resultado                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| npm ci                                  | Aprovado; 604 pacotes, prepare/Husky executado                                   |
| npm run build                           | Aprovado; avisos anteriores de budgets/CSS e Leaflet CommonJS preservados        |
| npm run ng -- test --watch=false        | 101 testes aprovados, 21 arquivos                                                |
| npm run test:governance                 | 24 testes aprovados; inclui lint TS, templates inline/externos e staging parcial |
| npm run lint                            | Aprovado com 0 erros e os 13 avisos legados acima                                |
| npm audit --omit=dev --audit-level=high | Aprovado, exit 0, zero vulnerabilidades em produção reportadas                   |

Logs completos locais: /tmp/open-transit-ope25-security (npm-ci.log, build.log, angular-tests.log, governance-tests.log, lint.log, audit-before.json e audit-after.json). O audit de produção não avalia devDependencies e seu resultado é temporal; não equivale a atestado universal de segurança. Vitest direto continua com falha conhecida de setup, sem correção nesta tarefa. Unidade/build não comprovam instalação standalone ou E2E Laravel.

### CI, política e ativação

O job Lint executa npm run lint sem condicional de script ausente. Security executa npm audit --omit=dev --audit-level=high sem continue-on-error ou tolerância a falha. Os testes verificam essas propriedades e que os seis checks constam nos Rulesets. Os JSONs permanecem Disabled, sem bypass e com zero aprovações formais obrigatórias. PR policy mantém apenas contents:read, não faz checkout, não usa secrets e não executa código da origem; dados de título/corpo são processados como strings JavaScript, sem interpolação em shell/eval. Não foi modificado para pull_request_target executar build/testes.

O bootstrap continua pendente: introduzir a feature por PR em develop, depois release develop→master, com revisão manual explícita da política enquanto ela ainda não existir na branch padrão. Confirmar execuções reais de todos os checks e nomes/app_id no GitHub antes de exigir checks ou ativar Rulesets. Esta tarefa não executou operações Git remotas nem aprovou esses merges. O [checklist de ativação](../git-workflow.md#checklist-de-ativação-segura) permanece a referência.

### Impacto de tamanho e PWA

O build após os patches tem bundle inicial de 775,67 kB (transferência estimada 164,29 kB), contra 644,58 kB (140,38 kB estimados) no build da preparação anterior. Aumento de aproximadamente 131,09 kB bruto (20,3%) e 23,91 kB estimados de transferência. Budget de aviso 500 kB e de erro 1 MB foram preservados: o build passa, mas o crescimento é risco de desempenho mobile a revisar antes da publicação.

Uma execução adicional com --stats-json foi feita para investigar esse crescimento: o chunk Zod passou de aproximadamente 327,28 kB no log anterior para 454,50 kB; as estatísticas atuais atribuem 454.374 bytes a Zod nesse chunk. Portanto, a maior parte do aumento está no pacote Zod atualizado. A participação Angular do outro chunk também cresceu. Não houve troca de imports/schemas por versões mini nem aumento de budgets para reduzir/ocultar o impacto; qualquer otimização ou escolha alternativa precisa preservar a correção de segurança e ter validação própria.

O ngsw-worker.js gerado tem o mesmo checksum do arquivo do pacote @angular/service-worker corrigido. Manifest de produção presente e ngsw.json mantém dataGroups vazio. NgSw config, substituição de preview e ambientes não foram alterados. Isso valida artefatos estáticos, sem comprovar instalação standalone, atualização de clientes reais ou E2E com Laravel.

## Revisão do bundle antes do PR — otimização concluída

### Causa e evidências

O stats.json anterior atribui 454.374 bytes do JavaScript emitido a Zod, em um chunk de 454.499 bytes. Só os locales contribuíam 263.831 bytes, distribuídos em 64 módulos. Também eram retidos o compilador opcional (29.382 bytes) e módulos de JSON Schema (34.263 bytes), sem chamadas da aplicação a essas funcionalidades. O chunk compartilhado Angular cresceu de cerca de 258,66 kB para 262,53 kB após os patches: contribuição bem menor para o aumento inicial total de 131,09 kB.

As dez importações Zod usavam namespace reexportado (import { z }) ou export default (import z). No entry point instalado de Zod 4.6.7, ambos apontam para um namespace do módulo classic/external.js, que expõe locales, compile e APIs de JSON Schema. A interação desse namespace reexportado com esbuild mantém exports não utilizados. A [documentação oficial Zod](https://zod.dev/error-customization#internationalization) recomenda import \* as z para esbuild; o resultado foi confirmado neste build, não deduzido apenas da documentação.

### Alteração aplicada

Apenas a linha de importação de dez arquivos de src foi trocada por import \* as z from 'zod'. Corpos de schemas/mappers/serviço, mensagens, coerções, refinements, parse/safeParse e tipos inferidos não foram alterados. Não houve Zod Mini, remoção de validação, importação de subpath privado, configuração de outro locale ou rollback de dependências. Angular/compiler-cli 21.2.25 e Zod 4.6.7 permanecem, assim como package.json, lock, budgets, rotas e configuração PWA existentes antes desta revisão.

Arquivos alterados em src/app:

- core/mappers/normalize-bus-line.mapper.ts
- core/schemas/api-response.schema.ts
- core/schemas/auth-api.schema.ts
- core/schemas/auth.schema.ts
- core/schemas/bus-line-service.schema.ts
- core/schemas/bus-line.schema.ts
- core/schemas/nearby-response.schema.ts
- core/schemas/nearby-stop.schema.ts
- core/schemas/real-timeBus.schema.ts
- core/services/bus-lines.service.ts

Também atualizados eslint.config.mjs e scripts/governance/lint.test.mjs: a regra no-restricted-syntax rejeita default import e o named import z de zod, permitindo namespace import e imports nomeados diretos que não materializem esse namespace. O teste verifica as formas permitida/rejeitadas. Uma tentativa inicial com no-restricted-imports também rejeitou namespace import; essa configuração foi substituída pelo seletor preciso e os testes/lint foram reexecutados. Nenhuma falha foi ignorada. docs/engineering.md registra a orientação. Inventário consolidado: 32 candidatos OPE-25, sem os 23 retidos.

### Comparação medida

| Medida                                      | Antes dos patches de segurança (histórico) | Após patches, antes da otimização | Após otimização |
| ------------------------------------------- | ------------------------------------------ | --------------------------------- | --------------- |
| Bundle inicial bruto                        | 644,58 kB                                  | 775,67 kB                         | 415,28 kB       |
| Transferência inicial estimada pelo builder | 140,38 kB                                  | 164,29 kB                         | 111,39 kB       |
| Aviso de budget inicial de 500 kB           | Presente                                   | Presente                          | Ausente         |

A redução da otimização é de 360,39 kB (46,46%) no inicial bruto e 52,90 kB na transferência estimada. O inicial otimizado também é 229,30 kB menor que o histórico anterior aos patches. Estimativas do builder não são medição de tráfego real em dispositivo/rede.

| Contribuição Zod em todos os outputs | Antes da otimização       | Depois                    |
| ------------------------------------ | ------------------------- | ------------------------- |
| Bytes atribuídos aos módulos Zod     | 454.374                   | 94.711                    |
| Locales emitidos                     | 64 módulos, 263.831 bytes | Apenas en.js, 2.688 bytes |
| Compilador opcional                  | 29.382 bytes              | Ausente dos outputs       |
| Módulos de JSON Schema               | 34.263 bytes              | 16.019 bytes              |

Após a otimização, 94.159 bytes de Zod estão no chunk inicial compartilhado e 552 bytes em outro chunk. Parte da infraestrutura JSON Schema permanece ligada às classes clássicas; não foi removida por alteração da biblioteca. Inglês continua sendo o locale padrão, com as mensagens customizadas dos schemas intactas. Os logs de comparação são builds observados de cada etapa; diferenças pequenas em CSS gerado por descoberta de classes não devem ser atribuídas a alterações manuais de estilo.

### Lazy loading e opções avaliadas

- As dez rotas reais de páginas já usam loadComponent com import dinâmico. Leaflet já é lazy e permanece em chunk de aproximadamente 149,55 kB. Não foi identificada página carregada diretamente que justificasse alteração de rotas nesta revisão.
- AuthService é usado no shell, guards e interceptor, importando schemas/mapeamento de autenticação; isso mantém parte de Zod no grafo inicial mesmo com páginas lazy. Postergar esse caminho exigiria revisar inicialização de sessão e/ou APIs síncronas. Não foi feito para preservar o comportamento.
- Imports nomeados individuais poderiam explicitar ainda mais a superfície utilizada, mas a troca única por namespace já permitiu tree-shaking com menor diff. Zod Mini ou validação dinâmica exigiriam migração e análise de compatibilidade; sem necessidade para atingir o budget atual. A configuração de locale não foi alterada para otimizar tamanho.

### Validações desta revisão

| Comando                                 | Resultado                                                          |
| --------------------------------------- | ------------------------------------------------------------------ |
| npm run build -- --stats-json           | Aprovado; inicial 415,28 kB, abaixo de 500 kB; budgets inalterados |
| npm run ng -- test --watch=false        | 101 testes aprovados em 21 arquivos                                |
| npm run test:governance                 | 25 testes aprovados, incluindo prevenção da regressão de imports   |
| npm run lint                            | Aprovado; 0 erros, 13 avisos legados preservados                   |
| npm audit --omit=dev --audit-level=high | Aprovado; zero vulnerabilidades de produção reportadas             |

Continuam os seis avisos de budget de CSS de componentes e o aviso Leaflet CommonJS. Não foram aumentados budgets ou desativados checks. HTTP simulado/unidade não são E2E Laravel; instalação e atualização standalone real continuam pendentes. Artefatos/logs de análise estão em /tmp/open-transit-ope25-bundle, fora dos candidatos, com stats-before.json, stats-after.json, comparison.json e resultados dos comandos.

### Recomendação

O aumento do inicial foi resolvido por uma alteração pequena e validada, preservando os patches de segurança. A OPE-25 está tecnicamente pronta para revisão do diff e preparação do primeiro PR para develop, respeitando autorização separada para commits/push/PR. Revisar explicitamente os 13 avisos legados de lint. O bootstrap da política e a comprovação dos checks no GitHub continuam obrigatórios antes de ativar os Rulesets; esta revisão não fez nenhuma dessas operações.
