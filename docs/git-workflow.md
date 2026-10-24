# Fluxo Git e governança do GitHub

## Estado confirmado e limites

Em 24/10/2026, a publicação excepcional OPE-34 e a criação de `develop` foram concluídas. `master` e `develop` partiram do SHA `39bcec9277499804b9134d6199a8b10c9e9acba8`. A exceção de push direto em master está encerrada.

A etapa OPE-25 prepara Husky, CI, política de PR e Rulesets. Repositório oficial: `hltav/mobility-frontend`, público e de proprietário pessoal (`hltav`, tipo User). A consulta de leitura à API `/repos/hltav/mobility-frontend/rulesets` retornou `[]`. As consultas de leitura aos endpoints branches/master e branches/develop retornaram protected=false e enforcement de checks off. O plano pago da conta não foi confirmado. O conector consultado tem leitura, sem administração.

| Estado                         | Configuração                                                              |
| ------------------------------ | ------------------------------------------------------------------------- |
| Implementado localmente        | Hooks e verificações de governança; workflows preparados na branch OPE-25 |
| Publicado previamente          | master/develop no SHA consolidado OPE-34                                  |
| Preparado para aprovação       | JSONs de Protect develop e Protect master com enforcement disabled        |
| Ainda não comprovado no GitHub | Execução dos novos checks e bloqueio efetivo de merges                    |
| Não ativado nesta etapa        | Rulesets, bypass e restrição adicional de atores                          |

## Branches e rastreabilidade

| Branch                            | Uso e destino                                                    |
| --------------------------------- | ---------------------------------------------------------------- |
| `master`                          | Estável; recebe exclusivamente release do próprio develop por PR |
| `develop`                         | Integração e base de novos trabalhos; recebe PRs por card        |
| `feature/OPE-<número>-descricao`  | Funcionalidade → develop                                         |
| `fix/OPE-<número>-descricao`      | Correção → develop                                               |
| `docs/OPE-<número>-descricao`     | Documentação → develop                                           |
| `refactor/OPE-<número>-descricao` | Refatoração → develop                                            |
| `test/OPE-<número>-descricao`     | Testes → develop                                                 |
| `chore/OPE-<número>-descricao`    | Manutenção/CI → develop                                          |

Descrições de branch usam letras minúsculas ASCII, números e hífens. Outros padrões de manutenção precisam de aprovação e atualização da política antes do uso. A branch desta entrega é `feature/OPE-25-governanca-ci-protecao-branches`, card real informado pelo mantenedor. Não usar esse card para trabalhos independentes.

Commits: `tipo(OPE-<número>): descrição`, com `!` opcional antes de `:`. Tipos aceitos: feat, fix, docs, style, refactor, perf, test, build, ci, chore e revert. Exemplo do escopo aprovado: `ci(OPE-25): configura validação de PRs e CI Angular`. Placeholders não são IDs reais.

A política exige card numérico no título ou corpo do PR, fora de comentários HTML; para develop, ele deve corresponder ao card da branch. Releases precisam listar os cards reais incluídos. Hooks e CI validam sintaxe e correspondência, não existência do card ou aceite no Linear. Confira isso na revisão, sem credenciais Linear no CI. Veja [rastreabilidade](linear-workflow.md).

## Hooks locais

Husky 9.1.7 é instalado por `npm ci`; `prepare` configura `.husky/_` como hooksPath. Antes de instalar, confira hooksPath e hooks existentes; não sobrescreva hooks pessoais/ativos sem combinar sua composição. Nesta configuração inicial só havia hooks de exemplo, preservados.

- pre-commit: `npm run lint:staged`; verifica whitespace e sintaxe/formatação Prettier dos blobs staged reconhecidos, mais ESLint em src TS/HTML (inclui templates inline), sem modificar arquivos ou staging. O hook reprova erros ESLint; o teto global de avisos é verificado pelo lint completo no CI. Arquivos sem parser ainda passam por whitespace.
- commit-msg: valida a primeira linha em Conventional Commits com OPE numérico. Confirme a existência e o escopo real do card antes do commit.
- Build e suíte Angular ficam fora do pre-commit. Hooks não substituem CI e podem ser desativados pelo cliente; CI usa `HUSKY=0` porque não cria commits.

