/**
 * @file Enter text tool
 * @description Tool for entering text into input fields on a web page
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { browserService } from '../../services/browser-service';
import { logger } from '../../utils/logger';

/**
 * Tool for entering text into input fields
 */
export const enterTextTool = new DynamicStructuredTool({
  name: 'enterText',
  description: 'Enter text into an input field on the current page',
  schema: z.object({
    selector: z.string().describe('CSS or XPath selector for the input element'),
    text: z.string().describe('Text to enter into the input field'),
    delay: z.number().optional().describe('Delay between keystrokes in milliseconds'),
  }),
  func: async ({ selector, text, delay = 0 }) => {
    try {
      logger.debug('Entering text', { selector, textLength: text.length, delay });
      const page = await browserService.getActivePage();
      
      // Try to find the element
      const element = await page.$(selector);
      if (!element) {
        logger.error('Element not found', { selector });
        return `Element not found with selector: ${selector}`;
      }
      
      // Clear existing text if any
      await element.click({ clickCount: 3 }); // Triple click to select all
      await element.press('Backspace');
      
      // Enter the new text with optional delay
      await element.type(text, { delay });
      
      logger.debug('Text entered successfully', { selector });
      return `Text entered successfully into element: ${selector}`;
    } catch (error) {
      logger.error('Error entering text', { error, selector });
      return `Error entering text: ${error}`;
    }
  },
});
