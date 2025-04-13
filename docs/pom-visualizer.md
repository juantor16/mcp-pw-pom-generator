# POM Visualizer Component

## Overview
The POM Visualizer is a React component that provides a user interface for viewing generated Page Object Models (POMs) and their associated screenshots. It allows users to select from available POMs and view their code and screenshots side by side.

## Features

### POM Selection
- Dropdown menu to select from available POMs
- Displays page name and relative path for each POM
- Handles empty state when no POMs are available

### Code Display
- Syntax-highlighted code view
- Scrollable code area with custom styling
- Shows file path in the header
- Displays placeholder text when no POM is selected

### Screenshot Display
- Side-by-side view with code
- Responsive image display with proper scaling
- Error handling for missing screenshots
- Fallback message when screenshot is not available

### Error Handling
- Loading states for both list and details
- Error messages for failed API calls
- Graceful handling of missing screenshots
- Initial state handling to prevent misleading errors

## API Integration

### Endpoints Used
1. `GET /api/poms`
   - Fetches list of available POMs
   - Returns array of `PomInfo` objects

2. `GET /api/pom-content`
   - Fetches content of selected POM
   - Requires `path` parameter
   - Returns POM code content

3. `GET /generated-output/[pageName]/[pageName].png`
   - Serves screenshot images
   - Static file serving from server

### Data Structure
```typescript
interface PomInfo {
    pageName: string;
    pomPath: string;
    screenshotPath: string | null;
}
```

## Usage

### Integration
The component is integrated into the main `App.tsx` and appears below the Results section. It requires no additional props as it manages its own state and API calls.

### Styling
The component uses Tailwind CSS classes for styling and follows the Atenea Conocimientos design system:
- Dark theme with custom colors
- Responsive layout (stacks on mobile, side-by-side on desktop)
- Custom scrollbars
- Loading animations
- Error state styling

## Error States

### Initial Load
- Shows loading state while fetching POM list
- Only displays error if fetch attempt fails
- Prevents misleading error messages when no POMs exist

### POM Selection
- Shows loading state while fetching POM content
- Displays error if content fetch fails
- Handles missing screenshots gracefully

### Screenshot Display
- Shows fallback message if screenshot fails to load
- Hides broken image and displays error message
- Maintains layout integrity during error states

## Best Practices

1. **Error Handling**
   - Always check for API response status
   - Provide meaningful error messages
   - Handle edge cases gracefully

2. **Performance**
   - Lazy load images
   - Use proper image sizing
   - Implement efficient code display

3. **User Experience**
   - Clear loading states
   - Intuitive error messages
   - Responsive design
   - Accessible interface 