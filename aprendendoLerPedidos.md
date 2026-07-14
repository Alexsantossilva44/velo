# Aprendendo a ler `pedidos.spec.ts`

Este documento explica, linha a linha (ou bloco a bloco, quando faz mais sentido),
o arquivo `playwright/e2e/pedidos.spec.ts`. A ideia é você conseguir ler o
arquivo sozinho depois e entender o "porquê" de cada trecho, não só o "o quê".

---

## 1. Imports (linhas 1-4)

```ts
import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { generateOrderCode } from '../support/helpers'
import { E2E_TEST_EMAIL, createTestOrder, deleteTestOrder } from '../helpers/orders'
```

- **Linha 1** — `import type { Page }`: importa só o **tipo** `Page` do Playwright (o
  `import type` some completamente no JavaScript final — existe só pro
  TypeScript checar tipos em tempo de compilação). Usamos esse tipo para
  anotar o parâmetro da função `searchOrder` (linha 8).
- **Linha 2** — `test` e `expect` **não** vêm direto de `@playwright/test`, vêm de
  `../fixtures/test`. Isso é importante: esse arquivo local (`playwright/fixtures/test.ts`)
  pega o `test` original do Playwright e "estende" ele com fixtures extras
  (dados/objetos que o Playwright injeta automaticamente nos testes, tipo o
  `page`). Quem usa `test` desse import ganha acesso a essas fixtures extras.
- **Linha 3** — `generateOrderCode`: função que gera um código de pedido no
  formato `VLO-XXXXXX` (3 letras + 6 caracteres alfanuméricos), só que **sem**
  inserir nada no banco. Serve pra simular um pedido que nunca existiu.
- **Linha 4** — três coisas vindas de `playwright/helpers/orders.ts`:
  - `E2E_TEST_EMAIL`: e-mail fixo usado em todo pedido de teste, pra
    conseguirmos identificar (e depois apagar) o que foi criado por teste.
  - `createTestOrder(status)`: insere um pedido de verdade no Supabase com o
    status que você passar (`APROVADO`, `REPROVADO` ou `EM_ANALISE`) e devolve
    o `order_number` gerado.
  - `deleteTestOrder(orderNumber)`: remove esse pedido do banco depois do teste.

---

## 2. Comentário AAA (linha 6)

```ts
/// AAA - Arrange, Act, Assert
```

Lembrete do padrão usado nos testes: **Arrange** (prepara o cenário), **Act**
(executa a ação que queremos testar), **Assert** (verifica o resultado). Você
vai ver esses três comentários espalhados nos testes abaixo.

---

## 3. Helper `searchOrder` (linhas 8-11)

```ts
async function searchOrder(page: Page, orderNumber: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}
```

Uma função auxiliar simples, não é um teste — é código reaproveitado por
**três** testes diferentes deste arquivo (evita repetir essas duas linhas em
todo lugar).

- `page.getByRole('textbox', { name: '...' })`: localiza um elemento pelo seu
  **papel de acessibilidade** (`role`) e pelo texto acessível associado (label,
  `aria-label`, etc.) — é a forma recomendada pelo Playwright de localizar
  elementos, porque testa a página do jeito que um leitor de tela (ou um
  usuário) "enxerga" ela, não pelo detalhe de implementação (classe CSS, id).
- `.fill(orderNumber)`: digita o texto no campo.
- `page.getByRole('button', { name: 'Buscar Pedido' })`: localiza o botão de
  busca pelo texto visível.
- `.click()`: clica.

---

## 4. `test.describe` e `beforeEach` (linhas 13-20)

```ts
test.describe('Consulta de Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()
  })
```

- `test.describe('Consulta de Pedidos', ...)`: agrupa testes relacionados sob
  um nome comum (aparece no relatório como prefixo, ex:
  `Consulta de Pedidos › deve consultar um pedido aprovado`).
- `test.beforeEach(async ({ page }) => {...})`: roda **antes de cada teste**
  que estiver dentro deste `describe`. Aqui ele:
  1. Navega pra home (`page.goto('/')`).
  2. Confere que a home carregou de verdade, checando o texto "Velô Sprint"
     no heading dentro do elemento com `data-testid="hero-section"`.
  3. Clica no link "Consultar Pedido" (que leva pra página de busca).
  4. Confirma que a página de busca carregou (heading "Consultar Pedido"
     visível).
