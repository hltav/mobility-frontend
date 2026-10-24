# Preparação da publicação inicial — Open Transit

Data: 24/10/2026. Esta é a última entrega excepcional preparada a partir de master antes do fluxo develop. **Preparação para revisão, sem autorização de publicação.** Não foram executados commits, push, merge, reset, alteração de branch, staging, proteção ou operações remotas. Laravel, Go e banco permaneceram intactos.

Relatório atualizado após o ajuste funcional autorizado de isolamento de `/preview`. O preparo anterior tinha 129 candidatos e validava 97 testes; esses resultados são históricos. Agora são 133 candidatos, com 101 testes aprovados e validação da fronteira produção/desenvolvimento. A [auditoria técnica](2026-10-24-frontend-audit.md) e os relatórios de lote permanecem intactos; o ajuste não altera identidade visual, assets ou funcionalidades reais.

O card **OPE-34** foi informado pelo mantenedor como card real da consolidação/publicação inicial. O plano definitivo usa esse identificador nos quatro commits. Não houve consulta ou alteração do Linear nesta revisão. Os 133 caminhos candidatos e os 23 retidos foram preservados; somente este documento foi atualizado, sem edição de código funcional.

## Estado completo do Git

- Diretório oficial: `/home/hudson-tavares/Projects/OPEN_TRANSIT/mobility-frontend`.
- Branch atual: master; HEAD `af4a148ed012f0085fe8acb58f0d1e8dfe2b74ee`.
- Upstream: origin/master; origem de fetch/push `git@github.com:hltav/mobility-frontend.git`.
- Branches conhecidas localmente: master, origin/master e origin/HEAD→origin/master. Develop ainda não existe nas referências locais.
- Ahead/behind: 0/0 **contra referência local** origin/master. Não houve fetch/ls-remote; isso não comprova igualdade com GitHub neste momento.
- Estado anterior ao ajuste de preview: 44 modificados e 108 não rastreados, total 152.
- Estado atualizado: 44 modificados e 112 não rastreados, total 156; zero staged, conflitos ou exclusões. Quatro arquivos foram acrescentados: as duas configurações de preview e dois arquivos de teste. Index/HEAD/refs permanecem inalterados.
- Histórico alcançável inspecionado: af4a148 e 76e0e74. CI/proteções/permissões no GitHub e integração automática Linear não foram verificadas.

O inventário integral ao final cobre cada caminho modificado/não rastreado. Arquivos já versionados e inalterados continuam no projeto; não precisam de novo staging. Não usar git add . ou git add -A.

## Recorte proposto para publicação

| Categoria atual           | Quantidade | Tratamento                                                                       |
| ------------------------- | ---------- | -------------------------------------------------------------------------------- |
| Código funcional/estilos  | 67         | Candidato, incluindo fronteira de produção e prévia exclusiva de desenvolvimento |
| Testes                    | 20         | Candidato junto do comportamento; app.spec inalterado já é rastreado             |
| Documentação/governança   | 17         | Candidato, incluindo este relatório atualizado                                   |
| Assets/manifest           | 13         | Candidato, sem alteração de identidade visual                                    |
| Configuração/dependências | 5          | Candidato; angular.json inclui substituição da configuração de preview           |
| Scripts                   | 3          | Tooling local documentado; CDP existente não foi usado para instalação real      |
| Evidências                | 29         | Oito referenciadas mantidas no recorte; 21 opcionais retidas                     |
| Preferências locais       | 2          | Fora da proposta inicial, preservadas no disco                                   |

São **133 candidatos e 23 arquivos retidos fora**, além de artefatos ignorados. O código demonstrativo é candidato como ferramenta exclusiva de desenvolvimento: seus módulos não entram no grafo de produção. O isolamento foi implementado e testado; a revisão final e autorização de publicação continuam pendentes. Nenhum staging efetuado.

### Arquivos aptos tecnicamente, sujeitos à revisão

- Código/configuração e testes por grupos G1/G2/G3 do inventário. Incluir arquivos novos referenciados: em especial line-details-light.css, schemas, serviços, guards, shared, fontes/ícones e manifest. O compilador confirma styleUrls de detalhes com os dois CSS; não classificar o arquivo claro como sobra.
- Documentos e template de PR por G4. Eles preservam Open Transit como nome oficial provisório e as limitações de entrega.
- package.json e package-lock.json juntos. Core/worker 21.2.11, CLI/build 21.2.9; nenhum pacote foi instalado ou atualizado nesta tarefa.
- scripts/preview-pwa.mjs é a prévia local servida em loopback, com proxy de API; não é servidor de hospedagem pública. Os scripts check-pwa são ferramentas históricas CDP com portas/origem fixas; só executar em navegador descartável dedicado, pois podem limpar armazenamento e sobrescrever evidências. São versionáveis como tooling, sem prova de portabilidade/instalação real.
- As 8 evidências selecionadas preservam os links dos documentos: onboarding-desktop.png, onboarding-mobile.png, login-mobile-light.png, login-mobile-dark.png, register-mobile-dark.png, login-offline.png e os dois JSONs PWA. Capturas inspecionadas mostram páginas públicas com campos vazios/placeholders, sem credenciais preenchidas identificadas. Continuam históricas, não aceitam o build atual.

### Arquivos fora do commit inicial proposto

