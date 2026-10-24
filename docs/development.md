# Desenvolvimento e validação

## Ambiente registrado na auditoria de 24/10/2026

Node 22.22.0, npm 10.9.4. `packageManager` declara npm 10.9.4; não há pin de Node na raiz inspecionada. Metadados locais de CLI/build exigem Node `^20.19.0 || ^22.12.0 || >=24.0.0`; Node 22.22.0 foi efetivamente validado.

As versões da tabela continuam coerentes com o `package-lock.json` consultado nesta consolidação. Nome técnico do pacote/projeto: `mobility-frontend`; nome oficial provisório do projeto: Open Transit. Resultados de execução abaixo são históricos, não novos testes desta etapa documental.

| Pacote                                                   | Resolvido localmente  |
| -------------------------------------------------------- | --------------------- |
| Angular core/common/forms/router/compiler/service-worker | 21.2.11               |
| CLI/build                                                | 21.2.9                |
| TypeScript                                               | 5.9.3                 |
| RxJS / Zod                                               | 7.8.2 / 4.4.1         |
| Tailwind / Leaflet / Vitest                              | 4.2.4 / 1.9.4 / 4.1.5 |

Na auditoria, `npm ls --depth=0` encontrou cinco pacotes extraneous de runtime WASM/emnapi. Nenhuma limpeza/reinstalação foi realizada. O diff do lockfile inspecionado acrescenta apenas service-worker e a referência raiz. Não foi feita varredura atual de vulnerabilidades do registry.

## Comandos

```bash
npm ci
npm start
```

`npm ci` é o procedimento reprodutível de instalação; não foi reexecutado na auditoria nem nesta consolidação, preservando node_modules existente. `npm start` chama `ng serve`, porta padrão 4200. API: `http://localhost:8000/api`; não há proxy de desenvolvimento em `angular.json`. O navegador precisa alcançar a API e o backend permitir CORS adequado. Em acesso remoto, localhost é o dispositivo do navegador, salvo encaminhamento apropriado.

```bash
npm run ng -- test --watch=false
npm run build
git diff --check
```

O teste usa `@angular/build:unit-test`, inicializa TestBed e compila templates. Resultado registrado na auditoria: **97 testes em 19 arquivos aprovados**; build de produção aprovado. Avisos: [auditoria](audits/2026-10-24-frontend-audit.md). Nesta consolidação, a validação se restringe a documentação, links, versões e preservação dos arquivos; não se reexecutaram build/testes funcionais.

`npm test` chama Vitest diretamente com `vitest.config.ts`, que aponta para `src/test-setup.ts`; o arquivo existente é `src/testSetup.ts`. `npm test -- --run` falhou nas 19 suítes antes de executar testes. Corrigir setup e integração Angular nessa configuração é tarefa pendente. `test:ui` não foi validado. VS Code ainda sugere Chrome/9876 para testes, e a task usa o script quebrado; não é o fluxo validado. Não há target E2E nem lint configurado.

Subconjunto diagnóstico, sem substituir suíte completa:

```bash
npm run ng -- test --watch=false --include='src/app/core/services/auth.service.spec.ts'
```

## Prévia PWA

```bash
npm run build
npm run preview:pwa
```

O servidor usa loopback/4300, serve `dist/mobility-frontend/browser` e exige `ngsw.json`. Não encerre servidores alheios. Para outra porta/upstream HTTP local:

```bash
MOBILITY_PREVIEW_PORT=4301 MOBILITY_API_UPSTREAM=http://127.0.0.1:8000 npm run preview:pwa
```

Proxy `/api`: timeout de 15 s, 503 JSON se indisponível. Não é configuração de hospedagem pública. Produção exige proxy Laravel para `/api` e HTTPS. Sessões são separadas por origem/porta. Os relatos de 4002→4200 e servidor 4300 são históricos, não garantem processos ativos.

## Aceite integrado pendente

Com ambiente/conta autorizados: login, cadastro/422, recarga, 401 e logout, busca/ID interno/detalhes, favoritos por `favorite_id`, paradas, GPS negado e indisponibilidade. Registrar payload real sanitizado e ambiente. Não criar contas nem executar sincronizações incidentalmente.

UI: 320/360/390 px, temas, zoom, teclado, rolagem, safe areas e orientação. PWA: perfil descartável, carga online, worker, offline, instalação, retorno da rede e atualização entre builds. [Roteiro PWA](pwa.md). Scripts CDP históricos têm origem/portas fixas e não são suíte E2E portátil pronta.

## Demonstração exclusiva de desenvolvimento

```bash
npm start
```

Abrir `http://localhost:4200/preview/home` ou `/preview/search`, `/preview/profile`, `/preview/map`, `/preview/stops`, `/preview/favorites`, `/preview/lines/146`. Não é preciso autenticar. Identidade: Pessoa de demonstração, e-mail `demo@example.invalid`; favoritos ficam em memória do conjunto de rotas. Essas telas não consomem a API de transporte; mapas podem carregar tiles externos. Rótulos de exemplo permanecem explícitos.

Não há login/cadastro demonstrativo nem uso do token/usuário persistidos pela página de demonstração. O shell mantém a sessão normal para permitir saída explícita à experiência real. Usar dados reais/Sair da prévia retorna ao fluxo normal sem limpar a sessão; isso não autentica quem estava sem token. Tema continua compartilhado.

No build de produção, a substituição de `src/app/preview.config.ts` por `preview.config.prod.ts` remove o ponto de entrada lazy e os módulos de fixtures do grafo. A flag de produção também oculta os links demonstrativos. `/preview/*` segue o fallback de rota desconhecida, sem abrir demo; com sessão existente, a entrada pode levar a Home. `npm run preview:pwa` serve esse build de produção e **não** habilita demonstrações. Nunca implantar o build de desenvolvimento como substituto da produção.

Para validar a separação: executar suíte Angular e `npm run build -- --stats-json`; conferir ausência de inputs `src/app/features/preview/` no stats gerado. Testar diretamente URLs de demonstração em produção, inclusive com sessão de teste, e conferir ausência dos links. No desenvolvimento, entrar na prévia com sessão de teste já persistida: somente identidade sintética deve aparecer, os favoritos devem ser temporários, sair não deve limpar a sessão e a API real indisponível deve continuar exibindo erro sem linhas fictícias.

Resultado do ajuste de 24/10/2026: 101 testes em 21 arquivos pelo builder Angular, build de produção e desenvolvimento aprovados; roteiro headless controlado confirmou oito URLs bloqueadas em produção e identidade/favoritos isolados em desenvolvimento. Não equivale a E2E Laravel, validação Android ou instalação standalone. Veja o [relatório de publicação](audits/2026-10-24-initial-publication-preparation.md).
