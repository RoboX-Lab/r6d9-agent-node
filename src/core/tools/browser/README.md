# Browser Automation Toolkit

A comprehensive set of tools for browser automation using Playwright. This toolkit provides a high-level API for common browser operations including navigation, DOM manipulation, form handling, cookie management, and more.

## Features

- **Browser Management**: Singleton browser instance with configurable settings
- **Navigation**: Navigate to URLs, manage browser history, refresh pages
- **DOM Interaction**: Click elements, type text, select options, scroll pages
- **Form Handling**: Fill forms, get form fields, find fields by label
- **Screenshots**: Capture full page or element screenshots
- **Cookies**: Get, set, and delete cookies
- **JavaScript Execution**: Run JavaScript in the browser context
- **Network Monitoring**: Intercept requests, track network activity
- **Page Information**: Get page content, DOM structure, clickable elements

## Installation

Make sure you have Playwright installed:

```bash
npm install playwright
```

## Usage Examples

### Basic Navigation

```typescript
import { initBrowser, navigateTo, getPageContent, closeBrowser } from './core-refactored/tools/browser';

async function main() {
  // Initialize the browser
  await initBrowser();
  
  // Navigate to a website
  await navigateTo({ url: 'https://example.com' });
  
  // Get page content
  const content = await getPageContent();
  console.log('Page title:', content.title);
  
  // Close the browser when done
  await closeBrowser();
}

main().catch(console.error);
```

### Form Filling

```typescript
import { initBrowser, navigateTo, getFormFields, fillForm, closeBrowser } from './core-refactored/tools/browser';

async function main() {
  await initBrowser();
  await navigateTo({ url: 'https://example.com/contact' });
  
  // Get all form fields on the page
  const fields = await getFormFields();
  
  // Fill the form
  await fillForm({
    fields: [
      { mmid: fields[0].mmid, value: 'John Doe' },
      { mmid: fields[1].mmid, value: 'john@example.com' },
      { mmid: fields[2].mmid, value: 'Hello, this is a message.' }
    ],
    submit: true,
    waitForNavigation: true
  });
  
  console.log('Form submitted successfully');
  await closeBrowser();
}

main().catch(console.error);
```

### Taking Screenshots

```typescript
import { initBrowser, navigateTo, takeScreenshot, closeBrowser } from './core-refactored/tools/browser';

async function main() {
  await initBrowser();
  await navigateTo({ url: 'https://example.com' });
  
  // Take a full page screenshot
  const screenshotPath = await takeScreenshot({ fullPage: true });
  console.log('Screenshot saved to:', screenshotPath);
  
  await closeBrowser();
}

main().catch(console.error);
```

### Executing JavaScript

```typescript
import { initBrowser, navigateTo, executeJavaScript, closeBrowser } from './core-refactored/tools/browser';

async function main() {
  await initBrowser();
  await navigateTo({ url: 'https://example.com' });
  
  // Execute JavaScript in the page context
  const result = await executeJavaScript({
    script: `
      // Get all headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
      return headings.map(h => ({
        text: h.innerText,
        level: h.tagName.toLowerCase()
      }));
    `
  });
  
  console.log('Headings on the page:', result);
  await closeBrowser();
}

main().catch(console.error);
```

### Cookie Management

```typescript
import { initBrowser, navigateTo, getAllCookies, setCookie, closeBrowser } from './core-refactored/tools/browser';

async function main() {
  await initBrowser();
  await navigateTo({ url: 'https://example.com' });
  
  // Get all cookies
  const cookies = await getAllCookies();
  console.log('Cookies:', cookies);
  
  // Set a new cookie
  await setCookie({
    name: 'example_cookie',
    value: 'test_value',
    expires: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
  });
  
  await closeBrowser();
}

main().catch(console.error);
```

## Key Components

1. **Browser Manager**: Singleton responsible for browser lifecycle management
2. **Navigation Tools**: URL navigation, history management
3. **Interaction Tools**: Element clicking, typing, scrolling
4. **Form Tools**: Form field detection and submission
5. **Info Tools**: Page content and structure retrieval
6. **Screenshot Tools**: Full page and element screenshots
7. **Cookie Tools**: Cookie management
8. **JavaScript Tools**: Script execution
9. **Network Tools**: Request monitoring and interception

## Error Handling

All tools include comprehensive error handling with detailed logging. Most methods return appropriate results or boolean success values, and throw errors with descriptive messages when necessary.

## Browser Configuration

The browser can be configured in the singleton manager instance:

```typescript
// Custom browser configuration
import browserManager from './core-refactored/tools/browser/manager';

const customManager = browserManager({
  headless: true,
  disableSecurity: false,
  chromeInstancePath: '/custom/path/to/chrome'
});
```

## DOM Services

The toolkit provides specialized DOM services:

- **DOM Info Service**: Comprehensive page structure analysis
- **Element Service**: Element detection and manipulation
- **DOM Field Service**: Form field analysis
- **Page Info Service**: Page metadata and content retrieval
