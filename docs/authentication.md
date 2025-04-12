# Authentication in MCP POM Generator

## Global Authentication Setup

The system uses `global.setup.ts` to handle authentication automatically. This file is crucial for accessing protected pages and maintaining the session during the POM generation process.

### Required Configuration

1. **Credentials**:
   - Username: Configured in `process.env.BIO_USERNAME` or default value
   - Password: Configured in `process.env.BIO_PASSWORD` or default value

2. **Login Selectors**:
   - Username selector: `[data-testid="email-input"]`
   - Password selector: `[data-testid="password-input"]`
   - Submit button selector: `[data-testid="login-button"]`
   - Welcome message selector: `[data-testid="welcome-message"]`

3. **Login URL**:
   - Base URL configured in `loginUrl`

### Session Storage

The system uses `storageState.json` to:
- Save the session state after successful login
- Reuse the session in subsequent executions
- Maintain authentication during the crawling process

> **Important**: The `storageState.json` file is included in `.gitignore` for security reasons.

## Manual Login Fallback Flow

### When it Activates
The system activates the manual login flow when:
1. Cannot load existing `storageState.json`
2. Saved session has expired
3. Error occurs during automatic authentication process

### Manual Login Process

1. **Login Page Detection**:
   - System automatically searches for links containing "/login", "/signin" or "/auth"
   - If a login link is found, it navigates to that page

2. **User Interaction**:
   - A visible browser window opens
   - User must perform login manually
   - After completing login, press ENTER in the console

3. **Session Storage**:
   - Once manual login is completed, the system:
     - Saves the new session state in `storageState.json`
     - Restarts browser context with new session
     - Continues with crawling process

### Important Considerations

1. **Security**:
   - Credentials are never stored in code
   - Use environment variables for credentials
   - `storageState.json` file should not be shared

2. **Maintenance**:
   - Session may expire over time
   - Manual login may be required periodically
   - System automatically detects when new login is needed

3. **Playwright Integration**:
   - System is integrated with Playwright global configuration
   - Can be configured in `playwright.config.ts`
   - Supports multiple projects with different authentication configurations
