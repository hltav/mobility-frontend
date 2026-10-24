# Open Transit — frontend

Frontend oficial Angular do **Open Transit**, nome oficial provisório do projeto, para consulta de transporte em São Paulo. A identidade visual atual está aprovada como referência de desenvolvimento; a identidade comercial permanece sujeita a decisão futura. Mobility, Mobo e outros candidatos não são marcas definitivas. Nomes presentes no código, manifest, assets e relatórios históricos são preservados nesta etapa documental.

A pasta `mobility-frontend-COMPLETO-VISTORIADO` é referência visual; `mobility_project` é referência de backend, somente leitura. O identificador técnico do pacote/projeto Angular continua `mobility-frontend`.

## Desenvolvimento

Ambiente validado em 24/10/2026: Node 22.22.0, npm 10.9.4, Angular core 21.2.11, CLI/build 21.2.9 e TypeScript 5.9.3. O pacote oficial permanece em `0.0.0`. O lockfile registra as versões resolvidas.

```bash
npm ci
npm start
```

Abrir `http://localhost:4200/`. A API de desenvolvimento está em `http://localhost:8000/api`. O encaminhamento 4002 citado nos relatórios era específico daquele ambiente, não a porta padrão do projeto.

## Validação e PWA

Comandos utilizados na auditoria técnica de 24/10/2026:

```bash
npm run ng -- test --watch=false
npm run build
```

Resultado registrado naquela auditoria: **97 testes em 19 arquivos aprovados** pelo builder Angular; build de produção aprovado com avisos de orçamento e Leaflet CommonJS. O comando alternativo `npm test -- --run` falhou por setup inexistente na configuração Vitest externa; essa configuração continua sem correção. Não há target E2E configurado; HTTP simulado não comprova integração com Laravel. Build e testes funcionais não foram reexecutados na consolidação documental.

```bash
npm run preview:pwa
```

A prévia de produção usa `http://localhost:4300/`, serve `dist/mobility-frontend/browser` e encaminha `/api` para `http://127.0.0.1:8000`. Exige build prévio. O worker é habilitado em produção; a primeira carga precisa de rede e offline limita-se à interface estática. Hospedagem pública exige HTTPS e proxy de `/api`.

## Estado das entregas

As situações abaixo distinguem código existente de aceite integrado. Entregue indica implementação observada, sem significar publicação ou validação ponta a ponta.

| Situação                           | Entrega ou pendência                                        | Evidência e limite                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entregue                           | Fundação visual, Design System e temas claro/escuro/sistema | Código e testes registrados na auditoria                                                                                                         |
| Entregue                           | Onboarding e autenticação modernizados                      | Formulários, schemas, guards e interceptor; login/cadastro levam a `/home`                                                                       |
| Parcialmente implementado          | Experiência PWA                                             | Configuração técnica presente; instalação standalone, Android físico e atualização real entre builds ainda sem aceite                            |
| Parcialmente implementado          | Estratégia mobile-only                                      | Molduras desktop nas telas públicas continuam identificadas                                                                                      |
| Pendente                           | Integração ponta a ponta com Laravel                        | Requer ambiente/conta autorizados; testes HTTP simulados não substituem o roteiro                                                                |
| Pendente                           | Correção do comando Vitest alternativo                      | Setup aponta para arquivo inexistente; usar builder Angular conforme documentação                                                                |
| Bloqueado no contexto da auditoria | Verificação automática GitHub–Linear                        | O conector acessava outro workspace; URL/equipe oficiais agora foram informadas pelo responsável, mas acesso e integração seguem sem confirmação |

Home, busca, detalhes, favoritos, mapa, paradas próximas e perfil têm código implementado em diferentes graus de aceite. As rotas funcionais protegidas exigem token local; a validade da sessão é responsabilidade do backend. O perfil ainda tem funções futuras explicitadas; veja a matriz da auditoria.

O ajuste autorizado posterior à auditoria restringiu `/preview/*` ao desenvolvimento, com identidade sintética e favoritos em memória. Produção não registra a rota nem inclui os módulos de fixtures; links demonstrativos ficam ocultos. O builder Angular agora aprova **101 testes em 21 arquivos**, e o build de produção foi aprovado. A verificação em navegador confirmou a separação usando API local controlada, sem provar integração real com Laravel. Detalhes e resultados no [relatório de publicação atualizado](docs/audits/2026-10-24-initial-publication-preparation.md).

As demais pendências técnicas permanecem na [matriz histórica da auditoria](docs/audits/2026-10-24-frontend-audit.md). O comando `preview:pwa` serve o build de produção e não habilita `/preview`; para demonstração visual use `npm start`, conforme [desenvolvimento](docs/development.md).

## Documentação

- [Arquitetura](docs/architecture.md), [engenharia](docs/engineering.md) e [instruções para agentes](AGENTS.md).
- [Desenvolvimento](docs/development.md), [contratos HTTP](docs/api-contracts.md), [PWA](docs/pwa.md) e [Design System](docs/design-system.md).
- [Contribuição](CONTRIBUTING.md), [Git e publicação inicial](docs/git-workflow.md), [Linear](docs/linear-workflow.md) e [template de PR](.github/PULL_REQUEST_TEMPLATE.md).
- [Changelog](CHANGELOG.md) e [auditoria de 24/10/2026](docs/audits/2026-10-24-frontend-audit.md), com matriz de evidências e pendências.
- Relatórios históricos dos [lotes 1](docs/migration-v2-batch-1.md) e [2](docs/migration-v2-batch-2.md). A auditoria registra divergências posteriores sem apagar esses relatos.

Política Git documentada: novos trabalhos partem de `develop`, PRs de funcionalidades têm `develop` como destino e releases chegam a `master` por PR. A aplicação operacional dessa política aguarda publicação inicial autorizada, criação de develop, CI e proteções. Rastreabilidade: [Linear Open Transit](https://linear.app/open-transit), equipe **OPE**; integração automática não confirmada. Nenhuma operação de publicação foi realizada nesta consolidação.
