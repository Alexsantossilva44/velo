import { test, expect } from '../fixtures/test'
import { generateOrderCode } from '../support/helpers'
import { E2E_TEST_EMAIL, createTestOrder, deleteTestOrder } from '../helpers/orders'
import { OrderLookupPage } from '../pages/OrderLookupPage'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()
  })

  // Casos de status: o card do pedido é idêntico em todos, só mudam o rótulo
  // do teste, o texto do badge e as classes de cor/ícone esperadas.
  const statusCases = [
    {
      status: 'APROVADO',
      label: 'aprovado',
      badgeBg: /bg-green-100/,
      badgeText: /text-green-700/,
      icon: /lucide-circle-check-big/,
    },
    {
      status: 'REPROVADO',
      label: 'reprovado',
      badgeBg: /bg-red-100/,
      badgeText: /text-red-700/,
      icon: /lucide-circle-x/,
    },
    {
      status: 'EM_ANALISE',
      label: 'em análise',
      badgeBg: /bg-amber-100/,
      badgeText: /text-amber-700/,
      icon: /lucide-clock/,
    },
  ] as const

  for (const { status, label, badgeBg, badgeText, icon } of statusCases) {
    test(`deve consultar um pedido ${label}`, async ({ page }) => {
      const lookup = new OrderLookupPage(page)
      const orderNumber = await createTestOrder(status)

      try {
        await lookup.search(orderNumber)
        await lookup.assertOrderResult({ orderNumber, status, email: E2E_TEST_EMAIL, badgeBg, badgeText, icon })
      } finally {
        await deleteTestOrder(orderNumber)
      }
    })
  }

  test('deve exibir mensagem de pedido não encontrado', async ({ page }) => {
    const lookup = new OrderLookupPage(page)
    const order = generateOrderCode()

    await lookup.search(order)

    const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
    await expect(title).toBeVisible()

    const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
    await expect(message).toBeVisible()
  })
})

// Fluxo real: cria o pedido pela loja e consulta usando o número gerado
// nessa mesma execução — nunca um valor fixo copiado de outra sessão.
test('deve consultar o pedido com o número gerado na criação', async ({ page }) => {
  const lookup = new OrderLookupPage(page)

  // Arrange - completa a compra como um usuário faria
  await page.goto('/configure')
  await page.getByTestId('checkout-button').click()

  await page.getByTestId('checkout-name').fill('Maria')
  await page.getByTestId('checkout-surname').fill('Teste')
  await page.getByTestId('checkout-email').fill(E2E_TEST_EMAIL)
  await page.getByTestId('checkout-phone').fill('(11) 99999-9999')
  await page.getByTestId('checkout-cpf').fill('123.456.789-09')
  await page.getByTestId('checkout-store').click()
  await page.getByRole('option', { name: /Velô Paulista/ }).click()
  await page.getByTestId('checkout-terms').click()
  await page.getByTestId('checkout-submit').click()

  await expect(page.getByTestId('success-status')).toBeVisible()

  // Captura o número REAL gerado pela criação do pedido
  const order = (await page.getByTestId('order-id').innerText()).trim()
  expect(order).toMatch(/^VLO-[A-Z0-9]{6}$/)

  try {
    // Act - consulta usando o mesmo número capturado acima
    await page.getByTestId('goto-consultar').click()
    await lookup.search(order)

    // Assert
    await expect(page.getByTestId(`order-result-${order}`)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('order-number')).toContainText(order)
    await expect(page.getByTestId('order-status')).toContainText('APROVADO')
  } finally {
    await deleteTestOrder(order)
  }
})
