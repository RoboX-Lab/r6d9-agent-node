/**
 * @file Google search tool
 * @description Tool for performing Google searches
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { browserService } from '../../services/browser-service';
import { logger } from '../../utils/logger';

/**
 * Tool for performing Google searches
 */
export const googleSearchTool = new DynamicStructuredTool({
  name: 'googleSearch',
  description: 'Perform a Google search query',
  schema: z.object({
    query: z.string().describe('The search query to execute'),
    resultsCount: z.number().optional().describe('Number of results to return (default: 5)'),
  }),
  func: async ({ query, resultsCount = 5 }) => {
    try {
      logger.debug('Performing Google search', { query, resultsCount });
      const page = await browserService.getActivePage();
      
      // Navigate to Google
      await page.goto('https://www.google.com', { waitUntil: 'networkidle' });
      
      // Accept cookies popup if present
      try {
        const acceptButton = await page.$('button:has-text("Accept all")');
        if (acceptButton) {
          await acceptButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        // Ignore errors if cookie consent doesn't appear
      }
      
      // Type search query
      await page.fill('input[name="q"]', query);
      
      // Submit the search
      await page.keyboard.press('Enter');
      
      // Wait for results to load
      await page.waitForSelector('#search');
      
      // Extract search results
      const results = await page.evaluate((count) => {
        const searchResults = [];
        const resultElements = document.querySelectorAll('#search .g');
        
        for (let i = 0; i < Math.min(resultElements.length, count); i++) {
          const element = resultElements[i];
          const titleElement = element.querySelector('h3');
          const linkElement = element.querySelector('a');
          const snippetElement = element.querySelector('.VwiC3b');
          
          if (titleElement && linkElement) {
            searchResults.push({
              title: titleElement.textContent || '',
              url: linkElement.getAttribute('href') || '',
              snippet: snippetElement ? snippetElement.textContent || '' : '',
            });
          }
        }
        
        return searchResults;
      }, resultsCount);
      
      logger.debug('Google search completed', { resultsCount: results.length });
      return JSON.stringify(results, null, 2);
    } catch (error) {
      logger.error('Error performing Google search', { error, query });
      return `Error performing Google search: ${error}`;
    }
  },
});
