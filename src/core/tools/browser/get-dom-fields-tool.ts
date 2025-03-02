/**
 * @file Get DOM fields tool
 * @description Tool for retrieving form fields and interactive elements from a web page
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { browserService } from '../../services/browser-service';
import { logger } from '../../utils/logger';

/**
 * Field type definitions
 */
const FIELD_TYPES = [
  'input', 'textarea', 'select', 'button', 'a', 'checkbox', 'radio'
] as const;

type FieldType = typeof FIELD_TYPES[number];

/**
 * Tool for retrieving form fields and interactive elements
 */
export const getDomFieldsTool = new DynamicStructuredTool({
  name: 'getDomFields',
  description: 'Get information about form fields and interactive elements on the current page',
  schema: z.object({
    types: z.array(z.enum(FIELD_TYPES)).optional()
      .describe('Types of fields to retrieve (defaults to all types)'),
    includeDisabled: z.boolean().optional()
      .describe('Whether to include disabled fields (defaults to false)'),
  }),
  func: async ({ types = FIELD_TYPES, includeDisabled = false }) => {
    try {
      logger.debug('Getting DOM fields', { types, includeDisabled });
      const page = await browserService.getActivePage();
      
      // Build the selector based on requested field types
      const typeSelectors = types.map(type => {
        if (type === 'button') return 'button, input[type="button"], input[type="submit"]';
        if (type === 'checkbox') return 'input[type="checkbox"]';
        if (type === 'radio') return 'input[type="radio"]';
        return type;
      });
      
      const selector = typeSelectors.join(', ');
      
      // Execute script in the page context to get field information
      const fields = await page.evaluate(
        ({ selector, includeDisabled }) => {
          const elements = Array.from(document.querySelectorAll(selector));
          
          return elements
            .filter(el => includeDisabled || !el.hasAttribute('disabled'))
            .map(el => {
              // Get basic information available for all elements
              const rect = el.getBoundingClientRect();
              const attributes: Record<string, string> = {};
              
              // Get all attributes
              Array.from(el.attributes).forEach(attr => {
                attributes[attr.name] = attr.value;
              });
              
              // Get basic information available for all elements
              const result = {
                tagName: el.tagName.toLowerCase(),
                type: (el as HTMLInputElement).type || el.tagName.toLowerCase(),
                id: el.id || '',
                name: (el as HTMLInputElement).name || '',
                value: (el as HTMLInputElement).value || '',
                placeholder: (el as HTMLInputElement).placeholder || '',
                text: el.textContent?.trim() || '',
                isVisible: rect.width > 0 && rect.height > 0,
                isDisabled: el.hasAttribute('disabled'),
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                attributes,
              };
              
              return result;
            });
        },
        { selector, includeDisabled }
      );
      
      logger.debug('Found DOM fields', { count: fields.length });
      return JSON.stringify(fields, null, 2);
    } catch (error) {
      logger.error('Error getting DOM fields', { error });
      return `Error getting DOM fields: ${error}`;
    }
  },
});
