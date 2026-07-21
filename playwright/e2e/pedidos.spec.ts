import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import { E2E_TEST_EMAIL, createTestOrder, deleteTestOrder } from '../helpers/orders'

/// Tudo que envolve pedidos (consulta, status, criação real)

test.describe('Consulta de Pedidos', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
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
    test(`Deve consultar um pedido ${label}`, async ({ app }) => {
      const orderNumber = await createTestOrder(status)

      try {
        await app.orderLookup.search(orderNumber)
        await app.orderLookup.assertOrderResult({
          orderNumber,
          status,
          email: E2E_TEST_EMAIL,
          badgeBg,
          badgeText,
          icon,
        })
      } finally {
        await deleteTestOrder(orderNumber)
      }
    })
  }

  test('Deve exibir mensagem de pedido não encontrado', async ({ app, page }) => {
    const order = generateOrderCode()

    await app.orderLookup.search(order)

    const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
    await expect(title).toBeVisible()

    const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
    await expect(message).toBeVisible()
  })

  test('Deve manter o botão de busca desabilitado com o campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLookup.searchButton
    await expect(button).toBeDisabled()

    await app.orderLookup.orderInput.fill('   ')
    await expect(button).toBeDisabled()
  })

  test('Deve exibir mensagem quando o pedido em qualquer formato não é encontrado', async ({ app, page }) => {
    await app.orderLookup.search('ABC123')

    await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible()
    await expect(page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })).toBeVisible()
  })
})

// Fluxo real: cria o pedido pela loja e consulta usando o número gerado
// nessa mesma execução — nunca um valor fixo copiado de outra sessão.
test('Deve consultar o pedido com o número gerado na criação', async ({ app, page }) => {
  // Arrange - completa a compra como um usuário faria
  await app.configurador.open()
  await app.configurador.goToCheckout()

  await app.checkout.fillForm({
    name: 'Maria',
    surname: 'Teste',
    email: E2E_TEST_EMAIL,
    phone: '(11) 99999-9999',
    cpf: '123.456.789-09',
    store: /Velô Paulista/,
  })
  await app.checkout.acceptTerms()
  await app.checkout.submit()

  await app.checkout.assertSuccess()

  // Captura o número REAL gerado pela criação do pedido
  const order = await app.checkout.getOrderNumber()

  try {
    // Act - consulta usando o mesmo número capturado acima
    await app.checkout.goToOrderLookup()
    await app.orderLookup.search(order)

    // Assert
    await expect(page.getByTestId(`order-result-${order}`)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('order-number')).toContainText(order)
    await expect(page.getByTestId('order-status')).toContainText('APROVADO')
  } finally {
    await deleteTestOrder(order)
  }
})