- .vscode/settings.json e .cspell/custom-dictionary-workspace.txt: preferências/dicionário local, sem impacto no runtime. Permanecem modificados localmente; não restaurar nem apagar para limpar o status.
- As outras 21 evidências PNG de docs/previews, individualizadas no inventário: opcionais, sem necessidade para os links publicados. Não remover do disco.
- profile-mobile-light.png e profile-mobile-dark.png contêm nome e e-mail legíveis. Não se confirmou origem sintética/consentimento; mantê-las fora até confirmar ou anonimizar em tarefa autorizada. O relatório não reproduz os valores. A existência de estatísticas de exemplo não demonstra que a identidade também seja fictícia.
- .migration-baselines/, incluindo tars/patches/manifests, tooling baixado e perfis CDP/XDG; dist/, node_modules/, .angular/cache/, coverage, logs e arquivos de ambiente/credenciais locais. Esses não integram os 23 arquivos, pois estão ignorados ou ausentes.

Não excluir apenas a pasta preview do staging: app.routes e vários testes/componentes dependem dela. Sua retirada exigiria mudança funcional autorizada e nova validação, não apenas omissão de arquivos.

## Artefatos, tamanho e possíveis dados sensíveis

- git check-ignore -v confirmou a regra /.migration-baselines/ e exclusões de dist, node_modules, .angular/cache, coverage e .env. git ls-files não encontrou esses artefatos rastreados; git ls-files -ci não apontou arquivos rastreados agora ignorados.
- .env.\* não é coberto pela regra .env exata. Nenhum arquivo de ambiente/credencial/chave/dump/log suspeito foi encontrado fora das árvores geradas/ignoradas. Repetir conferência imediatamente antes de staging; não confiar em regra de ignore como scanner.
- Nenhum arquivo não ignorado acima de 1.000.000 bytes. Maiores candidatos: capturas de mapa em torno de 363 kB (fora do recorte), package-lock 324 kB e fonte local 176 kB. Não há necessidade identificada de Git LFS para este conjunto.
- Busca por padrões de chaves privadas, tokens GitHub/AWS, Bearer literal longo, JWT e atribuições literais de senha/segredo em todos os arquivos não ignorados e nos dois commits alcançáveis: **nenhum candidato encontrado**. Isso não garante ausência absoluta, não examina objetos inalcançáveis/sistemas remotos e não detecta texto dentro de PNG.
- Endereços de exemplo em testes, placeholders de formulários e remote SSH em documentos foram diferenciados de credenciais. A inspeção visual de imagens identificou a ressalva de privacidade acima. .vscode/mcp.json já versionado é configuração Angular CLI, sem segredo identificado.

## Isolamento atualizado da rota /preview

| Aspecto         | Implementação e evidência atual                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Produção        | angular.json substitui preview.config.ts por preview.config.prod.ts; PREVIEW_ENTRY_ROUTES vazio e PREVIEW_ENABLED=false. Sem importação lazy da demonstração |
| Desenvolvimento | Configuração padrão registra /preview e seus filhos com providers locais; npm start preserva a prévia visual                                                 |
| Fixtures        | Somente a árvore demonstrativa fornece BusLines/Favorites/Realtime/Stops de exemplo. Nenhum desses módulos aparece nos inputs do grafo de produção           |
| Identidade      | PreviewAuthService retorna Pessoa de demonstração, demo@example.invalid, token nulo e autenticação falsa, sem ler/gravar localStorage ou revogar sessão      |
| Navegação       | Perfil/favoritos da Home demonstrativa ficam em /preview; Usar dados reais/Sair da prévia são saídas explícitas. Sessão normal continua intacta              |
| Falha de API    | Fluxo real continua usando HttpClient/serviços oficiais; teste de 503 comprova erro e ausência de linhas fictícias, sem fallback silencioso                  |
| Links           | Home, busca, mapa e paradas ocultam links demonstrativos em produção pela mesma configuração substituída                                                     |
| Rede externa    | Mapas ainda podem carregar tiles externos; tema é compartilhado. Não se promete isolamento completo da rede nem outro armazenamento de preferências          |

**Confirmação no build atual:** /preview, /preview/home, /preview/search, /preview/profile, /preview/map, /preview/stops, /preview/favorites e /preview/lines/146 não abrem demonstração em produção. Navegador Chrome/Brave headless 154 com perfil descartável confirmou redirecionamento para entrada pública, ausência de links/linhas fictícias na Home real com API controlada indisponível e identidade sintética apenas em desenvolvimento.

O servidor SPA pode devolver HTTP 200 para /preview; a confirmação é do roteador e da página efetivamente renderizada, não do status HTTP. Com sessão existente, o fluxo normal de entrada pode levar a Home. O comando preview:pwa serve produção e não habilita a demonstração. Não foi implantado build nem invalidado worker de instalação anterior; clientes de versões antigas só recebem esta alteração após a entrega/atualização apropriada.

No desenvolvimento, navegador e testes confirmaram favoritos temporários, zero chamadas de API durante o roteiro demonstrativo, identidade real não exibida e sessão preservada ao sair. Dados da API foram controlados localmente; não se acionou Laravel. A aprovação de exposição pública da demonstração deixou de ser necessária para este build porque essa rota não está registrada nele; revisar a implementação antes de publicar continua obrigatório.

## Resultados atualizados de validação

Execução atual em 24/10/2026, Node 22.22.0/npm 10.9.4, sem instalar dependências:

