/**
 * @file Open URL tool
 * @description Tool for navigating to a specified URL
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { browserService } from '../../services/browser-service';

/**
 * Schema for open URL parameters
 */
const openUrlSchema = z.object({
  url: z.string().url().describe('The URL to navigate to'),
  timeout: z.number().min(1).max(60).optional().describe(
    'Additional time in seconds to wait after the initial load (1-60)'
  ),
});

/**
 * Tool for navigating to a specified URL
 */
export const openUrlTool = new DynamicStructuredTool({
  name: 'open_url',
  description: 'Opens a specified URL in the browser',
  schema: openUrlSchema,
  func: async ({ url, timeout = 3 }) => {
    try {
      logger.info('Opening URL', { url, timeout });
      
      // Initialize browser if not already initialized
      const browser = await browserService.getBrowser();
      
      // Get the current page or create a new one
      const page = await browserService.getActivePage();
      
      // Navigate to the URL
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000, // 30 seconds timeout for initial navigation
      });
      
      // Wait for additional time if specified
      if (timeout > 0) {
        logger.debug('Waiting additional time', { seconds: timeout });
        await page.waitForTimeout(timeout * 1000);
      }
      
      // Get the final URL (in case of redirects)
      const finalUrl = page.url();
      
      logger.info('Successfully navigated to URL', { 
        originalUrl: url, 
        finalUrl,
      });
      
      return `Successfully navigated to ${finalUrl}`;
    } catch (error) {
      logger.error('Failed to open URL', { url, error });
      return `Failed to open URL: ${(error as Error).message}`;
    }
  }
});
