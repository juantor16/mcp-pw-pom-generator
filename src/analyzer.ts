import { chromium, Page, Browser, BrowserContext } from 'playwright';
import { ElementData } from './types';

// Define type for the elements found
type AnalyzedElement = {
    tag: string;
    text: string;
    selector: string;
};

export type AnalysisResult = {
    success: boolean;
    message: string;
    elements: ElementData[];
};

// The function signature now accepts an optional page
export async function analyzePage(url: string, existingPage?: Page, highlight: boolean = false): Promise<AnalysisResult> {
    let pageToAnalyze: Page;
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let shouldCloseBrowser = false;

    if (existingPage) {
        pageToAnalyze = existingPage;
        if (pageToAnalyze.url().split('#')[0] !== url.split('#')[0]) {
            console.log(`(analyzer) Navigating to ${url} on existing page...`);
            try {
                await pageToAnalyze.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            } catch (navError) {
                console.warn(`(analyzer) Error navigating to ${url}: ${navError instanceof Error ? navError.message : navError}`);
                return {
                    success: false,
                    message: 'Page navigation error',
                    elements: []
                };
            }
        }
    } else {
        browser = await chromium.launch({ headless: !highlight });
        context = await browser.newContext();
        pageToAnalyze = await context.newPage();
        try {
            await pageToAnalyze.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            shouldCloseBrowser = true;
        } catch (navError) {
            console.error(`(analyzer) Fatal error navigating to ${url}: ${navError}`);
            if (browser) await browser.close();
            return {
                success: false,
                message: 'Page navigation error',
                elements: []
            };
        }
    }

    // *** GENERIC WAIT FOR INITIAL CONTENT ***
    try {
        // Wait for the first child element of div#root to be visible
        // This indicates that React (or similar) has rendered something.
        // Use a shorter timeout since this should happen relatively quickly.
        const rootContentSelector = '#root > *';
        console.log(`(analyzer) Waiting for initial content inside ${rootContentSelector}...`);
        await pageToAnalyze.waitForSelector(rootContentSelector, { state: 'visible', timeout: 7000 }); // Wait up to 7 seconds
        console.log(`(analyzer) Initial content found. Proceeding with analysis.`);
        // Optional: Small additional delay just in case
        // await pageToAnalyze.waitForTimeout(200);
    } catch (waitError) {
         // If #root does not exist or is empty after the timeout, the page likely did not load correctly or has a different structure.
         console.warn(`(analyzer) Initial content not found inside '#root > *' after waiting. The page might be empty, have errors, or use a different structure. ${waitError}`);
         // Continue anyway, but the analysis might fail or be incomplete.
    }
    // *** END GENERIC WAIT ***

    // Extract elements using page.evaluate
    const elements: ElementData[] = await pageToAnalyze.evaluate(() => {
        const results: ElementData[] = [];
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, a, [role="button"], [role="link"]');
        
        for (const element of interactiveElements) {
            const tag = element.tagName.toLowerCase();
            const text = element.textContent?.trim() || '';
            
            // Generate selector based on available attributes
            let selector = '';
            const testId = element.getAttribute('data-testid');
            const role = element.getAttribute('role');
            const label = element.getAttribute('aria-label');
            const placeholder = element.getAttribute('placeholder');
            
            if (testId) {
                selector = `getByTestId('${testId}')`;
            } else if (role) {
                selector = `getByRole('${role}')`;
            } else if (label) {
                selector = `getByLabel('${label}')`;
            } else if (placeholder) {
                selector = `getByPlaceholder('${placeholder}')`;
            } else {
                selector = element.id ? `#${element.id}` : element.className ? `.${element.className.split(' ')[0]}` : tag;
            }
            
            results.push({
                tag,
                text,
                selector
            });
        }

        return results;
    });

    // Highlight logic (unchanged)
    if (highlight && elements.length > 0) {
        console.log(`(analyzer) Highlighting ${elements.length} elements found...`);
        await pageToAnalyze.evaluate((elementsToHighlight: ElementData[]) => {
            elementsToHighlight.forEach(({ selector }) => {
                try {
                    let foundElement: Element | null = null;
                    if (selector.startsWith('getBy')) {
                        console.warn(`Highlighting for 'getBy*' selectors not implemented in evaluate (browser limitation). Selector: ${selector}`);
                    } else {
                         foundElement = document.querySelector(selector);
                    }

                    const el = foundElement as HTMLElement;
                    if (!el) {
                         console.warn(`(highlight) Element not found for CSS selector: ${selector}`);
                         return;
                    }
                    el.style.outline = '2px solid lime';
                    el.setAttribute('title', `Selector: ${selector}`);
                } catch (e) {
                     console.error(`Error highlighting selector: ${selector}`, e);
                 }
            });
        }, elements);
        console.log("(analyzer) Keeping the page open for 60 seconds for review...");
        await pageToAnalyze.waitForTimeout(60000);
    }

    // Close the browser ONLY if we created it within this function
    if (shouldCloseBrowser && browser) {
        console.log("(analyzer) Closing temporary browser...");
        await browser.close();
    }

    // Return the final real URL and the elements
    console.log(`(analyzer) Analysis completed for ${pageToAnalyze.url()}. Elements found: ${elements.length}`);
    return {
        success: true,
        message: `Found ${elements.length} interactive elements`,
        elements
    };
}