- `{ page }` é a **fixture** `page` do Playwright — uma aba de navegador
  isolada, criada automaticamente para cada teste. O Playwright a injeta como
  parâmetro; você não precisa criar/fechar ela manualmente.

Sem esse `beforeEach`, cada teste teria que repetir essas 4 linhas de
navegação — outro exemplo de "não repetir o que é comum a todos os testes".

---

## 5. `statusCases`: os dados dos 3 cenários de status (linhas 22-46)

```ts
const statusCases = [
  {
    status: 'APROVADO',
    label: 'aprovado',
    badgeBg: /bg-green-100/,
    badgeText: /text-green-700/,
    icon: /lucide-circle-check-big/,
  },
  { status: 'REPROVADO', label: 'reprovado', badgeBg: /bg-red-100/, badgeText: /text-red-700/, icon: /lucide-circle-x/ },
  { status: 'EM_ANALISE', label: 'em análise', badgeBg: /bg-amber-100/, badgeText: /text-amber-700/, icon: /lucide-clock/ },
] as const
```

Isso **não** é um teste — é só um array de dados. A ideia: os três testes de
status (aprovado/reprovado/em análise) fazem exatamente a mesma sequência de
passos, só mudam os valores esperados. Em vez de escrever o mesmo teste três
vezes (copiar e colar, que é fonte de bug quando você esquece de atualizar uma
das cópias), a gente descreve **o que muda** entre os casos:

- `status`: o valor real que vai pro banco (usado por `createTestOrder`).
- `label`: usado só pra compor o nome do teste no relatório.
- `badgeBg` / `badgeText`: regex das classes CSS Tailwind que o badge de
  status deve ter (cor de fundo e cor do texto).
- `icon`: regex da classe do ícone SVG (a biblioteca `lucide-react` gera uma
  classe `lucide-<nome-do-icone>` em cada ícone, ex: `lucide-clock`).

`as const` trava o TypeScript pra tratar os valores como literais exatos
(`'APROVADO'`, não `string` genérico) — importante porque `createTestOrder`
espera um dos três valores específicos, não uma string qualquer.

---

## 6. O loop que gera os 3 testes de status (linhas 48-95)

```ts
for (const { status, label, badgeBg, badgeText, icon } of statusCases) {
  test(`deve consultar um pedido ${label}`, async ({ page }) => {
    const orderNumber = await createTestOrder(status)

    try {
      // Act
      await searchOrder(page, orderNumber)

      // Assert
      await expect(page.getByTestId(`order-result-${orderNumber}`)).toMatchAriaSnapshot(`...`)

      const statusBadge = page.getByRole('status').filter({ hasText: status })
      await expect(statusBadge).toHaveClass(badgeBg)
      await expect(statusBadge).toHaveClass(badgeText)
      await expect(statusBadge.locator('svg')).toHaveClass(icon)
    } finally {
      await deleteTestOrder(orderNumber)
    }
  })
}
```

- **`for (const {...} of statusCases)`**: um `for...of` normal do JavaScript,
  rodando no momento em que o **arquivo é carregado** (não durante a execução
  dos testes). Cada iteração chama `test(...)`, registrando um teste novo no
  Playwright. Resultado: 3 testes distintos no relatório
  (`deve consultar um pedido aprovado`, `...reprovado`, `...em análise`),
  gerados por um único bloco de código.
- **`const orderNumber = await createTestOrder(status)`** (Arrange): cria um
  pedido de verdade no Supabase com aquele status, e guarda o número gerado
  (ex: `VLO-4F7X2A`). Isso é melhor que usar um número fixo/hardcoded, porque:
  - Não depende de nenhum registro específico já existir no banco.
  - Cada execução do teste usa um pedido novo, então testes que rodam em
    paralelo não colidem entre si.
