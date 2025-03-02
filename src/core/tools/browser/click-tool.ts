/**
 * @file Click tool
 * @description Tool for clicking elements on a webpage
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { browserService } from '../../services/browser-service';

/**
 * Schema for click parameters
 */
const clickSchema = z.object({
  query_selector: z.string().describe(
    'CSS selector to identify the element to click'
  ),
  description: z.string().optional().describe(
    'Optional description of what is being clicked'
  ),
});

/**
 * Apply visual highlight to element before clicking
 * @param page - Browser page
 * @param selector - CSS selector
 */
async function highlightElement(page: any, selector: string): Promise<void> {
  await page.evaluate((sel: string) => {
    const element = document.querySelector(sel);
    if (element) {
      const originalStyles = element.getAttribute('style') || '';
      element.setAttribute(
        'style', 
        `${originalStyles}; outline: 2px solid red; outline-offset: 2px;`
      );
      
      // Reset after a short delay
      setTimeout(() => {
        element.setAttribute('style', originalStyles);
      }, 2000);
    }
  }, selector);
}

/**
 * Tool for clicking elements on a webpage
 */
export const clickTool = new DynamicStructuredTool({
  name: 'click',
  description: 'Clicks an element on the current web page identified by a CSS selector',
  schema: clickSchema,
  func: async ({ query_selector, description }) => {
    try {
      logger.info('Clicking element', { 
        selector: query_selector, 
        description: description || 'no description' 
      });
      
      // Get the active page
      const page = await browserService.getActivePage();
      
      // Wait for the element to be visible
      await page.waitForSelector(query_selector, { 
        state: 'visible',
        timeout: 10000,
      });
      
      // Highlight the element before clicking (for visual feedback)
      await highlightElement(page, query_selector);
      
      // Get information about the element
      const elementInfo = await page.evaluate((selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        const tagName = element.tagName.toLowerCase();
        const isLink = tagName === 'a';
        const isButton = tagName === 'button' || element.getAttribute('role') === 'button';
        const isSelect = tagName === 'select';
        const isInput = tagName === 'input' && element.getAttribute('type') === 'checkbox';
        const text = element.textContent?.trim() || '';
        
        return { tagName, isLink, isButton, isSelect, isInput, text };
      }, query_selector);
      
      if (!elementInfo) {
        return `Element with selector "${query_selector}" was found but could not be analyzed.`;
      }
      
      // Special handling for links to ensure they open in the same tab
      if (elementInfo.isLink) {
        logger.debug('Clicking link element', { text: elementInfo.text });
        
        // Disable target="_blank" behavior to keep navigation in the same tab
        const navigationPromise = page.waitForNavigation({ 
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        }).catch(() => null); // Don't throw if navigation doesn't happen
        
        await page.click(query_selector);
        await navigationPromise;
        
        return `Successfully clicked link "${elementInfo.text || query_selector}"`;
      }
      
      // Standard click for other elements
      await page.click(query_selector);
      
      // Special reporting for different element types
      if (elementInfo.isButton) {
        return `Successfully clicked button "${elementInfo.text || query_selector}"`;
      } else if (elementInfo.isSelect) {
        return `Successfully clicked select element "${query_selector}"`;
      } else if (elementInfo.isInput) {
        return `Successfully clicked input element "${query_selector}"`;
      } else {
        return `Successfully clicked element "${elementInfo.text || query_selector}"`;
      }
    } catch (error) {
      logger.error('Failed to click element', { 
        selector: query_selector, 
        error 
      });
      return `Failed to click element: ${(error as Error).message}`;
    }
  }
});
