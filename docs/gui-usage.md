# GUI Usage Guide

## Overview

The Aegis QA Toolkit provides a modern web interface for generating Page Object Models (POMs) from web applications. This guide explains how to use the GUI effectively.

## Getting Started

1. Start the application:
   ```bash
   npm run start:dev
   ```
   This launches both the backend server and frontend GUI.

2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Using the Interface

### Single Page Analysis

1. Enter the target URL in the input field
2. Click "Analyze Single Page"
3. Wait for the analysis to complete
4. Results will be saved in a page-specific directory:
   ```
   src/output/page-name/
   ├── page-name.ts    # Generated POM
   └── page-name.png   # Page screenshot
   ```

### Multi-Page Crawl

1. Enter the starting URL
2. Click "Start Crawl & Generate POMs"
3. The tool will:
   - Crawl all linked pages
   - Generate POMs for each page
   - Take screenshots of each page
   - Create organized directories:
     ```
     src/output/
     ├── home/
     │   ├── home.ts
     │   └── home.png
     ├── about/
     │   ├── about.ts
     │   └── about.png
     └── contact/
         ├── contact.ts
         └── contact.png
     ```

## Output Structure

For each analyzed page, the tool creates:

1. **Page Directory**
   - Located at `src/output/page-name/`
   - Named using a URL-based slug (e.g., "about-us" for "/about-us")

2. **POM File**
   - Named `page-name.ts`
   - Contains TypeScript class with element selectors
   - Includes interaction methods

3. **Screenshot**
   - Named `page-name.png`
   - Full-page screenshot
   - Useful for:
     - Visual reference
     - Documentation
     - Verification

## Status and Results

The interface provides real-time feedback:

- **Status Panel**: Shows current operation status
- **Results Panel**: Displays analysis results
  - Number of elements found
  - Generated file locations
  - Any errors or warnings

## Error Handling

If errors occur:
1. Check the status panel for error messages
2. Verify the target URL is accessible
3. Ensure authentication is configured if needed
4. Check output directories for partial results 