# PWA

Projeto: Open Transit, nome oficial provisório. A estratégia é PWA-first, com experiência mobile-only. O nome observado no manifest é um detalhe do estado atual, sem aprovação de marca comercial; esta tarefa não modifica manifest, textos ou ícones.

## Implementação observada

- Angular service-worker 21.2.11, igual ao core instalado. Configuração de produção em `angular.json`; `app.config.ts` usa `enabled: !isDevMode()` e `registerWhenStable:30000`.
- Manifest em `public/manifest.webmanifest`: nome/short_name Mobility, idioma pt-BR, `id`, `start_url` e `scope` em `/`, display standalone, cores claras. Não há suporte de subdiretório validado.
- Ícones any e maskable em 192/512 px; dimensões verificadas na auditoria técnica de 24/10/2026. Há outros tamanhos do schematic e apple-touch-icon em `index.html`. Área segura visual dos maskable não foi reavaliada nesta consolidação.
- Cache `app-shell`: favicon, index, manifest, JS e CSS. `static-assets`: fontes e ícones locais. Ambos prefetch; `dataGroups: []`. `/api` e `/api/**` excluídos do fallback de navegação.
- `PwaService` observa online/offline, beforeinstallprompt, appinstalled, display-mode, VERSION_READY e versão irrecuperável; listeners/streams têm descarte. Verifica atualização ao recuperar rede/visibilidade.
- Atualização oferecida por botão; recarrega apenas online, sem ativar versão em execução nem recarregar formulários automaticamente. Pedido de instalação depende do navegador; há mensagem de falha.

Offline preserva o shell depois de primeira carga online/controlada. Login/cadastro, API, favoritos, GPS/reverse geocoding, posições, tiles e OSRM continuam dependendo de rede. Token/usuário permanecem em localStorage pelo AuthService; estão fora do cache do worker, mas não deixam de ser dados persistidos.

## Executar e hospedar

```bash
npm run build
npm run preview:pwa
```

Prévia local: `http://localhost:4300/`, apenas loopback, proxy `/api` para Laravel em 8000. Variáveis e limites: [desenvolvimento](development.md). `ng serve` padrão não registra o worker. O comando `preview:pwa` serve artefatos de produção e não habilita a rota demonstrativa `/preview`. Essa rota é exclusiva de desenvolvimento e seus módulos de fixtures não entram no build de produção, conforme [desenvolvimento](development.md). Produção pública precisa de HTTPS, fallback para rotas SPA e proxy de `/api` que preserve método/status/cabeçalhos e não devolva index.html como resposta de API.

Publicar conjunto coerente de index, chunks, assets, `ngsw.json` e worker; evitar cache HTTP que mantenha metadados antigos e preservar assets necessários às versões em uso. Esses requisitos de hospedagem são propostos; configuração remota/CDN e headers reais não foram verificados. O servidor de prévia usa `no-cache` para estáticos, `no-store` para API e `nosniff`; não foi validado como servidor de produção.

## Evidências e limites

Na auditoria técnica de 24/10/2026: build gerou `ngsw.json`/`ngsw-worker.js`; manifesto gerado tinha 33 URLs no app-shell e 12 estáticas, zero dataGroups e nenhuma URL `/api` em hashTable. Foram verificações de artefato, não execução no navegador. Configurações de registro/cache/manifest foram reconferidas no código durante esta consolidação; não se gerou novo build nem se repetiu instalação/offline em navegador.

O [JSON histórico do lote 2](previews/pwa-browser-validation.json) registra worker activated/controlador, manifest sem erro de instalabilidade, mobile 390 px sem overflow, login offline e cache sem URLs de API. Não foi reexecutado e não corresponde ao hash do build atual. A lista inclui metadados internos do worker, além de assets.

O [registro standalone](previews/pwa-standalone-validation.json) declara `validated:false`: CDP PWA.install indisponível. Não há instalação real/Android físico comprovados nem atualização entre dois builds instalada.

## Roteiro de aceite pendente

1. Usar perfil descartável dedicado e build identificado em origem HTTPS ou localhost; carregar online e verificar manifest, worker activated e controller.
2. Conferir ícones e instalação real oferecida pelo navegador. Abrir pelo aplicativo instalado e confirmar `display-mode: standalone`, sem barra de endereço.
3. Em 320/360/390 px e dispositivo físico, conferir temas, safe areas, teclado e rolagem; garantir que o aviso PWA não cubra ações.
4. Depois da carga online, ficar offline e recarregar `/`, `/login` e rota protegida com sessão de teste. Esperar shell e falhas explícitas de dados, sem prometer autenticação offline.
5. Inspecionar Cache Storage: nenhuma API, token, usuário, favorito, posição, localização, tile ou OSRM. Voltar online e verificar recuperação.
6. Publicar segundo build em ambiente de teste, preservar formulário preenchido e conferir oferta de atualização; somente ao aceitar deve recarregar. Testar versão irrecuperável.
7. Registrar build/origem/navegador/dispositivo e evidências novas, sanitizadas, sem substituir registros históricos.

`scripts/check-pwa.mjs` usa CDP 9333 e limpa todos os dados da origem 4300. `check-pwa-standalone.mjs` usa 9334 e tenta instalar/abrir o app. Ambos pressupõem navegador separado já iniciado. Não rodar em perfil pessoal, nem considerar esses scripts uma garantia de instalação portátil.
