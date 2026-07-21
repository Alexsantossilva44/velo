# Testes E2E — Playwright

Testes de ponta a ponta do projeto Velô usando [Playwright](https://playwright.dev/).

## Estrutura

```
playwright/
├── e2e/
│   ├── online.spec.ts            # smoke test — app no ar
│   ├── configurador.spec.ts      # configuração do veículo em /configure
│   └── pedidos.spec.ts           # consulta de pedidos em /lookup
├── helpers/
│   └── orders.ts                 # cria e remove pedidos de teste no Supabase
├── support/
│   ├── actions/
│   │   ├── configuradorActions.ts  # ações da página de configuração
│   │   ├── checkoutActions.ts      # ações do fluxo de checkout/pedido
│   │   └── orderLookupActions.ts   # ações da consulta de pedidos
│   ├── fixtures.ts               # fixtures customizadas (app, approvedOrderId)
│   └── helpers.ts                # funções utilitárias (ex: generateOrderCode)
└── README.md
```

## Padrão Feature Actions

Cada feature da aplicação tem um arquivo de actions em `support/actions/` que encapsula:

- **Locators reutilizáveis** — expostos para assertions diretas nos specs
- **Ações de interação** — cliques, preenchimentos, toggles
- **Assertions semânticas** — validações tipadas e legíveis

Os specs acessam tudo via fixture `app`:

```typescript
test('exemplo', async ({ app }) => {
  await app.configurador.open()
  await app.configurador.selectColor('Midnight Black')
  await app.configurador.assertPrice('R$ 40.000,00')
})
```

Para criar um novo módulo de actions:

1. Crie `support/actions/<feature>Actions.ts` com uma factory `createXxxActions(page)`
2. Registre em `support/fixtures.ts` no tipo `App` e na fixture `app`

## Pré-requisitos

1. Arquivo `.env` na raiz com as variáveis do Supabase (mesmas do frontend)
2. Migrações aplicadas: `yarn supabase db push`

Os testes de pedido usam o helper `orders.ts`, que insere registros com email `e2e-test@velo.local` e remove ao final. A migration `20260704180000_e2e_orders_delete_policy.sql` permite esse cleanup.

## Rodar os testes

```bash
# todos os testes (sobe o Vite automaticamente se necessário)
yarn playwright test

# só consulta de pedidos
yarn playwright test pedidos.spec.ts

# configurador
yarn playwright test configurador.spec.ts

# interface visual
yarn playwright test --ui

# passo a passo com inspector
yarn playwright test --debug

# gravar ações no navegador
yarn playwright codegen http://localhost:5173
```

## O que cada teste cobre

### `online.spec.ts`
- Acessa `/` e verifica o título da página

### `configurador.spec.ts`
- **trocar cor** — altera a cor e valida imagem + preço preservado
- **trocar rodas** — sport wheels atualiza preço, aero wheels restaura
- **opcionais** — ativa/desativa opcionais e valida acúmulo de preço

### `pedidos.spec.ts`
- **consulta pedido aprovado/reprovado/em análise** — cria pedido no banco, busca em `/lookup`, valida card completo
- **pedido não encontrado** — ID inválido exibe mensagem de erro
- **botão desabilitado** — sem número no campo, botão "Buscar Pedido" fica desabilitado
- **fluxo completo** — configura veículo, faz checkout, consulta o pedido gerado

## Seletores

Os testes usam seletores semânticos (`getByLabel`, `getByRole`, `getByText`), sem depender de `data-testid` nos campos de busca e resultado.

## Configuração

Ver `playwright.config.ts` na raiz:
- `baseURL`: `http://localhost:5173`
- `webServer`: inicia `yarn dev` se o servidor não estiver rodando
- `.env` carregado automaticamente para os helpers do Supabase
