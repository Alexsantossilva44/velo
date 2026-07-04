// Fixture opcional — alternativa ao beforeAll/afterAll usado em pedidos.spec.ts
import { test as base, expect } from '@playwright/test'
import { createTestOrder, deleteTestOrder } from '../helpers/orders'

export const test = base.extend<{ approvedOrderId: string }>({
  approvedOrderId: async ({}, use) => {
    const orderId = await createTestOrder('APROVADO')
    await use(orderId)
    await deleteTestOrder(orderId)
  },
})

export { expect }
