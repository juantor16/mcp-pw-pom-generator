# MCP Compare Tool

The MCP Compare Tool (`compare.ts`) is a powerful utility for visually validating generated Page Object Models (POMs) against live web pages. It provides real-time feedback on which elements are correctly mapped, missing, or potentially unmapped in your POMs.

## Usage

### Basic Command

```bash
npx ts-node src/compare.ts --url=<URL> --pom=<POM_PATH>
```

### Required Arguments

- `--url`: The URL of the live page to compare against
- `--pom`: Path to the generated POM file (typically in `src/output/`)

### Optional Flags

- `--use-session`: Use this flag when comparing authenticated pages. Requires `storageState.json` to exist.

### Examples

```bash
# Compare a public page
npx ts-node src/compare.ts --url=https://example.com/public --pom=src/output/public.ts

# Compare an authenticated page
npx ts-node src/compare.ts --url=https://example.com/dashboard --pom=src/output/dashboard.ts --use-session
```

## Visual Output

The tool provides visual feedback directly on the web page:

### 🟩 Green Outline
- Elements that are defined in your POM and successfully found on the page
- Indicates that your locators are working correctly
- Hover over elements to see the POM property name

### 🟦 Blue Outline
- Interactive elements found on the page that are not mapped in your POM
- Helps identify potential missing locators
- Hover over elements to see the suggested selector

### 🟥 Red (Console Only)
- POM locators that were not found on the page
- Reported in the console with detailed error messages
- Includes the attempted selector for debugging

## Authentication Requirements

### For Public Pages
- No special setup required
- Can run the tool directly

### For Authenticated Pages
1. **Prerequisite**: Run the Playwright Global Setup first
   ```bash
   npx playwright test --project=mcp-crawler-setup
   ```
   This generates the required `storageState.json` file.

2. **Important Notes**:
   - Always use the `--use-session` flag for authenticated pages
   - The tool will fail if `storageState.json` is missing
   - If the session expires, you'll need to run the Global Setup again

## Console Output

The tool provides detailed console output:

1. **Setup Information**
   - URL being compared
   - POM file being used
   - Session status (if using authentication)

2. **Comparison Results**
   - List of successfully found POM locators
   - List of POM locators not found on the page
   - Count of elements analyzed

3. **Error Messages**
   - Detailed error information for failed locators
   - Suggestions for fixing common issues

## Best Practices

1. **For Public Pages**:
   - Run the tool directly without `--use-session`
   - Check both visual output and console messages
   - Use the blue highlights to identify missing locators

2. **For Authenticated Pages**:
   - Always use `--use-session` flag
   - Ensure `storageState.json` exists and is valid
   - Run Global Setup if session expires

3. **Debugging Tips**:
   - Hover over highlighted elements to see details
   - Check console for specific error messages
   - Use the 60-second window to inspect the page
   - Take note of blue highlights for potential POM improvements

## Limitations

- The browser window stays open for 60 seconds for inspection
- Some complex selectors might not be highlighted correctly
- Authentication sessions may expire and require renewal
- The tool may not handle all dynamic content perfectly 