- **`try { ... } finally { await deleteTestOrder(orderNumber) }`**: garante que
  o pedido criado seja **sempre** apagado do banco no final — seja o teste
  passando ou falhando (o bloco `finally` roda nos dois casos). Sem isso, cada
  execução da suíte deixaria lixo acumulando no Supabase.
- **`await searchOrder(page, orderNumber)`** (Act): usa o helper da seção 3
  pra preencher o campo e clicar em buscar.
- **`toMatchAriaSnapshot(...)`** (Assert, parte 1): compara a **árvore de
  acessibilidade** do elemento (`order-result-{orderNumber}`) com um "molde"
  escrito em YAML. Cada linha do molde (`- paragraph: Pedido`, `- img`, etc.)
  descreve um nó esperado (papel + texto). É uma forma de verificar a
  estrutura inteira do card de uma vez, sem escrever uma asserção separada
  para cada campo.
  - Repare no uso de template string (`` `...` ``) com `${orderNumber}`,
    `${status}` e `${E2E_TEST_EMAIL}` interpolados — o molde é montado
    dinamicamente com os valores reais do pedido criado, nunca com texto
    fixo.
- **`page.getByRole('status').filter({ hasText: status })`** (Assert, parte 2):
  localiza o elemento com `role="status"` (adicionado na `<div>` do badge em
  `OrderLookup.tsx`) que contenha o texto do status. `.filter({ hasText })`
  refina uma busca por role adicionando uma condição de texto.
- **`toHaveClass(badgeBg)` / `toHaveClass(badgeText)`**: confere se a classe
  CSS do elemento bate com a regex esperada (cor de fundo e cor do texto do
  badge).
- **`statusBadge.locator('svg')`**: dentro do badge, localiza o elemento
  `<svg>` (o ícone) e confere sua classe (`toHaveClass(icon)`) — garante que o
  ícone certo (check verde, X vermelho, relógio âmbar) está sendo mostrado
  pra cada status.

---

## 7. Teste "pedido não encontrado" (linhas 97-110)

```ts
test('deve exibir mensagem de pedido não encontrado', async ({ page }) => {
  // Test Data
  const order = generateOrderCode() // Exemplo de pedido não encontrado para teste

  // Act
  await searchOrder(page, order)

  // Assert
  const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
  await expect(title).toBeVisible()

  const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
  await expect(message).toBeVisible()
})
```

- **`generateOrderCode()`** (Test Data): aqui, ao contrário dos testes
  anteriores, o objetivo é *propositalmente* usar um número que **não existe**
  no banco — por isso não usamos `createTestOrder` (que cria de verdade).
- **`searchOrder(page, order)`** (Act): mesma busca de sempre, só que com um
  código que o Supabase não vai encontrar.
- **Assert**: confere que aparece o heading "Pedido não encontrado" e o
  parágrafo de orientação ("Verifique o número..."). Note que aqui não
  precisamos de `try/finally`/`deleteTestOrder`, porque nenhum pedido foi
  criado no banco — não há nada pra limpar.

---

## 8. Teste de fluxo real: criar e consultar (linhas 113-148)

```ts
// Fluxo real: cria o pedido pela loja e consulta usando o número gerado
// nessa mesma execução — nunca um valor fixo copiado de outra sessão.
test('deve consultar o pedido com o número gerado na criação', async ({ page }) => {
  // Arrange - completa a compra como um usuário faria
  await page.goto('/configure')
  await page.getByTestId('checkout-button').click()

  await page.getByTestId('checkout-name').fill('Maria')
  await page.getByTestId('checkout-surname').fill('Teste')
  await page.getByTestId('checkout-email').fill(E2E_TEST_EMAIL)
  await page.getByTestId('checkout-phone').fill('(11) 99999-9999')
  await page.getByTestId('checkout-cpf').fill('123.456.789-09')
  await page.getByTestId('checkout-store').click()
  await page.getByRole('option', { name: /Velô Paulista/ }).click()
  await page.getByTestId('checkout-terms').click()
  await page.getByTestId('checkout-submit').click()

  await expect(page.getByTestId('success-status')).toBeVisible()

  // Captura o número REAL gerado pela criação do pedido
  const order = (await page.getByTestId('order-id').innerText()).trim()
  expect(order).toMatch(/^VLO-[A-Z0-9]{6}$/)

  try {
    // Act - consulta usando o mesmo número capturado acima
    await page.getByTestId('goto-consultar').click()
    await searchOrder(page, order)

    // Assert
    await expect(page.getByTestId(`order-result-${order}`)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('order-number')).toContainText(order)
    await expect(page.getByTestId('order-status')).toContainText('APROVADO')
  } finally {
    await deleteTestOrder(order)
  }
})
```

