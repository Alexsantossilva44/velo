Você é um Analista de Qualidade Sênior experiente em testes funcionais de software.

Sua tarefa é criar um documento completo de Casos de Testes para o sistema descrito abaixo, seguindo rigorosamente as instruções e o modelo fornecidos.

---

## Informações do Sistema

**Nome do sistema:** Velô Sprint - Configurador de Veículo Elétrico

**Descrição:** Uma SPA (Single Page Application) web desenvolvida em React que permite aos usuários configurar, simular financiamentos e realizar a compra do veículo elétrico Velô Sprint. O sistema calcula preços dinamicamente com base nas escolhas do cliente e possui integração com uma API de análise de crédito para validar as compras.

**Módulos/Funcionalidades a cobrir:** Landing Page, Configurador de Veículo, Checkout/Pedido, Análise de Crédito Automática, Confirmação, Consulta de Pedidos.

**Perfis de usuário:** Cliente (Usuário Comum).

**Regras de negócio relevantes:** 
- Precificação: O carro possui um valor base de R$ 40.000. Adicionar rodas "Sport" custa +R$ 2.000. Adicionar "Precision Park" custa +R$ 5.500. Adicionar "Flux Capacitor" custa +R$ 5.000.
- Juros de Financiamento: Se a opção for parcelada, o financiamento é travado em 12x com uma taxa fixa de juros compostos de 2% ao mês.
- Análise de Crédito por Score: Score > 700 (Aprovado), 501 a 700 (Em análise), <= 500 (Reprovado).
- Exceção na Aprovação de Crédito: Entrada >= 50% do valor total aprova automaticamente o pedido, ignorando o score de crédito.
- Segurança de Dados: A consulta de pedidos requer o número do pedido (`order_number`).

---

## Escopo dos Testes

Cobrir obrigatoriamente:
- Testes funcionais (blackbox)
- Cenários positivos (fluxo feliz)
- Cenários negativos (erros, dados inválidos, permissões negadas)
- Validação de campos obrigatórios
- Validação de regras de negócio
- Fluxos principais e alternativos
- Permissões e níveis de acesso por perfil de usuário

Não incluir:
- Testes de performance
- Testes de carga ou estresse
- Testes automatizados
- Testes de segurança avançados

---

## Modelo de Caso de Teste

Cada caso de teste deve seguir exatamente este formato:

---

### CT[NN] - [Nome descritivo do caso de teste]

#### Objetivo
[Descrição clara e objetiva do que está sendo validado.]

#### Pré-Condições
- [Condição 1]
- [Condição 2]
- [...]

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | [Ação do usuário] | [Comportamento esperado do sistema] |
| 2  | [...] | [...] |

#### Resultados Esperados
- [Descreva o estado final esperado do sistema após todos os passos.]

#### Critérios de Aceitação
- [Critério objetivo 1]
- [Critério objetivo 2]
- [...]

---

## Instruções de Geração

1. Numere os casos de teste sequencialmente: CT01, CT02, CT03...
2. Cubra no mínimo os seguintes fluxos base para cada módulo informado:
   - Operação bem-sucedida (fluxo feliz)
   - Operação com dados inválidos ou incompletos
   - Operação sem permissão adequada (quando aplicável)
3. Inclua casos de teste para validação de campos obrigatórios.
4. Inclua casos de teste para cada perfil de usuário listado, sempre que houver comportamentos distintos.
5. Seja detalhado nos passos — cada ação deve ser clara o suficiente para que qualquer pessoa execute o teste sem dúvidas.
6. Gere o resultado em formato Markdown, pronto para ser salvo em um arquivo `.md` dentro da pasta `docs/tests` do projeto.

---

## Casos de Teste Gerados

### CT01 - Acesso inicial à Landing Page

#### Objetivo
Validar se a Landing Page carrega corretamente e exibe os elementos principais.

#### Pré-Condições
- O sistema deve estar online e acessível.
- Acessar com perfil de Cliente (Usuário Comum).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Acessar a URL raiz do sistema | A página deve carregar sem erros. |
| 2 | Verificar o conteúdo da página | Devem ser exibidos o título, descrição do veículo e botão para iniciar a configuração. |

#### Resultados Esperados
- A página inicial é exibida com sucesso para o usuário cliente, com todas as informações básicas da Velô Sprint.

#### Critérios de Aceitação
- Nenhum erro de console ou de rede deve ocorrer ao carregar a página.

---

### CT02 - Navegação para o Configurador de Veículo

#### Objetivo
Validar se o usuário consegue transitar da Landing Page para a página do Configurador.

#### Pré-Condições
- Estar na Landing Page do sistema.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Clicar no botão "Configurar", "Monte o seu" ou equivalente | O sistema deve redirecionar o usuário para a rota do configurador. |

