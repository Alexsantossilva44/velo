import { test } from '../support/fixtures'

// Tudo que envolve montar o veículo (cores, rodas, opcionais, preço)
test.describe('Configuração do veículo', () => {
  const priceForty = 'R$ 40.000,00'
  const priceFortyFiveFifty = 'R$ 45.500,00'

  test.beforeEach(async ({ app }) => {
    await app.configurador.open()
  })

  test('Deve atualizar a imagem e preservar o preço ao trocar a cor do veículo', async ({ app }) => {
    await app.configurador.assertPrice(priceForty)
    await app.configurador.selectColor('Midnight Black')
    await app.configurador.assertCarColor('midnight-black')
    await app.configurador.assertPrice(priceForty)
  })

  test('Deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({ app }) => {
    await app.configurador.assertPrice(priceForty)
    await app.configurador.selectSportWheels()
    await app.configurador.assertPrice('R$ 42.000,00')
    await app.configurador.selectAeroWheels()
    await app.configurador.assertPrice(priceForty)
  })

  /// Configuração do Veículo (Adição de Opcionais) e Cálculo de Preço
  test("Deve validar se a seleção de opcionais ('Precision Park' e 'Flux Capacitor') atualiza dinamicamente o preço do veículo", async ({
    app,
  }) => {
    await app.configurador.assertPrice(priceForty)

    await app.configurador.togglePrecisionPark()
    await app.configurador.assertPrice(priceFortyFiveFifty)

    await app.configurador.toggleFluxCapacitor()
    await app.configurador.assertPrice('R$ 50.500,00')

    await app.configurador.toggleFluxCapacitor()
    await app.configurador.assertPrice(priceFortyFiveFifty)

    await app.configurador.togglePrecisionPark()
    await app.configurador.assertPrice(priceForty)

    await app.configurador.goToCheckout()
    await app.configurador.assertOnCheckoutPage()
  })
})
