# Mobility V2 — primeiro lote

Implementado em 24/10/2026. Próximos lotes aguardam revisão visual.

## Entrega

- Design System com azul/turquesa, tokens de superfície, contraste, foco, cards, botões e campos.
- Plus Jakarta Sans variável hospedada localmente; licença OFL incluída. Sem novas dependências.
- Serviço único de tema claro/escuro/sistema, persistência, migração da chave anterior, listener do sistema e descarte.
- Shell responsivo sem moldura, viewport dinâmica, safe areas, espaço para navegação e toast, link para pular conteúdo e movimento reduzido.
- Navegação inferior apenas em área autenticada: Início, Buscar e Favoritos. Mapa e Perfil ficam para seus lotes.
- Home protegida em `/home`: usuário da sessão, origem/destino, GPS e reverse geocoding, consulta de linhas disponíveis/próximas e inclusão de favorito pelos serviços oficiais.
- Sem ETA, localização, usuário ou linhas fictícios. Estado desconhecido de favoritos não permite inclusão acidental; itens já favoritados abrem a tela de favoritos.
- Cards compactos opcionais preservam a apresentação anterior usada nas demais telas.
- Origem/destino da Home entram na busca existente por query params. A busca não recebeu migração visual neste lote.

## Baseline e recuperação

Baseline verificada por SHA-256, com 72 arquivos anteriores, inclusive os não rastreados:

`.migration-baselines/20261024T031344Z`

Contém `frontend-before.tar.gz`, `manifest.json`, `git-status.txt` e `local-changes.patch` (diff contra HEAD anterior).
O diretório é ignorado pelo Git para evitar publicação de snapshots locais.
Para recuperar algo, extraia o arquivo em diretório separado, compare com o estado atual e recupere somente trechos escolhidos. Não extraia sobre todo o projeto nem use reset/clean.

## Validação

- Build anterior às edições: aprovado, inicial 640,34 kB.
- Build após fundação/temas/shell: aprovado.
- Build completo do lote: aprovado, inicial 643,32 kB.
- Os avisos de orçamento inicial de 500 kB e Leaflet CommonJS já existiam na baseline. O orçamento não foi alterado.
- 21 testes aprovados em 5 arquivos pelo builder Angular/Vitest: serviço de tema, Home, shell/guard, navegação e entrada de origem/destino na busca.
- Corrigido o teste antigo da busca que importava um símbolo inexistente, substituindo-o por verificações do comportamento preservado e do recebimento da Home.
- Testes usam fixtures somente no ambiente de testes. Nenhum mock foi incluído nas rotas da aplicação.
- `git diff --check` executado.
- Servidor existente confirmado no diretório oficial, respondendo na porta interna 4200; `/home` entrega o HTML atualizado. O usuário confirmou que 4002 é encaminhamento dessa instância. Nenhum servidor foi iniciado ou encerrado.
- Não há navegador/Playwright disponível nesta sessão. HTTP 200 e build não aprovam fidelidade visual, teclado virtual, contraste ou responsividade.
- Integrações reais não foram exercitadas contra o backend; requerem API e sessão válidas. Nenhuma API de sincronização foi chamada.

### Comandos de validação

```bash
npm run build
npm run ng -- test --watch=false --include='src/app/core/services/theme.service.spec.ts' --include='src/app/features/home/home.component.spec.ts' --include='src/app/shared/components/bottom-nav/bottom-nav.component.spec.ts' --include='src/app/features/search/search.spec.ts' --include='src/app/app-shell.spec.ts'
```

A execução usa o builder Angular, que inicializa TestBed e compila templates. O script antigo `npm test`/configuração Vitest externa não foi alterado nem usado como prova de aprovação da suíte inteira.

## Revisão visual

1. Abrir `http://localhost:4002/home` com sessão real; sem sessão, o guard mantém o redirecionamento para login.
2. Conferir cores, fonte, cabeçalho e três opções de tema, inclusive após recarga.
3. Conferir Home em 320/360/390 px e desktop; abrir teclado e verificar campos e rolagem.
4. Conferir barra ativa em Início/Buscar/Favoritos e sua ausência no login/cadastro.
5. Conferir estados de carregamento, API indisponível, vazio e GPS negado.
6. Com API disponível, conferir linhas e passagem de origem/destino à busca.

## Pendências deliberadas

Busca/detalhes, mapa/paradas, favoritos completos, autenticação/perfil e PWA aguardam seus próximos lotes.
Os problemas anteriores de interceptor/401, cadastro, DTOs de detalhes/trajeto e exclusão de favoritos não foram corrigidos por este lote visual. Nenhuma alteração foi feita em backend, Meta AI, GTFS, dependências ou porta.
A Home usa a listagem existente com IDs internos; se uma resposta de proximidade não fornecer ID interno, não inventa um para abrir detalhes. A inclusão usa o resolvedor oficial de favoritos.

## Arquivos introduzidos ou alterados neste lote

Esta relação compara o conteúdo com a baseline, e não com HEAD, separando alterações desta tarefa das alterações anteriores:

- `.gitignore` — alterado
- `public/fonts/OFL.txt` — novo
- `public/fonts/plus-jakarta-sans.ttf` — novo
- `src/app/app-shell.spec.ts` — novo
- `src/app/app.component.ts` — alterado
- `src/app/app.routes.ts` — alterado
- `src/app/core/services/theme.service.spec.ts` — novo
- `src/app/core/services/theme.service.ts` — novo
- `src/app/features/home/home.component.css` — novo
- `src/app/features/home/home.component.html` — novo
- `src/app/features/home/home.component.spec.ts` — novo
- `src/app/features/home/home.component.ts` — novo
- `src/app/features/search/search.component.ts` — alterado
- `src/app/features/search/search.spec.ts` — alterado
- `src/app/shared/components/bottom-nav/bottom-nav.component.spec.ts` — novo
- `src/app/shared/components/bottom-nav/bottom-nav.component.ts` — novo
- `src/app/shared/components/icon/icon.component.ts` — novo
- `src/app/shared/components/line-card/line-card.component.ts` — alterado
- `src/app/shared/components/navbar/navbar.component.ts` — alterado
- `src/app/shared/components/theme-switcher/theme-switcher.component.ts` — novo
- `src/app/shared/components/toast/toast.component.ts` — alterado
- `src/index.html` — alterado
- `src/styles.css` — alterado

- `docs/migration-v2-batch-1.md` — este registro.
