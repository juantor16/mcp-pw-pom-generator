import { chromium } from 'playwright';
import { analyzePage } from './analyzer';
import { generatePOM } from './pomGenerator';
import path from 'path';
import fs from 'fs';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function crawlAndGeneratePOMs(startUrl: string) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(startUrl);

    const baseUrl = new URL(startUrl).origin;

    const outputDir = path.join('src', 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const hrefs = await page.$$eval(
        'a[href]',
        (anchors, base) =>
            Array.from(
                new Set(
                    anchors
                        .map((a) => a.getAttribute('href') || '')
                        .filter((href) => href.startsWith('/') || href.startsWith(base))
                )
            ),
        baseUrl
    );

    const visitedPages: string[] = [];

    for (const href of hrefs) {
        const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
        try {
            console.log(`🌐 Visitando: ${fullUrl}`);
            await page.goto(fullUrl);
            const result = await analyzePage(fullUrl);
            const pageName = slugify(href === '/' ? 'home' : href);
            const fileName = path.join('src', 'output', `${pageName || 'page'}.ts`);
            generatePOM(result.elements, fileName);
            visitedPages.push(fullUrl);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`⚠️ Could not analyze ${fullUrl}: ${msg}`);
        }
    }

    await browser.close();
    return visitedPages;
}
