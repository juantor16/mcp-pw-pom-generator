import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { analyzePage } from './analyzer';       // Import your analyzer
import { generatePOM } from './pomGenerator';   // Import your POM generator
import path from 'path';
import fs from 'fs';
// 'readline' is no longer needed because there is no manual pause

// Define the path to the state file directly here
const storageStatePath = 'storageState.json';
const outputDir = path.join('src', 'output'); // Output folder for POMs

// --- Helper Function: slugify (for file/class names) ---
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
// --- End Helper Function ---


// --- Main Crawling Function (Final Simplified Version) ---
// Optionally accepts a browser instance to reuse it
export async function crawlAndGeneratePOMs(startUrl: string, browserInstance?: Browser) {
    let browser: Browser | null = browserInstance || null; // Use passed instance or null
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    const visitedPages = new Set<string>(); // To avoid repeating pages
    let ownBrowser = false; // To know if we should close the browser at the end

    try {
        console.log('🚀 Starting MCP POM Generator Crawl...');

        // Create a browser only if one was not provided
        if (!browser) {
            console.log('   Creating a new browser instance...');
            // Configure headless as needed for normal crawling
            browser = await chromium.launch({ headless: false }); // You can set this to true
            ownBrowser = true; // Mark that this script owns the browser
        } else {
            console.log('   Reusing existing browser instance...');
        }

        // *** Load Context: Try to use the saved state ***
        try {
            // Assume that global.setup.ts (if it exists) already created this file
            console.log(`   Attempting to load session from ${storageStatePath}...`);
            context = await browser.newContext({
                storageState: storageStatePath,
                // You could add other context options here if needed
                // such as viewport, userAgent, etc., defined in your playwright.config.ts
            });
            console.log(`✅ Session loaded from ${storageStatePath}.`);
        } catch (error) {
            // If it fails (e.g., file doesn't exist or is invalid), create a clean context
            console.warn(`⚠️ Could not load session from ${storageStatePath}. Starting without session... (${error})`);
            context = await browser.newContext(); // Clean context
        }
        // *** End Load Context ***

        page = await context.newPage();

        // Navigate to the start URL (either with or without session)
        console.log(`   Navigating to the initial URL: ${startUrl}`);
        // 'networkidle' is usually a good wait for dynamic apps
        await page.goto(startUrl, { waitUntil: 'networkidle', timeout: 60000 });
        console.log(`✅ Landed on: ${page.url()}`);


        // Ensure the output folder exists
        if (!fs.existsSync(outputDir)) {
            console.log(`📂 Creating output directory: ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // --- Main Crawling Logic ---

        // Analyze the initial page where we landed
        const currentPageUrl = page.url().split('#')[0]; // Ignore URL fragments
        if (!visitedPages.has(currentPageUrl)) {
            console.log(`\n🔎 Analyzing current page: ${currentPageUrl}`);
            try {
                // Call analyzePage (which has its own generic wait internally)
                const result = await analyzePage(currentPageUrl, page);
                // Generate the POM for this page
                const pageName = slugify(currentPageUrl);
                const fileName = path.join(outputDir, `${pageName}.ts`);
                generatePOM(result.elements, fileName, pageName);
                visitedPages.add(currentPageUrl); // Mark as visited
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`⚠️ Could not analyze the current page ${currentPageUrl}: ${msg}`);
            }
        }

        // Extract links from the current page to continue crawling
        console.log('\n🔗 Extracting internal links from the current page...');
        const currentBaseUrl = new URL(page.url()).origin;
        let linksToCrawl: string[] = [];
        try {
             linksToCrawl = await page.$$eval(
                'a[href]', // Selector
                (anchors, base) => { // Function in the browser
                    const uniqueHrefs = new Set<string>();
                    anchors.forEach(a => {
                        const href = a.getAttribute('href');
                        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                            try {
                                const absoluteUrl = new URL(href, base).toString().split('#')[0];
                                if (absoluteUrl.startsWith(base) && !href.startsWith('javascript:')) {
                                    uniqueHrefs.add(absoluteUrl);
                                }
                            } catch (e) { }
                        }
                    });
                    return Array.from(uniqueHrefs);
                },
                currentBaseUrl // Argument for the function
            );
             console.log(`🔍 Found ${linksToCrawl.length} unique same-domain links to crawl.`);
        } catch(evalError) {
            console.error("Error extracting links:", evalError);
        }

        // Sort links (optional, here alphabetically)
        linksToCrawl.sort((a, b) => a.localeCompare(b));

        // Iterate and analyze each found link
        console.log('\n🔄 Starting analysis of linked pages...');
        for (const fullUrl of linksToCrawl) {
            // Skip if already visited (directly or via redirection)
            if (visitedPages.has(fullUrl)) {
                continue;
            }

            console.log(`\n\t➡ Visiting link: ${fullUrl}`);
            try {
                // Navigate to the next URL using the same page (maintains session)
                await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
                // Get the real URL after possible redirections, without fragment
                const currentUrlAfterNav = page.url().split('#')[0];

                // Re-check if we already visited the resulting URL
                if (visitedPages.has(currentUrlAfterNav)) {
                    console.log(`\t⏭️ Skipping ${currentUrlAfterNav} (already visited post-redirect)`);
                    continue;
                }

                console.log(`\t🔎 Analyzing: ${currentUrlAfterNav}`);
                // Analyze the new page
                const result = await analyzePage(currentUrlAfterNav, page);

                // Generate POM for this linked page
                const pageName = slugify(currentUrlAfterNav);
                const fileName = path.join(outputDir, `${pageName}.ts`);
                generatePOM(result.elements, fileName, pageName);
                // Mark the real visited URL as processed
                visitedPages.add(currentUrlAfterNav);

            } catch (err) {
                // Error handling for this specific page
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`\t⚠️ Could not analyze ${fullUrl} (or its redirection ${page?.url()}): ${msg.split('\n')[0]}`);
                 // Mark both URLs (the original and the redirected one if it exists) as visited
                 // to avoid infinite error loops
                 visitedPages.add(fullUrl);
                 if (page?.url() && page.url() !== fullUrl) {
                    visitedPages.add(page.url().split('#')[0]);
                 }
            }
        } // End of for loop
         // --- End Crawling Logic ---

    } catch (error) {
        // Capture general errors in the process
        console.error('\n❌ Fatal error during the crawling process:', error);
        // Consider re-throwing the error if you want the process to fail explicitly
        // throw error;
    } finally {
        // Block that always executes (whether there is an error or not)
        // Close the browser ONLY if this script created it
        if (browser && ownBrowser) {
            console.log('\n🚪 Closing the browser created by the script...');
            await browser.close();
        } else if (browser && !ownBrowser) {
             console.log('\n🚪 Not closing the browser (reused instance).');
        }
        console.log('\n🏁 Crawling process completed.');
        console.log(`✨ Pages analyzed and POMs generated (or attempted): ${visitedPages.size}`);
    }

    // Return the final list of visited/processed URLs
    return Array.from(visitedPages);
} // End of crawlAndGeneratePOMs