Este teste é diferente dos outros: ele está **fora** do `test.describe`
(então não usa o `beforeEach` — não precisa, porque começa direto em
`/configure`, não na home). Ele reproduz o caminho **completo** que um
usuário de verdade faria: montar o carro, finalizar a compra, e só então
consultar o pedido — sem nenhum atalho por API/banco.

- **Linhas 117-128 (Arrange)**: navega até `/configure`, clica em
  `checkout-button` (avança pro formulário de pedido), preenche todos os
  campos obrigatórios (nome, sobrenome, e-mail, telefone, CPF), escolhe a
  loja no `<select>` (abre com `.click()` e escolhe a opção pelo texto via
  `getByRole('option', ...)`), marca a caixinha de termos, e envia o
  formulário (`checkout-submit`).
- **Linha 130**: confirma que a tela de sucesso apareceu
  (`data-testid="success-status"`).
- **Linha 133**: aqui está o ponto mais importante do teste — em vez de
  inventar um número de pedido, ele **lê o número real** que a aplicação
  gerou e mostrou na tela (`order-id`), com `.innerText()`, e guarda numa
  variável. É esse valor que será usado na consulta logo depois — nunca um
  valor copiado de outra sessão/manual.
- **Linha 134**: `expect(order).toMatch(/^VLO-[A-Z0-9]{6}$/)` é uma
  verificação de sanidade: confirma que o texto capturado realmente parece um
  número de pedido válido (`VLO-` + 6 caracteres maiúsculos/dígitos) antes de
  seguir. Se a página mudasse e o texto capturado viesse errado (vazio, ou
  outra coisa), o teste falharia aqui, com uma mensagem clara — em vez de
  falhar de forma confusa mais adiante, na hora de buscar.
- **`try { ... } finally { deleteTestOrder(order) }`**: mesma lógica de
  limpeza dos testes de status — mesmo esse pedido tendo sido criado pela UI
  (não por `createTestOrder`), ele ainda é uma linha real no Supabase e
  precisa ser removido no final.
- **Act**: clica em "Consultar Pedido" (`goto-consultar`, na tela de
  sucesso) e busca usando o `searchOrder` com o número **capturado** (não um
  literal).
- **Assert**: confere que o card do resultado aparece, que o número exibido
  bate com o que foi capturado, e que o status mostrado é `APROVADO` (o
  fluxo usa pagamento "à vista", que sempre aprova direto, sem passar pela
  análise de crédito).

---

## Resumo dos conceitos-chave do Playwright usados aqui

| Conceito | O que é | Onde aparece |
|---|---|---|
| `test.describe` | Agrupa testes relacionados | linha 13 |
| `test.beforeEach` | Roda antes de cada teste do grupo | linha 14 |
| Fixture `page` | Aba de navegador isolada, injetada automaticamente | em todo `async ({ page }) => {}` |
| `getByRole` | Localiza elementos pelo papel de acessibilidade (recomendado pelo Playwright) | `searchOrder`, e vários outros lugares |
| `getByTestId` | Localiza elementos por `data-testid` (usado quando não há um papel/texto natural) | `order-result-*`, `checkout-*` |
| `toMatchAriaSnapshot` | Compara a árvore de acessibilidade inteira de um elemento com um molde | linha 57 |
| `toHaveClass` | Confere se as classes CSS de um elemento batem com um valor/regex | badge de status |
| `try/finally` para limpeza | Garante que dados de teste criados sejam removidos, mesmo se o teste falhar | todos os testes que chamam `createTestOrder` |
| Fixtures customizadas (`../fixtures/test`) | Extensão do `test` do Playwright com dados extras injetáveis | linha 2 (import) |
