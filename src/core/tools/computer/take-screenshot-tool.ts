/**
 * @file Take screenshot tool
 * @description Tool for taking screenshots of the current screen
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { computerService } from '../../services/computer-service';
import { logger } from '../../utils/logger';

/**
 * Schema for screenshot parameters
 */
const takeScreenshotSchema = z.object({
  name: z.string().optional().describe(
    'Optional name for the screenshot file'
  ),
});

/**
 * Tool for taking screenshots of the current screen
 */
export const takeScreenshotTool = new DynamicStructuredTool({
  name: 'takeScreenshot',
  description: 'Takes a screenshot of the current screen state',
  schema: takeScreenshotSchema,
  func: async ({ name }) => {
    try {
      logger.info('Taking screenshot', { name: name || 'unnamed' });
      
      // Take the screenshot
      const screenshotPath = await computerService.takeScreenshot(name);
      
      // Get the base64 representation for analysis
      const screenshotBase64 = await computerService.getScreenshotBase64();
      
      return JSON.stringify({
        success: true,
        path: screenshotPath,
        message: `Screenshot saved to ${screenshotPath}`,
        // Return a truncated version of base64 for debugging (full would be too large)
        base64Preview: `${screenshotBase64.substring(0, 20)}...${screenshotBase64.substring(screenshotBase64.length - 20)}`
      });
    } catch (error: any) {
      logger.error('Error taking screenshot', { error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
