/**
 * @file Get page URL tool
 * @description Tool for retrieving the current page URL
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { browserService } from '../../services/browser-service';
import { logger } from '../../utils/logger';

/**
 * Tool for getting the current page URL
 */
export const getPageUrlTool = new DynamicStructuredTool({
  name: 'getPageUrl',
  description: 'Gets the URL of the current page',
  schema: z.object({}),
  func: async () => {
    try {
      logger.debug('Getting current page URL');
      const page = await browserService.getActivePage();
      const url = page.url();
      logger.debug('Current page URL', { url });
      return url;
    } catch (error) {
      logger.error('Error getting page URL', { error });
      return 'Error getting page URL';
    }
  },
});
