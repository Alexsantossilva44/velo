/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvFile() {
  const envPath = resolve(__dirname, '.env')
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^"|"$/g, '')

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Tempo máximo para cada teste completo (30 segundos é o padrão)
  timeout: 60_000,

  // Tempo máximo para cada assertion e expectativa (5 segundos por padrão)
  expect: {
    timeout: 5_000, // não vale a pena aumentar muito esse tempo, pois o ideal é que a aplicação responda rápido
  },

  testDir: './playwright/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // teste: reporter 'list' puro não escreve nada em disco, pra isolar se o travamento é na geração do html report
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */

  use: {
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Tempo máximo para cada ações interativas (como click(), fill() e etc.)
    // Quando o valor é 0, herda o limite de timeout geral do teste
    actionTimeout: 5_000,

    // Tempo máximo para cada navegação (como goto(), waitForURL() etc.)
    // Quando o valor é 0, herda o limite de timeout geral do teste
    navigationTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Chama o vite direto (não via 'yarn dev') porque no Windows o yarn spawna
    // um cmd.exe aninhado que o Playwright não consegue matar ao final, travando o processo.
    command: 'node node_modules/vite/bin/vite.js',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
