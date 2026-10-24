# Contratos HTTP observados

Inspeção estática em 24/10/2026: serviços/schemas do frontend e `mobility_project/mobility_backend/routes/api.php`, controllers Auth/Line/Bus/Favorite/BusStop/Geocoding e requests de autenticação. O backend não foi alterado nem executado. Endpoints declarados e testes com `HttpTestingController` **não comprovam integração real**.

Nesta consolidação documental, contratos foram reconferidos nos services/schemas e ambientes do frontend, sem chamadas de API ou mudanças no backend. Mudanças compartilhadas devem ter escopo em card OPE e avaliação de impacto; a classificação Shared Contracts está descrita no [fluxo Linear](linear-workflow.md).

Base: desenvolvimento `http://localhost:8000/api`; produção `/api`. Rotas abaixo são relativas à base. Bearer é restrito à origem/caminho da API e omitido em login/cadastro. O interceptor também pode enviá-lo em geocodificação pública quando houver sessão. Backend protege linhas/paradas/favoritos/logout com `auth:sanctum`.

## Autenticação

| Método/rota           | Entrada                                       | Resposta observada no código                                              |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| POST `/auth/login`    | `{email,password}`                            | 200 `{message,data:{token,user}}`; credenciais inválidas: 401 `{message}` |
| POST `/auth/register` | `{name,email,password,password_confirmation}` | 201 com mesmo envelope; validação Laravel pode retornar 422               |
| POST `/auth/logout`   | `{}`, Bearer capturado antes da limpeza local | `{message}`; o cliente já está deslogado mesmo se a requisição falhar     |

Frontend: nome 3–100, email válido até 255, senha 6–100, confirmação igual. Email/nome são aparados. Requests locais Laravel confirmam esses limites e unicidade de email no cadastro. Mensagens 422 são lidas de `errors: Record<string,string[]>`; rede/status 0 tem mensagem própria.

`mapAuthResponse` exige `message` e `data.token`, usuário com `id`, `name`, `email`, `avatar` nullable, `created_at`, `updated_at`, `email_verified_at` nullable e `google_id` nullable. Normaliza para `{token,user:{id,name,email}}`. Campos nullable ainda são obrigatórios no schema da resposta. A serialização real, especialmente no cadastro recém-criado, precisa ser confirmada; não presumir que campos omitidos sejam equivalentes a null. Não existe chamada de refresh, `/me`, Google ou recuperação de senha no frontend atual.

## Linhas, trajeto e posições

| Método/rota               | Parâmetros enviados                                                                   | Consumo pelo frontend                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| GET `/lines`              | `term?`, `per_page?`                                                                  | `data` array ou `data.data` paginado; normaliza linhas                                                     |
| GET `/lines/search`       | `term`                                                                                | `data` array; o controller chama `syncLines` no processor, portanto não é leitura sem efeitos garantida    |
| GET `/lines/{id}`         | ID interno                                                                            | `data:{line,buses}`; normaliza `line`, preserva buses para adaptação posterior                             |
| GET `/lines/{id}/stops`   | `direction?=1\|2`                                                                     | `data` array ou objeto `stops`/`data`; aceita aliases de coordenadas, elimina inválidos e ordena           |
| GET `/lines/nearby`       | `address`, `radius_km` (padrão cliente 1)                                             | `data:{origin:{address,lat,lng}\|null,lines:[...linha,distance_km]}`; backend pode retornar 404 sem origem |
| GET `/lines/{id}/buses`   | ID interno                                                                            | `data` ou array direto; parsing por item, descarta inválidos e retorna vazio se payload não for array      |
| GET `/stops/trip-nearest` | `origin_address`, `destination_address`, `radius_km=2`, `limit=20`, `mode=with_lines` | `data:{origin:{point,stops},destination:{point,stops}}`; extrai/intersecta linhas das paradas              |
| GET `/geocode/reverse`    | `lat`, `lng`                                                                          | `data:{address}`; público no backend; 404 quando não encontra                                              |

Linha normalizada separa `database_id` (interno), `sptrans_id` (externo) e `id` de apresentação que pode usar fallback externo. `normalizeBusLine` exige `sptrans_id` numérico; ID interno pode faltar. Telas impedem detalhes quando não têm `database_id`. Não inventar ID interno para tornar rota clicável.

Posição exige prefixo e coordenadas; aceita `lat/lng` ou `latitude/longitude`. Placa, velocidade e timestamp são opcionais. O schema aplica defaults `accessible=false` e `status=moving` quando ausentes: isso é inferência local, não telemetria confirmada. Falta de data/hora não comprova atualidade do rótulo “Ao vivo”. Polling de 10 s no mapa/detalhes depende da API e da rede.

OSRM público: GET `https://router.project-osrm.org/route/v1/driving/{lng,lat;...}?overview=full&geometries=geojson`, em grupos de 10 pontos com sobreposição. Usa geometria quando disponível e retorna pontos originais em falha. Esse caminho calculado não comprova itinerário oficial/GTFS. Sem Bearer. Leaflet carrega tiles OpenStreetMap e URLs de imagens unpkg; não há garantia offline para esses recursos.

## Favoritos e paradas

| Método/rota              | Entrada/saída                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET `/favorites`         | `{data:[{id,line_id,line}]}`; cliente também tolera lista direta/linha plana. Preserva `favorite_id` e `database_id` quando recebe objeto relacionado             |
| POST `/favorites`        | `{line_id: ID interno}`; 201 `{message,data:favorite}`; se só conhece ID externo, cliente consulta `/lines?term=...&per_page=100` e compara código/origem/destino |
| DELETE `/favorites/{id}` | **ID do favorito**; 404 se não encontrado para usuário; sucesso `{message}`                                                                                       |
| GET `/stops/nearest`     | `address` ou `lat/lng`, `radius_km=0.5`, `limit=5`, `mode=with_lines`; espera `{data:{point,stops}}`                                                              |

Parada exige `id`, `name`, `lat`, `lng`, `distance_km`; `sptrans_id`, `address`, `lines`, `line_codes`, `arrivals` são opcionais. Transforma distância em metros e `stops:null` em lista vazia. Se presentes, arrivals devem conter `{code,minutes}`; isso não demonstra que o backend forneça previsão real. Tela filtra até 500 m e cinco resultados. Backend aceita raio 0.1–10 km, limite 1–20 e mode any/with_lines.

## Lacunas para fechar

- Capturar envelopes reais sanitizados de login/cadastro, linhas paginadas/processor, paradas e posições, incluindo null/ausência e erros. O schema de auth exige campos de perfil como avatar/google_id presentes mesmo quando null; ausência pode rejeitar resposta legítima. Isso não significa rejeição de propriedades desconhecidas: o schema usa `z.object`, sem `z.strictObject`.
- Testar criação/exclusão de favorito com IDs diferentes de linha/SPTrans e igualdade de código/sentido; a busca resolvedora de 100 itens pode não achar o item correto.
- Há `any` e envelopes sem schema no serviço de favoritos/OSRM; dados inválidos podem virar erro genérico ou sumir da lista. `findNearbySafe`/`findTripLinesSafe` convertem falhas em vazio, dificultando distinguir indisponibilidade.
- Padronizar contrato de erro, paginação, limites/timeouts e descarte de itens inválidos. `ApiResponse` tem definições diferentes em dois schemas; o envelope genérico não é aplicado uniformemente.
- GET `/geocode` não é contratado: backend declara **POST** `/geocode`, não utilizado pelo cliente atual. Rotas administrativas/internas não fazem parte do fluxo do produto e não devem ser acionadas.