| Comando/verificação                                                                                                              | Resultado atualizado                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run build -- --stats-json                                                                                                    | Exit 0; produção aprovada, inicial 644,55 kB, transferência 140,37 kB                                                                                                                  |
| npm run ng -- build --configuration development --source-map=false --output-path=/tmp/open-transit-preview-isolation/development | Exit 0; desenvolvimento aprovado e demonstração preservada                                                                                                                             |
| npm run ng -- test --watch=false                                                                                                 | Exit 0; 101 testes em 21 arquivos, quatro testes novos de fronteira/navegação/identidade/falha real                                                                                    |
| Grafo de produção                                                                                                                | Zero inputs de src/app/features/preview; configuração substituída aparece no stats com o caminho lógico preview.config.ts                                                              |
| Marcadores exclusivos                                                                                                            | Nenhum DEMO-, demo@example.invalid, CANT. DO PARANAPANEMA ou título de perfil demo nos JS de produção                                                                                  |
| Navegador descartável                                                                                                            | Oito URLs demonstrativas rejeitadas em produção; Home sem links demo/linhas fictícias; desenvolvimento com identidade sintética, favorito temporário e zero chamadas de API no roteiro |
| Worker gerado                                                                                                                    | 31 URLs app-shell e 12 estáticas; dataGroups vazio; módulos de fixtures ausentes                                                                                                       |
| Vitest alternativo                                                                                                               | Falha anterior conhecida: setup src/test-setup.ts ausente; não foi alterado nem tratado como corrigido pelo sucesso do builder                                                         |

Primeira tentativa dos testes novos falhou por caminho relativo incorreto no import do environment; o import foi corrigido e a suíte completa passou. Nenhuma falha foi ocultada. A execução headless precisou de autorização para bind em loopback, bloqueado no sandbox; utilizou perfil descartável em /tmp, sem sessão pessoal, sem proxy de API e com recursos HTTPS externos bloqueados no roteiro.

Resultados de 97/19 e 645,86 kB do preparo anterior são históricos, assim como o recorte antigo de 129 arquivos. Nenhum budget foi afrouxado. Permanecem os avisos: bundle >500 kB, CSS de paradas/mapa/detalhes/Home/perfil/onboarding >4 kB e Leaflet CommonJS; detalhes permanece perto do limite de erro de 8 kB. Build inicial fica abaixo de 1 MB.

Esses testes não comprovam Laravel ponta a ponta, Android, instalação standalone ou atualização entre dois builds. O roteiro de navegador comprova a separação nos artefatos atuais com API local controlada. Não promete revogar versões já implantadas ou apagar arquivos de caches externos.

### Evidências locais e recorte atualizado

Resultados de produção/desenvolvimento, suíte, grafo e navegador em /tmp/open-transit-preview-isolation: build-production.log, build-development.log, tests.log, production-artifacts.json e browser-validation.json. São artefatos locais, não candidatos a commit. Não reusar o snapshot/listas antigos de /tmp/open-transit-initial-publication como se representassem este estado.

As listas G1–G4 foram regeneradas para 133 caminhos em /tmp/open-transit-preview-isolation. Esse recorte foi montado em candidate-tree no mesmo diretório, sem .git/branches/commits e reutilizando node_modules existente por symlink. Build de produção aprovado às 17:10:33 UTC, inicial 644,55 kB/transferência 140,37 kB, com 101 testes em 21 arquivos aprovados. A árvore oficial foi recompilada às 17:10:30 UTC com o mesmo tamanho e sem fixtures no grafo. Logs: build-production-final.log, build-candidate.log e tests-candidate.log. Não equivale a instalação limpa, E2E Laravel ou reprodução binária entre ambientes.

## Documentação e template de PR

README, AGENTS, CONTRIBUTING, CHANGELOG e docs técnicos estão presentes e coerentes com a política: Open Transit provisório, mobile-only/PWA-first, HTTP/Zod, sessão, preservação e publicação separada. O template exige card OPE real, resumo, contexto, evidências, testes, build, HTTP, riscos, pendências, aceite e rollback; features apontam para develop e merge depende de checks/autorização do mantenedor, sem autoaprovação formal presumida.

A documentação anterior foi preservada. Mantém-se a correção da classificação de line-details-light.css, referenciado por styleUrls. Os guias atuais também passaram a documentar a separação de preview; os relatórios históricos não foram reescritos. Os relatórios anteriores descrevem momentos diferentes; não alterar seus números históricos para fazê-los coincidir com o build atual. Não há confirmação de automação GitHub–Linear; workspace oficial informado é https://linear.app/open-transit, equipe OPE. Nenhum card foi consultado/alterado nesta etapa; o mantenedor confirmou OPE-34 como card real dos quatro commits nesta revisão.

## Proposta concreta de divisão dos commits

| Ordem | Responsabilidade                | Conteúdo                                                                                                              | Quantidade proposta |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------- |
| G1    | Correções de contratos e sessão | Núcleo HTTP, schemas/mappers, guards/interceptor e testes                                                             | 16                  |
| G2    | Fundação visual, temas e PWA    | Assets/manifest, package/lock, serviços tema/PWA, shared de base, app.config e trechos PWA/ambiente de angular.json   | 38                  |
| G3    | Telas, rotas e navegação mobile | Features, shell, Navbar, teste da navegação inferior, configurações de preview e trecho de isolamento em angular.json | 55                  |
| G4    | Documentação e governança       | Documentos consolidados, relatórios, template, este plano e oito evidências selecionadas                              | 25                  |

A sequência definitiva preserva **133 arquivos únicos**, mas tem **134 participações**: angular.json aparece em G2 e G3 com trechos distintos. Em G2 entram somente as alterações já existentes de service worker e ambiente de produção. Em G3 entra o bloco já existente que substitui preview.config.ts por preview.config.prod.ts, no mesmo estado que introduz esses arquivos e as rotas demonstrativas. Nenhum código intermediário fictício foi criado.

A Navbar e o teste da barra inferior passam de G2 para G3 porque dependem de Home/Mapa/Perfil registrados nesse grupo. app.config permanece em G2, com a geração do worker já habilitada no trecho de angular.json de G2. Assim preview:pwa não é introduzido com seu pré-requisito ausente. A tentativa de adiar angular.json inteiro para G3 foi descartada na simulação porque gerava essa inconsistência.

