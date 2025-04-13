import { chromium, Browser, BrowserContext, Page, ElementHandle } from 'playwright';
import { analyzePage, AnalysisResult } from './analyzer';
import { generatePOM } from './pomGenerator';
import { BoundingBox, ElementData, LocatorMetadata, ElementScreenshotData, PomGenerationResult } from './types';
import path from 'path';
import fs from 'fs';
import readline from 'readline'; // <--- Necessary for manual login fallback
import { toCamelCase, toClassName } from './utils';  // Import utility functions

// Define the path to the storage state file directly here
const storageStatePath = 'storageState.json';
const outputDir = path.join('src', 'output'); // Base output folder for POMs

// --- Helper Functions ---

// Function to pause and wait for Enter in the console (for manual login)
function waitForEnter(query: string): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve();
    }))
}

// Function to convert URLs/text into valid file/class names
function slugify(url: string): string {
    try {
        const urlObj = new URL(url);
        // Remove protocol and common subdomains
        let hostname = urlObj.hostname.replace(/^(www\.|m\.)/, '');
        // Create path string, removing query parameters and hash
        let path = urlObj.pathname.replace(/^\/|\/$/g, '');
        // Replace special characters and spaces
        let slug = `${hostname}-${path}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        // Ensure the slug isn't too long for filesystems
        return slug.slice(0, 200) || 'home';
    } catch {
        // Fallback for invalid URLs
        return 'invalid-url';
    }
}

// Function to detect if a URL seems to be a login page (for manual fallback)
function isLoginPage(url: string): boolean {
    try {
        const pathName = new URL(url).pathname.toLowerCase();
        return pathName.includes('/login') || pathName.includes('/signin') || pathName.includes('/auth');
    } catch (e) {
        const lowerUrl = url.toLowerCase();
        return lowerUrl.includes('/login') || lowerUrl.includes('/signin') || lowerUrl.includes('/auth');
    }
}

async function getClickableElements(page: Page): Promise<ElementHandle[]> {
    // Get all clickable elements (buttons, links, etc.)
    const elements = await page.$$([
        'button',
        'a',
        'input[type="button"]',
        'input[type="submit"]',
        '[role="button"]',
        '[onclick]',
        '[class*="btn"]',
        '[class*="button"]'
    ].join(','));

    return elements;
}

async function getLocatorMetadata(page: Page, selector: string): Promise<LocatorMetadata> {
    const locator = page.locator(selector).first();
    const boundingBox = await locator.boundingBox();
    if (!boundingBox) {
        throw new Error(`Could not get bounding box for selector: ${selector}`);
    }
    return {
        name: selector,
        selector,
        boundingBox
    };
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- End of Helper Functions ---

export interface CrawlResult {
    success: boolean;
    message: string;
    pagesAnalyzed: string[];
    generatedPoms: string[];
}

// --- Main Crawling Function (with Manual Fallback) ---
export async function crawlAndGeneratePOMs(
    browser: Browser,
    startUrl: string,
    outputDir: string,
    maxPages: number = 10
): Promise<CrawlResult> {  // Changed return type to CrawlResult
    console.log(`[Navigator] Starting crawl from ${startUrl} with max pages: ${maxPages}`);
    const visitedUrls = new Set<string>();
    const urlsToVisit = [startUrl];
    const startUrlObj = new URL(startUrl);
    const baseDomain = startUrlObj.hostname;
    const generatedPoms = new Set<string>();

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`[Navigator] Created output directory: ${outputDir}`);
    }

    const page = await browser.newPage();
    let pagesVisited = 0;
    let totalElements = 0;

    while (urlsToVisit.length > 0 && pagesVisited < maxPages) {
        const currentUrl = urlsToVisit.shift()!;
        if (visitedUrls.has(currentUrl)) {
            console.log(`[Navigator] Skipping already visited URL: ${currentUrl}`);
            continue;
        }

        try {
            console.log(`[Navigator] Attempting to visit ${currentUrl} (${pagesVisited + 1}/${maxPages})`);
            await page.goto(currentUrl, { waitUntil: 'networkidle' });
            const currentUrlAfterNav = page.url().split('#')[0]; // Get the final URL after any redirects
            visitedUrls.add(currentUrlAfterNav);
            pagesVisited++;
            console.log(`[Navigator] Successfully navigated to ${currentUrlAfterNav}`);

            const pageName = slugify(currentUrlAfterNav);
            const pageDir = path.join(outputDir, 'pages', pageName);
            fs.mkdirSync(pageDir, { recursive: true });
            console.log(`[Navigator] Created page directory: ${pageDir}`);

            // Take screenshot
            const screenshotPath = path.join(pageDir, `${pageName}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`[Navigator] Saved screenshot to: ${screenshotPath}`);

            // Get all clickable elements
            console.log(`[Navigator] Starting clickable elements search...`);
            const elements = await getClickableElements(page);
            console.log(`[Navigator] Found ${elements.length} clickable elements`);

            console.log(`[Navigator] Processing element metadata...`);
            const elementData = await Promise.all(elements.map(async (element) => {
                try {
                    const metadata = await getLocatorMetadata(page, await element.evaluate(el => (el as HTMLElement).tagName.toLowerCase()));
                    const text = await element.evaluate(el => (el as HTMLElement).textContent?.trim() || '');
                    return {
                        tag: metadata.name,
                        text,
                        selector: metadata.selector,
                        metadata: {
                            screenshotPath: `pages/${pageName}/${pageName}.png`,
                            metadataPath: `pages/${pageName}/${pageName}.json`,
                            boundingBox: metadata.boundingBox
                        }
                    };
                } catch (err) {
                    console.warn(`[Navigator] Failed to process element:`, err);
                    return null;
                }
            }));
            const validElementData = elementData.filter(data => data !== null) as ElementData[];
            totalElements += validElementData.length;
            console.log(`[Navigator] Successfully processed ${validElementData.length} elements with metadata`);

            // Save metadata
            const metadataPath = path.join(pageDir, `${pageName}.json`);
            fs.writeFileSync(metadataPath, JSON.stringify(
                validElementData.map(el => el.metadata), 
                null, 
                2
            ));
            console.log(`[Navigator] Saved element metadata to: ${metadataPath}`);

            // Generate POM
            console.log(`[Navigator] Generating POM for ${pageName}...`);
            const pomResult = generatePOM(
                validElementData.map(({ tag, text, selector }) => ({ tag, text, selector })),
                pageName
            );
            const pomPath = path.join(pageDir, `${pageName}.ts`);
            fs.writeFileSync(pomPath, pomResult.pomString);
            console.log(`[Navigator] Generated POM file at: ${pomPath}`);
            generatedPoms.add(pageName);

            // Get new URLs to visit
            console.log(`[Navigator] Collecting links from page...`);
            const links = await page.$$eval('a', (anchors) => 
                anchors.map(a => a.href).filter(href => href && !href.includes('#'))
            );
            console.log(`[Navigator] Found ${links.length} total links`);

            // Filter and add new URLs
            let newUrlsAdded = 0;
            for (const link of links) {
                try {
                    const linkUrl = new URL(link);
                    if (linkUrl.hostname === baseDomain && !visitedUrls.has(link)) {
                        urlsToVisit.push(link);
                        newUrlsAdded++;
                    }
                } catch {
                    console.warn(`[Navigator] Invalid URL found: ${link}`);
                }
            }
            console.log(`[Navigator] Added ${newUrlsAdded} new URLs to visit queue. Queue size: ${urlsToVisit.length}`);

            // Small delay to prevent overwhelming the server
            await page.waitForTimeout(1000);

        } catch (error) {
            console.error(`[Navigator] Error processing ${currentUrl}:`, error);
        }
    }

    console.log(`[Navigator] Crawl complete. Visited ${pagesVisited} pages.`);
    console.log(`[Navigator] Generated ${generatedPoms.size} POMs.`);
    console.log(`[Navigator] Total elements processed: ${totalElements}`);
    console.log(`[Navigator] Final list of visited URLs:`, Array.from(visitedUrls));
    await page.close();
    
    // Return the detailed result
    return {
        success: true,
        message: `Crawl completed. Generated ${generatedPoms.size} POMs with ${totalElements} elements across ${pagesVisited} pages.`,
        pagesAnalyzed: Array.from(visitedUrls),
        generatedPoms: Array.from(generatedPoms)
    };
}

