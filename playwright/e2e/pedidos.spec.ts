import { test, expect } from '@playwright/test'

// AAA - Arrange, Act, Assert - Padrão de teste (Preparar, Agir, Verificar)

test('test', async ({ page }) => {
  // Arrange - Preparar - Navegar para a página de consulta de pedido
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  // Act - Agir - Preencher o campo de ID do pedido
  await page.getByTestId('search-order-id').fill('VLO-XTVPWT')
  await page.getByTestId('search-order-button').click()

  // Assert - Verificar - Verificar se o ID do pedido está correto
  await expect(page.getByTestId('order-result-id')).toBeVisible()
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-XTVPWT')
  await expect(page.getByTestId('order-result-status')).toBeVisible()
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')
})
