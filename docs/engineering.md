# Padrão de engenharia

Regras para próximas mudanças. Conformidade atual e dívidas estão na [auditoria](audits/2026-10-24-frontend-audit.md); regra não comprova implementação. Procedimentos operacionais: [AGENTS.md](../AGENTS.md).

## Código e fronteiras

- Preserve core/shared/features, componentes standalone e rotas lazy. Features coordenam casos de uso; serviços concentram HTTP; schemas/mappers validam e adaptam dados externos.
- Mantenha tipos/templates estritos. Prefira `unknown`, tipos inferidos de Zod e estados explícitos. Não introduza `any` sem justificativa localizada.
- Signals para estado, computed para derivados, RxJS para assíncrono. Cancele resultados antigos e descarte listeners, polling e assinaturas. Proteja callbacks GPS tardios.
- Reutilize normalização de identidades, textos e coordenadas quando a semântica coincidir. Extraia duplicação com validação comportamental; não esconda diferenças de contrato em abstração genérica.
- Diferencie ID interno da linha, SPTrans e favorito. Exclusão recebe `favorite_id`.

## Segurança e confiabilidade

Não registre credenciais/token nem injete dados externos em HTML. Restrinja Bearer à API. Preserve 401 sem recursão e limpeza offline; revogação remota pode falhar sem rede. Presença de token não é autorização do servidor. LocalStorage mantém risco de XSS; mudar a arquitetura de sessão exige coordenação com backend.

Valide entradas/respostas; separe rede, 422, autenticação, schema e vazio. Evite fallbacks que ocultem indisponibilidade. Loading deve terminar em sucesso, erro e cancelamento. Previna ações duplicadas.

## Produto e PWA

O padrão é mobile-only e PWA-first. Considere conectividade, instalação, atualização e recuperação desde o desenho da mudança; essa diretriz não declara concluídas as validações pendentes. Open Transit é o nome provisório; identidade visual atual é referência aprovada de desenvolvimento, sem definir marca comercial. Não altere textos/assets em tarefas documentais.

Mobile-only: mesma experiência mobile utilizável em viewport grande, sem moldura ou versão desktop paralela. Use tokens, temas centralizados, safe areas, `dvh`, foco e movimento reduzido. Verifique teclado, zoom, orientação e rolagem. Veja [Design System](design-system.md).

PWA: cache estático por allowlist, API fora do fallback e atualização por ação do usuário. Não armazenar dados autenticados/localização no worker. Offline não promete autenticação nem dados atuais. Veja [PWA](pwa.md).

## Critérios de entrega

Código funcional exige testes de comportamento relevantes, suíte Angular, build, diff check e revisão. HTTP/sessão pede teste de contrato simulado e roteiro integrado; UI pede evidência visual. Documentação pede links/comandos e consistência. Não crie testes tautológicos ou que apenas repitam a implementação.

Registre comando, resultado, warnings, mocks e ambiente. Template substituído não aprova o template real; HTTP mockado não é E2E; manifest válido não comprova instalação. Pendências precisam de critério de aceite reproduzível.

PR contém card confirmado, resumo, contexto, alterações, evidências técnicas/visuais, testes, resultado do build, contratos, riscos, aceite, pendências e rollback quando aplicável. Todo PR de feature tem `develop` como destino; releases seguem de develop para master. Merge exige checks definidos e autorização do mantenedor responsável. Não presuma que o autor possa aprovar formalmente seu próprio PR; siga a [política Git](git-workflow.md) para revisão e proteção.

Na OPE-25, hooks e workflows estão preparados localmente; checks no GitHub e ativação dos Rulesets ainda precisam de validação e aprovação. Não afrouxe budgets para ocultar regressões. Separe implementação, auditoria, documentação e publicação; aprovação de documentação não autoriza commit, push, PR ou merge automático. O escopo vem de card real da equipe OPE, conforme [Linear](linear-workflow.md); gestão de cards/workspace ocorre separadamente pelo responsável.

## Validação de governança

`npm run test:governance` testa a política real embutida no workflow, mensagens de commit, requisitos dos Rulesets e isolamento dos blobs staged em repositório temporário. Pre-commit usa Prettier, whitespace e ESLint nos blobs staged src TS/HTML, sem escrita. `npm run lint` valida toda a árvore src com ESLint 10.13.0, TypeScript ESLint 8.72.0 e Angular ESLint 21.4.0, incluindo templates inline/externos e acessibilidade. O teto de 13 avisos visíveis preserva a dívida anterior nos arquivos específicos declarados em eslint.config.mjs; demais regras são erros. Não aumentar o teto para esconder novos problemas. O CI expõe Install, Build, Angular tests, Lint e Security separadamente, mais PR policy por metadados, sem filtros de caminhos. O [fluxo Git](git-workflow.md) é a referência de configuração e ativação; não repetir ou ativar regras diferentes em outra documentação.

Não existe validação remota de existência de cards Linear no hook/CI: o mantenedor confere card e escopo. Não colocar tokens Linear no workflow. Falhas de build/testes serão bloqueantes quando os status checks forem exigidos por Rulesets ativos; até lá há validação preparada, sem garantia de bloqueio remoto.

O check Security consulta `npm audit --omit=dev --audit-level=high` e reprova sem mascarar falhas. A primeira execução OPE-25 encontrou 6 entradas altas e 2 moderadas preexistentes. A correção autorizada alinhou Angular/compiler-cli em 21.2.25 e Zod em 4.6.7; o novo audit de produção reporta zero vulnerabilidades. Não foi usado audit fix/force/legacy-peer-deps. Resultados locais aprovados não substituem checks verdes no GitHub antes de ativar os Rulesets.

## Importações Zod e tamanho do bundle

Com o builder esbuild atual, use `import * as z from 'zod'`. As formas `import { z }` e default import retêm o namespace reexportado e impedem a remoção de locales/APIs não usados. ESLint bloqueia essas duas formas para evitar regressão. Não remover validações, trocar para Zod Mini, alterar locale ou rebaixar versões corrigidas para reduzir bundle sem avaliação específica. A otimização OPE-25 reduziu o inicial de 775,67 kB para 415,28 kB mantendo schemas e versões; estatísticas, opções de lazy loading e limites estão no relatório OPE-25.