#### Resultados Esperados
- O sistema exibe a interface do Configurador de Veículo.

#### Critérios de Aceitação
- A transição de tela deve ocorrer corretamente sem perda de estado.

---

### CT03 - Validação do valor base do veículo

#### Objetivo
Garantir que o veículo seja precificado inicialmente com seu valor base de R$ 40.000.

#### Pré-Condições
- Estar na página do Configurador de Veículo.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Visualizar o resumo de preços sem selecionar nenhum opcional extra | O valor total exibido deve ser de R$ 40.000. |

#### Resultados Esperados
- O preço base do carro é respeitado pelo sistema de precificação.

#### Critérios de Aceitação
- O valor exibido na tela deve ser exatamente R$ 40.000 na inicialização.

---

### CT04 - Adição de opcionais e atualização de preço

#### Objetivo
Validar se o sistema adiciona corretamente o valor das opções ao valor base do carro.

#### Pré-Condições
- Estar na página do Configurador de Veículo com o preço base em R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar a opção de rodas "Sport" | O valor total exibido deve ser atualizado para R$ 42.000 (+R$ 2.000). |
| 2 | Selecionar o opcional "Precision Park" | O valor total exibido deve ser atualizado para R$ 47.500 (+R$ 5.500 sobre o acumulado). |
| 3 | Selecionar o opcional "Flux Capacitor" | O valor total exibido deve ser atualizado para R$ 52.500 (+R$ 5.000 sobre o acumulado). |

#### Resultados Esperados
- O preço final exibido reflete a soma do valor base com todos os opcionais selecionados.

#### Critérios de Aceitação
- A cada seleção, o preço é recalculado instantaneamente.
- Valores das opções aplicadas rigorosamente: Sport (+R$ 2.000), Precision Park (+R$ 5.500), Flux Capacitor (+R$ 5.000).

---

### CT05 - Validação de campos obrigatórios no Checkout

#### Objetivo
Garantir que o usuário não consiga prosseguir com o pedido sem preencher os dados obrigatórios.

#### Pré-Condições
- Ter concluído a configuração do veículo.
- Estar na tela de Checkout/Pedido.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Deixar campos do formulário essenciais em branco | Nenhum dado é inserido. |
| 2 | Clicar para finalizar o pedido | O sistema deve exibir mensagens de erro nos campos obrigatórios e bloquear o envio. |

#### Resultados Esperados
- O formulário não é enviado e os campos obrigatórios são destacados visualmente.

#### Critérios de Aceitação
- Mensagens de validação claras devem ser exibidas para cada campo ausente.

---

### CT06 - Simulação de Financiamento Parcelado (12x)

#### Objetivo
Validar o travamento do parcelamento e cálculo de juros compostos (2% ao mês) para financiamento em 12x.

#### Pré-Condições
- Estar na tela de Checkout com o formulário de dados preenchido.
- Valor total do veículo definido (ex: R$ 40.000 base).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar método de pagamento "Financiamento" ou "Parcelado" | O sistema exibe opções de financiamento restritas a 12x. |
| 2 | Definir valor de entrada como R$ 0 | O valor a ser financiado será R$ 40.000. |
| 3 | Escolher o parcelamento em 12x | O sistema calcula o valor da parcela com juros compostos de 2% ao mês. |

#### Resultados Esperados
- O sistema exibe o valor da parcela mensal corretamente calculado e apresenta a taxa travada em 12x.

#### Critérios de Aceitação
- A taxa de juros deve ser fixada em 2% a.m compostos e apenas a opção de 12 meses deve ser permitida.

---

### CT07 - Aprovação automática de crédito (Score > 700)

#### Objetivo
Validar a aprovação de uma compra quando o score de crédito do usuário for superior a 700.

#### Pré-Condições
- Estar na tela de Checkout.
- Utilizar dados de teste que retornam um Score > 700 na integração com a API de crédito.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Submeter o formulário de pedido financiado | O sistema requisita a validação de crédito à API. |
| 2 | Aguardar o retorno da API | O sistema confirma o pedido e encaminha para a tela de Confirmação. |

#### Resultados Esperados
- O status do pedido é definido como "Aprovado" instantaneamente.

#### Critérios de Aceitação
- O usuário visualiza uma tela/mensagem de sucesso indicando a aprovação.

---

### CT08 - Pedido com crédito em análise (Score 501 a 700)

#### Objetivo
Validar o fluxo em que a compra vai para análise manual devido ao score mediano.

#### Pré-Condições
- Estar na tela de Checkout.
- Utilizar dados de teste que retornam um Score entre 501 e 700 na API de crédito.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Submeter o formulário de pedido financiado | O sistema requisita a validação de crédito à API. |
| 2 | Aguardar o retorno da API | O sistema encaminha para a tela de Confirmação com status de análise. |

