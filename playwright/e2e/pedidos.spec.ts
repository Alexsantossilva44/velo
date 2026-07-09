import { test, expect } from '../fixtures/test'

/// AAA - Arrange, Act, Assert

test('deve consultar um pedido aprovado', async ({ page, approvedOrderId }) => {
  // Arrange
  await page.goto('/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()

  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(approvedOrderId)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  // Assert
  const orderResult = page.getByTestId(`order-result-${approvedOrderId}`)
  await expect(orderResult).toBeVisible({ timeout: 10_000 })
  await expect(orderResult).toContainText(approvedOrderId)
  await expect(orderResult).toContainText('APROVADO')
})