Lint configurado em eslint.config.mjs: ESLint 10.13.0, TypeScript ESLint 8.72.0 e Angular ESLint 21.4.0. Regras recomendadas de JS/TS/Angular/templates e acessibilidade, sem regras de reformatação ESLint. Não usa análise de tipos por projeto. A comparação intencional `== null`/`!= null` é permitida nos templates. Argumentos prefixados por \_ podem ser ignorados. Os 13 avisos legados de tipos/padrões ficam visíveis em arquivos específicos; `npm run lint` usa --max-warnings=13. Não subir o teto nem ampliar exceções para novos problemas. A contagem global limita crescimento, mas não substitui revisão de mudanças no mesmo arquivo. Ao corrigir formatação de arquivo parcialmente staged, preserve trechos locais e revise antes de adicionar. Não executar formatadores com escrita global, `git add .` ou `git add -A`.

O whitespace histórico da licença `public/fonts/OFL.txt:21` foi aceito somente na OPE-34, preservando seus bytes. Essa decisão não desativa verificações nem autoriza novas exceções.

## Checks preparados

| Workflow / job (nome do check proposto) | Validação                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| PR policy / `PR policy`                 | Metadados: origem/destino/card; sem checkout e sem executar código do PR               |
| Angular CI / `Install`                  | npm ci e testes de governança                                                          |
| Angular CI / `Build`                    | npm ci e npm run build                                                                 |
| Angular CI / `Angular tests`            | npm ci e npm run ng -- test --watch=false                                              |
| Angular CI / `Security`                 | npm audit --omit=dev --audit-level=high e npm audit --audit-level=high, sem instalação |
| Angular CI / `Lint`                     | npm ci e npm run lint; erros ou mais de 13 avisos reprovam                             |

CI técnico usa pull_request para develop/master, código sem credenciais persistidas, token contents:read, actions fixadas por SHA e Node 22.22.0. O check Security é bloqueante e não usa continue-on-error; a consulta inicial encontrou 6 entradas altas e 2 moderadas nas dependências de produção. A correção autorizada de Angular/compiler-cli para 21.2.25 e Zod para 4.6.7 zerou o audit de produção, com instalação limpa, build, suíte e lint validados. Não foi executado npm audit fix. O audit de produção permanece separado, mas o Security agora também executa audit completo para cobrir devDependencies; nenhum dos dois substitui revisão de segredos. Security não executa npm ci: lê o lock e precisa passar antes de Install, que instala e testa a governança. Os jobs técnicos continuam dependendo de Install. A triagem posterior atualizou CLI/build 21.2.28, PostCSS 8.5.31 e Vitest 4.1.12, com audit completo local sem vulnerabilidades reportadas. npm ci é repetido por job para manter instalações isoladas. Falhas não são convertidas em sucesso; dependências impedem executar jobs técnicos se Install falhar. Não há filtro paths, inclusive em PRs somente de documentação. O job Lint executa npm run lint diretamente, sem caminho de sucesso pela ausência do script.

A política usa pull_request_target com eventos opened/synchronize/reopened/edited/ready_for_review, inclusive mudança de destino e descrição. Lê somente payload; não faz checkout, não usa secrets nem altera/fecha PRs. A proteção precisa exigir esse check para que uma reprovação impeça merge. Uma atualização da política requer revisão do mantenedor; testes locais não comprovam execução no GitHub.

## Revisão e merge

PRs por card vão para develop, usando o [template](../.github/PULL_REQUEST_TEMPLATE.md). Master aceita exclusivamente develop do mesmo repositório; branch develop de fork é rejeitada. PR inválido falha por status, sem fechamento ou redirecionamento automático.

Merge depende dos checks e da autorização explícita do mantenedor, registrada no PR. Autor não pode aprovar formalmente o próprio PR. A proposta usa zero aprovações formais obrigatórias, sem exigir code owner ou aprovação do último push, para o único mantenedor conseguir integrar PRs com checks verdes e conversas resolvidas. Isso não equivale a revisão independente: adote um revisor elegível quando a equipe permitir. Squash por card é preferência; releases devem preservar a ancestralidade de develop, preferindo merge commit e listando cards.

Como a proposta exige base atualizada, depois de cada release planeje uma sincronização de master em develop por PR de manutenção com card real (branch chore por card, baseada em develop, incorporando a release sob autorização). Não use push direto, PR master→develop fora da política ou botão Update branch que tente gravar diretamente na develop protegida. Essa sincronização não foi executada nesta etapa.

Agentes só fazem commit/push/PR/merge mediante autorização específica. Nesta entrega não há commit, push ou PR autorizado. Sem push direto em master/develop, force push, rebase/merge incidental ou alteração de proteção.

## Rulesets propostos para aprovação

Arquivos: [Protect develop](../.github/rulesets/protect-develop.json) e [Protect master](../.github/rulesets/protect-master.json). São propostas importáveis, com `enforcement: disabled`; não enviadas à API. Targets literais refs/heads/develop e refs/heads/master. Exigem PR, conversas resolvidas, os seis checks e atualização da base; bloqueiam exclusão e force push. Lista de bypass vazia e aprovações formais zero.

