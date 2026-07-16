# Aprendendo a ler `pedidos.spec.ts`

Este documento explica, linha a linha (ou bloco a bloco, quando faz mais sentido),
o arquivo `playwright/e2e/pedidos.spec.ts`. A ideia é você conseguir ler o
arquivo sozinho depois e entender o "porquê" de cada trecho, não só o "o quê".

---

## 1. Imports (linhas 1-4)

```ts
import { test, expect } from '../fixtures/test'
import { generateOrderCode } from '../support/helpers'
import { E2E_TEST_EMAIL, createTestOrder, deleteTestOrder } from '../helpers/orders'
import { OrderLookupPage } from '../pages/OrderLookupPage'
```

- **Linha 1** — `test` e `expect` **não** vêm direto de `@playwright/test`, vêm de
  `../fixtures/test`. Isso é importante: esse arquivo local (`playwright/fixtures/test.ts`)
  pega o `test` original do Playwright e "estende" ele com fixtures extras
  (dados/objetos que o Playwright injeta automaticamente nos testes, tipo o
  `page`). Quem usa `test` desse import ganha acesso a essas fixtures extras.
- **Linha 2** — `generateOrderCode`: função que gera um código de pedido no
  formato `VLO-XXXXXX` (3 letras + 6 caracteres alfanuméricos), só que **sem**
  inserir nada no banco. Serve pra simular um pedido que nunca existiu.
- **Linha 3** — três coisas vindas de `playwright/helpers/orders.ts`:
  - `E2E_TEST_EMAIL`: e-mail fixo usado em todo pedido de teste, pra
    conseguirmos identificar (e depois apagar) o que foi criado por teste.
  - `createTestOrder(status)`: insere um pedido de verdade no Supabase com o
    status que você passar (`APROVADO`, `REPROVADO` ou `EM_ANALISE`) e devolve
    o `order_number` gerado.
  - `deleteTestOrder(orderNumber)`: remove esse pedido do banco depois do teste.
- **Linha 4** — `OrderLookupPage`: a classe de **Page Object** que encapsula
  todas as interações com a página de consulta de pedidos. Ver seção 3 abaixo.

---

## 2. Comentário AAA (linha 6)

```ts
/// AAA - Arrange, Act, Assert
```

Lembrete do padrão usado nos testes: **Arrange** (prepara o cenário), **Act**
(executa a ação que queremos testar), **Assert** (verifica o resultado). Você
vai ver esses três comentários espalhados nos testes abaixo.

---

## 3. Page Object `OrderLookupPage` (`playwright/pages/OrderLookupPage.ts`)

Em vez de uma função solta `searchOrder` no topo do spec, a refatoração
extraiu um **Page Object** — uma classe que agrupa todas as interações com
uma página específica. O padrão se chama **Page Object Model (POM)** e é
a abordagem recomendada pelo Playwright para organizar testes maiores.

```ts
export class OrderLookupPage {
  constructor(private page: Page) {}

  async search(orderNumber: string) { ... }
  async assertOrderResult({ orderNumber, status, email, badgeBg, badgeText, icon }) { ... }
}
```

**Por que Page Object?**

- Os testes ficam legíveis como linguagem de negócio (`lookup.search(...)`,
  `lookup.assertOrderResult(...)`) em vez de misturar detalhes do Playwright
  diretamente no spec.
- Se o HTML da página mudar (ex: o label do campo virar "Código do Pedido"),
  você corrige **só dentro do Page Object** — todos os testes que o usam ficam
  corrigidos automaticamente.
- O spec se torna mais curto e fácil de ler.

**`search(orderNumber)`** — encapsula os dois passos de busca:

- `page.getByRole('textbox', { name: 'Número do Pedido' })`: localiza o campo
  pelo seu **papel de acessibilidade** (`role`) e pelo label associado — forma
  recomendada pelo Playwright, porque testa como um usuário (ou leitor de tela)
  enxerga a página, não por classe CSS ou id.
- `.fill(orderNumber)`: digita o texto no campo.
- `page.getByRole('button', { name: 'Buscar Pedido' }).click()`: clica no botão.

