/**
 * Keyboard Input Example
 * 
 * This example demonstrates how to use keyboard input capabilities 
 * of the r6d9-agent-node library.
 * 
 * Features:
 * - Typing text into a search box
 * - Pressing individual keys (Enter)
 * - Using key combinations (Ctrl+A, Ctrl+C)
 */

import { chromium } from 'playwright';
import { BrowserAgent } from '../../src/core/agent';
import { typeText, pressKey, pressKeyCombination } from '../../src/core/tools/browser/keyboard-tools';
import { consola } from 'consola';

async function main() {
  // Initialize the browser
  consola.info('Initializing browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Initialize the browser agent
  const agent = new BrowserAgent(page);
  
  try {
    // Navigate to a search engine
    consola.info('Navigating to search page...');
    await page.goto('https://www.google.com/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Type text into the search box
    consola.info('Demonstrating text typing...');
    await page.click('input[name="q"]');
    await typeText(page, 'r6d9 agent node keyboard example', 50);
    
    // Press Enter to search
    consola.info('Pressing Enter key to search...');
    await pressKey(page, 'Enter');
    
    // Wait for search results
    await page.waitForLoadState('networkidle');
    
    // Demonstrate key combination (select all text)
    consola.info('Demonstrating key combinations...');
    await page.click('input[name="q"]');
    
    // Select all text using Ctrl+A (or Command+A on Mac)
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    
    await pressKeyCombination(page, [modifierKey, 'a'], true);
    consola.info('Selected all text using Ctrl+A / Command+A');
    
    // Type new text
    await typeText(page, 'r6d9 agent node - advanced browser automation', 50);
    
    // Press Enter again
    await pressKey(page, 'Enter');
    
    // Wait for search results
    await page.waitForLoadState('networkidle');
    
    consola.success('Keyboard input example completed successfully!');
    
    // Keep the browser open for observation (close after 10 seconds)
    consola.info('Keeping browser open for 10 seconds for observation...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    consola.error('Example failed:', error);
  } finally {
    // Close the browser
    consola.info('Closing browser...');
    await browser.close();
  }
}

// Run the example
main().catch(error => {
  consola.error('Unhandled error in main:', error);
  process.exit(1);
});