Mensagens definitivas fornecidas pelo mantenedor:

- `fix(OPE-34): corrige contratos HTTP e gerenciamento de sessão`
- `feat(OPE-34): consolida Design System, temas e PWA`
- `feat(OPE-34): integra telas, rotas e navegação mobile`
- `docs(OPE-34): consolida documentação e governança do frontend`

## Simulação cumulativa OPE-34

Estados montados em /tmp/open-transit-ope34-simulation a partir do HEAD e das alterações selecionadas, sem .git, sem commits reais e sem tocar o index original. Dependências locais foram reutilizadas por symlink; não houve npm ci ou rede. Configurações diagnósticas temporárias não integram os commits.

| Estado                  | Build de produção                                  | Testes completos                                                       | Diagnóstico do núcleo              |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| HEAD original, controle | Aprovado, 637,45 kB                                | Falha preexistente TS2305 em search.spec.ts, import Search inexistente | Não usado como aprovação funcional |
| Depois de G1            | Aprovado, 639,93 kB                                | Mesma falha preexistente                                               | 10 testes em 3 arquivos aprovados  |
| Depois de G2            | Aprovado, 663,83 kB, ngsw.json/worker gerados      | Mesma falha preexistente                                               | 18 testes em 5 arquivos aprovados  |
| Depois de G3            | Aprovado, 644,38 kB, demonstração fora de produção | 101 testes em 21 arquivos aprovados                                    | Suíte completa viável              |
| Depois de G4            | Aprovado, 644,55 kB                                | 101 testes em 21 arquivos aprovados                                    | Suíte completa viável              |

Em G1/G2, tanto a suíte completa quanto o include simples param no erro de compilação do teste antigo da busca, já reproduzido no HEAD. Para verificar os testes do núcleo, usou-se somente nas cópias um tsconfig.scope.json que estende tsconfig.spec.json e limita include a src/app/core/services/_.spec.ts. O comando diagnóstico combina --ts-config=tsconfig.scope.json e --include=src/app/core/services/_.spec.ts. Não se removeu/reparou teste para esconder a falha nem se declarou a suíte completa aprovada nesses estados. A versão atual do teste da busca entra legitimamente junto da tela em G3 e remove o bloqueio.

Todos os estados propostos compilam, sem referência nova a arquivo ausente. Isso não comprova E2E do backend ou ausência de dívida anterior. G1/G2 não são estados com suíte completa verde; a limitação preexistente está explícita. Os avisos de orçamento/Leaflet permanecem, sem alteração de budgets. G3/G4 não contêm marcadores exclusivos de fixtures nos JS de produção.

Os patches G2-angular.patch e G3-angular.patch foram aplicados sucessivamente somente numa cópia de angular.json e recompõem byte a byte o arquivo final. No repositório original, permanecem apenas comandos sugeridos. As listas e comandos completos ficam no plano /tmp/open-transit-commit-review/commit-plan.md; logs e resultados por estado ficam em /tmp/open-transit-ope34-simulation. Esses artefatos não serão versionados.

## Comandos sugeridos — não executados

Executar somente após aprovar conteúdo exato, revisão do isolamento de preview, riscos e autorização da exceção. Listas locais de apoio foram preparadas em /tmp/open-transit-commit-review/G1-paths.txt até G4-paths.txt; são temporárias, não versionáveis e precisam ser reconferidas contra o inventário. Não incluem preferências locais nem as 21 imagens opcionais. Para G2/G3, usar as listas de arquivos inteiros e os patches próprios de angular.json; não adicionar angular.json inteiro em G2. Se /tmp não persistir, reconstruir as listas a partir deste relatório, nunca trocar por git add .

Conferência remota, somente na etapa autorizada; interromper se origin/master não for ancestral de master ou se o remoto tiver divergência inesperada:

```bash
git status --short --untracked-files=all
git branch -vv
git remote -v
git fetch origin
git log --oneline --left-right master...origin/master
git merge-base --is-ancestor origin/master master
```

Revisar também o código de saída do último comando; falha exige nova decisão do mantenedor, não reset/merge automático.

Exemplo do primeiro grupo, após revisão final e autorização específica:

```bash
git --literal-pathspecs add --pathspec-from-file=/tmp/open-transit-commit-review/G1-whole-files.txt
git diff --cached --check
git diff --cached --stat
git diff --cached
# Interromper para revisão do diff staged; somente depois, se autorizado:
git commit -m 'fix(OPE-34): corrige contratos HTTP e gerenciamento de sessão'
```

Em G2: adicionar G2-whole-files.txt, conferir e aplicar G2-angular.patch com git apply --cached. Em G3: adicionar G3-whole-files.txt e aplicar G3-angular.patch ao index. Comparar o arquivo staged com angular.G2.json e angular.G3.json, respectivamente. G4 usa G4-whole-files.txt. A relação staged de cada grupo precisa coincidir exatamente com G1-paths.txt a G4-paths.txt. Os blocos completos com as quatro mensagens estão no plano local atualizado. Nenhum desses comandos foi executado aqui.

Após revisar commits finais e obter autorização de push:

```bash
npm run ng -- test --watch=false
npm run build
git diff --check
git diff --cached --quiet
git log --oneline origin/master..master
git status --short --untracked-files=all
git push --dry-run origin master
git push origin master
```

Revisar cada saída antes da próxima operação. O status pode continuar mostrando as preferências e imagens deliberadamente retidas; isso não autoriza adicioná-las. Não usar force push. Este push direto é a última exceção inicial autorizável, não o fluxo futuro.

