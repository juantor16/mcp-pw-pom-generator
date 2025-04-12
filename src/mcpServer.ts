import express from 'express'; // Only import express by default
import cors from 'cors';
import { analyzePage } from './analyzer';
import { generatePOM } from './pomGenerator';
// Ensure the path is correct and that navigator.ts is the SIMPLIFIED version
import { crawlAndGeneratePOMs } from './navigator';
import path from 'path';

const app = express();

// Enable CORS for all origins during development
// In production, you should configure specific origins
app.use(cors({
  origin: true, // Allow all origins during development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// --- Auxiliary Function Slugify (unchanged) ---
function slugify(text: string): string {
    const urlPath = text.startsWith('http') ? new URL(text).pathname : text;
    if (!urlPath || urlPath === '/') return 'home';
    return urlPath
        .toLowerCase()
        .replace(/^\/|\/$/g, '')
        .replace(/[^a-z0-9\/]+/g, '-')
        .replace(/\//g, '--')
        .replace(/^-+|-+$/g, '')
        || 'page';
}
// --- End Auxiliary Function ---

// Endpoint to analyze a SINGLE page (unchanged)
app.post('/analyze', async (req, res) => {
    const { url, output }: { url?: string, output?: string } = req.body;
    if (!url) { return res.status(400).json({ error: 'Missing URL' }); }

    try {
        console.log(`(Server) Analyzing single URL: ${url}`);
        // analyzePage does not require a session for simple analysis
        const result = await analyzePage(url);
        const pageName = slugify(url);
        const fileName = output || `${pageName}.ts`;
        // Consider placing output in src/output for consistency
        const fullOutputPath = path.join('src', 'output', fileName);
        // Ensure generatePOM is imported correctly
        const { generatePOM } = await import('./pomGenerator');
        generatePOM(result.elements, fullOutputPath, pageName);
        res.json({ success: true, message: `POM generated at ${fullOutputPath}`, pageName: pageName, elementsCount: result.elements.length });
    } catch (err) {
        console.error('Error in /analyze endpoint:', err);
        res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' });
    }
});

// Endpoint to CRAWL multiple pages
app.post('/crawl', async (req, res) => {
    const { url }: { url?: string } = req.body;
    if (!url) { return res.status(400).json({ error: 'Missing URL' }); }

    try {
        // *** IMPORTANT NOTE ***
        // This implementation assumes that the Playwright Global Setup process
        // (defined in playwright.config.ts and global.setup.ts)
        // has already been executed and created 'storageState.json' if authentication was required.
        // The imported crawlAndGeneratePOMs function must be the simplified version
        // that attempts to load 'storageState.json' but DOES NOT handle manual login.
        console.log(`(Server) Starting crawl from URL: ${url}`);
        const pagesAnalyzed = await crawlAndGeneratePOMs(url);
        res.json({ 
            success: true, 
            message: `Crawl completed. Analyzed ${pagesAnalyzed.length} pages.`,
            pagesAnalyzed: pagesAnalyzed
        });
    } catch (err) {
        console.error('Error in /crawl endpoint:', err);
        res.status(500).json({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred',
            pagesAnalyzed: []
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`   Endpoints:`);
    console.log(`     POST /analyze { "url": "...", "output": "optional_filename.ts" }`);
    console.log(`     POST /crawl   { "url": "..." }`);
});
