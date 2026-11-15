# Coverage e preparação da integração — Fase 5

## Baseline e limites

O responsável informou 119/119 testes aprovados após a Fase 4B e estes percentuais:

| Métrica    | Cobertura |
| ---------- | --------: |
| Statements |    69,41% |
| Branches   |    69,54% |
| Functions  |    69,88% |
| Lines      |    73,45% |

A leitura do `coverage-final.json` existente encontrou 2.009/2.894 statements,
886/1.274 branches e 376/538 functions cobertos. Com denominadores constantes,
faltam 17 statements, 6 branches e 1 function para atingir 70%. Novas importações
e diferenças de instrumentação podem alterar os denominadores.

Nenhum teste, coverage, build, lint, benchmark, servidor ou chamada HTTP foi
executado nesta fase. Não se declara que os 70% foram alcançados. A confirmação
depende da execução manual da suíte completa e da inspeção do novo relatório.

## Inclusão de suporte de testes

O relatório contém `src/testing/fixtures/transit.fixture.ts` e
`src/testing/providers/transit.providers.ts`. Somados, representam 50/66
statements, 20/33 functions e 37/47 branches cobertos. Esses arquivos são
importados por specs e não pelo runtime do produto.

Não há filtro de coverage específico para esse diretório em `angular.json` ou
`vitest.config.ts`. O builder Angular remapeia o código compilado para as fontes,
com `excludeAfterRemap: true`; módulos auxiliares importados pelos testes também
aparecem no relatório. Estar em `src/testing/` não os exclui automaticamente.

Nenhuma exclusão ou threshold foi alterado. A baseline é mantida para comparação.
Se for adotado um relatório separado de código do produto, seu escopo precisa ser
explícito, preservando o relatório amplo e todos os arquivos de produção. Remover
o suporte do denominador não representa testes adicionais nem resolve os templates.

## Templates com 0%: medição pendente

| Template                      | Statements | Branches | Functions |
| ----------------------------- | ---------: | -------: | --------: |
| `line-details.component.html` |      0/234 |     0/65 |      0/13 |
| `nearby-stops.component.html` |      0/161 |     0/34 |       0/9 |
| `map-page.component.html`     |      0/135 |     0/19 |      0/14 |

Os três specs usam `TestBed.overrideComponent` para substituir somente o mapa
por um stub, preservando o template da página e seus asserts de DOM. No Angular
instalado, `overrideComponent` adiciona o componente a `pendingComponents` e
`compileTypesSync` chama `compileComponent` novamente com os metadados alterados.

Hipótese sustentada por essa inspeção: a recompilação JIT executa funções diferentes
das funções originais atribuídas ao HTML pelo source map do relatório. O 0% não
prova ausência de exercício do template; tampouco permite presumir cobertura de
todos os seus ramos. Não foi confirmada a causa por execução.

Investigação seguinte: comparar um caso existente com e sem override do componente
da página, isolando o Leaflet no limite de dependência. Conferir contadores HTML,
funções e source maps antes de substituir a estratégia nos três specs. Preservar
os asserts reais de DOM, cancelamento, polling e descarte. Não excluir os HTML nem
usar templates vazios como prova de cobertura visual.

## Lacunas reais e testes acrescentados

O relatório mostra funções de GPS e callbacks de geocodificação sem cobertura na
Busca; o ramo de envio de `per_page` do serviço de linhas também está descoberto.

Foram acrescentados oito cenários, sem alterar código de produção:

- Busca: interseção normalizada e deduplicação entre origem/destino;
- Busca: fallback de trajeto quando as outras fontes estão vazias;
- Busca: ausência de fallback quando há resultados textuais sem linha em comum;
- GPS: aguarda geocodificação e usa o endereço retornado;
- GPS: preserva o fallback existente após falha de geocodificação;
- GPS: recusa de permissão libera loading e não chama geocodificação;
- Serviço de linhas: filtro/paginação e separação de IDs interno/SPTrans;
- Serviço de linhas: ordenação, aliases de coordenadas e descarte de paradas inválidas.

HTTP e GPS são controlados exclusivamente nos testes. Novos testes não comprovam
integração real, e sua aprovação e contribuição de coverage ainda não foram medidas.

## Contratos Laravel: pendências para a próxima fase

Referências: `docs/api-contracts.md`, serviços/schemas atuais e rotas do backend
local em leitura. Nenhum endpoint, payload ou política de sessão foi alterado.

| Área                | Verificação necessária                                                | Critério para análise seguinte                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login/cadastro      | Envelopes reais `{message,data:{token,user}}`, datas, null e ausência | Comparar respostas sanitizadas com `AuthApiResponseSchema`; o schema atual já torna avatar, verificação de email e Google opcionais, ao contrário do documento histórico |
| Sessão              | 401, expiração e logout offline                                       | Conferir invalidação local sem recursão e revogação remota em ambiente autorizado                                                                                        |
| Linhas              | Lista e paginação, tipos dos IDs e metadados                          | Preservar `database_id` e `sptrans_id`; não inventar ID interno                                                                                                          |
| Favoritos           | Criação/exclusão com IDs diferentes                                   | POST recebe ID da linha; DELETE recebe ID do favorito; avaliar o limite de 100 itens da busca resolvedora                                                                |
| Paradas             | Envelopes, aliases, sentidos, `stops: null`, coordenadas inválidas    | Confirmar quais variantes são realmente emitidas, distinguindo vazio de erro/schema inválido                                                                             |
| Posições            | Timestamp, velocidade, acessibilidade e movimento ausentes            | Defaults locais não comprovam telemetria; decidir tratamento sem mudar contrato por suposição                                                                            |
| Proximidade/trajeto | 404, origem nula e falhas parciais                                    | Avaliar `findNearbySafe`/`findTripLinesSafe`, que convertem erro em vazio                                                                                                |
| GPS/geocodificação  | Endereço obtido e fallback de falha                                   | O comportamento atual envia coordenadas formatadas como `address` para proximidade; confirmar suporte real antes de alterá-lo                                            |
| Implantação         | Origem da API, CORS e proxy `/api`                                    | Verificar desenvolvimento e produção com autorização de ambiente                                                                                                         |

`/lines/search` pode sincronizar dados no processor e não deve ser usado como
verificação simples. OSRM e tiles são integrações externas; não recebem Bearer.
Não criar contas nem executar sincronizações na preparação da análise.

## Preservação e validação manual

`AGENTS.md` foi alterado exclusivamente para registrar a aprovação da OPE-37 e a
preservação da moldura, landing, temas, responsividade e rolagem. Sua implementação,
fixtures existentes, alterações locais e evidências históricas foram preservadas.

```bash
npm run ng -- test --watch=false --coverage
npm run lint
npm run build
git diff --check
```

Comparar as quatro métricas com a baseline e conferir se os três HTML permanecem
zerados. O total aprovado da suíte deve ser obtido pela execução completa, não
inferido da quantidade de cenários adicionados. Não houve commit ou operação remota.
