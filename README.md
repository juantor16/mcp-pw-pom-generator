
# 🧠 MCP POM Generator

Welcome to **MCP POM Generator**, an experimental and powerful tool to scan websites, auto-generate optimized **Page Object Model (POM)** files for **Playwright**, and visually highlight which elements are correctly mapped, missing, or broken. 🔍💥

> ⚡️ Built to accelerate E2E automation like never before.

---

## 🚀 Features

- 🔎 Scans public and **private (post-authentication)** pages from a site automatically.
- 🔐 **Supports sites with complex authentication** via integration with Playwright Global Setup.
- 🧬 Generates POM classes in TypeScript, ready for Playwright.
- ✅ Prioritizes `data-testid`, roles (`getByRole`), labels (`getByLabel`), placeholders (`getByPlaceholder`), and other accessible attributes.
- 🟩 Interactive visual overlay (`compare.ts`) with:
  - 🟩 **Green**: found elements defined in the POM.
  - 🟥 **Red**: POM locators not found on the page (logged in console).
  - 🟦 **Blue**: interactive elements found on the page but not mapped in the POM.
- 📂 Outputs saved in `src/output/`.
- 💻 Visual validation in the browser.
- 📋 Clean CLI reporting for debugging.

---

## 🛠 Installation

```bash
git clone https://github.com/juantor16/mcp-pom-generator.git
cd mcp-pom-generator
npm install
```

---

## ⚙️ Usage

### 1. Generate POM for a Single Page (no login required)

```bash
# Analyze a public page and generate POM in src/output/
npx ts-node src/cli.ts -u https://your-site.com/public-page

# Optional: specify output file and highlight mapped elements
npx ts-node src/cli.ts -u https://your-site.com -o myPage.ts --highlight
```

---

### 2. Multiple Page Crawl (Public or Authenticated Sites)

#### a. (If login is required) Configure Playwright Global Setup

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

const STORAGE_STATE = 'storageState.json';

export default defineConfig({
  globalSetup: require.resolve('./src/global.setup.ts'),
  projects: [
    {
      name: 'mcp-crawler-setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'mcp-crawler-main',
      use: {
        storageState: STORAGE_STATE,
      },
    },
  ],
});
```

Create `src/global.setup.ts` with your login logic using Playwright. Make sure to save the session using:

```ts
await page.context().storageState({ path: 'storageState.json' });
```

> **Tip**: Use `process.env` for secure credentials.

Add `storageState.json` to your `.gitignore`.

Run the setup script:

```bash
npx playwright test --project=mcp-crawler-setup
```

#### b. Start the MCP Server

```bash
npx ts-node src/mcpServer.ts
```

Server will listen at `http://localhost:3001`.

#### c. Send the Crawl Request

```json
POST http://localhost:3001/crawl
{
  "url": "https://your-site.com"
}
```

This will generate POMs for all navigated pages in `src/output/`.

---

### 3. Compare a POM with the Live Page

```bash
npx ts-node src/compare.ts --url=https://your-site.com/dashboard --pom=src/output/dashboard.ts
```

- 🟩 Green: POM locator found.
- 🟥 Red: POM locator NOT found (logged in console).
- 🟦 Blue: interactive element on the page but missing in the POM.

---

## ✨ Visual Example

> _(Optional image here showing the comparison on an authenticated page)_  
> _Add it like this:_  
> `![Comparison Example](./docs/example-compare.png)`

---

## 🧪 Roadmap

- [x] Auto-generate POMs per page
- [x] Visual validation of locators (`compare.ts`)
- [x] Authentication handling via Global Setup
- [ ] DevTools-like visual mode for interactive exploration
- [ ] CLI to compare POM versions
- [ ] Auto-push updated POMs to a remote repo
- [ ] Web UI to manage and visualize POMs

---

## 🧠 Why MCP?

> _"Because a POM is useless if you don’t know if it works."_

---

## 👨‍💻 Author

**Juan Torres**  
🔗 [linkedin.com/in/juantor16](https://linkedin.com/in/juantor16)  
QA Engineer | Automation Lover | 🇦🇷

---

## ⚠️ License

**MIT** – Use it, improve it, and share it 🚀

---

## ⭐ Was it useful?

Please consider starring the repo! 🌟
