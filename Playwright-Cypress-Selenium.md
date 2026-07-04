# Estudo Comparativo: Playwright vs Selenium vs Cypress

> Pesquisa sobre as principais ferramentas de automação de testes end-to-end (E2E) para web, com foco em arquitetura, performance, recursos e indicação de uso para QAs em 2026.

---

## 1. Visão Geral

| Ferramenta | Lançamento | Criador | Linguagem principal | Protocolo de comunicação |
|---|---|---|---|---|
| **Selenium** | 2004 | Comunidade open source | Java, Python, C#, JavaScript, Ruby, Kotlin, PHP | WebDriver (HTTP) / WebDriver BiDi |
| **Cypress** | 2017 | Cypress.io | JavaScript / TypeScript | Executa dentro do navegador (mesmo event loop da app) |
| **Playwright** | 2020 | Microsoft (equipe que criou o Puppeteer) | JavaScript, TypeScript, Python, Java, C# | Chrome DevTools Protocol (CDP) / WebSocket (sem overhead HTTP) |

---

## 2. Arquitetura

### Selenium
Selenium se comunica com o navegador através do protocolo **WebDriver**, que envia comandos HTTP para um *driver* específico de cada navegador (ChromeDriver, GeckoDriver etc.). Essa camada extra de comunicação é o principal motivo de ele ser historicamente o mais lento e mais suscetível a testes instáveis (*flaky tests*), embora as versões mais recentes (Selenium 4.4x) já suportem o protocolo **WebDriver BiDi**, reduzindo essa distância.

### Cypress
Cypress roda **dentro do próprio navegador**, no mesmo *event loop* da aplicação sendo testada. Isso elimina a latência de rede e dá acesso direto ao DOM, resultando em um debug muito rápido e um recurso famoso chamado *time-travel debugging* (permite "voltar no tempo" e ver o estado da aplicação em cada passo do teste).

### Playwright
Playwright se conecta diretamente aos navegadores usando os protocolos nativos de cada engine — CDP para Chromium, uma versão adaptada do Marionette para Firefox e o protocolo de inspeção do WebKit para Safari — tudo via **WebSocket persistente**, sem overhead de HTTP. Isso o torna, tecnicamente, o mais rápido dos três atualmente.

---

## 3. Comparativo de Recursos

| Critério | Selenium | Cypress | Playwright |
|---|---|---|---|
| **Navegadores suportados** | Chrome, Firefox, Edge, Safari e navegadores legados | Chromium, Firefox (WebKit experimental/limitado) | Chromium, Firefox e WebKit (Safari) nativamente |
| **Testes mobile nativos (Android/iOS)** | Sim, via Appium (padrão de mercado) | Não (apenas emulação de viewport) | Não (apenas emulação de dispositivo) |
| **Execução em paralelo** | Via Selenium Grid (própria infra ou nuvem) | Nativa em single-thread; paralelismo real exige Cypress Cloud (pago) | Nativa, sem necessidade de grid, sharding gratuito |
| **Auto-wait (espera automática por elementos)** | Parcial, geralmente exige waits explícitos | Sim, nativo | Sim, com verificação de "actionability" (visível, habilitado, estável) |
| **Debug / Observabilidade** | Básico | Excelente (time-travel debugger) | Excelente (Trace Viewer: snapshots de DOM, rede e console) |
| **Suporte a múltiplas abas/janelas** | Sim | Limitado | Sim, nativo |
| **Testes de API** | Suporte limitado | Suporte básico | Suporte robusto embutido |
| **Geração automática de testes (codegen)** | Selenium IDE (gravação simples) | Recurso de IA em beta (cy.prompt) | Playwright Codegen (gravação + exportação para várias linguagens) |
| **Curva de aprendizado** | Moderada a alta (setup de drivers) | Baixa (só JS/TS) | Baixa a moderada |
| **Custo** | Gratuito (infraestrutura de paralelismo pode gerar custo) | Gratuito, mas paralelismo avançado é pago (Cypress Cloud) | Gratuito, paralelismo nativo incluso |
| **Adoção em 2026** | ~22% entre QAs (em queda) | ~14% (estável) | ~45% (em forte crescimento) |

---

## 4. Pontos Fortes e Fracos

### Selenium
**Fortes:**
- Suporte à mais ampla gama de linguagens e navegadores, inclusive legados.
- Integração nativa com Appium para automação mobile real (Android/iOS).
- Ecossistema maduro, décadas de comunidade e documentação.

**Fracos:**
- Setup mais trabalhoso (drivers, versões de navegador).
- Historicamente mais lento e mais propenso a testes instáveis.
- Paralelismo exige infraestrutura adicional (Grid).

