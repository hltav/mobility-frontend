# Design System e mobile-only

Estado observado em 24/10/2026. Fonte local Plus Jakarta Sans variável, peso 200–800 e `font-display:swap`; arquivo e licença OFL em `public/fonts`. A referência visual não define contratos HTTP nem versões do produto oficial.

Open Transit é o nome oficial provisório. A identidade visual atual está aprovada como referência de desenvolvimento; cores, tipografia e componentes guiam a evolução mobile-only/PWA-first. Isso não define a identidade comercial nem consolida Mobility, Mobo ou outro candidato como marca. Textos da aplicação e assets permanecem intactos nesta consolidação.

## Tokens e componentes

`src/styles/theme.css` contém a paleta semântica; `src/styles.css` importa Tailwind e tokens, define base, componentes e overrides do shell. Componentes têm estilos locais; há sobreposição que precisa ser reduzida em mudanças futuras.

| Uso                 | Tokens principais                                           |
| ------------------- | ----------------------------------------------------------- |
| Superfícies         | `--bg-main`, `--bg-card`, `--bg-input`, `--border`          |
| Texto/ações         | `--text-main`, `--text-muted`, `--primary`, `--on-primary`  |
| Realce/erro         | `--turquoise`, `--accent-text`, `--danger`, `--danger-soft` |
| Controles/navegação | `--control-bg`, `--control-selected`, `--nav-height`        |
| Detalhes/mapa       | famílias `--details-hero-*`, `--map-*`                      |

Compartilhados: IconComponent com nomes tipados, ThemeSwitcher, LineCard (variantes), BottomNav, Navbar, Toast, PwaStatus e mapa Leaflet. AuthLayout reúne apresentação de login/cadastro. Reutilize esses elementos antes de criar variantes.

## Temas

ThemeService mantém `light`, `dark`, `system`; persiste `mobility-theme`, migra chave `theme`, acompanha preferência do sistema, aplica classe `.dark`, color-scheme e meta theme-color e descarta listener. `index.html` também inicializa tema antes do bootstrap para reduzir flash. Preserve consistência entre inicialização e serviço; não crie novo mecanismo por feature.

## Padrão mobile-only

Próximas entregas devem preservar uma experiência mobile contínua, sem moldura de smartphone na interface real e sem produto desktop separado. Viewport grande deve continuar utilizável com a mesma experiência. Não confundir captura de referência com obrigação de reproduzir um aparelho fictício.

Já há `100dvh`, safe areas, barra inferior e estados responsivos. **Divergências atuais:** `styles.css` aplica moldura/sombra/raio 42 px e largura 390 px às entradas públicas em desktop com pointer fine/display-mode browser; há múltiplos max-widths e overrides globais. Isso requer decisão/correção funcional autorizada. Não foi resolvido por documentação.

Acessibilidade observada: skip-link, outline de foco, labels, autocomplete, estados aria e regras de movimento reduzido. Não há auditoria completa de contraste/leitor de tela. O override do ThemeSwitcher reduz botões a 26 px; avaliar contra meta de toque de 44 px. Scrollbars ocultas e alturas/overflow de mapa também pedem verificação de uso com teclado/zoom.

## Validação visual

Conferir 320/360/390 px, altura pequena, temas e mudança do sistema, reload, teclado virtual, zoom, foco, rolagem e safe areas. Verificar barra inferior/aviso PWA/toast sem sobreposição. Inspecionar estados vazio, erro, loading, offline e GPS negado. Capturas devem indicar rota, viewport, tema e presença de fixtures. Imagens em `docs/previews` são evidências históricas com contextos diferentes; não atestam integração real nem aceite visual do build atual.
