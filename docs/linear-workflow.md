# Rastreabilidade com Linear

## Referência oficial

Workspace oficial do Open Transit: [https://linear.app/open-transit](https://linear.app/open-transit). Equipe: **OPE**. URL e equipe foram informadas pelo responsável do projeto nesta consolidação; não são resultado de uma nova consulta remota.

Linear é a fonte de rastreabilidade das tarefas e do escopo aprovado. A gestão de cards, classificações, estados, permissões e automações será realizada separadamente pelo responsável do projeto. Nenhum card ou configuração deve ser alterado como efeito colateral desta documentação.

A auditoria de 24/10/2026 registrou que o conector disponível acessava outro workspace. Esse registro histórico é preservado no [relatório](audits/2026-10-24-frontend-audit.md). A identificação oficial fornecida agora resolve a referência documental, mas não comprova acesso do conector, estados reais ou integração automática GitHub–Linear. A leitura do GitHub na etapa OPE-25 não comprova acesso ao workspace Linear nem integração automática.

## Classificações de cards

Os cards podem usar as classificações existentes informadas pelo responsável, conforme seu escopo:

| Classificação    | Aplicação                                             |
| ---------------- | ----------------------------------------------------- |
| Frontend         | Aplicação Angular e experiência de uso                |
| Backend          | API Laravel                                           |
| Go Processor     | Processamento e serviços Go                           |
| Infrastructure   | Ambientes, hospedagem e CI                            |
| Security         | Sessão, exposição e controles de segurança            |
| Testing          | Testes e validação                                    |
| Documentation    | Documentação e governança                             |
| Shared Contracts | Contratos compartilhados entre componentes do sistema |

A classificação do card não autoriza alteração fora do escopo aprovado. Em especial, cards Frontend ou Shared Contracts não autorizam por si só mudanças de backend. Não criar, renomear ou aplicar classificações automaticamente nesta etapa.

## Card, branch, commit, PR e release

| Artefato | Vínculo exigido                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Card     | Identificador OPE real, objetivo, escopo aprovado e critérios de aceite                                                                |
| Branch   | Base develop; feature/fix/docs/refactor/test/chore com o identificador real, por exemplo `feature/OPE-XX-descricao` apenas como modelo |
| Commit   | Conventional Commits com o mesmo card real, conforme [Git](git-workflow.md)                                                            |
| PR       | Link completo do card, resumo, contexto, evidências, testes/build, riscos, contratos e pendências; funcionalidades para develop        |
| Release  | PR develop→master, cards/PRs/commits incluídos, resultado dos checks, autorização e referência da versão ou SHA efetivamente publicada |

`XX` é placeholder documental, nunca identificador para commit real. Não inventar IDs, vínculos ou card agregador. Quando uma mudança abranger vários cards, listar as relações verdadeiras e os critérios de cada um. Manter links rastreáveis mesmo se a associação automática não estiver configurada.

## Estados e aceite

Os nomes abaixo descrevem o fluxo desejado. Antes de uma transição autorizada, o responsável deve conferir os estados/IDs e suas categorias reais na equipe OPE, sem inferi-los de outro workspace.

| Momento                                   | Estado desejado e registro                                     |
| ----------------------------------------- | -------------------------------------------------------------- |
| Início da implementação                   | In Progress, com branch vinculada e escopo aceito              |
| PR pronto para revisão                    | In Review, com PR vinculado, evidências e critérios revisáveis |
| Ajustes solicitados                       | Estado de implementação conforme mapeamento real               |
| Entrega integrada e critérios satisfeitos | Done, com PR/commit integrado e evidência de aceite            |

PR aberto, checks verdes ou testes unitários aprovados não implicam Done. Merge em develop encerra o card somente se cumprir seus critérios; se o aceite exigir release/produção, aguardar essa entrega. Não presumir automação das transições. Nesta etapa, não atualizar estados ou cards.

## Integração automática pendente de confirmação

A relação documental acima funciona com links explícitos. Não há confirmação de integração automática GitHub–Linear. Em etapa separada, sob responsabilidade do projeto:

- [ ] Conferir acesso ao workspace oficial, equipe OPE, estados/IDs, classificações e permissões.
- [ ] Conferir instalação e escopo da integração com o repositório GitHub correto, convenções e eventos de PR/release.
- [ ] Aprovar mapeamento de estados e responsabilidades, evitando conflito entre automações e gestão manual.
- [ ] Se autorizado, validar vínculos e transições em card controlado e registrar evidências sanitizadas.
- [ ] Atualizar este documento com configurações efetivamente confirmadas, sem expor credenciais.

A publicação inicial e a criação/proteção de develop seguem o [plano Git](git-workflow.md). Master/develop foram publicadas na OPE-34; a OPE-25 prepara a governança, sem autorização de push, PR, merge ou ativação de proteções.

## Validação preparada na OPE-25

O card real OPE-25 — Criar CI de lint, testes, build e segurança — foi confirmado pelo mantenedor para Husky, Actions, política de PR e propostas de Rulesets. A branch é `feature/OPE-25-governanca-ci-protecao-branches`. A política de PR exige card no título/corpo fora de comentários HTML, correspondendo ao ID da branch em PR para develop. Release develop→master lista cards reais incluídos. Hooks validam a sintaxe numérica do ID; não consultam Linear nem confirmam existência, estado ou aceite. O mantenedor faz essa verificação. Não foi alterado nenhum card ou estado; integração automática permanece não confirmada.
