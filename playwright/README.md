# Testes E2E — Playwright

Testes de ponta a ponta do projeto Velô usando [Playwright](https://playwright.dev/).

## Estrutura

```
playwright/
├── e2e/
│   ├── online.spec.ts    # smoke test — app no ar
│   └── pedidos.spec.ts   # consulta de pedidos em /lookup
├── fixtures/
│   └── test.ts           # fixture opcional (approvedOrderId)
├── helpers/
│   └── orders.ts         # cria e remove pedidos de teste no Supabase
└── README.md
```

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

### `pedidos.spec.ts`
- **consulta pedido aprovado** — cria pedido no banco, busca em `/lookup`, valida ID e status
- **pedido não encontrado** — ID inválido exibe mensagem de erro
- **botão desabilitado** — sem número no campo, botão "Buscar Pedido" fica desabilitado

## Seletores

Os testes usam seletores semânticos (`getByLabel`, `getByRole`, `getByText`), sem depender de `data-testid` nos campos de busca e resultado.

## Configuração

Ver `playwright.config.ts` na raiz:
- `baseURL`: `http://localhost:5173`
- `webServer`: inicia `yarn dev` se o servidor não estiver rodando
- `.env` carregado automaticamente para os helpers do Supabase
