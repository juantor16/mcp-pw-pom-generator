# Selector Strategy

This document explains the selector generation strategy used by the MCP POM Generator's analyzer module. The strategy prioritizes robust, maintainable, and user-facing selectors to ensure reliable test automation.

## Selector Priority Order

The analyzer follows a specific priority order when generating selectors for elements:

1. **Data Attributes** (Highest Priority)
   - `data-testid`
   - `data-qa`
   - `data-cy`
   - `data-test`
   - `data-test-id`

   > **Rationale**: Data attributes are specifically designed for testing and provide the most stable and maintainable selectors.

2. **Accessibility Attributes**
   - `aria-label`
   - `aria-labelledby`
   - `aria-describedby`

   > **Rationale**: Accessibility attributes are user-facing and typically stable across UI changes.

3. **Semantic HTML**
   - `getByRole()` with accessible name
   - `getByLabelText()`
   - `getByAltText()`
   - `getByTitle()`

   > **Rationale**: Semantic selectors are closely tied to user experience and tend to be more stable.

4. **Text Content**
   - `getByText()`
   - `getByDisplayValue()`
   - `getByPlaceholderText()`

   > **Rationale**: Text-based selectors are user-facing but may be more prone to changes.

5. **CSS Selectors** (Lowest Priority)
   - ID selectors (`#id`)
   - Class selectors (`.class`)
   - Attribute selectors (`[attribute]`)
   - Complex CSS selectors

   > **Rationale**: CSS selectors are implementation details and most prone to changes.

## Selector Generation Process

### 1. Element Analysis

For each element, the analyzer:
1. Collects all available attributes and properties
2. Evaluates element's role and type
3. Checks for text content and labels
4. Identifies relationships with other elements

### 2. Selector Generation

The analyzer attempts to generate selectors in priority order:

```typescript
// Example selector generation logic
function generateSelector(element) {
  // 1. Check data attributes
  if (element.hasAttribute('data-testid')) {
    return `[data-testid="${element.getAttribute('data-testid')}"]`;
  }

  // 2. Check accessibility attributes
  if (element.hasAttribute('aria-label')) {
    return `getByRole('${element.getAttribute('role')}', { name: '${element.getAttribute('aria-label')}' })`;
  }

  // 3. Check semantic HTML
  if (element.tagName === 'BUTTON' && element.textContent) {
    return `getByRole('button', { name: '${element.textContent.trim()}' })`;
  }

  // 4. Check text content
  if (element.textContent && element.textContent.trim()) {
    return `getByText('${element.textContent.trim()}')`;
  }

  // 5. Fallback to CSS selectors
  return generateCSSSelector(element);
}
```

### 3. Selector Validation

Generated selectors are validated for:
- Uniqueness on the page
- Stability across page loads
- Performance characteristics
- Maintainability

## Best Practices

### Recommended Selector Types

1. **Data Attributes**
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```typescript
   getByTestId('submit-button')
   ```

2. **Accessibility Attributes**
   ```html
   <button aria-label="Submit form">Submit</button>
   ```
   ```typescript
   getByRole('button', { name: 'Submit form' })
   ```

3. **Semantic HTML**
   ```html
   <label for="username">Username</label>
   <input id="username" />
   ```
   ```typescript
   getByLabelText('Username')
   ```

### Selectors to Avoid

1. **Fragile CSS Selectors**
   ```typescript
   // Avoid
   page.locator('.container > div:nth-child(2) > button')
   
   // Prefer
   page.getByTestId('submit-button')
   ```

2. **Implementation-Dependent Selectors**
   ```typescript
   // Avoid
   page.locator('[class*="btn-"]')
   
   // Prefer
   page.getByRole('button', { name: 'Submit' })
   ```

3. **Overly Complex Selectors**
   ```typescript
   // Avoid
   page.locator('div[data-component="form"] > div:first-child input[type="text"]')
   
   // Prefer
   page.getByTestId('username-input')
   ```

## Selector Maintenance

### When to Update Selectors

1. **UI Changes**
   - When element structure changes
   - When text content changes
   - When attributes are modified

2. **Performance Issues**
   - When selectors become slow
   - When selectors are not unique
   - When selectors are too complex

### Selector Versioning

1. **Track Changes**
   - Document selector changes
   - Update tests accordingly
   - Maintain backward compatibility

2. **Deprecation Strategy**
   - Mark old selectors as deprecated
   - Provide migration path
   - Remove old selectors gradually

## Troubleshooting

### Common Issues

1. **Non-Unique Selectors**
   - Add more specific attributes
   - Use parent-child relationships
   - Consider using data-testid

2. **Flaky Selectors**
   - Check for dynamic content
   - Verify selector stability
   - Consider using more robust selectors

3. **Performance Problems**
   - Simplify complex selectors
   - Use more specific selectors
   - Consider caching results

### Debugging Tips

1. **Selector Verification**
   ```typescript
   // Check selector uniqueness
   const elements = await page.locator(selector).count();
   if (elements !== 1) {
     console.log(`Selector matches ${elements} elements`);
   }
   ```

2. **Selector Performance**
   ```typescript
   // Measure selector performance
   console.time('selector');
   await page.locator(selector).click();
   console.timeEnd('selector');
   ```

3. **Selector Stability**
   ```typescript
   // Verify selector stability
   const element = await page.locator(selector);
   const isStable = await element.isVisible();
   console.log(`Selector stable: ${isStable}`);
   ``` 