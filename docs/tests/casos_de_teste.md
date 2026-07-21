# Casos de Teste - Velô Sprint (Configurador de Veículo Elétrico)

Este documento foi elaborado a partir de uma análise estática do código-fonte do sistema Velô Sprint, cobrindo as regras de negócio, fluxos e comportamentos definidos nos componentes e lógicas do sistema.

---

## Módulo: Landing Page & Configuração de Veículo

### CT01 - Acesso e inicialização do Configurador (Validação de Valor Base)

#### Objetivo
Garantir que a aplicação inicializa o veículo com a cor e rodas padrão, além de precificar corretamente o valor base do veículo.

#### Pré-Condições
- O sistema deve estar online e o usuário estar na rota inicial ou `/configure`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Acessar o sistema de configuração do veículo | A tela carrega com a cor exterior "Glacier Blue", interior "Carbon Black" e rodas tipo "Aero". |
| 2 | Visualizar o valor total no resumo ou checkout sem adicionar opcionais | O valor exibido (calculado por `BASE_PRICE`) deve ser de R$ 40.000,00. |

#### Resultados Esperados
- O veículo inicializa corretamente com seu modelo padrão e preço base de R$ 40.000.

#### Critérios de Aceitação
- O estado inicial da `store` (`configuratorStore`) reflete 40.000 sem opcionais.

---

### CT02 - Adição de opcionais e atualização dinâmica do preço

#### Objetivo
Validar se o cálculo total do veículo adiciona corretamente os valores dos pacotes extras.

#### Pré-Condições
- Estar na página do Configurador com o valor base em R$ 40.000,00.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar a opção de rodas "Sport" | O valor total calculado deve ser incrementado em R$ 2.000,00 (Total: R$ 42.000,00). |
| 2 | Selecionar o opcional "Precision Park" | O valor total calculado deve ser incrementado em R$ 5.500,00 (Total: R$ 47.500,00). |
| 3 | Selecionar o opcional "Flux Capacitor" | O valor total calculado deve ser incrementado em R$ 5.000,00 (Total: R$ 52.500,00). |
| 4 | Desmarcar o "Flux Capacitor" | O valor deve decrementar R$ 5.000,00 e retornar para R$ 47.500,00. |

#### Resultados Esperados
- A soma dos valores (base + opcionais) reflete o preço total final do veículo dinamicamente.

#### Critérios de Aceitação
- O cálculo deve seguir estritamente as constantes: `SPORT_WHEELS_PRICE` = 2000, `PRECISION_PARK_PRICE` = 5500, `FLUX_CAPACITOR_PRICE` = 5000.

---

## Módulo: Checkout/Pedido & Pagamento

### CT03 - Validação de campos obrigatórios no Formulário de Checkout

#### Objetivo
Garantir que os requisitos mínimos de caracteres e padrões de preenchimento do Zod Schema sejam validados antes da submissão do pedido.

#### Pré-Condições
- Estar na página de Checkout (`/order`) com o veículo configurado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Preencher o campo Nome e Sobrenome com apenas 1 caractere | O sistema deve exibir erro: "Nome deve ter pelo menos 2 caracteres" / "Sobrenome deve ter pelo menos 2 caracteres". |
| 2 | Preencher o campo Email com um texto sem formato de email (ex: 'usuario.com') | O sistema deve exibir erro: "Email inválido". |
| 3 | Preencher Telefone e CPF com menos de 14 caracteres na máscara | O sistema deve exibir erros de Telefone/CPF inválido. |
| 4 | Não selecionar nenhuma Loja e não marcar os Termos de Uso | O sistema deve exibir erro indicando seleção de loja obrigatória e requerer o aceite nos termos. |
| 5 | Tentar clicar no botão "Confirmar Pedido" | O sistema deve reter a ação e exibir mensagens visuais (textos de erro) sob os inputs defeituosos. |

#### Resultados Esperados
- O formulário bloqueia envios que não correspondam ao Zod `orderSchema`.

#### Critérios de Aceitação
- Validações em tela ocorrem indicando quais campos necessitam ajuste e os motivos exatos de recusa.

---

### CT04 - Fluxo de Pagamento à Vista

#### Objetivo
Validar que a compra na modalidade à vista é processada sem consulta à API de análise de crédito e utiliza o valor estrito configurado.

#### Pré-Condições
- Formulário de Checkout devidamente preenchido (dados válidos).
- Veículo configurado no valor de R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar a opção de pagamento "À Vista" | Os campos de financiamento (Entrada e Parcelas) ficam ocultos. |
| 2 | Clicar em "Confirmar Pedido" | O pedido deve ser submetido diretamente para o banco de dados via provedor (sem invocar a *Edge Function* de análise de crédito). |

