import * as fs from 'fs';
import * as path from 'path';
import { ElementData, PomGenerationResult } from './types';
import { toClassName, toCamelCase } from './utils';

// Function to generate a descriptive and unique locator name
function generateLocatorName(el: ElementData, tag: string, usedNames: Set<string>): string {
    let baseName = '';
    // Prioritize meaningful text if it exists and is not too long
    if (el.text && el.text.length > 2 && el.text.length < 30) {
        baseName = toCamelCase(el.text);
    } else if (el.selector.startsWith('[data-testid=')) {
        // Use data-testid if it exists
        baseName = toCamelCase(el.selector.match(/\[data-testid="?([^"\]]+)"?\]/)?.[1] || `testid_${tag}`);
    } else if (el.selector.startsWith('getByLabel')) {
        baseName = toCamelCase(el.selector.match(/getByLabel\('(.+)'\)/)?.[1] || `label_${tag}`);
    } else if (el.selector.startsWith('getByPlaceholder')) {
        baseName = toCamelCase(el.selector.match(/getByPlaceholder\('(.+)'\)/)?.[1] || `placeholder_${tag}`);
    } else if (el.selector.startsWith('getByRole')) {
        // Combine role and name if it exists
        const roleMatch = el.selector.match(/getByRole\('([^']+)',\s*\{\s*name:\s*'([^']+)'\s*\}\)/);
        if (roleMatch) {
            baseName = toCamelCase(`${roleMatch[1]} ${roleMatch[2]}`);
        } else {
            baseName = toCamelCase(`role_${tag}`);
        }
    } else if (el.selector.startsWith('getByText')) {
        baseName = toCamelCase(el.selector.match(/getByText\('(.+)'\)/)?.[1] || `text_${tag}`);
    } else if (el.selector.startsWith('#')) {
        // Use ID if it exists
        baseName = toCamelCase(el.selector.substring(1));
    }

    // If a descriptive name could not be generated, use the tag
    if (!baseName) {
        baseName = tag;
    }

    // Add a suffix based on the tag for clarity (Button, Link, Field, etc.)
    let suffix = '';
    if (tag === 'button' || el.selector.includes("getByRole('button'")) {
        suffix = 'Button';
    } else if (tag === 'a' || el.selector.includes("getByRole('link'")) {
        suffix = 'Link';
    } else if (tag === 'input') {
        const type = el.selector.match(/type="([^"]+)"/)?.[1];
        if (type === 'checkbox') suffix = 'Checkbox';
        else if (type === 'radio') suffix = 'Radio';
        else if (type === 'submit' || type === 'button') suffix = 'Button';
        else suffix = 'Input'; // Default input
    } else if (tag === 'select') {
        suffix = 'Select';
    } else if (tag === 'textarea') {
        suffix = 'Textarea';
    } else {
        // Generic suffix if it doesn't match common ones
        suffix = 'Element';
    }

    // Combine base name and suffix
    let finalName = baseName.endsWith(suffix) ? baseName : baseName + suffix;

    // Ensure uniqueness by adding a counter if necessary
    let uniqueName = finalName;
    let counter = 1;
    while (usedNames.has(uniqueName)) {
        uniqueName = `${finalName}${counter++}`;
    }
    usedNames.add(uniqueName);

    return uniqueName;
}

export function generatePOM(elements: ElementData[], pageName: string): PomGenerationResult {
    const className = toClassName(pageName) + 'Page';
    const usedNames = new Set<string>();
    const usedSelectors = new Set<string>();
    const locatorMappings: { locatorName: string, selector: string }[] = [];

    const lines: string[] = [
        "import { Page, Locator } from '@playwright/test';",
        "",
        `export class ${className} {`,
        "  constructor(private readonly page: Page) {"
    ];

    const constructorLines: string[] = [];

    elements.forEach((el) => {
        if (!el.selector || usedSelectors.has(el.selector)) return;
        usedSelectors.add(el.selector);

        const locatorName = generateLocatorName(el, el.tag, usedNames);

        // Store the mapping
        locatorMappings.push({ locatorName, selector: el.selector });

        lines.push(`  readonly ${locatorName}: Locator;`);

        const safeSelector = el.selector.replace(/'/g, "\\'");
        if (el.selector.startsWith('getBy')) {
            constructorLines.push(`    this.${locatorName} = page.${el.selector};`);
        } else {
            constructorLines.push(`    this.${locatorName} = page.locator('${safeSelector}');`);
        }
    });

    constructorLines.push(`  }\n`);
    lines.push(...constructorLines, `}`);

    const pomString = lines.join('\n');

    return { pomString, locatorMappings };
}