## Plano imediato de develop após publicação

Confirmar primeiro que o SHA de master publicado corresponde ao conjunto aprovado; se develop já existir remotamente, parar e revisar em vez de sobrescrevê-la. Criar sem trocar a branch evita transportar/sobrescrever as alterações locais retidas:

```bash
git fetch origin
git rev-parse master origin/master
git ls-remote --heads origin develop
# Prosseguir somente se master/origin/master coincidirem no SHA aprovado e develop não existir.
git branch develop master
git push -u origin develop
```

Depois, em etapa autorizada: configurar CI com npm ci, builder Angular e build; resolver o script Vitest ou manter seu limite explícito, sem usar o comando quebrado como check obrigatório. Confirmar nomes reais dos checks; proteger master (sem push direto, releases por PR) e develop de forma apropriada, respeitando revisores disponíveis e autorização do mantenedor. A proteção não está ativa por estar descrita aqui. Sem branches ou proteções criadas agora.

Novos trabalhos partem de develop em feature/fix/docs por card OPE real; todo PR de feature aponta para develop. Releases develop→master exigem checks e autorização do mantenedor. Não afirmar que o próprio autor pode aprovar formalmente seu PR. Gestão do Linear fica com o responsável, com vínculo card→branch→commit→PR→release; Done só após integração e aceite.

## Decisões abertas antes da publicação

- [x] Preservar o recorte técnico de 133 caminhos e os 23 retidos; OPE-34 confirmado pelo mantenedor.
- [ ] Revisar divisão definitiva, patches e limitações dos testes intermediários; autorizar operações reais somente depois.
- [x] Implementar isolamento de preview exclusivo de desenvolvimento, testar sessão/identidade e impedir rota/fixtures em produção.
- [ ] Revisar esse isolamento e os resultados antes de qualquer commit.
- [ ] Aprovar/corrigir divergência mobile-only das molduras em desktop; não alterada nesta tarefa.
- [ ] Validar Laravel/PWA instalada ou aceitar explicitamente seus limites para esta publicação de fontes, sem declarar aceite E2E.
- [ ] Registrar falha Vitest, avisos de tamanho e política de CI subsequente.
- [ ] Revisar nomes/e-mails nas capturas retidas antes de qualquer inclusão futura.
- [ ] Conferir estado remoto atual e autorizar commits/push excepcionais somente depois de revisar o conteúdo final.

## Histórico do ajuste autorizado de preview

Na etapa anterior de isolamento de preview, foram alterados 21 arquivos existentes e criados quatro arquivos de código/teste, totalizando 25 caminhos. Os outros 158 arquivos do snapshot anterior permanecem íntegros, inclusive assets, relatórios históricos, configurações de ambiente, package/lock e serviços HTTP reais. As alterações locais anteriores nos arquivos editados foram preservadas por mudanças incrementais. Snapshot de conferência em /tmp/open-transit-preview-isolation; HEAD/branch/refs/index não foram alterados.

- `AGENTS.md`
- `CHANGELOG.md`
- `README.md`
- `angular.json`
- `docs/architecture.md`
- `docs/audits/2026-10-24-initial-publication-preparation.md`
- `docs/development.md`
- `docs/git-workflow.md`
- `docs/pwa.md`
- `src/app/app.routes.ts`
- `src/app/features/home/home.component.html`
- `src/app/features/home/home.component.ts`
- `src/app/features/map/map-page.component.html`
- `src/app/features/map/map-page.component.ts`
- `src/app/features/nearby-stops/nearby-stops.component.html`
- `src/app/features/nearby-stops/nearby-stops.component.ts`
- `src/app/features/preview/preview-isolation.spec.ts` — novo
- `src/app/features/preview/preview-services.ts`
- `src/app/features/preview/preview.spec.ts`
- `src/app/features/profile/profile.component.spec.ts`
- `src/app/features/search/search.component.html`
- `src/app/features/search/search.component.ts`
- `src/app/preview.config.prod.ts` — novo
- `src/app/preview.config.spec.ts` — novo
- `src/app/preview.config.ts` — novo

Pendências: revisar o plano definitivo OPE-34 e autorizar as operações antes de commitar; decidir/corrigir molduras mobile-only; validar Laravel E2E e PWA instalada/atualização ou registrar seus limites; manter as capturas sensíveis retidas; conferir remoto e autorizar publicação apenas em etapa posterior. A exposição de preview no novo build de produção está resolvida, sem implicar remoção imediata de versões antigas já instaladas.

## Inventário integral atualizado por arquivo

M = rastreado modificado, ? = não rastreado. G1–G4 são propostas, não commits existentes; Fora preserva o arquivo local sem staging. Tamanho em bytes, exceto este relatório. Total: 156 arquivos, com 133 candidatos e 23 retidos; nenhuma exclusão.

