/**
 * @file Press key combination tool
 * @description Tool for pressing key combinations on a web page
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { browserService } from '../../services/browser-service';
import { logger } from '../../utils/logger';

/**
 * Common key combinations
 */
const COMMON_KEY_COMBOS = [
  'Control+A', 'Control+C', 'Control+V', 'Control+Z',
  'Meta+A', 'Meta+C', 'Meta+V', 'Meta+Z',
  'Escape', 'Tab', 'Enter', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight',
] as const;

/**
 * Tool for pressing key combinations
 */
export const pressKeyCombinationTool = new DynamicStructuredTool({
  name: 'pressKeyCombination',
  description: 'Press a key combination on the current page',
  schema: z.object({
    keys: z.string().describe(
      'Key combination to press (e.g., "Control+A", "Enter", "Escape")'
    ),
    selector: z.string().optional().describe(
      'Optional selector to focus before pressing keys'
    ),
  }),
  func: async ({ keys, selector }) => {
    try {
      logger.debug('Pressing key combination', { keys, selector });
      const page = await browserService.getActivePage();
      
      // Focus the element if a selector was provided
      if (selector) {
        logger.debug('Focusing element before key press', { selector });
        await page.focus(selector);
      }
      
      // Split the key combination
      const keyParts = keys.split('+');
      
      // For single key press
      if (keyParts.length === 1) {
        await page.keyboard.press(keys);
      } 
      // For key combinations
      else {
        // Press all modifier keys
        for (let i = 0; i < keyParts.length - 1; i++) {
          await page.keyboard.down(keyParts[i]);
        }
        
        // Press the final key
        const finalKey = keyParts[keyParts.length - 1];
        await page.keyboard.press(finalKey);
        
        // Release all modifier keys in reverse order
        for (let i = keyParts.length - 2; i >= 0; i--) {
          await page.keyboard.up(keyParts[i]);
        }
      }
      
      logger.debug('Key combination pressed successfully', { keys });
      return `Key combination pressed successfully: ${keys}`;
    } catch (error) {
      logger.error('Error pressing key combination', { error, keys });
      return `Error pressing key combination: ${error}`;
    }
  },
});
