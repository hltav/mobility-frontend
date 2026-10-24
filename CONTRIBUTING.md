# Contribuição

Leia [AGENTS.md](AGENTS.md), [engenharia](docs/engineering.md) e [desenvolvimento](docs/development.md). Preserve mudanças locais e mantenha o escopo do card confirmado. Alterações de contrato, sessão ou cache devem explicitar impacto e compatibilidade.

1. Confirme o card da equipe OPE no [Linear Open Transit](https://linear.app/open-transit), seu escopo aprovado e critérios de aceite. A gestão do workspace é realizada separadamente pelo responsável do projeto.
2. Parta de `develop` atualizada; use `feature`, `fix`, `docs`, `refactor`, `test` ou `chore` no padrão `tipo/OPE-<número>-descricao`, com card real. Veja [Git](docs/git-workflow.md) para Conventional Commits, revisão e releases.
3. Implemente com componentes standalone, tipos estritos, contratos/Zod e padrão mobile-only/PWA-first. Preserve funcionalidades reais; não introduza mocks silenciosos.
4. Para código funcional, execute suíte Angular, build e diff check. Para documentação, confira links, comandos e consistência. Registre warnings e limites da evidência.
5. Prepare PR de funcionalidade/correção/documentação para `develop` com o [template](.github/PULL_REQUEST_TEMPLATE.md), card, evidências técnicas/visuais, testes, resultado do build, riscos, contratos e rollback quando aplicável. Não abra o PR automaticamente sem autorização.
6. Merge depende dos checks definidos e da autorização do mantenedor responsável. Não presuma que o autor possa aprovar formalmente seu próprio PR. Done somente depois de integração e aceite, seguindo [Linear](docs/linear-workflow.md).

`master` e `develop` já foram publicadas na OPE-34. Hooks e workflows da OPE-25 estão preparados localmente; execução no GitHub e ativação dos Rulesets seguem pendentes. Não faça commit, push, PR ou merge sem autorização específica. Exemplos `OPE-XX` são placeholders e não podem ser usados em commits reais. Backend permanece somente leitura sem autorização específica.

Use Open Transit como nome provisório nos documentos. Identidade visual é referência aprovada para desenvolvimento; identidade comercial será decidida depois. Preserve nomes técnicos e relatos históricos, sem alterar marca/textos/assets da aplicação por consequência de uma tarefa documental.

## Hooks e CI

Use `npm ci` para instalar dependências e Husky 9.1.7, conferindo antes hooks existentes. Pre-commit executa `npm run lint:staged` sobre os blobs do index (whitespace, Prettier e ESLint para src TypeScript/HTML, sem escrita); commit-msg exige `tipo(OPE-<número>): descrição`. Essa sintaxe não comprova existência do card. Revise staging seletivo, especialmente arquivos parcialmente staged; não formate a árvore inteira.

Antes de entregar, execute `npm run test:governance`, `npm run ng -- test --watch=false`, `npm run build`, `npm run lint` e `npm audit --omit=dev --audit-level=high`. O lint usa ESLint 10/Angular ESLint 21, incluindo templates inline e externos. Os 13 avisos legados permanecem visíveis, restritos por arquivo e teto; erros ou aumento acima do teto reprovam a execução. Não aumente o limite para acomodar novos problemas. Vitest direto mantém a falha conhecida. Veja os checks, restrições, bootstrap e checklist dos Rulesets no [fluxo Git](docs/git-workflow.md). Checks preparados só serão obrigatórios depois de execução real e ativação autorizada no GitHub.