#### Resultados Esperados
- O pedido é finalizado com `status: 'APROVADO'` automático (pois não há verificação de risco de crédito).

#### Critérios de Aceitação
- A tela de Sucesso é apresentada sem delays de processamento de crédito.

---

### CT05 - Simulação de Financiamento Parcelado (Juros Compostos)

#### Objetivo
Validar o cálculo matemático de parcelamento em 12 vezes com juros compostos de 2% ao mês.

#### Pré-Condições
- Formulário de Checkout com método de pagamento selecionado como "Financiamento".
- Veículo configurado com valor de R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Visualizar a simulação de Financiamento deixando a entrada como R$ 0,00 | O valor a ser financiado será R$ 40.000,00. O sistema calcula 12x com juros compostos de 2% a.m. |
| 2 | Visualizar os dados de parcela e juros totais | As parcelas e custo efetivo (`amountToFinance / 12 * 1.02` no código atual) devem bater com a fórmula contida no componente. |
| 3 | Informar um valor de entrada (Ex: R$ 20.000) | O valor financiado cai para R$ 20.000 e a parcela e juros totais são re-calculados com base neste montante. |

#### Resultados Esperados
- A simulação atualiza em tempo real, travando sempre o número de parcelas em 12 e mostrando dados detalhados (montante financiado e parcela).

#### Critérios de Aceitação
- O input de valor de entrada nunca pode exceder o valor total do veículo (`max={totalPrice}`).

---

## Módulo: Análise de Crédito (Integração)

### CT06 - Análise de crédito: Aprovação Direta (Score > 700)

#### Objetivo
Validar o fluxo de retorno de crédito onde o usuário possui um *score* elevado, resultando em aprovação limpa.

#### Pré-Condições
- Estar no Checkout.
- Selecionar "Financiamento".
- Utilizar um CPF configurado na API Mock de crédito que retorne Score = 750.
- Entrada menor que 50% (para que não acione a exceção).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Preencher formulário e clicar em "Confirmar Pedido" | O status do botão altera para "Processando..." e chama a Edge Function `credit-analysis`. |
| 2 | Aguardar resposta | A API retorna Score 750. A função local `creditStatus` avalia `score > 700` e devolve `'APROVADO'`. |

#### Resultados Esperados
- O pedido é gravado com status "APROVADO".
- Redirecionamento bem-sucedido para `/success`.

#### Critérios de Aceitação
- A tela de Sucesso é exibida.

---

### CT07 - Análise de crédito: Pedido Em Análise (Score 501 a 700)

#### Objetivo
Validar o fluxo em que o usuário tem um score médio (entre 501 e 700), forçando o pedido a ir para análise manual.

#### Pré-Condições
- Estar no Checkout, modalidade "Financiamento", entrada menor que 50%.
- Utilizar CPF cujo retorno da API seja Score = 600.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Clicar em "Confirmar Pedido" | A API de crédito é consultada. |
| 2 | Aguardar processamento | A função `creditStatus` avalia `score >= 501` e devolve `'EM_ANALISE'`. |

#### Resultados Esperados
- Pedido salvo na base de dados com status "EM_ANALISE".

#### Critérios de Aceitação
- Redirecionamento para tela de confirmação mas com metadados do status `EM_ANALISE`.

---

### CT08 - Análise de crédito: Reprovação Direta (Score <= 500)

#### Objetivo
Validar o comportamento quando a API de crédito retorna um score muito baixo (<= 500), resultando em negação do financiamento.

#### Pré-Condições
- Estar no Checkout, modalidade "Financiamento".
- Valor de entrada informado é menor que 50% do total (Ex: Entrada R$ 0).
- CPF retorna Score = 450.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Clicar em "Confirmar Pedido" | A API de crédito é consultada e retorna Score = 450. |
| 2 | Aguardar processamento | A função `creditStatus` cai na última checagem (`return 'REPROVADO'`). |

#### Resultados Esperados
- Pedido criado com status `'REPROVADO'`.
- O cliente visualiza que seu crédito não foi aprovado.

#### Critérios de Aceitação
- A lógica não deixa o sistema definir 'APROVADO' ou 'EM_ANALISE' para score <= 500 sem entrada suficiente.

---

### CT09 - Análise de crédito: Exceção de Entrada >= 50%

#### Objetivo
Garantir que a regra de exceção contorne um score ruim caso o cliente dê metade (ou mais) do valor do veículo como entrada.

