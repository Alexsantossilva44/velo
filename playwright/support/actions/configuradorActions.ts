import { Page, expect } from '@playwright/test'

export function createConfiguradorActions(page: Page) {
  const checkoutButton = page.getByTestId('checkout-button')

  const wheelsButton = (type: 'sport' | 'aero') =>
    page.getByRole('button', { name: type === 'sport' ? /Sport Wheels/ : /Aero Wheels/ })

  const optionalCheckbox = (name: string) => page.getByRole('checkbox', { name: new RegExp(name) })

  return {
    checkoutButton,

    async open() {
      await page.goto('/configure')
      await expect(page.getByRole('heading', { name: 'Velô Sprint', level: 1 })).toBeVisible()
    },

    // --- Assertions ---

    async assertPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async assertCarColor(colorSlug: string) {
      const carImage = page.getByTestId('car-exterior-image')
      await expect(carImage).toHaveAttribute('alt', new RegExp(colorSlug))
    },

    // --- Ações: Cores ---

    async selectColor(color: string) {
      await page.getByRole('button', { name: color }).click()
    },

    // --- Ações: Rodas ---

    async selectWheels(type: 'sport' | 'aero') {
      await wheelsButton(type).click()
    },

    async selectSportWheels() {
      await wheelsButton('sport').click()
    },

    async selectAeroWheels() {
      await wheelsButton('aero').click()
    },

    // --- Ações: Opcionais ---

    async toggleOptional(name: string) {
      await optionalCheckbox(name).click()
    },

    async togglePrecisionPark() {
      await optionalCheckbox('Precision Park').click()
    },

    async toggleFluxCapacitor() {
      await optionalCheckbox('Flux Capacitor').click()
    },

    // --- Navegação ---

    async goToCheckout() {
      await checkoutButton.click()
    },

    async assertOnCheckoutPage() {
      await expect(page).toHaveURL('/order')
    },
  }
}
