/**
 * @file Press key tool
 * @description Tool for pressing keyboard keys and key combinations
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { computerService } from '../../services/computer-service';
import { logger } from '../../utils/logger';

/**
 * Schema for key press parameters
 */
const pressKeySchema = z.object({
  key: z.string().describe(
    'The key or key combination to press (e.g., "Enter", "Control+C", "Shift+Tab")'
  ),
});

/**
 * Tool for pressing keyboard keys
 */
export const pressKeyTool = new DynamicStructuredTool({
  name: 'pressKey',
  description: 'Presses a specific key or key combination',
  schema: pressKeySchema,
  func: async ({ key }) => {
    try {
      logger.info('Pressing key', { key });
      
      // Press the key
      await computerService.pressKey(key);
      
      // Take a screenshot to show the result
      const screenshotPath = await computerService.takeScreenshot();
      
      return JSON.stringify({
        success: true,
        message: `Pressed key: ${key}`,
        screenshotPath,
      });
    } catch (error: any) {
      logger.error('Error pressing key', { error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
