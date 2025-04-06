import fs from 'fs';
import path from 'path';

type ElementData = {
    tag: string;
    text: string;
    selector: string;
};

// Function to convert file/path names to CamelCase for class names
function toClassName(pageName: string): string {
     // Example: 'user--profile-settings' -> 'UserProfileSettings'
     return pageName
       .split('--') // Split by the delimiter used in slugify
       .map(part =>
            part
             .split('-') // Split by regular hyphens
             .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
             .join('')
       )
       .join(''); // Join the main parts
}

// Function to convert text/selector to camelCase for variable/locator names
function toCamelCase(text: string): string {
    // Simplified: remove special characters, spaces, and capitalize the next letter
    let name = text
        .toLowerCase()
        // Remove non-alphanumeric characters except spaces for initial separation
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        // Replace multiple spaces with a single one
        .replace(/\s+/g, ' ')
        // Convert to camelCase
        .replace(/\s(.)/g, (_, group1) => group1.toUpperCase())
        // Remove remaining spaces (if any after cleanup)
        .replace(/\s/g, '');

     // If the resulting name is empty or just a number, use a generic name
     if (!name || /^\d+$/.test(name)) {
         return 'element';
     }
    // Avoid starting with a number
     if (/^[0-9]/.test(name)) {
         name = '_' + name;
     }
    return name;
}

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


// The signature now accepts pageName for the class name
export function generatePOM(elements: ElementData[], outputFile: string, pageName: string) {
    // Generate class name from pageName (e.g., 'home' -> HomePage, 'user--profile' -> UserProfilePage)
    const className = toClassName(pageName) + 'Page';

    const usedNames = new Set<string>();        // For unique locator names
    const usedSelectors = new Set<string>();    // For unique selectors

    const lines: string[] = [
        `import { Page, Locator } from '@playwright/test';\n`, // Using @playwright/test is common
        `export class ${className} {`,
        `  readonly page: Page;`
    ];

    const constructorLines: string[] = [
        `\n  constructor(page: Page) {`,
        `    this.page = page;`
    ];

    elements.forEach((el) => {
        // Skip if the selector has already been processed
        if (!el.selector || usedSelectors.has(el.selector)) return;
        usedSelectors.add(el.selector);

        // Generate a unique and descriptive name for the locator
        const locatorName = generateLocatorName(el, el.tag, usedNames);

        // Declare the locator as readonly
        lines.push(`  readonly ${locatorName}: Locator;`);

        // Escape single quotes in the selector if it's a CSS selector
        const safeSelector = el.selector.replace(/'/g, "\\'");

        // Initialize the locator in the constructor
        // Distinguish between Playwright selectors (getBy*) and CSS selectors
        if (el.selector.startsWith('getBy')) {
            // Use the getBy* selector directly
            constructorLines.push(`    this.${locatorName} = page.${el.selector};`);
        } else {
            // Use page.locator for CSS selectors
            constructorLines.push(`    this.${locatorName} = page.locator('${safeSelector}');`);
        }
    });

    // Finalize the constructor
    constructorLines.push(`  }\n`);
    // Add constructor lines and close the class
    lines.push(...constructorLines, `}`);

    // Write the content to the file
    const content = lines.join('\n');
    const fullPath = path.resolve(outputFile);
    try {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`\t📄 POM generated: ${path.basename(fullPath)} (Class: ${className})`);
    } catch (writeError) {
         console.error(`\t❌ Error writing the POM file ${fullPath}:`, writeError);
    }
}