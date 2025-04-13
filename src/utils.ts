export function toClassName(pageName: string): string {
    // Split by common separators and capitalize each word
    return pageName
        .split(/[-_\s]+/g)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

export function toCamelCase(text: string): string {
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