| Arquivo                                                                | Git | Categoria                 | Grupo | Bytes  | Decisão                                                                                               |
| ---------------------------------------------------------------------- | --- | ------------------------- | ----- | ------ | ----------------------------------------------------------------------------------------------------- |
| `.cspell/custom-dictionary-workspace.txt`                              | M   | Preferências locais       | Fora  | 895    | Fora: preferência local                                                                               |
| `.github/PULL_REQUEST_TEMPLATE.md`                                     | ?   | Documentação/governança   | G4    | 3359   | Candidato: revisar no grupo correspondente                                                            |
| `.gitignore`                                                           | M   | Configuração/dependências | G2    | 733    | Candidato: revisar no grupo correspondente                                                            |
| `.vscode/settings.json`                                                | M   | Preferências locais       | Fora  | 804    | Fora: preferência local                                                                               |
| `AGENTS.md`                                                            | ?   | Documentação/governança   | G4    | 8580   | Candidato: revisar no grupo correspondente                                                            |
| `CHANGELOG.md`                                                         | ?   | Documentação/governança   | G4    | 3738   | Candidato: revisar no grupo correspondente                                                            |
| `CONTRIBUTING.md`                                                      | ?   | Documentação/governança   | G4    | 2217   | Candidato: revisar no grupo correspondente                                                            |
| `README.md`                                                            | M   | Documentação/governança   | G4    | 7062   | Candidato: revisar no grupo correspondente                                                            |
| `angular.json`                                                         | M   | Configuração/dependências | G2/G3 | 2459   | Candidato: trechos existentes PWA/ambiente em G2; isolamento de preview em G3                         |
| `docs/api-contracts.md`                                                | ?   | Documentação/governança   | G4    | 8918   | Candidato: revisar no grupo correspondente                                                            |
| `docs/architecture.md`                                                 | ?   | Documentação/governança   | G4    | 5794   | Candidato: revisar no grupo correspondente                                                            |
| `docs/audits/2026-10-24-frontend-audit.md`                             | ?   | Documentação/governança   | G4    | 53293  | Candidato: revisar no grupo correspondente                                                            |
| `docs/audits/2026-10-24-initial-publication-preparation.md`            | ?   | Documentação/governança   | G4    | —      | Candidato: revisar no grupo correspondente                                                            |
| `docs/design-system.md`                                                | ?   | Documentação/governança   | G4    | 3708   | Candidato: revisar no grupo correspondente                                                            |
| `docs/development.md`                                                  | ?   | Documentação/governança   | G4    | 6688   | Candidato: revisar no grupo correspondente                                                            |
| `docs/engineering.md`                                                  | ?   | Documentação/governança   | G4    | 4059   | Candidato: revisar no grupo correspondente                                                            |
| `docs/git-workflow.md`                                                 | ?   | Documentação/governança   | G4    | 9886   | Candidato: revisar no grupo correspondente                                                            |
| `docs/linear-workflow.md`                                              | ?   | Documentação/governança   | G4    | 5762   | Candidato: revisar no grupo correspondente                                                            |
| `docs/migration-v2-batch-1.md`                                         | ?   | Documentação/governança   | G4    | 6290   | Candidato: revisar no grupo correspondente                                                            |
| `docs/migration-v2-batch-2.md`                                         | ?   | Documentação/governança   | G4    | 12224  | Candidato: revisar no grupo correspondente                                                            |
| `docs/previews/details-mobile-dark.png`                                | ?   | Evidências                | Fora  | 178033 | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/details-mobile-light.png`                               | ?   | Evidências                | Fora  | 172567 | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/details-stops-dark.png`                                 | ?   | Evidências                | Fora  | 63109  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/details-stops-light.png`                                | ?   | Evidências                | Fora  | 61570  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/favorites-mobile-dark.png`                              | ?   | Evidências                | Fora  | 32891  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/favorites-mobile-light.png`                             | ?   | Evidências                | Fora  | 32496  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/home-mobile-dark.png`                                   | ?   | Evidências                | Fora  | 52094  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/home-mobile-light.png`                                  | ?   | Evidências                | Fora  | 52925  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/home-mock-dark.png`                                     | ?   | Evidências                | Fora  | 58186  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/login-mobile-dark.png`                                  | ?   | Evidências                | G4    | 37496  | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/login-mobile-light.png`                                 | ?   | Evidências                | G4    | 37132  | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/login-offline.png`                                      | ?   | Evidências                | G4    | 44425  | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/map-mobile-dark.png`                                    | ?   | Evidências                | Fora  | 363395 | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/map-mobile-light.png`                                   | ?   | Evidências                | Fora  | 361668 | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/nearby-stops-mobile-dark.png`                           | ?   | Evidências                | Fora  | 54698  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/nearby-stops-mobile-light.png`                          | ?   | Evidências                | Fora  | 53892  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/onboarding-desktop.png`                                 | ?   | Evidências                | G4    | 75528  | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/onboarding-mobile.png`                                  | ?   | Evidências                | G4    | 61403  | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/onboarding-theme-dark.png`                              | ?   | Evidências                | Fora  | 54911  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/onboarding-theme-light.png`                             | ?   | Evidências                | Fora  | 56272  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/profile-mobile-dark.png`                                | ?   | Evidências                | Fora  | 62348  | Fora: confirmar origem/consentimento ou anonimizar nome/e-mail                                        |
| `docs/previews/profile-mobile-light.png`                               | ?   | Evidências                | Fora  | 63130  | Fora: confirmar origem/consentimento ou anonimizar nome/e-mail                                        |
| `docs/previews/pwa-browser-validation.json`                            | ?   | Evidências                | G4    | 5281   | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/pwa-standalone-validation.json`                         | ?   | Evidências                | G4    | 409    | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/register-mobile-dark.png`                               | ?   | Evidências                | G4    | 47898  | Candidato: evidência histórica referenciada; não aceita o build atual                                 |
| `docs/previews/search-mobile-dark.png`                                 | ?   | Evidências                | Fora  | 33870  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/search-mobile-light.png`                                | ?   | Evidências                | Fora  | 33908  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/search-mock-dark.png`                                   | ?   | Evidências                | Fora  | 40555  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/previews/search-mock-light.png`                                  | ?   | Evidências                | Fora  | 40390  | Fora: captura opcional não necessária aos links históricos                                            |
| `docs/pwa.md`                                                          | ?   | Documentação/governança   | G4    | 5409   | Candidato: revisar no grupo correspondente                                                            |
| `ngsw-config.json`                                                     | ?   | Configuração/dependências | G2    | 616    | Candidato: revisar no grupo correspondente                                                            |
| `package-lock.json`                                                    | M   | Configuração/dependências | G2    | 323635 | Candidato: revisar no grupo correspondente                                                            |
| `package.json`                                                         | M   | Configuração/dependências | G2    | 1174   | Candidato: revisar no grupo correspondente                                                            |
| `public/fonts/OFL.txt`                                                 | ?   | Assets/manifest           | G2    | 4402   | Candidato: revisar no grupo correspondente                                                            |
| `public/fonts/plus-jakarta-sans.ttf`                                   | ?   | Assets/manifest           | G2    | 176288 | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-128x128.png`                                        | ?   | Assets/manifest           | G2    | 6315   | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-144x144.png`                                        | ?   | Assets/manifest           | G2    | 7811   | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-152x152.png`                                        | ?   | Assets/manifest           | G2    | 8914   | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-192x192.png`                                        | ?   | Assets/manifest           | G2    | 11041  | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-384x384.png`                                        | ?   | Assets/manifest           | G2    | 26835  | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-512x512.png`                                        | ?   | Assets/manifest           | G2    | 33781  | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-72x72.png`                                          | ?   | Assets/manifest           | G2    | 3549   | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/icon-96x96.png`                                          | ?   | Assets/manifest           | G2    | 4911   | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/maskable-192x192.png`                                    | ?   | Assets/manifest           | G2    | 7926   | Candidato: revisar no grupo correspondente                                                            |
| `public/icons/maskable-512x512.png`                                    | ?   | Assets/manifest           | G2    | 26278  | Candidato: revisar no grupo correspondente                                                            |
| `public/manifest.webmanifest`                                          | ?   | Assets/manifest           | G2    | 851    | Candidato: revisar no grupo correspondente                                                            |
| `scripts/check-pwa-standalone.mjs`                                     | ?   | Scripts                   | G2    | 3886   | Candidato: revisar no grupo correspondente                                                            |
| `scripts/check-pwa.mjs`                                                | ?   | Scripts                   | G2    | 6656   | Candidato: revisar no grupo correspondente                                                            |
| `scripts/preview-pwa.mjs`                                              | ?   | Scripts                   | G2    | 3200   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/app-shell.spec.ts`                                            | ?   | Testes                    | G3    | 4142   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/app.component.ts`                                             | M   | Código funcional/estilos  | G3    | 3399   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/app.config.ts`                                                | M   | Código funcional/estilos  | G2    | 735    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/app.routes.ts`                                                | M   | Código funcional/estilos  | G3    | 2343   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/guards/guest.guard.ts`                                   | ?   | Código funcional/estilos  | G1    | 254    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/guards/public-entry.spec.ts`                             | ?   | Testes                    | G3    | 2511   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/interceptors/auth.interceptor.ts`                        | M   | Código funcional/estilos  | G1    | 1336   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/mappers/normalize-bus-line.mapper.ts`                    | M   | Código funcional/estilos  | G1    | 852    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/schemas/auth.schema.ts`                                  | M   | Código funcional/estilos  | G1    | 1116   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/schemas/bus-line-service.schema.ts`                      | ?   | Código funcional/estilos  | G1    | 2992   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/schemas/bus-line.schema.ts`                              | M   | Código funcional/estilos  | G1    | 831    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/schemas/nearby-stop.schema.ts`                           | ?   | Código funcional/estilos  | G1    | 1351   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/schemas/real-timeBus.schema.ts`                          | M   | Código funcional/estilos  | G1    | 1468   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/auth.service.spec.ts`                           | ?   | Testes                    | G1    | 5140   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/auth.service.ts`                                | M   | Código funcional/estilos  | G1    | 2484   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/bus-lines.service.ts`                           | M   | Código funcional/estilos  | G1    | 9003   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/favorites.service.spec.ts`                      | ?   | Testes                    | G1    | 1541   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/favorites.service.ts`                           | M   | Código funcional/estilos  | G1    | 2959   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/pwa.service.spec.ts`                            | ?   | Testes                    | G2    | 2407   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/pwa.service.ts`                                 | ?   | Código funcional/estilos  | G2    | 2992   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/real-time.service.ts`                           | M   | Código funcional/estilos  | G1    | 892    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/stops.service.spec.ts`                          | ?   | Testes                    | G1    | 2372   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/stops.service.ts`                               | ?   | Código funcional/estilos  | G1    | 956    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/theme.service.spec.ts`                          | ?   | Testes                    | G2    | 2407   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/core/services/theme.service.ts`                               | ?   | Código funcional/estilos  | G2    | 2327   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/auth-form-errors.ts`                            | ?   | Código funcional/estilos  | G3    | 1083   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/auth-layout/auth-layout.component.ts`           | ?   | Código funcional/estilos  | G3    | 928    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/login/login.component.html`                     | M   | Código funcional/estilos  | G3    | 1774   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/login/login.component.ts`                       | M   | Código funcional/estilos  | G3    | 2197   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/login/login.spec.ts`                            | M   | Testes                    | G3    | 2956   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/register/register.component.ts`                 | M   | Código funcional/estilos  | G3    | 2354   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/register/register.html`                         | M   | Código funcional/estilos  | G3    | 2864   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/auth/register/register.spec.ts`                      | M   | Testes                    | G3    | 2428   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/favorites/favorites.component.ts`                    | M   | Código funcional/estilos  | G3    | 2927   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/favorites/favorites.css`                             | M   | Código funcional/estilos  | G3    | 3693   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/favorites/favorites.html`                            | M   | Código funcional/estilos  | G3    | 2968   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/favorites/favorites.spec.ts`                         | M   | Testes                    | G3    | 3693   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/home/home.component.css`                             | ?   | Código funcional/estilos  | G3    | 5296   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/home/home.component.html`                            | ?   | Código funcional/estilos  | G3    | 6013   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/home/home.component.spec.ts`                         | ?   | Testes                    | G3    | 8696   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/home/home.component.ts`                              | ?   | Código funcional/estilos  | G3    | 8652   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/line-details/line-details-light.css`                 | ?   | Código funcional/estilos  | G3    | 1987   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/line-details/line-details.component.html`            | M   | Código funcional/estilos  | G3    | 11027  | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/line-details/line-details.component.ts`              | M   | Código funcional/estilos  | G3    | 10486  | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/line-details/line-details.css`                       | M   | Código funcional/estilos  | G3    | 9585   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/line-details/line-details.spec.ts`                   | M   | Testes                    | G3    | 7326   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/map/map-page.component.css`                          | ?   | Código funcional/estilos  | G3    | 5987   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/map/map-page.component.html`                         | ?   | Código funcional/estilos  | G3    | 6205   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/map/map-page.component.spec.ts`                      | ?   | Testes                    | G3    | 7098   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/map/map-page.component.ts`                           | ?   | Código funcional/estilos  | G3    | 8421   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/nearby-stops/nearby-stops.component.css`             | ?   | Código funcional/estilos  | G3    | 6354   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/nearby-stops/nearby-stops.component.html`            | ?   | Código funcional/estilos  | G3    | 6845   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/nearby-stops/nearby-stops.component.spec.ts`         | ?   | Testes                    | G3    | 7040   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/nearby-stops/nearby-stops.component.ts`              | ?   | Código funcional/estilos  | G3    | 5779   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/onboarding/onboarding.component.css`                 | ?   | Código funcional/estilos  | G3    | 6514   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/onboarding/onboarding.component.html`                | ?   | Código funcional/estilos  | G3    | 3604   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/onboarding/onboarding.component.ts`                  | ?   | Código funcional/estilos  | G3    | 682    | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/preview/preview-data.ts`                             | ?   | Código funcional/estilos  | G3    | 3352   | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/features/preview/preview-isolation.spec.ts`                   | ?   | Testes                    | G3    | 5751   | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/features/preview/preview-services.ts`                         | ?   | Código funcional/estilos  | G3    | 4553   | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/features/preview/preview.routes.ts`                           | ?   | Código funcional/estilos  | G3    | 1710   | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/features/preview/preview.spec.ts`                             | ?   | Testes                    | G3    | 4476   | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/features/profile/profile.component.css`                       | ?   | Código funcional/estilos  | G3    | 6925   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/profile/profile.component.html`                      | ?   | Código funcional/estilos  | G3    | 6570   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/profile/profile.component.spec.ts`                   | ?   | Testes                    | G3    | 4514   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/profile/profile.component.ts`                        | ?   | Código funcional/estilos  | G3    | 2583   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/search/search.component.html`                        | M   | Código funcional/estilos  | G3    | 5470   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/search/search.component.ts`                          | M   | Código funcional/estilos  | G3    | 12851  | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/search/search.css`                                   | M   | Código funcional/estilos  | G3    | 4049   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/features/search/search.spec.ts`                               | M   | Testes                    | G3    | 9030   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/preview.config.prod.ts`                                       | ?   | Código funcional/estilos  | G3    | 129    | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/preview.config.spec.ts`                                       | ?   | Testes                    | G3    | 1305   | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/preview.config.ts`                                            | ?   | Código funcional/estilos  | G3    | 346    | Candidato: isolamento e demonstração exclusiva de desenvolvimento; fixtures fora do grafo de produção |
| `src/app/shared/components/bottom-nav/bottom-nav.component.spec.ts`    | ?   | Testes                    | G3    | 1883   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/bottom-nav/bottom-nav.component.ts`         | ?   | Código funcional/estilos  | G2    | 1438   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/icon/icon.component.ts`                     | ?   | Código funcional/estilos  | G2    | 2429   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/line-card/line-card.component.css`          | ?   | Código funcional/estilos  | G2    | 1783   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/line-card/line-card.component.ts`           | M   | Código funcional/estilos  | G2    | 4328   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/map/map.component.ts`                       | M   | Código funcional/estilos  | G2    | 11360  | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/navbar/navbar.component.ts`                 | M   | Código funcional/estilos  | G3    | 1389   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/pwa-status/pwa-status.component.ts`         | ?   | Código funcional/estilos  | G2    | 1047   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/theme-switcher/theme-switcher.component.ts` | ?   | Código funcional/estilos  | G2    | 1162   | Candidato: revisar no grupo correspondente                                                            |
| `src/app/shared/components/toast/toast.component.ts`                   | M   | Código funcional/estilos  | G2    | 1032   | Candidato: revisar no grupo correspondente                                                            |
| `src/environments/environment.prod.ts`                                 | M   | Código funcional/estilos  | G2    | 139    | Candidato: revisar no grupo correspondente                                                            |
| `src/index.html`                                                       | M   | Código funcional/estilos  | G2    | 658    | Candidato: revisar no grupo correspondente                                                            |
| `src/styles.css`                                                       | M   | Código funcional/estilos  | G2    | 17697  | Candidato: revisar no grupo correspondente                                                            |
| `src/styles/theme.css`                                                 | ?   | Código funcional/estilos  | G2    | 2141   | Candidato: revisar no grupo correspondente                                                            |
