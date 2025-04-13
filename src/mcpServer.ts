import express from 'express'; // Only import express by default
import cors from 'cors';
import { analyzePage } from './analyzer';
import { generatePOM } from './pomGenerator';
// Ensure the path is correct and that navigator.ts is the SIMPLIFIED version
import { crawlAndGeneratePOMs } from './navigator';
import path from 'path';
import fs from 'fs';

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

// Define base output directory relative to server file location
const outputBaseDir = path.join(__dirname, '..', 'src', 'output');

// Serve static files from src/output directory
app.use('/generated-output', express.static(outputBaseDir));

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

// GET endpoint to list available POMs and screenshots
app.get('/api/poms', (req, res) => {
    try {
        const availablePoms = [];
        // Read the base output directory
        const pageFolders = fs.readdirSync(outputBaseDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const pageName of pageFolders) {
            const pageDir = path.join(outputBaseDir, pageName);
            const pomFile = `${pageName}.ts`;
            const screenshotFile = `${pageName}.png`;
            const pomFilePath = path.join(pageDir, pomFile);
            const screenshotFilePath = path.join(pageDir, screenshotFile);

            // Use relative paths for frontend consumption
            const relativePomPath = path.join('src', 'output', pageName, pomFile);
            const relativeScreenshotPath = path.join('src', 'output', pageName, screenshotFile);

            // Check if POM file exists
            if (fs.existsSync(pomFilePath)) {
                availablePoms.push({
                    pageName: pageName,
                    pomPath: relativePomPath,
                    // Include screenshot path only if it exists
                    screenshotPath: fs.existsSync(screenshotFilePath) ? relativeScreenshotPath : null,
                });
            }
        }
        res.json(availablePoms);
    } catch (error) {
        console.error('Error listing POMs:', error);
        res.status(500).json({ error: 'Failed to list generated POMs' });
    }
});

// GET endpoint to fetch POM file content
app.get('/api/pom-content', async (req, res) => {
    const relativePath = req.query.path as string;

    if (!relativePath || !relativePath.startsWith('src/output/') || !relativePath.endsWith('.ts')) {
        return res.status(400).json({ error: 'Invalid or missing file path parameter.' });
    }

    // Construct absolute path securely
    const projectRoot = path.resolve(__dirname, '..');
    const absolutePath = path.resolve(projectRoot, relativePath);

    // Security check: Ensure the resolved path is still within the intended output directory
    const resolvedOutputDir = path.resolve(projectRoot, 'src', 'output');
    if (!absolutePath.startsWith(resolvedOutputDir)) {
         return res.status(403).json({ error: 'Access denied.' });
    }

    try {
        const content = await fs.promises.readFile(absolutePath, 'utf-8');
        res.json({ content });
    } catch (error: any) {
        console.error(`Error reading POM file ${absolutePath}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'POM file not found.' });
        }
        res.status(500).json({ error: 'Failed to read POM file content.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`   Endpoints:`);
    console.log(`     POST /analyze { "url": "...", "output": "optional_filename.ts" }`);
    console.log(`     POST /crawl   { "url": "..." }`);
    console.log(`     GET  /api/poms`);
    console.log(`     GET  /api/pom-content?path=...`);
    console.log(`     GET  /generated-output/* (static files)`);
});
