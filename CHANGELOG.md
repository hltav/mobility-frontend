# Changelog

Registro por data enquanto não há release/tag validada. Pacote oficial: `0.0.0`; não importar a versão 2.0.0 da referência visual.

## Não publicado — 24/10/2026

### Lote 1 — registro histórico

- Design System, fonte local/OFL, temas, shell, navegação inferior e Home ligada aos serviços existentes.
- [Relatório e limites](docs/migration-v2-batch-1.md).

### Lote 2 — registro histórico

- Onboarding, formulários, normalização do cadastro, restrição de Bearer e 401 sem recursão.
- Service worker Angular 21.2.11, manifest/ícones, cache estático e status offline/atualização.
- [Relatório e evidências](docs/migration-v2-batch-2.md). Integração real e instalação standalone ficaram pendentes.

### Estado local adicional observado

- Busca/detalhes/favoritos remodelados, mapa, paradas, perfil, cinco itens de navegação e prévias com fixtures; não atribuídos integralmente aos lotes 1/2.
- Login/cadastro atualmente levam a `/home`, divergindo de `/search` registrado no lote 2.

### Governança desta auditoria

- README consolidado; instruções para agentes, contribuição, arquitetura, engenharia, desenvolvimento, contratos, PWA e Design System.
- Fluxo Git/Linear proposto, plano da publicação excepcional em master e template de PR.
- [Auditoria](docs/audits/2026-10-24-frontend-audit.md): 97 testes aprovados pelo builder Angular, build aprovado com avisos e Vitest direto falhando por setup preexistente. Nenhuma publicação realizada.

### Consolidação documental posterior à auditoria

- Open Transit registrado como nome oficial provisório; identidade visual aprovada como referência de desenvolvimento e identidade comercial ainda em aberto. Nomes históricos/técnicos e assets da aplicação preservados.
- Regras de agentes consolidadas: mobile-only/PWA-first, preservação de funcionalidades, contratos HTTP/Zod e separação entre implementação, auditoria, documentação e publicação.
- Política Git definida: develop como base/destino de novos trabalhos, master estável recebendo releases por PR após a exceção inicial; CI/proteções ainda aguardam configuração autorizada.
- Linear oficial informado pelo responsável: `https://linear.app/open-transit`, equipe OPE; cadeia card→branch→commit→PR→release documentada. Integração automática GitHub–Linear permanece não confirmada.
- Template de PR revisado com evidências técnicas e resultado do build; merge exige checks definidos e autorização do mantenedor, sem presumir autoaprovação formal do autor.
- Resultados funcionais continuam atribuídos à auditoria de 24/10/2026; esta consolidação verifica documentação e não reexecuta build/testes funcionais. Relatórios dos lotes e resultados históricos preservados.

### Isolamento da demonstração antes da publicação

- `/preview` restrito ao desenvolvimento por substituição de configuração; produção não registra a rota nem carrega os módulos de fixtures. Links demonstrativos ocultos em produção.
- Identidade sintética local, sem ler/gravar token/usuário da sessão; favoritos temporários e navegação de perfil/favoritos mantida na prévia. Serviços oficiais e falhas reais preservados.
- Testes de roteamento, identidade, sessão, favoritos e retorno à API real; 101 testes em 21 arquivos aprovados pelo builder Angular. Produção e desenvolvimento compilados; roteiro headless confirmou a separação com API local controlada.
- Lista de candidatos e [relatório de publicação](docs/audits/2026-10-24-initial-publication-preparation.md) atualizados. Sem commits, push, branches ou PRs. Laravel E2E, PWA instalada e demais pendências históricas não foram considerados resolvidos.
