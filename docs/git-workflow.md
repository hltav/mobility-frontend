# Fluxo Git e publicação inicial

## Estado observado

Em 24/10/2026: branch local `master`, HEAD `af4a148ed012f0085fe8acb58f0d1e8dfe2b74ee`, tracking `origin/master`; `origin/HEAD` aponta para `origin/master`. Remote fetch/push: `git@github.com:hltav/mobility-frontend.git`. Não houve fetch: referências remotas locais podem estar desatualizadas. Só `master` existe nas referências inspecionadas. Proteções, permissões, checks e integração Linear não foram verificados no GitHub.

## Política Git definida para o frontend

A política abaixo define o fluxo de trabalho adotado para as próximas entregas. A existência das branches, dos checks e das proteções é estado operacional separado: sua configuração ainda está pendente e não foi realizada nesta consolidação.

| Branch                     | Finalidade e destino                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `master`                   | Branch estável; protegida após publicação inicial; releases de develop por PR; sem push direto no fluxo futuro |
| `develop`                  | Branch de integração, base de novos trabalhos e destino padrão dos PRs de funcionalidades                      |
| `feature/OPE-XX-descricao` | Funcionalidade de card real; PR obrigatoriamente para develop                                                  |
| `fix/OPE-XX-descricao`     | Correção de card real; PR para develop                                                                         |
| `docs/OPE-XX-descricao`    | Documentação de card real; PR para develop                                                                     |

## Conventional Commits

