/**
 * @file Type text tool
 * @description Tool for typing text with the keyboard
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { computerService } from '../../services/computer-service';
import { logger } from '../../utils/logger';

/**
 * Schema for text typing parameters
 */
const typeTextSchema = z.object({
  text: z.string().describe(
    'The text to type'
  ),
  delay: z.number().optional().describe(
    'Optional delay between keystrokes in milliseconds'
  ),
});

/**
 * Tool for typing text
 */
export const typeTextTool = new DynamicStructuredTool({
  name: 'typeText',
  description: 'Types text at the current cursor position',
  schema: typeTextSchema,
  func: async ({ text, delay }) => {
    try {
      logger.info('Typing text', { 
        textLength: text.length,
        textPreview: text.length > 20 ? `${text.substring(0, 20)}...` : text,
        delay 
      });
      
      // Type the text with the specified delay
      await computerService.typeText(text, { delay });
      
      // Take a screenshot to show the result
      const screenshotPath = await computerService.takeScreenshot();
      
      return JSON.stringify({
        success: true,
        message: `Typed text: "${text.length > 30 ? `${text.substring(0, 30)}...` : text}"`,
        screenshotPath,
      });
    } catch (error: any) {
      logger.error('Error typing text', { error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
