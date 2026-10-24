# Mobility V2 — Entrega 2

Data: 24/10/2026. Escopo encerrado para revisão visual.

## Entrega

- Onboarding em `/`, inspirado na referência Meta AI, responsivo e com Entrar/Criar conta ligados às rotas reais.
- Sessão existente direciona a entrada e as telas de autenticação para `/home`. Sem sessão, onboarding permanece público e as rotas protegidas mantêm o authGuard.
- Login e cadastro com superfícies do Design System, claro/escuro/sistema, labels, autocomplete, confirmação, visibilidade de senha, loading, prevenção de duplo envio e erros por campo.
- AuthService oficial preservado e corrigido: cadastro normaliza `{message,data:{token,user}}`, como login; sessão continua usando `auth_token` e `user`; logout limpa localmente mesmo sem rede.
- Interceptor restringe Bearer à origem/caminho da API, não o envia em login/cadastro e invalida sessão em 401 protegido sem chamar logout recursivamente.
- Redirecionamento bem-sucedido de login/cadastro continua em `/search`, preservando o fluxo anterior.
- Sem Google, recuperação de senha ou estatísticas fictícias.
- Mensagem offline e atualização controlada pelo usuário; nenhuma recarga automática de formulários.

## Preservação

Baseline com 86 arquivos, incluindo trabalho anterior e não rastreados, conferida por SHA-256:

`.migration-baselines/batch-2-20261024T033520Z`

Contém tar.gz, manifest de hashes, status e patch. Não extrair sobre o projeto inteiro. A recuperação deve ser feita em diretório separado e comparada por arquivo.
Conferidos contra essa baseline: Home, busca, detalhes, Leaflet, serviços de linhas/favoritos/tempo real e relatório do lote 1 permanecem intactos.
Nenhum commit, push, PR, alteração de backend/Meta AI/Docker/GTFS ou migração de banco.

## PWA oficial Angular

O schematic oficial `@angular/pwa@21.2.9` foi baixado, inspecionado e executado primeiro em dry-run:

```bash
npm run ng -- generate ./.migration-baselines/pwa-tooling/package/collection.json:pwa --project=mobility-frontend --title=Mobility --dry-run
```

Sua implementação oficial foi aplicada pela API de schematics existente, separando a instalação para fixar `@angular/service-worker` em **21.2.11**, igual ao Angular core instalado. Foi acrescentado apenas esse pacote; nenhuma versão anterior do lockfile mudou.

- Manifest: Mobility, nome curto Mobility, `id/start_url/scope: /`, `display: standalone`, idioma pt-BR e cores do Design System.
- Ícones originais Mobility em 192/512 px, além dos tamanhos do schematic; ícones maskable separados com conteúdo dentro da área segura. Apple touch icon incluído.
- `provideServiceWorker` ativo somente em produção; `ng serve` normal continua sem registrar o worker.
- Cache por allowlist: HTML, manifest, JS, CSS, fontes e ícones locais. `dataGroups: []`.
- Nenhum cache de API autenticada, tokens, usuário, favoritos, localização, posições, tiles ou OSRM. Sessão permanece no armazenamento já utilizado pelo AuthService, fora do cache do service worker.
- `VERSION_READY` oferece atualização por botão; não ativa versão em execução sem recarregar. Também existe recuperação oferecida para versão irrecuperável.
- A primeira carga precisa de rede. Offline preserva o shell; dados e autenticação continuam dependendo da rede/API.

