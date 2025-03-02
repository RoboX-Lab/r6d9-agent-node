/**
 * @file JavaScript tools
 * @description Tools for executing JavaScript in the browser
 */

import { z } from 'zod';
import browserManager from '../manager';
import { logger } from '../../../utils/logger';

/**
 * Schema for executing JavaScript
 */
export const ExecuteJavaScriptSchema = z.object({
  script: z.string().nonempty(),
  args: z.array(z.any()).optional(),
});

/**
 * Execute JavaScript in the browser
 * @param params - Execute JavaScript parameters
 * @returns Result of the script execution
 */
export async function executeJavaScript<T = any>({
  script,
  args = [],
}: z.infer<typeof ExecuteJavaScriptSchema>): Promise<T> {
  try {
    logger.info('Executing JavaScript', { scriptLength: script.length });
    
    const page = await browserManager.getPage();
    const result = await page.evaluate(script, ...args);
    
    logger.info('JavaScript executed successfully');
    return result;
  } catch (error) {
    logger.error('Error executing JavaScript', { error });
    throw new Error(`Failed to execute JavaScript: ${error}`);
  }
}

/**
 * Execute JavaScript in the context of a specific element
 * @param selector - CSS selector for the element
 * @param script - JavaScript to execute
 * @returns Result of the script execution
 */
export async function executeJavaScriptOnElement<T = any>(
  selector: string,
  script: string
): Promise<T> {
  try {
    logger.info('Executing JavaScript on element', { selector, scriptLength: script.length });
    
    const page = await browserManager.getPage();
    const element = await page.$(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    const result = await element.evaluate(script);
    
    logger.info('JavaScript executed on element successfully', { selector });
    return result;
  } catch (error) {
    logger.error('Error executing JavaScript on element', { selector, error });
    throw new Error(`Failed to execute JavaScript on element: ${error}`);
  }
}

/**
 * Add a JavaScript event listener to the page
 * @param event - Event name
 * @param handler - JavaScript handler code (as string)
 * @returns Success status
 */
export async function addEventListenerToPage(
  event: string,
  handler: string
): Promise<boolean> {
  try {
    logger.info('Adding event listener to page', { event });
    
    const page = await browserManager.getPage();
    
    await page.evaluate(
      ([eventName, handlerCode]) => {
        // Create a function from the handler code
        const handlerFunction = new Function('event', handlerCode);
        
        // Add the event listener
        window.addEventListener(eventName, handlerFunction);
      },
      [event, handler]
    );
    
    logger.info('Event listener added successfully', { event });
    return true;
  } catch (error) {
    logger.error('Error adding event listener', { event, error });
    return false;
  }
}

/**
 * Wait for a JavaScript condition to be true
 * @param conditionFn - JavaScript condition function (as string)
 * @param timeout - Timeout in milliseconds
 * @returns Success status
 */
export async function waitForCondition(
  conditionFn: string,
  timeout: number = 30000
): Promise<boolean> {
  try {
    logger.info('Waiting for condition', { timeout });
    
    const page = await browserManager.getPage();
    
    await page.waitForFunction(conditionFn, {}, { timeout });
    
    logger.info('Condition met successfully');
    return true;
  } catch (error) {
    logger.error('Error waiting for condition', { error });
    return false;
  }
}

/**
 * Get JavaScript console logs
 * @returns Array of console log entries
 */
export async function getConsoleLogs(): Promise<Array<{ type: string; text: string; }>> {
  try {
    logger.info('Getting console logs');
    
    // Create a new page with console logging
    const browser = await browserManager.getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const logs: Array<{ type: string; text: string }> = [];
    
    // Listen for console events
    page.on('console', (msg) => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
      });
    });
    
    // Navigate to the same URL as the main page
    const mainPage = await browserManager.getPage();
    await page.goto(mainPage.url(), { waitUntil: 'networkidle' });
    
    // Wait a bit to capture logs
    await page.waitForTimeout(1000);
    
    // Close the temporary page and context
    await page.close();
    await context.close();
    
    logger.info('Console logs retrieved successfully', { count: logs.length });
    return logs;
  } catch (error) {
    logger.error('Error getting console logs', { error });
    throw new Error(`Failed to get console logs: ${error}`);
  }
}
