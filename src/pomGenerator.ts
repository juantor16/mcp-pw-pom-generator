import fs from 'fs';
import path from 'path';

type ElementData = {
    tag: string;
    text: string;
    selector: string;
};

function toCamelCase(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+(.)/g, (_, group1) => group1.toUpperCase());
}

function sanitizeName(base: string, tag: string): string {
    const name = toCamelCase(base || tag);
    return `${name}${tag === 'a' ? 'Link' : tag === 'button' ? 'Button' : 'Field'}`;
}

export function generatePOM(elements: ElementData[], outputFile: string) {
    const usedNames = new Set<string>();
    const usedSelectors = new Set<string>();

    const lines: string[] = [
        `import { Page, Locator } from '@playwright/test';\n`,
        `export class GeneratedPage {`,
        `  readonly page: Page;`
    ];

    const constructorLines: string[] = [
        `  constructor(page: Page) {`,
        `    this.page = page;`
    ];

    elements.forEach((el, index) => {
        if (usedSelectors.has(el.selector)) return;
        usedSelectors.add(el.selector);

        const rawName = el.text || el.selector;
        let baseName = sanitizeName(rawName, el.tag);
        let name = baseName;
        let counter = 1;

        // Avoid duplicate names
        while (usedNames.has(name)) {
            name = `${baseName}${counter++}`;
        }

        usedNames.add(name);

        lines.push(`  readonly ${name}: Locator;`);
        if (/^getBy(Text|Role|Label)\(/.test(el.selector)) {
            constructorLines.push(`    this.${name} = page.${el.selector}`);
        } else {
            constructorLines.push(`    this.${name} = page.locator('${el.selector}');`);
        }
    });

    constructorLines[constructorLines.length - 1] += ';';
    constructorLines.push(`  }\n`);
    lines.push('', ...constructorLines, `}`);

    const content = lines.join('\n');
    const fullPath = path.resolve(outputFile);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Page Object Model saved at: ${fullPath}`);
}