Referências: [PWA Angular](https://angular.dev/ecosystem/service-workers/getting-started), [configuração de cache](https://angular.dev/ecosystem/service-workers/config), [atualizações](https://angular.dev/ecosystem/service-workers/communications).

## URLs e execução

- Desenvolvimento: **http://localhost:4002/** — encaminhamento existente para a instância interna 4200, preservado.
- Login: **http://localhost:4002/login**.
- Cadastro: **http://localhost:4002/register**.
- Produção/PWA: **http://localhost:4300/** — servidor separado iniciado por esta entrega.

Se 4300 não estiver acessível no cliente remoto, encaminhe essa porta na aba Ports do ambiente, preservando o encaminhamento 4002. O servidor 4300 foi confirmado acessível pelo navegador e por HTTP no host.

Para reproduzir a prévia, após parar somente o servidor de prévia desta entrega se necessário:

```bash
npm run build
npm run preview:pwa
```

O servidor de prévia usa somente módulos nativos Node, responde aos assets com MIME correto, aplica fallback de rotas e não transforma requisições de API em HTML.
A produção usa `environment.prod.ts` com `/api`. A prévia encaminha `/api` ao Laravel já configurado em `http://127.0.0.1:8000` e retorna erro explícito se indisponível. Pode ser ajustado por `MOBILITY_API_UPSTREAM`; isso não altera o backend.
Hospedagem de produção deve encaminhar `/api` para Laravel e usar HTTPS. A URL API do desenvolvimento continua inalterada.
As origens 4002 e 4300 possuem sessões separadas; entrar em uma não autentica automaticamente a outra.

## Validação realizada

- Build de produção aprovado, com `ngsw.json` e `ngsw-worker.js` gerados.
- 42 testes aprovados em 10 arquivos: regressões do lote 1, autenticação HTTP, 401 sem ciclo, Bearer externo, envelope, formulários/422, guards e ciclo PWA.
- Avisos anteriores de orçamento de bundle e Leaflet CommonJS permanecem. Inicial: 655,47 kB; orçamento não foi afrouxado.
- Manifest e dimensões/purpose dos ícones conferidos programaticamente.
- Navegador Chromium/Brave headless 154, perfil isolado: manifest sem erros de instalabilidade; service worker `activated` e controlador da página.
- Antes do teste, apenas o armazenamento da origem 4300 no navegador descartável foi limpo para validar o build atual. Nenhuma sessão pessoal foi acessada.
- Onboarding/cadastro em 390×844: largura do documento 390 px e ausência da barra autenticada.
- Capturas reais de desktop, mobile claro/escuro e login offline; imagens inspecionadas durante o trabalho.
- Recarga de `/login` offline funcionou pelo service worker e exibiu aviso. Cache Storage continha 40 requests estáticos e nenhuma URL `/api`.
- Nenhuma exceção JavaScript registrada nesse roteiro.
- Testes HTTP de autenticação usam exclusivamente HttpTestingController; **não foram enviados cadastros ou credenciais à API real**. A aceitação ponta a ponta com Laravel ainda depende de ambiente e conta reais.

Evidência: [resultado do navegador](previews/pwa-browser-validation.json).

Comando dos testes:

```bash
npm run ng -- test --watch=false --include='src/app/core/**/*.spec.ts' --include='src/app/features/home/*.spec.ts' --include='src/app/features/auth/**/*.spec.ts' --include='src/app/shared/components/bottom-nav/*.spec.ts' --include='src/app/features/search/*.spec.ts' --include='src/app/app-shell.spec.ts'
```

A suíte foi executada pelo builder Angular/Vitest, que compila os templates. Não equivale a aprovar todos os testes antigos não relacionados.

## Prévia visual e limite do standalone

Capturas de tela reais, sem moldura de smartphone:

- [Onboarding mobile](previews/onboarding-mobile.png)
- [Onboarding desktop](previews/onboarding-desktop.png)
- [Login claro](previews/login-mobile-light.png)
- [Login escuro](previews/login-mobile-dark.png)
- [Cadastro escuro](previews/register-mobile-dark.png)
- [Login offline](previews/login-offline.png)

**A instalação no sistema e a abertura em janela standalone ainda não foram comprovadas.** O navegador headless disponível não expôs `PWA.install` via DevTools (erro -32601 tanto no alvo browser quanto no alvo página); a emulação de `display-mode` também não ativou standalone. Nenhuma captura foi rotulada como aplicativo instalado. Isso é uma limitação da automação disponível, não um erro de instalabilidade reportado pelo navegador.

Foi tentado um segundo perfil descartável com os diretórios XDG isolados dentro do frontend; não houve instalação no perfil pessoal. [Registro da limitação](previews/pwa-standalone-validation.json).

## Instalar e conferir no Chrome

1. Abrir **http://localhost:4300/** online no Chrome; usar a porta de produção, não ng serve.
2. Se aparecer, clicar em **Instalar Mobility no dispositivo** ou no ícone Instalar da barra de endereço.
3. Alternativa: menu ⋮ → Transmitir, salvar e compartilhar → Instalar esta página como um app; confirmar.
4. Abrir Mobility pelo aplicativo instalado e verificar que não há barra de endereço, que o tema funciona e que as telas rolam normalmente.
5. Em DevTools → Application, conferir Manifest e Service Workers; após uma carga online, testar offline e recarregar login/onboarding.
6. Voltar online antes de autenticar. Não esperar linhas ou posições em tempo real quando offline.

Procedimento de instalação: [Ajuda oficial Chrome](https://support.google.com/chrome/answer/9658361?hl=pt-BR).
Android físico não foi testado. Acesso pelo IP HTTP do computador não substitui HTTPS; é necessário endereço HTTPS alcançável ou encaminhamento seguro apropriado ao aparelho.

## Pendências e próxima revisão

- Revisão visual do usuário, principalmente 320/360 px, teclado virtual, ampliação e aparelho Android real.
- Instalação manual no Chrome e confirmação de janela standalone.
- Login/cadastro ponta a ponta com Laravel disponível; nenhum endpoint foi considerado funcional apenas pela declaração.
- Atualização de uma instalação real entre dois builds; o tratamento de eventos foi testado por unidade.
- Busca, detalhes, mapa, paradas, favoritos e perfil permanecem para seus próximos lotes. Não foram migrados nesta entrega.

## Arquivos desta entrega

Comparação contra a baseline desta entrega, distinguindo alterações anteriores:

- `angular.json` — alterado
- `docs/previews/login-mobile-dark.png` — novo
- `docs/previews/login-mobile-light.png` — novo
- `docs/previews/login-offline.png` — novo
- `docs/previews/onboarding-desktop.png` — novo
- `docs/previews/onboarding-mobile.png` — novo
- `docs/previews/pwa-browser-validation.json` — novo
- `docs/previews/pwa-standalone-validation.json` — novo
- `docs/previews/register-mobile-dark.png` — novo
- `ngsw-config.json` — novo
- `package-lock.json` — alterado
- `package.json` — alterado
- `public/icons/icon-128x128.png` — novo
- `public/icons/icon-144x144.png` — novo
- `public/icons/icon-152x152.png` — novo
- `public/icons/icon-192x192.png` — novo
- `public/icons/icon-384x384.png` — novo
- `public/icons/icon-512x512.png` — novo
- `public/icons/icon-72x72.png` — novo
- `public/icons/icon-96x96.png` — novo
- `public/icons/maskable-192x192.png` — novo
- `public/icons/maskable-512x512.png` — novo
- `public/manifest.webmanifest` — novo
- `scripts/check-pwa-standalone.mjs` — novo
- `scripts/check-pwa.mjs` — novo
- `scripts/preview-pwa.mjs` — novo
- `src/app/app.component.ts` — alterado
- `src/app/app.config.ts` — alterado
- `src/app/app.routes.ts` — alterado
- `src/app/core/guards/guest.guard.ts` — novo
- `src/app/core/guards/public-entry.spec.ts` — novo
- `src/app/core/interceptors/auth.interceptor.ts` — alterado
- `src/app/core/schemas/auth.schema.ts` — alterado
- `src/app/core/services/auth.service.spec.ts` — novo
- `src/app/core/services/auth.service.ts` — alterado
- `src/app/core/services/pwa.service.spec.ts` — novo
- `src/app/core/services/pwa.service.ts` — novo
- `src/app/features/auth/auth-form-errors.ts` — novo
- `src/app/features/auth/login/login.component.html` — alterado
- `src/app/features/auth/login/login.component.ts` — alterado
- `src/app/features/auth/login/login.spec.ts` — alterado
- `src/app/features/auth/register/register.component.ts` — alterado
- `src/app/features/auth/register/register.html` — alterado
- `src/app/features/auth/register/register.spec.ts` — alterado
- `src/app/features/onboarding/onboarding.component.ts` — novo
- `src/app/shared/components/icon/icon.component.ts` — alterado
- `src/app/shared/components/navbar/navbar.component.ts` — alterado
- `src/app/shared/components/pwa-status/pwa-status.component.ts` — novo
- `src/environments/environment.prod.ts` — alterado
- `src/index.html` — alterado
- `src/styles.css` — alterado

- `docs/migration-v2-batch-2.md` — este relatório.
