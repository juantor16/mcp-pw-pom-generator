import { chromium } from 'playwright';

export async function analyzePage(url: string, highlight: boolean = false) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    const elements = await page.evaluate(() => {
        const results: any[] = [];

        function getBestSelector(el: HTMLElement): string {
            if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`;
            if (el.tagName.toLowerCase() === 'button' || el.getAttribute('role') === 'button') {
                const name = el.textContent?.trim();
                if (name) return `getByRole('button', { name: '${name}' })`;
            }
            if (el.id) {
                const label = document.querySelector(`label[for="${el.id}"]`);
                if (label && label.textContent?.trim()) return `getByLabel('${label.textContent.trim()}')`;
            }
            if (el.id) return `#${el.id}`;
            if (el.getAttribute('name')) return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
            if (el.getAttribute('aria-label')) return `[aria-label="${el.getAttribute('aria-label')}"]`;
            if (el.getAttribute('placeholder')) return `[placeholder="${el.getAttribute('placeholder')}"]`;
            if (el.tagName.toLowerCase() === 'input' && el.textContent?.trim()) {
                return `input:has-text("${el.textContent.trim()}")`;
            }
            if (el.textContent && el.textContent.trim()) return `getByText('${el.textContent.trim()}')`;
            return el.tagName.toLowerCase();
        }

        const seen = new Set();
        document.querySelectorAll('button, a, input, textarea, select').forEach((el) => {
            const element = el as HTMLElement;
            const selector = getBestSelector(element);
            if (seen.has(selector)) return;
            seen.add(selector);

            const text = element.textContent?.trim() || '';
            const hasValidSelector =
                selector.startsWith('[') ||
                selector.startsWith('#') ||
                selector.includes(':has-text') ||
                selector.startsWith('getByText') ||
                selector.startsWith('getByRole') ||
                selector.startsWith('getByLabel');

            if (!hasValidSelector) return;

            results.push({
                tag: element.tagName.toLowerCase(),
                text,
                selector
            });
        });

        return results;
    });

    if (highlight) {
        await page.evaluate((elements: { selector: string }[]) => {
            elements.forEach(({ selector }) => {
                try {
                    const el = document.querySelector(selector) as HTMLElement;
                    if (!el) return;
                    el.style.outline = '2px solid lime';
                    el.setAttribute('title', `Selector: ${selector}`);
                } catch { }
            });
        }, elements);
        await page.waitForTimeout(60000); // 1 minute to look
    }

    await browser.close();
    return { url, elements };
}