### Cypress
**Fortes:**
- Excelente experiência de desenvolvedor (DX) e debug em tempo real.
- Auto-wait nativo reduz boa parte da instabilidade dos testes.
- Ótimo para times 100% JavaScript/TypeScript testando SPAs.

**Fracos:**
- Sem suporte real a testes mobile nativos.
- Suporte limitado/experimental ao Safari (WebKit).
- Paralelismo sério depende do Cypress Cloud (pago).
- Não suporta múltiplas abas com a mesma fluidez que os concorrentes.

### Playwright
**Fortes:**
- Mais rápido e com menos testes instáveis segundo benchmarks recentes.
- Suporte nativo real aos três motores de navegador (Chromium, Firefox, WebKit).
- Paralelismo e sharding nativos, sem custo adicional.
- Multi-linguagem (JS/TS, Python, Java, C#), facilitando adoção em times heterogêneos.
- Trace Viewer é um dos melhores recursos de debug pós-falha do mercado.
- Ecossistema de IA em rápida expansão (ex: Playwright MCP).

**Fracos:**
- Comunidade menor que a do Selenium (embora crescendo rapidamente).
- Não substitui o Appium para automação mobile nativa.
- Ferramenta mais nova, então times de QA mais tradicionais ainda estão migrando.

---

## 5. Quando Escolher Cada Ferramenta

- **Escolha Selenium se:** você trabalha em um ambiente corporativo com múltiplas linguagens (Java, Python, C#, Ruby), precisa manter uma suíte legada já consolidada, ou depende do Appium para testes mobile nativos.
- **Escolha Cypress se:** seu time é 100% JavaScript/TypeScript, foca em uma única aplicação SPA e prioriza a experiência de debug local em detrimento de cobertura ampla de navegadores.
- **Escolha Playwright se:** você está começando um projeto novo, precisa de cobertura cross-browser real (incluindo Safari), quer paralelismo sem custo extra e busca a melhor relação performance/estabilidade/DX disponível hoje.

---

## 6. Conclusão: Qual é a Melhor Ferramenta Hoje?

Com base nos dados de adoção, benchmarks de performance e tendências de mercado em 2026, o **Playwright** é hoje a ferramenta mais recomendada para a maioria dos QAs e times de automação:

- É **mais rápido** que Selenium e Cypress em benchmarks recentes, graças à comunicação direta via WebSocket/CDP.
- Produz **significativamente menos testes instáveis** (flaky tests) que Cypress e Selenium, graças ao auto-wait com verificação de "actionability".
- Suporta **os três principais motores de navegador nativamente** (Chromium, Firefox e WebKit/Safari), algo que nem Selenium (mais lento) nem Cypress (suporte limitado ao Safari) entregam com a mesma qualidade.
- Tem **paralelismo nativo e gratuito**, reduzindo o custo total de propriedade (TCO) em comparação ao Selenium Grid e ao Cypress Cloud.
- É **multi-linguagem** (JS/TS, Python, Java, C#), o que facilita a adoção em times com perfis técnicos diferentes — um ponto relevante, por exemplo, para quem já vem de um background Java, como é o caso de projetos backend em Spring Boot.
- Está com a **adoção em forte crescimento** (ultrapassou Selenium e Cypress em downloads npm e em pesquisas de adoção entre profissionais de QA em 2026), o que também significa mais vagas, mais conteúdo e mais suporte de comunidade no médio prazo.

**Ressalva importante:** isso não significa que Selenium ou Cypress estejam obsoletos. Selenium continua sendo a opção certa quando há necessidade de testes mobile nativos via Appium ou suítes legadas já consolidadas em ambientes corporativos regulados. Cypress ainda é uma excelente escolha para times 100% front-end/JavaScript que valorizam a experiência de debug local. Inclusive, uma tendência forte em 2026 é a **adoção híbrida**: 74,6% dos times de QA já usam duas ou mais ferramentas de automação ao mesmo tempo, combinando Playwright para testes web modernos com Selenium+Appium para mobile, por exemplo.

**Recomendação final:** para projetos novos, comece com **Playwright**. Ele reúne hoje o melhor equilíbrio entre performance, estabilidade, cobertura de navegadores e custo, sendo o "default" mais seguro para um QA que está automatizando um projeto do zero em 2026.

---

## Fontes

Pesquisa realizada com base em artigos e comparativos publicados entre março e junho de 2026, incluindo dados de adoção (State of JS, TestDino, ThinkSys), benchmarks de performance (TestDino, Vervali Systems, ARDURA Consulting) e análises técnicas de arquitetura das três ferramentas.
