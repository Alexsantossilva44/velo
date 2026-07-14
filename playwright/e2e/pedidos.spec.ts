import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { generateOrderCode } from '../support/helpers'
import { E2E_TEST_EMAIL, createTestOrder, deleteTestOrder } from '../helpers/orders'

/// AAA - Arrange, Act, Assert

async function searchOrder(page: Page, orderNumber: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}

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
      const orderNumber = await createTestOrder(status)

      try {
        // Act
        await searchOrder(page, orderNumber)

        // Assert
        await expect(page.getByTestId(`order-result-${orderNumber}`)).toMatchAriaSnapshot(`
        - img
        - paragraph: Pedido
        - paragraph: ${orderNumber}
        - status:
          - img
          - text: ${status}
        - img "Velô Sprint"
        - paragraph: Modelo
        - paragraph: Velô Sprint
        - paragraph: Cor
        - paragraph: Glacier Blue
        - paragraph: Interior
        - paragraph: cream
        - paragraph: Rodas
        - paragraph: aero Wheels
        - heading "Dados do Cliente" [level=4]
        - paragraph: Nome
        - paragraph: Teste E2E
        - paragraph: Email
        - paragraph: ${E2E_TEST_EMAIL}
        - paragraph: Loja de Retirada
        - paragraph
        - paragraph: Data do Pedido
        - paragraph: /\\d+\\/\\d+\\/\\d+/
        - heading "Pagamento" [level=4]
        - paragraph: À Vista
        - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
        `)

        const statusBadge = page.getByRole('status').filter({ hasText: status })
        await expect(statusBadge).toHaveClass(badgeBg)
        await expect(statusBadge).toHaveClass(badgeText)
        await expect(statusBadge.locator('svg')).toHaveClass(icon)
      } finally {
        await deleteTestOrder(orderNumber)
      }
    })
  }

  test('deve exibir mensagem de pedido não encontrado', async ({ page }) => {
    // Test Data
    const order = generateOrderCode() // Exemplo de pedido não encontrado para teste

    // Act
    await searchOrder(page, order)

    // Assert
    const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
    await expect(title).toBeVisible()

    const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
    await expect(message).toBeVisible()
  })
})

// Fluxo real: cria o pedido pela loja e consulta usando o número gerado
// nessa mesma execução — nunca um valor fixo copiado de outra sessão.
test('deve consultar o pedido com o número gerado na criação', async ({ page }) => {
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
    await searchOrder(page, order)

    // Assert
    await expect(page.getByTestId(`order-result-${order}`)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('order-number')).toContainText(order)
    await expect(page.getByTestId('order-status')).toContainText('APROVADO')
  } finally {
    await deleteTestOrder(order)
  }
})