export async function navigateAndCollectElements(
    page: Page,
    url: string,
    outputDir: string,
    pageName: string
): Promise<void> {
    try {
        // Analyze the page and collect elements
        const analysisResult: AnalysisResult = await analyzePage(url, page);
        
        if (!analysisResult.success || analysisResult.elements.length === 0) {
            console.error('Failed to analyze page or no elements found:', analysisResult.message);
            return;
        }

        // Generate POM from the analyzed elements
        const pomResult = generatePOM(
            analysisResult.elements.map(el => ({
                tag: el.tag,
                text: el.text || '',
                selector: el.selector
            })),
            pageName
        );

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write POM file
        const pomFilePath = path.join(outputDir, `${pageName}.ts`);
        fs.writeFileSync(pomFilePath, pomResult.pomString, 'utf8');

        // Write locator mappings to JSON
        const mappingsFilePath = path.join(outputDir, `${pageName}-locators.json`);
        fs.writeFileSync(
            mappingsFilePath,
            JSON.stringify(pomResult.locatorMappings, null, 2),
            'utf8'
        );

        console.log(`Generated POM file at: ${pomFilePath}`);
        console.log(`Generated locator mappings at: ${mappingsFilePath}`);
    } catch (error) {
        console.error('Error in navigateAndCollectElements:', error);
        throw error;
    }
}

async function generatePOMForPage(page: Page, elements: ElementData[]): Promise<PomGenerationResult> {
    const pageName = await page.title();
    return generatePOM(elements, pageName);
}

async function savePOMFile(result: PomGenerationResult, outputPath: string): Promise<void> {
    await fs.promises.writeFile(outputPath, result.pomString, 'utf-8');
}