import { Page, expect } from '@playwright/test'

export class Navbar {
  constructor(private page: Page) {}

  async clickOrderLookup() {
    await this.page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(this.page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()
  }
}