#### Pré-Condições
- Estar no Checkout, modalidade "Financiamento".
- Veículo de R$ 40.000. Entrada fornecida de R$ 20.000 (ou mais).
- CPF retorna Score = 400 (que normalmente causaria Reprovação).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Clicar em "Confirmar Pedido" | A API retorna Score = 400. |
| 2 | Função `creditStatus` avalia os dados | O sistema avalia a condição `(entryPct >= 0.5 && score < 700)` como Verdadeira. |
| 3 | Aguardar gravação do pedido | O status forçado é `'APROVADO'`. |

#### Resultados Esperados
- O sistema aprova o pedido, superpondo o baixo score graças ao aporte inicial da entrada financeira.

#### Critérios de Aceitação
- O comportamento bate com o IF da função local no frontend: o status gerado deve ser `'APROVADO'` e não `'REPROVADO'`.

---

### CT10 - Falha de Integração com API de Crédito

#### Objetivo
Validar o tratamento de exceção (Toast) em caso de queda ou erro na Edge Function de análise de crédito.

#### Pré-Condições
- Estar no Checkout, modalidade "Financiamento".
- Servidor ou Edge Function indisponível/retornando 500.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Clicar em "Confirmar Pedido" | O bloco `try/catch` no front-end intercepta o erro ou ausência de score na requisição da API. |
| 2 | Visualizar tela | Um Toast de "Erro" é emitido dizendo "Falha ao consultar análise de crédito...". |

#### Resultados Esperados
- O pedido *não* é criado. O fluxo é interrompido e a flag de `isSubmitting` volta a ser falsa.

#### Critérios de Aceitação
- O usuário é avisado visualmente (`data-testid="toast-error"`) de que o sistema encontra-se indisponível ou os dados falharam na checagem da API.

---

## Módulo: Consulta de Pedidos (`OrderLookup`)

### CT11 - Consulta Válida (Happy Path)

#### Objetivo
Verificar se os dados do pedido são renderizados perfeitamente (Cores de crachá, detalhes do cliente, parcelamento, etc.) para um ID existente.

#### Pré-Condições
- O sistema possui um pedido aprovado com ID `VLO-ABC123`.
- Estar na rota de Busca (`OrderLookup.tsx`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Inserir `VLO-ABC123` no input de Número do Pedido | O botão "Buscar Pedido" é habilitado. |
| 2 | Clicar em "Buscar Pedido" | O estado de Loading (Loader2) é exibido brevemente. |
| 3 | Visualizar resultados | O sistema exibe o Card do Pedido com o número `VLO-ABC123`, os opcionais do carro, dados do cliente e crachá de Status com sua respectiva cor e ícone. |

#### Resultados Esperados
- O pedido é localizado, o estado `notFound` é setado para falso, e `searchedOrder` preenche a tela.

#### Critérios de Aceitação
- Os dados na tela conferem com o pedido contido na base de dados.

---

### CT12 - Consulta a Pedido Inexistente (Error Flow)

#### Objetivo
Verificar a renderização amigável de erro caso o ID pesquisado não conste na base.

#### Pré-Condições
- Estar na rota de Busca (`OrderLookup`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Inserir um código inexistente, ex: `9999-NOTFOUND` | O botão habilita. |
| 2 | Clicar em "Buscar Pedido" | O sistema chama `getOrderByNumber(orderId)` que devolve error ou null. |
| 3 | Visualizar layout de erro | O componente de erro (`data-testid="order-not-found"`) entra em tela via animação `fade-in`. |

#### Resultados Esperados
- Nenhuma quebra da aplicação. Apenas a notificação contida informando que o pedido não foi localizado.

#### Critérios de Aceitação
- O card `Pedido não encontrado` é exibido em vermelho contendo o ícone `XCircle`.

---

### CT13 - Restrição de Submissão Vazia e Segurança

#### Objetivo
Garantir que a função de busca não é iniciada à toa e atestar o requerimento do código, reforçando que usuários comuns não possuem um meio de listar todos os pedidos indiscriminadamente por essa interface.

#### Pré-Condições
- Estar na tela de Consulta de Pedidos.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Manter o input vazio ou preenchido apenas com espaços ("   ") | O botão "Buscar Pedido" (`disabled={!orderId.trim() || isLoading}`) deve estar e permanecer inoperável. |

#### Resultados Esperados
- A requisição para o backend (`getOrderByNumber`) não é disparada.
- Garante-se que para achar um pedido, é imperativo o fornecimento explícito do ID associado à compra do cliente.

#### Critérios de Aceitação
- Ações são bloqueadas com base no estado e lógica do botão, mitigando chamadas desnecessárias ou exploratórias.
