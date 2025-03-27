🧠 MCP POM Generator

Welcome to MCP POM Generator, an experimental and powerful tool to scan websites, auto-generate optimized Page Object Model (POM) files for Playwright, and visually highlight which elements are correctly mapped, missing, or broken. 🔍💥

> ⚡️ Built to accelerate E2E automation like never before.

---

🚀 Features

- 🔎 Scans multiple pages from a site automatically.
- 🧬 Generates POM classes in TypeScript ready for Playwright.
- ✅ Prioritizes `data-testid`, `id`, `aria-label`, `placeholder`, and other accessible attributes.
- 🟩 Interactive visual overlay with:
  - 🟩 Green: found elements
  - 🟥 Red: broken locators (locators not found will be displayed on logs for now)
  - 🟦 Blue: elements found but not yet mapped
- 📂 Saves POM classes in `src/output`.
- 💻 Visual validation in the browser.
- 📋 Clean CLI reporting for quick debugging.

---

🛠 Installation

```bash
git clone https://github.com/juantor16/mcp-pom-generator.git
cd mcp-pom-generator
npm install
```

---

⚙️ Usage

### 1. Generate POM for a single page:

```bash
npx ts-node src/analyzer.ts --url=https://your-site.com
```

### 2. Crawl multiple site routes and generate all POMs:

```bash
npx ts-node src/mcpServer.ts
```

Send a `POST` request to `http://localhost:3001/crawl` with:

```json
{
  "url": "https://your-site.com"
}
```

### 3. Compare a POM with the real page:

```bash
npx ts-node src/compare.ts --url=https://your-site.com/login --pom=src/output/login.ts
```

### Visual output in browser:
- Green: locator found
- Red: broken locator in POM
- Blue: elements found but not mapped

---

✨ Visual Example

![Visual Example](./assets/pom-visual-example.png?raw=true "Visual Example")
---

🧪 Roadmap

- [x] Auto-generate POMs per page
- [x] Visual validation of locators
- [ ] DevTools-like visual mode
- [ ] CLI to compare POM versions
- [ ] Auto-push POMs to remote
- [ ] Web UI to manage POMs

---

🧠 Why MCP?

> "Because a POM is useless if you don’t know if it works."

---

👨‍💻 Author

Juan Torres  
🔗 https://linkedin.com/in/juantor16 — QA Engineer | Automation Lover | 🇦🇷

---

⚠️ License

MIT – Use it, improve it, and share it 🚀

---

⭐ Was it useful?

Star the repo! 🌟