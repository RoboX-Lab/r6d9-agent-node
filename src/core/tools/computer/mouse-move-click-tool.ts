/**
 * @file Mouse move and click tool
 * @description Tool for moving the mouse and clicking
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { computerService } from '../../services/computer-service';
import { logger } from '../../utils/logger';

/**
 * Schema for mouse move and click parameters
 */
const mouseMoveClickSchema = z.object({
  x: z.number().describe(
    'The x coordinate to move the mouse to'
  ),
  y: z.number().describe(
    'The y coordinate to move the mouse to'
  ),
  click: z.boolean().optional().describe(
    'Whether to click after moving the mouse'
  ),
  button: z.enum(['left', 'right', 'middle']).optional().describe(
    'The mouse button to click with'
  ),
  description: z.string().optional().describe(
    'Optional description of what is being clicked'
  ),
});

/**
 * Tool for moving the mouse and optionally clicking
 */
export const mouseMoveClickTool = new DynamicStructuredTool({
  name: 'mouseMoveClick',
  description: 'Moves the mouse to specific coordinates and optionally clicks',
  schema: mouseMoveClickSchema,
  func: async ({ x, y, click = true, button = 'left', description }) => {
    try {
      logger.info('Moving mouse', { 
        x, 
        y, 
        click, 
        button,
        description: description || 'no description' 
      });
      
      // Move the mouse
      await computerService.moveMouse(x, y);
      
      // Click if requested
      if (click) {
        await computerService.clickMouse(button);
      }
      
      // Take a screenshot to show the result
      const screenshotPath = await computerService.takeScreenshot();
      
      return JSON.stringify({
        success: true,
        message: click 
          ? `Mouse moved to coordinates (${x},${y}) and ${button} clicked` 
          : `Mouse moved to coordinates (${x},${y})`,
        screenshotPath,
        description: description || '',
      });
    } catch (error: any) {
      logger.error('Error with mouse operation', { error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
