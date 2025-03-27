import { analyzePage } from './analyzer';
import { chromium, Page } from 'playwright';
import path from 'path';
import { argv } from 'process';

async function main() {
    const urlArg = argv.find(arg => arg.startsWith('--url='));
    const pomArg = argv.find(arg => arg.startsWith('--pom='));

    if (!urlArg || !pomArg) {
        console.error('Usage: npx ts-node src/compare.ts --url=https://... --pom=src/output/file.ts');
        process.exit(1);
    }

    const url = urlArg.replace('--url=', '');
    const pomPath = pomArg.replace('--pom=', '');
    const fullPomPath = path.resolve(pomPath);

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const scanResult = await analyzePage(url);
    const foundSelectors = scanResult.elements.map((el: { selector: string }) => el.selector);

    try {
        const pomModule = await import(fullPomPath);
        const PomClass = Object.values(pomModule)[0] as { new(page: Page): any };
        const pomInstance = new PomClass(page);
        await injectHighlighter(page);
        const notFound: string[] = [];
        const matched: string[] = [];

        for (const key of Object.keys(pomInstance)) {
            if (key === 'page') continue;
            try {
                const locator = (pomInstance as any)[key];
                let count = 0;
                try {
                    count = await locator.count();
                } catch {
                    count = 0;
                }

                if (count === 0) {
                    notFound.push(key);
                } else {
                    matched.push(key);
                    await highlightElement(page, locator, key, 'lime');
                }
            } catch (err) {
                notFound.push(key);
            }
        }

        for (const el of scanResult.elements) {
            const isAlreadyInPom = Object.values(pomInstance).some((locator: any) => {
                return locator?.toString().includes(el.selector);
            });
            if (!isAlreadyInPom) {
                try {
                    const locator = page.locator(el.selector);
                    const count = await safeCount(locator);
                    if (count > 0) {
                        await highlightElement(page, locator, el.selector, 'blue');
                    }
                } catch { }
            }
        }

        if (notFound.length) {
            console.warn('\n❌ Elements defined in the POM but not found:');
            notFound.forEach(key => {
                const locatorString = pomInstance[key]?.toString?.() || 'Could not generate string for the locator';
                console.warn(` - ${key} (selector: ${locatorString})`);
            });
        } else {
            console.log('\n✅ All elements in the POM were found.');
        }

        console.log('\n🟩 Green: found\n🟥 Red: not found\n🟦 Blue: not yet mapped');
        await page.waitForTimeout(60000);
    } catch (error) {
        console.error('Error loading the POM:', error);
    }

    await browser.close();
}

async function safeCount(locator: any): Promise<number> {
    try {
        return await locator.count();
    } catch {
        return 0;
    }
}

async function highlightElement(page: Page, locator: any, label: string, color: string) {
    try {
        const handle = await locator.first().elementHandle().catch(() => null); // <- catches here

        if (handle) {
            await page.evaluate(
                (data) => {
                    const { el, label, color } = data;
                    // @ts-ignore
                    window.__highlightElement(el, label, color);
                },
                { el: handle, label, color }
            );
        } else {
            console.warn(`⚠️ Could not get handle for: ${label}`);
        }
    } catch (e) {
        console.error('Error highlighting element:', label, e);
    }
}

async function injectHighlighter(page: Page) {
    await page.addScriptTag({
        content: `
      window.__highlightElement = (element, label, color) => {
        if (!element) return;
        element.style.outline = '2px solid ' + color;
        element.setAttribute('title', 'Element: ' + label);
      };
    ` });
}

main();
