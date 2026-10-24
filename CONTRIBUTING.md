# Contribuição

Leia [AGENTS.md](AGENTS.md), [engenharia](docs/engineering.md) e [desenvolvimento](docs/development.md). Preserve mudanças locais e mantenha o escopo do card confirmado. Alterações de contrato, sessão ou cache devem explicitar impacto e compatibilidade.

1. Confirme o card da equipe OPE no [Linear Open Transit](https://linear.app/open-transit), seu escopo aprovado e critérios de aceite. A gestão do workspace é realizada separadamente pelo responsável do projeto.
2. Após a publicação inicial e criação de `develop`, parta dessa branch atualizada; use `feature/OPE-XX-descricao`, `fix/OPE-XX-descricao` ou `docs/OPE-XX-descricao` com card real. Veja [Git](docs/git-workflow.md) para Conventional Commits, revisão e releases.
3. Implemente com componentes standalone, tipos estritos, contratos/Zod e padrão mobile-only/PWA-first. Preserve funcionalidades reais; não introduza mocks silenciosos.
4. Para código funcional, execute suíte Angular, build e diff check. Para documentação, confira links, comandos e consistência. Registre warnings e limites da evidência.
5. Prepare PR de funcionalidade/correção/documentação para `develop` com o [template](.github/PULL_REQUEST_TEMPLATE.md), card, evidências técnicas/visuais, testes, resultado do build, riscos, contratos e rollback quando aplicável. Não abra o PR automaticamente sem autorização.
6. Merge depende dos checks definidos e da autorização do mantenedor responsável. Não presuma que o autor possa aprovar formalmente seu próprio PR. Done somente depois de integração e aceite, seguindo [Linear](docs/linear-workflow.md).

`develop` ainda não existe nas referências locais inspecionadas. Não crie branches, commits, push ou merge nesta consolidação. Exemplos `OPE-XX` são placeholders e não podem ser usados em commits reais. Backend permanece somente leitura sem autorização específica.

Use Open Transit como nome provisório nos documentos. Identidade visual é referência aprovada para desenvolvimento; identidade comercial será decidida depois. Preserve nomes técnicos e relatos históricos, sem alterar marca/textos/assets da aplicação por consequência de uma tarefa documental.