**`assertOrderResult({...})`** — encapsula as duas verificações do card de resultado:

1. `toMatchAriaSnapshot(...)`: compara a árvore de acessibilidade inteira do
   card com um molde YAML. Os valores dinâmicos (`orderNumber`, `status`,
   `email`) são interpolados na template string, nunca fixos.
2. As três asserções do badge de status (`toHaveClass` para cor de fundo, cor
   do texto e classe do ícone SVG).

No spec, o uso fica assim:

```ts
const lookup = new OrderLookupPage(page)
await lookup.search(orderNumber)
await lookup.assertOrderResult({ orderNumber, status, email: E2E_TEST_EMAIL, badgeBg, badgeText, icon })
```

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

## 6. O loop que gera os 3 testes de status (linhas 43-55)

```ts
for (const { status, label, badgeBg, badgeText, icon } of statusCases) {
  test(`deve consultar um pedido ${label}`, async ({ page }) => {
    const lookup = new OrderLookupPage(page)
    const orderNumber = await createTestOrder(status)

    try {
      await lookup.search(orderNumber)
      await lookup.assertOrderResult({ orderNumber, status, email: E2E_TEST_EMAIL, badgeBg, badgeText, icon })
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
- **`const lookup = new OrderLookupPage(page)`**: instancia o Page Object
  passando a `page` do Playwright. A partir daí, todas as interações com a
  página de consulta passam por `lookup`.
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
- **`lookup.search(orderNumber)`** (Act): delega para o Page Object preencher
  o campo e clicar em buscar (ver seção 3).
- **`lookup.assertOrderResult({...})`** (Assert): delega para o Page Object as
  duas verificações — o aria snapshot completo do card e as classes do badge de
  status. O spec passa os valores que variam por cenário (`orderNumber`,
  `status`, `email`, `badgeBg`, `badgeText`, `icon`); a lógica de como verificar
  fica encapsulada no Page Object.

O bloco que antes ocupava ~40 linhas no spec agora ocupa 3 linhas — sem perder
nenhuma cobertura, porque toda a lógica de asserção foi movida para
`OrderLookupPage.assertOrderResult`.

---

## 7. Teste "pedido não encontrado" (linhas 57-68)

```ts
test('deve exibir mensagem de pedido não encontrado', async ({ page }) => {
  const lookup = new OrderLookupPage(page)
  const order = generateOrderCode()

  await lookup.search(order)

  const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
  await expect(title).toBeVisible()

  const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
  await expect(message).toBeVisible()
})
```

- **`generateOrderCode()`** (Test Data): aqui, ao contrário dos testes
  anteriores, o objetivo é *propositalmente* usar um número que **não existe**
  no banco — por isso não usamos `createTestOrder` (que cria de verdade).
- **`lookup.search(order)`** (Act): mesmo Page Object, mesma busca — só que com
  um código que o Supabase não vai encontrar.
- **Assert**: confere que aparece o heading "Pedido não encontrado" e o
  parágrafo de orientação ("Verifique o número..."). Note que aqui não
  precisamos de `try/finally`/`deleteTestOrder`, porque nenhum pedido foi
  criado no banco — não há nada pra limpar. Também não usamos
  `assertOrderResult`, pois o cenário é de erro — não existe card de resultado
  pra verificar.

---

## 8. Teste de fluxo real: criar e consultar (linhas 71-108)

```ts
test('deve consultar o pedido com o número gerado na criação', async ({ page }) => {
  const lookup = new OrderLookupPage(page)

  // Arrange - completa a compra como um usuário faria
  await page.goto('/configure')
  await page.getByTestId('checkout-button').click()
  // ... preenche formulário ...
  await page.getByTestId('checkout-submit').click()

  await expect(page.getByTestId('success-status')).toBeVisible()

  const order = (await page.getByTestId('order-id').innerText()).trim()
  expect(order).toMatch(/^VLO-[A-Z0-9]{6}$/)

  try {
    await page.getByTestId('goto-consultar').click()
    await lookup.search(order)

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

- **`const lookup = new OrderLookupPage(page)`**: o Page Object é instanciado
  no início do teste, antes de navegar. Pode ser reusado em qualquer momento
  do teste quando a página de consulta for relevante.
- **Arrange** (linhas do formulário): navega até `/configure`, clica em
  `checkout-button`, preenche todos os campos obrigatórios (nome, sobrenome,
  e-mail, telefone, CPF), escolhe a loja no `<select>` (abre com `.click()` e
  escolhe a opção pelo texto via `getByRole('option', ...)`), marca a
  caixinha de termos, e envia o formulário (`checkout-submit`).
- **`success-status` visível**: confirma que a tela de sucesso apareceu.
- **Leitura do número real**: em vez de inventar um número de pedido, o teste
  **lê o número real** que a aplicação gerou e mostrou na tela (`order-id`),
  com `.innerText()`, e guarda numa variável. É esse valor que será usado na
  consulta — nunca um valor copiado de outra sessão/manual.
- **`expect(order).toMatch(/^VLO-[A-Z0-9]{6}$/)`**: verificação de sanidade —
  confirma que o texto capturado realmente é um número de pedido válido antes
  de seguir. Se a página mudasse e o texto viesse errado (vazio, ou outra
  coisa), o teste falharia aqui, com mensagem clara, em vez de falhar de forma
  confusa na busca.
- **`try { ... } finally { deleteTestOrder(order) }`**: mesma lógica de
  limpeza dos testes de status — mesmo esse pedido tendo sido criado pela UI
  (não por `createTestOrder`), ele ainda é uma linha real no Supabase e
  precisa ser removido no final.
- **Act**: clica em "Consultar Pedido" (`goto-consultar`, na tela de sucesso)
  e usa `lookup.search(order)` com o número **capturado** (não um literal).
- **Assert**: aqui usamos `getByTestId` diretamente (não `assertOrderResult`),
  porque neste teste só precisamos confirmar que o card existe e que o status
  é `APROVADO` — não a estrutura completa do aria snapshot. O fluxo usa
  pagamento "à vista", que sempre aprova direto, sem passar pela análise de
  crédito.

---

## Resumo dos conceitos-chave do Playwright usados aqui

| Conceito | O que é | Onde aparece |
|---|---|---|
| `test.describe` | Agrupa testes relacionados | linha 8 |
| `test.beforeEach` | Roda antes de cada teste do grupo | linha 9 |
| Fixture `page` | Aba de navegador isolada, injetada automaticamente | em todo `async ({ page }) => {}` |
| **Page Object Model** | Classe que encapsula interações de uma página — separa "como interagir" de "o que testar" | `OrderLookupPage` (seção 3) |
| `getByRole` | Localiza elementos pelo papel de acessibilidade (recomendado pelo Playwright) | `OrderLookupPage.search`, e vários outros lugares |
| `getByTestId` | Localiza elementos por `data-testid` (usado quando não há um papel/texto natural) | `order-result-*`, `checkout-*` |
| `toMatchAriaSnapshot` | Compara a árvore de acessibilidade inteira de um elemento com um molde | `OrderLookupPage.assertOrderResult` |
| `toHaveClass` | Confere se as classes CSS de um elemento batem com um valor/regex | badge de status (dentro do Page Object) |
| `try/finally` para limpeza | Garante que dados de teste criados sejam removidos, mesmo se o teste falhar | todos os testes que chamam `createTestOrder` |
| Fixtures customizadas (`../fixtures/test`) | Extensão do `test` do Playwright com dados extras injetáveis | linha 1 (import) |


O benefício real do Page Object.

Imagine que o label do campo muda de "Número do Pedido" para "Código do Pedido".

- Sem POM: você procura em todos os testes e corrige em 3, 4, 5 lugares.
- Com POM: corrige só dentro de OrderLookupPage.search(). Todos os testes que usam lookup.search() ficam corrigidos automaticamente.

---
Quando vale a pena criar

- Quando 2 ou mais testes interagem com a mesma página da mesma forma.
- Quando o bloco de interação/assertion tem mais de ~5 linhas e se repetiria.
- Quando a página é complexa o suficiente pra ter vários fluxos (busca, resultado, erro).

Para um teste único e simples, usar o Page Object seria over-engineering — o getByRole direto é mais claro.