#### Resultados Esperados
- O status do pedido é definido como "Em Análise".

#### Critérios de Aceitação
- O usuário visualiza uma mensagem indicando que o pedido está aguardando análise de um analista.

---

### CT09 - Reprovação de crédito (Score <= 500)

#### Objetivo
Validar a recusa de financiamento quando o score do cliente for baixo.

#### Pré-Condições
- Estar na tela de Checkout.
- Entrada menor que 50%.
- Utilizar dados de teste que retornam um Score <= 500.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Submeter o formulário de pedido financiado | O sistema requisita a validação de crédito à API. |
| 2 | Aguardar o retorno da API | O sistema exibe bloqueio ou recusa do financiamento. |

#### Resultados Esperados
- O status do pedido é definido como "Reprovado".

#### Critérios de Aceitação
- O usuário é informado da impossibilidade de prosseguir devido a políticas de crédito.

---

### CT10 - Exceção na Aprovação de Crédito (Entrada >= 50%)

#### Objetivo
Garantir que um pedido seja aprovado independentemente do score de crédito, caso a entrada seja igual ou maior a 50% do valor total do veículo.

#### Pré-Condições
- Estar na tela de Checkout.
- Utilizar dados de teste que retornam um Score <= 500 (condição de reprovação).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Configurar o valor da entrada para cobrir no mínimo 50% do valor do carro configurado | O sistema deve reconhecer o valor da entrada. |
| 2 | Submeter o formulário de pedido | O sistema aplica a regra de exceção e aprova automaticamente. |

#### Resultados Esperados
- O status do pedido é "Aprovado", ignorando o score de crédito baixo.

#### Critérios de Aceitação
- A regra de entrada >= 50% funciona como uma exceção absoluta, garantindo a aprovação.

---

### CT11 - Tela de Confirmação e exibição do Order Number

#### Objetivo
Validar a tela de sucesso após um pedido e garantir que o número do pedido seja gerado e exibido ao cliente.

#### Pré-Condições
- Concluir um pedido com sucesso (Aprovado ou Em Análise).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Visualizar a tela de Confirmação pós-checkout | O sistema exibe a mensagem de sucesso e o número do pedido (`order_number`). |

#### Resultados Esperados
- O usuário possui o identificador necessário para consultas futuras.

#### Critérios de Aceitação
- O `order_number` deve ser exibido com destaque na tela de sucesso.

---

### CT12 - Consulta de pedido válida

#### Objetivo
Validar se o usuário consegue consultar corretamente o status do seu pedido fornecendo um número de pedido válido.

#### Pré-Condições
- Estar na funcionalidade de Consulta de Pedidos.
- Possuir um `order_number` válido existente no banco de dados.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Inserir o `order_number` no campo de consulta | O número é formatado corretamente (se aplicável). |
| 2 | Clicar em consultar | O sistema pesquisa o banco e retorna os dados do veículo, opções e status do crédito. |

#### Resultados Esperados
- As informações pertinentes ao pedido são exibidas com sucesso para o usuário.

#### Critérios de Aceitação
- A exibição deve trazer os detalhes da configuração e o status atual.

---

### CT13 - Consulta com dados inválidos ou pedido inexistente

#### Objetivo
Validar o comportamento do sistema quando um número de pedido inexistente é consultado.

#### Pré-Condições
- Estar na funcionalidade de Consulta de Pedidos.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Inserir um `order_number` formatado corretamente, porém inexistente | O número é aceito no input. |
| 2 | Clicar em consultar | O sistema deve informar que o pedido não foi localizado. |

#### Resultados Esperados
- O usuário recebe um aviso amigável de pedido não encontrado (Not Found).

#### Critérios de Aceitação
- Nenhuma falha severa ou quebra de tela ocorre.

---

### CT14 - Segurança de Dados: Exigência do Order Number

#### Objetivo
Garantir que nenhuma informação de pedido seja exposta sem a devida identificação do `order_number`.

#### Pré-Condições
- Estar na funcionalidade de Consulta de Pedidos.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Tentar consultar clicando no botão sem preencher o `order_number` | O sistema deve impedir a requisição. |
| 2 | Acessar rotas diretas de API na tentativa de listar todos os pedidos (quando testando via backend) | O sistema deve retornar Access Denied (403) ou Unauthorized (401) para listagem sem identificador. |

#### Resultados Esperados
- O acesso aos detalhes de pedidos está estritamente atrelado ao conhecimento do `order_number`.

#### Critérios de Aceitação
- É impossível consultar o status de pedidos de terceiros ou ver listagens abertas sendo um cliente comum.