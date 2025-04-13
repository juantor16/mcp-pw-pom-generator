# Configuration Guide

This guide will help you set up and configure the necessary components for the MCP Playwright POM Generator project.

## Table of Contents
- [Environment Variables](#environment-variables)
- [Playwright Configuration](#playwright-configuration)
- [Global Setup](#global-setup)
- [Authentication Setup](#authentication-setup)
- [UI Configuration](#ui-configuration)

## Environment Variables

The following environment variables are required for the project to function correctly:

```bash
# Authentication
BIO_USERNAME=your_username
BIO_PASSWORD=your_password

# Application URLs
LOGIN_URL=https://your-application.com/login
BASE_URL=https://your-application.com

# Optional: Session Storage
STORAGE_STATE_PATH=./playwright/.auth/user.json
```

You can set these variables in your `.env` file or directly in your environment.

## Playwright Configuration

The `playwright.config.ts` file should be configured as follows:

```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./src/global.setup.ts'),
  use: {
    storageState: process.env.STORAGE_STATE_PATH,
    baseURL: process.env.BASE_URL,
  },
  // ... other configuration options
};

export default config;
```

## Global Setup

The `src/global.setup.ts` file handles authentication and session management. You'll need to configure it with your application-specific selectors:

```typescript
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Configure these selectors based on your application
  const loginSelectors = {
    username: '#username',
    password: '#password',
    submit: '#login-button',
  };

  // Login process
  await page.goto(process.env.LOGIN_URL!);
  await page.fill(loginSelectors.username, process.env.BIO_USERNAME!);
  await page.fill(loginSelectors.password, process.env.BIO_PASSWORD!);
  await page.click(loginSelectors.submit);
  
  // Save authentication state
  await page.context().storageState({ path: process.env.STORAGE_STATE_PATH });
  await browser.close();
}

export default globalSetup;
```

## Authentication Setup

The authentication system supports both automatic and manual login processes:

1. **Automatic Login**: Configured through environment variables and global setup
2. **Manual Login**: Fallback mechanism when automatic login fails

To set up authentication:

1. Ensure your environment variables are properly set
2. Configure the login selectors in `global.setup.ts`
3. Verify the storage state path is correctly set

## UI Configuration

The project uses Tailwind CSS for styling. The configuration is set up in:

1. `tailwind.config.js`: Contains theme configuration and customizations
2. `postcss.config.js`: PostCSS configuration for Tailwind
3. `src/index.css`: Global styles and component classes

### Customizing the UI

You can customize the UI by:

1. Modifying the color scheme in `tailwind.config.js`
2. Adding custom components in `src/index.css`
3. Creating new utility classes as needed

### Available UI Components

The following utility classes are available:

- `.btn-primary`: Primary button style
- `.btn-secondary`: Secondary button style
- `.input-field`: Standard input field style
- `.card`: Card container style

## Troubleshooting

If you encounter issues:

1. Verify all environment variables are set correctly
2. Check that the login selectors match your application's HTML structure
3. Ensure the storage state path is writable
4. Verify that the base URL and login URL are correct

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Environment Variables Best Practices](https://12factor.net/config) 