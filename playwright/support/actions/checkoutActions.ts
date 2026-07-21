import { Page, expect } from '@playwright/test'

export type CheckoutFormData = {
  name: string
  surname: string
  email: string
  phone: string
  cpf: string
  store: string | RegExp
}

export function createCheckoutActions(page: Page) {
  const nameInput = page.getByTestId('checkout-name')
  const surnameInput = page.getByTestId('checkout-surname')
  const emailInput = page.getByTestId('checkout-email')
  const phoneInput = page.getByTestId('checkout-phone')
  const cpfInput = page.getByTestId('checkout-cpf')
  const storeSelect = page.getByTestId('checkout-store')
  const termsCheckbox = page.getByTestId('checkout-terms')
  const submitButton = page.getByTestId('checkout-submit')

  const successStatus = page.getByTestId('success-status')
  const orderIdDisplay = page.getByTestId('order-id')
  const goToOrderLookupLink = page.getByTestId('goto-consultar')

  return {
    // Locators públicos
    nameInput,
    surnameInput,
    emailInput,
    phoneInput,
    cpfInput,
    storeSelect,
    termsCheckbox,
    submitButton,
    successStatus,
    orderIdDisplay,

    async fillForm(data: CheckoutFormData) {
      await nameInput.fill(data.name)
      await surnameInput.fill(data.surname)
      await emailInput.fill(data.email)
      await phoneInput.fill(data.phone)
      await cpfInput.fill(data.cpf)
      await storeSelect.click()
      await page.getByRole('option', { name: data.store }).click()
    },

    async acceptTerms() {
      await termsCheckbox.click()
    },

    async submit() {
      await submitButton.click()
    },

    async assertSuccess() {
      await expect(successStatus).toBeVisible()
    },

    async getOrderNumber(): Promise<string> {
      const text = (await orderIdDisplay.innerText()).trim()
      expect(text).toMatch(/^VLO-[A-Z0-9]{6}$/)
      return text
    },

    async goToOrderLookup() {
      await goToOrderLookupLink.click()
    },
  }
}
