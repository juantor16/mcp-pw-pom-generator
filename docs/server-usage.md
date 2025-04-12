# MCP Server Usage Guide

## Starting the Server

To start the MCP server, run the following command:

```bash
npx ts-node src/mcpServer.ts
```

The server will start and listen on `http://localhost:3001`.

## Available Endpoints

### 1. Analyze Single Page (`/analyze`)

**Endpoint**: `POST http://localhost:3001/analyze`

**Purpose**: Analyze a single page and generate its Page Object Model (POM).

**Request Format**:
```json
{
  "url": "https://example.com/page",
  "output": "optional_filename.ts"  // Optional
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "POM generated at src/output/filename.ts",
  "pageName": "page-name",
  "elementsCount": 42
}
```

**Error Response**:
```json
{
  "error": "Error message description"
}
```

### 2. Multi-Page Crawl (`/crawl`)

**Endpoint**: `POST http://localhost:3001/crawl`

**Purpose**: Crawl multiple pages from a starting URL and generate POMs for each page.

**Request Format**:
```json
{
  "url": "https://example.com"
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "Crawl process finished (used existing session if available)",
  "pagesAnalyzed": ["url1", "url2", "url3"]
}
```

**Error Response**:
```json
{
  "error": "Error during the crawl process",
  "details": "Specific error message"
}
```

## Authentication Requirements

### For Public Sites
- No special setup required
- Can use both endpoints directly

### For Authenticated Sites
1. **Prerequisite**: Run the Playwright Global Setup first
   ```bash
   npx playwright test --project=mcp-crawler-setup
   ```
   This will generate the required `storageState.json` file.

2. **Important Notes**:
   - The `/crawl` endpoint assumes `storageState.json` exists if authentication is required
   - The server will use the existing session state for authenticated crawling
   - If the session expires, you'll need to run the Global Setup again

## Output Files

- Generated POMs are saved in the `src/output/` directory
- File names are automatically generated based on the page URL
- You can specify a custom output filename for single-page analysis

## Error Handling

The server provides detailed error messages for common issues:
- Missing URL in request
- Invalid URL format
- Network connectivity issues
- Authentication failures
- File system errors

## Best Practices

1. **For Single Page Analysis**:
   - Use the `/analyze` endpoint for quick POM generation
   - Specify a custom output filename if needed
   - Monitor the response for element count and success status

2. **For Multi-Page Crawling**:
   - Ensure proper authentication setup for protected sites
   - Start with a high-level URL to discover all relevant pages
   - Monitor the `pagesAnalyzed` array in the response
   - Check the `src/output/` directory for generated POMs

3. **Security Considerations**:
   - Never commit `storageState.json` to version control
   - Use environment variables for sensitive credentials
   - Keep the server running only when needed 