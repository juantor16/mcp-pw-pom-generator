# Frontend Implementation

## Overview
The frontend of the MCP Playwright POM Generator is built using React and TypeScript, with Tailwind CSS for styling. It provides a user interface for analyzing web pages, generating POMs, and visualizing the results.

## Components

### App.tsx
The main application component that orchestrates the entire interface. It includes:
- URL input field
- Analysis and crawl buttons
- Status display
- Results section
- POM Visualizer integration

### PomVisualizer.tsx
A dedicated component for viewing generated POMs and their screenshots. See [POM Visualizer Documentation](./pom-visualizer.md) for details.

## Styling

### Tailwind CSS Configuration
The application uses Tailwind CSS with custom configuration:
- Custom color palette matching Atenea Conocimientos brand
- Responsive design utilities
- Custom component classes
- Dark theme implementation

### Custom Styles (App.css)
- Base styles for body and typography
- Component classes for buttons, inputs, and cards
- Custom scrollbar styling
- Loading animations
- Code block styling

## API Integration

### Endpoints
1. Analysis and Crawling
   - `/api/analyze` - Single page analysis
   - `/api/crawl` - Multi-page crawling

2. POM Visualization
   - `/api/poms` - List available POMs
   - `/api/pom-content` - Get POM code content
   - `/generated-output/` - Serve screenshots

### Error Handling
- Loading states for all API calls
- Error message display
- Graceful fallbacks for missing data
- Initial state management

## State Management

### App State
- URL input
- Analysis results
- Crawl results
- Loading states
- Error states

### PomVisualizer State
- Available POMs list
- Selected POM
- POM code content
- Screenshot URLs
- Loading and error states

## Best Practices

1. **Component Structure**
   - Clear separation of concerns
   - Reusable components
   - Proper TypeScript typing
   - Efficient state management

2. **Styling**
   - Consistent use of Tailwind classes
   - Responsive design
   - Dark theme support
   - Accessible color contrast

3. **Error Handling**
   - Clear error messages
   - Loading states
   - Graceful fallbacks
   - User-friendly error display

4. **Performance**
   - Efficient API calls
   - Proper image handling
   - Responsive layout
   - Optimized rendering

## Development

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

### Building
```bash
npm run build
```

### Testing
```bash
npm run test
```

## Integration with Backend
The frontend communicates with the backend server running on `http://localhost:3001`. Ensure the backend server is running before starting the frontend development server. 