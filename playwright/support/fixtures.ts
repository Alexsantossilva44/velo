import { test as base, expect } from '@playwright/test'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createConfiguradorActions } from './actions/configuradorActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createTestOrder, deleteTestOrder } from '../helpers/orders'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurador: ReturnType<typeof createConfiguradorActions>
  checkout: ReturnType<typeof createCheckoutActions>
}

export const test = base.extend<{ app: App; approvedOrderId: string }>({
  app: async ({ page }, use) => {
    await use({
      orderLookup: createOrderLookupActions(page),
      configurador: createConfiguradorActions(page),
      checkout: createCheckoutActions(page),
    })
  },
  approvedOrderId: async ({}, use) => {
    const orderId = await createTestOrder('APROVADO')
    await use(orderId)
    await deleteTestOrder(orderId)
  },
})

export { expect }
