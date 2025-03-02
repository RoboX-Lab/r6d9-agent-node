/**
 * @file Browser tools index
 * @description Exports all browser-related tools
 */

// Browser manager and setup
export { default as browserManager } from './manager';
export * from './setup';

// Navigation tools
export * from './tools/navigation';
export * from './tools/screenshot';
export * from './tools/interaction';
export * from './tools/info';
export * from './tools/cookies';
export * from './tools/javascript';
export * from './tools/forms';
export * from './tools/network';

// DOM services
export * from './dom/services/dom-info';
export * from './dom/services/element';
export * from './dom/services/dom-field';
// Export page-info with explicit naming to avoid conflicts
export { getPageContent as getDOMPageContent } from './dom/services/page-info';

// DOM types
export * from './dom/types/base';
export * from './dom/types/element';

// DOM utils
// Export element utils with explicit naming to avoid conflicts
export { injectMmidAttributes as injectElementMmidAttributes } from './dom/utils/element';
export * from './dom/utils/element-utils';
export * from './dom/utils/text';

// Import browserManager for use in the functions below
import browserManager from './manager';

/**
 * Initialize the browser with default configuration
 * Usage example:
 * 
 * ```typescript
 * import { initBrowser, navigateTo, getPageContent } from './core-refactored/tools/browser';
 * 
 * async function main() {
 *   await initBrowser();
 *   await navigateTo({ url: 'https://example.com' });
 *   const content = await getPageContent();
 *   console.log(content);
 * }
 * 
 * main().catch(console.error);
 * ```
 */
export async function initBrowser(): Promise<void> {
  // This will initialize the browser with default configuration
  await browserManager.getPage();
}

/**
 * Close the browser instance
 * Should be called when the browser is no longer needed
 */
export async function closeBrowser(): Promise<void> {
  await browserManager.close();
}