O identificador deve corresponder a um card real da equipe OPE no [Linear Open Transit](https://linear.app/open-transit). `XX` é somente placeholder documental, nunca um ID para commit real.

```text
feat(OPE-XX): implementa nova tela de paradas
fix(OPE-XX): corrige tratamento de sessão expirada
docs(OPE-XX): atualiza documentação PWA
test(OPE-XX): adiciona testes da autenticação
refactor(OPE-XX): reorganiza componentes compartilhados
```

Tipos adicionais seguem o mesmo vínculo de card real e escopo aprovado. Releases envolvendo vários cards devem listá-los na descrição; não inventar card agregador. A cadeia de rastreabilidade card→branch→commit→PR→release está no [fluxo Linear](linear-workflow.md).

## Revisão, checks e autorização

PR deve usar o [template](../.github/PULL_REQUEST_TEMPLATE.md), evidências técnicas/visuais, testes e resultado do build. Todo PR de feature tem develop como destino. Merge depende dos checks definidos para o repositório e da autorização do mantenedor responsável; checks verdes não substituem essa autorização. Após ajustes, revalidar o impacto antes de aprovar.

Não presumir que GitHub permita ao autor aprovar formalmente seu próprio PR. Quando revisão formal for exigida, obter aprovação de revisor elegível distinto do autor. Se não houver revisor elegível, o mantenedor precisa definir uma política de proteção compatível e registrar sua autorização; não simular autoaprovação, contornar checks ou declarar requisito formal atendido sem evidência.

Preferência proposta: squash por card com mensagem convencional; releases develop→master devem preservar rastreabilidade. A estratégia de merge e os nomes dos checks dependem da configuração real, ainda não verificada. Agentes não executam commit, push, abertura de PR ou merge automaticamente.

Depois da entrega inicial expressamente autorizada, **proibido push direto em master**. Não presumir que essa política documental já esteja tecnicamente protegida.

## Checklist da publicação excepcional inicial em master

Esta seção é plano, não autorização nem comandos executados. A auditoria não criou commits, branches, PRs, push ou proteções. O inventário está no [relatório](audits/2026-10-24-frontend-audit.md).

- [ ] Revisar inventário integral, incluindo não rastreados, com o responsável; aprovar escopo adicional aos lotes, revisar o isolamento de preview exclusivo de desenvolvimento e decidir sobre o layout mobile-only.
- [ ] Fechar aceite HTTP real e PWA instalada ou aprovar expressamente limites e riscos. Build/unidade não são E2E. Decidir correção do Vitest alternativo e avisos sem afrouxar budgets.
- [ ] Revisar segredos, arquivos grandes, artefatos, licenças e dados de capturas no conteúdo exato a publicar.
- [ ] Propor commits por assunto e card real, com seleção de arquivos/trechos; não usar `git add .` sobre trabalho de terceiros.
- [ ] Revalidar a combinação selecionada em ambiente isolado. Os 97 testes e o build registrados na auditoria não validam automaticamente um subconjunto diferente de alterações.
- [ ] Apresentar conteúdo, commits propostos, evidências e rollback para revisão; obter autorização explícita para commit e publicação excepcional em master.
- [ ] Somente na etapa autorizada, atualizar referências remotas, conferir divergências e permissão da exceção, revisar staging e publicar o conteúdo aprovado. Sem force push ou sobrescrita de trabalho remoto.

Nenhum item é marcado como concluído por esta consolidação. Comandos remotos, staging, commits e branches não foram executados nesta etapa.

### Agrupamento sugerido de commits

| Grupo                         | Conteúdo e dependências                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Contratos e compatibilidade   | Mappers/schemas/serviços de linhas, favoritos e posições já modificados antes dos lotes; testes correspondentes |
| Fundação visual               | Fonte/licença, tokens, tema, shell, ícones e componentes compartilhados, Home/navegação e testes                |
| Entrada e autenticação        | Onboarding, AuthLayout, formulários, guards, interceptor, AuthService e testes                                  |
| PWA                           | Pacote/lock/config, manifest/ícones, status/serviço PWA, preview server e testes                                |
| Telas adicionais              | Busca/detalhes/favoritos, mapa/paradas/perfil, testes e CSS; confirmar escopo e fixtures separadamente          |
| Governança/evidências         | Documentos desta auditoria, relatórios históricos, template e evidências aprovadas                              |
| Preferências locais opcionais | `.vscode/settings.json` e dicionário cspell somente se forem deliberadamente política de equipe                 |

Arquivos como rotas, shell, styles, icons e serviços abrangem vários grupos; separar por trechos coerentes e respeitar dependências, sem prometer que cada grupo atual compila sozinho. Não reescrever mudanças de terceiros para forçar o agrupamento.

### O que versionar

- Código/configuração funcional aprovado, testes relacionados, package/lock juntos, manifest/ngsw, fonte/OFL e ícones usados; scripts apenas se revisados e documentados.
- Governança desta execução e relatórios históricos. Selecionar capturas/JSON úteis e sanitizados; screenshots com `mock`/prévia não são evidência de API real.
- `.gitignore` contém exclusão de `.migration-baselines/`, necessária para preservar snapshots fora da publicação. Baselines, perfis CDP/XDG, tooling temporário, dist, node_modules, cache, coverage, logs, segredos e `.env*` locais não devem ser adicionados. A regra atual ignora apenas `.env` exato: conferir variantes antes de staging.
- CSS/templates antigos e scripts CDP não devem ser apagados nesta consolidação; decidir sua manutenção em revisão funcional. Não publicar snapshots para demonstrar preservação.

## Checklist posterior: develop, CI, proteções e releases

- [ ] Confirmar SHA de master efetivamente publicado e criar develop exatamente a partir dele, com autorização; não partir da árvore local suja.
- [ ] Configurar e validar checks de CI para build/testes em tarefa própria; definir nomes dos checks a partir de execuções reais. Não há workflow de CI na árvore inspecionada.
- [ ] Proteger master: releases por PR, checks definidos, revisão conforme política, autorização do mantenedor, conversas resolvidas, bloqueio de force push/exclusão e bypass restrito.
- [ ] Proteger develop de forma apropriada: PRs de entrega, checks e revisão conforme política compatível com os revisores disponíveis; registrar responsáveis/exceções.
- [ ] Padronizar novos trabalhos a partir de develop e branches feature/fix/docs por card OPE real. Todo PR de feature deve apontar para develop.
- [ ] Publicar releases de develop para master por PR, mediante checks e autorização do mantenedor; registrar cards incluídos e rollback.
- [ ] Conferir acesso, estados e eventual integração automática no workspace oficial informado, sem modificar cards nesta consolidação. Gestão do workspace fica com o responsável do projeto.

Caso se escolha mudar a branch padrão de colaboração no GitHub, registrar essa decisão e configurá-la em etapa autorizada; base develop para novos trabalhos já é a política documental. Nenhuma proteção é considerada ativa apenas pela existência deste checklist.

Rollback da publicação deve preservar histórico, preferindo revert revisado e novo build coerente. Para PWA, servir conjunto completo da versão escolhida e validar atualização dos clientes; reverter código não garante remoção instantânea de workers instalados. Qualquer ação remota depende de autorização.
