import { test, expect } from '@playwright/test'
import { createTestOrder, deleteTestOrder } from '../helpers/orders'

let orderId: string

test.beforeAll(async () => {
  orderId = await createTestOrder()
})

test.afterAll(async () => {
  await deleteTestOrder(orderId)
})

test('consulta pedido aprovado', async ({ page }) => {
  await page.goto('/lookup')

  await page.getByLabel('Número do Pedido').fill(orderId)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  await expect(page.getByText(orderId)).toBeVisible()
  await expect(page.getByText('APROVADO')).toBeVisible()
})

test('pedido não encontrado', async ({ page }) => {
  await page.goto('/lookup')

  await page.getByLabel('Número do Pedido').fill('VLO-NAOEXISTE')
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible()
})

test('botão desabilitado com campo vazio', async ({ page }) => {
  await page.goto('/lookup')

  await expect(page.getByRole('button', { name: 'Buscar Pedido' })).toBeDisabled()
})