Não ativar Restrict updates nesses dois Rulesets: sem bypass, impediria atualizações inclusive por merge do único mantenedor. Require a pull request limita push direto sem exigir esse bloqueio. Não habilitar bypass genérico de administradores: ele permite contornar as regras do Ruleset e reduz as garantias de checks/PR. O proprietário ainda pode editar/desativar regras com administração; isso é poder administrativo, não evidência de conformidade.

Os contextos de checks e integration_id 15368 (GitHub Actions) são candidatos, não observações de execução neste repositório. Antes da ativação, conferir os nomes e app_id efetivos nas check-runs e ajustar os JSONs se necessário.

### Restrição de merge por ator e plano

[Rulesets de branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) estão disponíveis para repositórios públicos inclusive no GitHub Free; não é necessário presumir plano pago para este repositório público. Push rulesets têm outra disponibilidade e finalidade, e não são os arquivos propostos aqui.

A opção clássica Restrict who can push to matching branches, que também limita merges, é documentada para [repositórios de organizações](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule). Este repositório pertence a conta pessoal; não apresentar essa opção como disponível. Em Rulesets, Restrict updates exige bypass para atualizações e não é um seletor independente de quem pode aprovar/realizar merge. Se houver colaboradores com escrita, a exigência documental de autorização do mantenedor não equivale a um bloqueio técnico por ator. Rever permissões/repositório de organização em etapa própria, sem adotar bypass amplo para simular a restrição.

Fontes: [regras disponíveis](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) e [limite de aprovação pelo autor](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request).

## Checklist de ativação segura

1. Revisar o diff OPE-25 e os 23 arquivos retidos; autorizar separadamente commit seletivo, push da feature e PR para develop. Não adicionar preferências locais ou screenshots retidos.
2. Executar os testes de governança, instalação limpa, build, suíte Angular e audits de produção/completo; confirmar que ambos os audits continuam sem alertas altos/críticos antes de habilitar Security obrigatório. O bloqueio inicial foi corrigido localmente; ainda falta validação no GitHub. Não usar Vitest direto como substituto; a falha conhecida de setup continua pendente.
3. Publicar a feature e abrir PR para develop somente quando autorizado. CI técnico roda a partir do workflow do PR. A política pull_request_target requer workflow presente na branch padrão; como master ainda não contém esse workflow, não prometer seu check nesta primeira entrega.
4. Para a introdução inicial da governança, revisar manualmente origem/destino/card e os resultados técnicos, obter autorização e integrar por PR em develop. Preparar depois release develop→master também por PR, com revisão manual da política se o check ainda não existir. Essas operações não estão executadas nem autorizadas por este documento. Não ativar checks inexistentes para forçar essa transição.
5. Após os workflows chegarem à master, validar em PRs controlados os cenários abaixo, incluindo PR só documental, mudança de destino e ausência de card. Registrar URLs das execuções e contextos/app_id reais. Remover condições inválidas somente por ajuste explícito do PR; não fechar/alterar automaticamente.
6. Com checks aprovados observados no GitHub, revisar/importar os dois JSONs como Disabled em Settings → Rules → Rulesets, sem bypass. Conferir também proteções clássicas, permissões Actions e restrições adicionais que se acumulam.
7. Mediante autorização de ativação, selecionar os checks confirmados, conferir PR/conversas/zero aprovações e mudar enforcement para Active em ambos. Validar que o mantenedor pode fazer merge por PR sem autoaprovação formal, que push direto/force push/exclusão são bloqueados e que build/teste reprovados impedem merge. Não testar force push ou exclusão nas branches oficiais.
8. Registrar evidências e configuração efetiva. Alterar a branch padrão de colaboração ou integrar Linear são decisões separadas. Só marcar como ativo o que foi confirmado no GitHub.

| Cenário                                                                | Resultado da política preparado                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| feature/fix/docs/refactor/test/chore com card correspondente → develop | Permitido                                               |
| feature/fix/docs → master                                              | Rejeitado com orientação para develop                   |
| develop do próprio repositório → master com card                       | Permitido                                               |
| develop de fork → master                                               | Rejeitado                                               |
| PR sem card, placeholder ou card divergente da branch                  | Rejeitado                                               |
| Destino diferente de master/develop                                    | Rejeitado                                               |
| Build/teste falha                                                      | Check falha; bloqueia merge somente após proteção ativa |

Rollback da governança deve ocorrer por PR revisado, mantendo proteções funcionais e histórico. Não apagar hooks de terceiros. Para publicação da aplicação/PWA, servir versão coerente e considerar clientes com worker antigo; consulte [PWA](pwa.md).
