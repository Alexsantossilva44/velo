import { Page, expect } from '@playwright/test'

export function createOrderLookupActions(page: Page) {
  return {
    async open() {
      await page.goto('/')
      const title = page.getByTestId('hero-section').getByRole('heading')
      await expect(title).toContainText('Velô Sprint')
      await page.getByRole('link', { name: 'Consultar Pedido' }).click()
      await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    },
    async search(orderNumber: string) {
      await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
      await page.getByRole('button', { name: 'Buscar Pedido' }).click()
    },

    async assertOrderResult({
      orderNumber,
      status,
      email,
      badgeBg,
      badgeText,
      icon,
    }: {
      orderNumber: string
      status: string
      email: string
      badgeBg: RegExp
      badgeText: RegExp
      icon: RegExp
    }) {
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
        - paragraph: ${email}
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
    },
  }
}
