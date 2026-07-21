# CT03 - Configuração do Veículo com Adição de Opcionais e Cálculo de Preço

## Desafio

Neste desafio você deverá automatizar o cenário CT03 – Configuração do Veículo com Adição de Opcionais e Cálculo de Preço.

O objetivo é validar se o preço do veículo é atualizado corretamente ao selecionar ou remover os opcionais Precision Park (+R$5.500) e Flux Capacitor (+R$5.000).

---

## O que foi feito

1. Aberto o arquivo `testcases.md` e localizado o cenário CT03.
2. Utilizado o prompt `prompt-qa-playwright-automator.md` como referência de padrões para geração da automação.
3. Executado o teste e validado que o cenário funciona corretamente.
4. Refatorada a automação utilizando Feature Actions.
5. Reutilizada e estendida a camada `configuradorActions.ts`.

---

## Caso de Teste de Referência

**CT03 - Configuração do Veículo (Adição de Opcionais) e Cálculo de Preço**

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Marcar o checkbox do opcional "Precision Park" | Preço acrescido de R$ 5.500,00 → Total: R$ 45.500,00 |
| 2  | Marcar o checkbox do opcional "Flux Capacitor" | Preço acrescido de R$ 5.000,00 → Total: R$ 50.500,00 |
| 3  | Desmarcar os checkboxes dos dois opcionais | Preço subtrai os valores e volta a R$ 40.000,00 |
| 4  | Clicar no botão "Monte o Seu" (Checkout) | Redirecionamento para `/order` com valores persistidos |

---

## Implementação

### Feature Actions — `configuradorActions.ts`

Arquivo: `playwright/support/actions/configuradorActions.ts`

Métodos reutilizados da aula anterior:

```typescript
async togglePrecisionPark() {
  await optionalCheckbox('Precision Park').click()
},

async toggleFluxCapacitor() {
  await optionalCheckbox('Flux Capacitor').click()
},

async assertPrice(price: string) {
  const priceElement = page.getByTestId('total-price')
  await expect(priceElement).toBeVisible()
  await expect(priceElement).toHaveText(price)
},

async goToCheckout() {
  await checkoutButton.click()
},
```

Método novo adicionado para cobrir o passo 4 do CT03:

```typescript
async assertOnCheckoutPage() {
  await expect(page).toHaveURL('/order')
},
```

---

### Teste — `configurador.spec.ts`

Arquivo: `playwright/e2e/configurador.spec.ts`

O teste foi adicionado dentro do `test.describe('Configuração do veículo')`, reutilizando as constantes de preço já declaradas no escopo do describe:

```typescript
const priceForty = 'R$ 40.000,00'
const priceFortyFiveFifty = 'R$ 45.500,00'
```

```typescript
/// Configuração do Veículo (Adição de Opcionais) e Cálculo de Preço
test("Deve validar se a seleção de opcionais ('Precision Park' e 'Flux Capacitor') atualiza dinamicamente o preço do veículo", async ({ app }) => {
  await app.configurador.assertPrice(priceForty)

  await app.configurador.togglePrecisionPark()
  await app.configurador.assertPrice(priceFortyFiveFifty)

  await app.configurador.toggleFluxCapacitor()
  await app.configurador.assertPrice('R$ 50.500,00')

  await app.configurador.toggleFluxCapacitor()
  await app.configurador.assertPrice(priceFortyFiveFifty)

  await app.configurador.togglePrecisionPark()
  await app.configurador.assertPrice(priceForty)

  await app.configurador.goToCheckout()
  await app.configurador.assertOnCheckoutPage()
})
```

---

## Decisões tomadas

| Decisão | Motivo |
|---------|--------|
| Teste em `configurador.spec.ts` | CT03 testa comportamento do configurador; cada arquivo agrupa testes por contexto de negócio |
| Reutilização de `priceForty` e `priceFortyFiveFifty` | Constantes já existiam no escopo do `describe`; evita strings duplicadas |
| `assertOnCheckoutPage()` adicionado em `configuradorActions.ts` | Mantém assertions encapsuladas nas actions, seguindo o padrão Feature Actions do projeto |

---

## Resultado

Comando para rodar apenas o CT03:
```
npx playwright test configurador.spec.ts:27 --debug
```

Comando para rodar toda a suite:
```
npx playwright test --reporter=list
```

**11/11 testes passando, zero regressões.**
