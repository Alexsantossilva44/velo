import { Page, expect } from '@playwright/test'
import { Navbar } from './Navbar'

export class LandingPage {
  constructor(private page: Page) {}

  async goToOrderLookup() {
    await this.page.goto('/')
    const title = this.page.getByTestId('hero-section').getByRole('heading')
    await expect(title).toContainText('Velô Sprint')
    await new Navbar(this.page).clickOrderLookup()
  }
}
