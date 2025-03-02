/**
 * @file Network tools
 * @description Tools for monitoring and interacting with network requests in the browser
 */

import { z } from 'zod';
import browserManager from '../manager';
import { logger } from '../../../utils/logger';

/**
 * Schema for request interception
 */
export const InterceptRequestSchema = z.object({
  urlPattern: z.string(),
  resourceType: z.enum([
    'document',
    'stylesheet',
    'image',
    'media',
    'font',
    'script',
    'texttrack',
    'xhr',
    'fetch',
    'eventsource',
    'websocket',
    'manifest',
    'other'
  ]).optional(),
  action: z.enum(['block', 'continue', 'abort']),
});

/**
 * Network request object
 */
export interface NetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  status: number;
  statusText: string;
  response?: string;
  headers: Record<string, string>;
  timing?: {
    startTime: number;
    domainLookupStart: number;
    domainLookupEnd: number;
    connectStart: number;
    connectEnd: number;
    secureConnectionStart: number;
    requestStart: number;
    responseStart: number;
    responseEnd: number;
  };
}

/**
 * Enable request interception
 * @param params - Interception parameters
 * @returns Success status
 */
export async function interceptRequests(
  params: z.infer<typeof InterceptRequestSchema>[]
): Promise<boolean> {
  try {
    logger.info('Setting up request interception', { rulesCount: params.length });
    
    const page = await browserManager.getPage();
    
    // Enable request interception
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      const resourceType = request.resourceType();
      
      // Check if any rule matches
      for (const rule of params) {
        // Check if URL matches the pattern
        if (new RegExp(rule.urlPattern).test(url)) {
          // If resourceType is specified, it must match as well
          if (rule.resourceType && rule.resourceType !== resourceType) {
            continue;
          }
          
          // Apply the specified action
          switch (rule.action) {
            case 'block':
              logger.debug('Blocking request', { url, resourceType });
              await route.abort();
              return;
            case 'abort':
              logger.debug('Aborting request', { url, resourceType });
              await route.abort('failed');
              return;
            case 'continue':
              logger.debug('Continuing request', { url, resourceType });
              await route.continue();
              return;
          }
        }
      }
      
      // No rule matched, continue by default
      await route.continue();
    });
    
    logger.info('Request interception set up successfully');
    return true;
  } catch (error) {
    logger.error('Error setting up request interception', { error });
    return false;
  }
}

/**
 * Disable request interception
 * @returns Success status
 */
export async function disableRequestInterception(): Promise<boolean> {
  try {
    logger.info('Disabling request interception');
    
    const page = await browserManager.getPage();
    
    // Remove all route handlers
    await page.unroute('**/*');
    
    logger.info('Request interception disabled successfully');
    return true;
  } catch (error) {
    logger.error('Error disabling request interception', { error });
    return false;
  }
}

/**
 * Get all network requests made during page load
 * @returns Array of network requests
 */
export async function getNetworkRequests(): Promise<NetworkRequest[]> {
  try {
    logger.info('Getting network requests');
    
    // Create a new page with request tracking
    const browser = await browserManager.getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const requests: NetworkRequest[] = [];
    
    // Listen for request and response events
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        status: 0,
        statusText: '',
        headers: request.headers(),
      });
    });
    
    page.on('response', async (response) => {
      const request = response.request();
      const url = request.url();
      
      // Find the corresponding request
      const requestRecord = requests.find((r) => r.url === url);
      if (requestRecord) {
        requestRecord.status = response.status();
        requestRecord.statusText = response.statusText();
        
        // Add response headers
        const responseHeaders = await response.allHeaders();
        requestRecord.headers = { ...requestRecord.headers, ...responseHeaders };
        
        // Add timing information if available
        const timing = response.timing();
        if (timing) {
          requestRecord.timing = timing;
        }
        
        // For text responses, add the response body (limit to avoid huge responses)
        const contentType = response.headers()['content-type'] || '';
        if (
          contentType.includes('json') ||
          contentType.includes('text') ||
          contentType.includes('javascript')
        ) {
          try {
            const text = await response.text();
            // Limit response size
            requestRecord.response = text.substring(0, 5000);
            if (text.length > 5000) {
              requestRecord.response += '... (truncated)';
            }
          } catch (error) {
            logger.debug('Error getting response text', { url, error });
          }
        }
      }
    });
    
    // Navigate to the same URL as the main page
    const mainPage = await browserManager.getPage();
    await page.goto(mainPage.url(), { waitUntil: 'networkidle' });
    
    // Wait a bit for any remaining responses
    await page.waitForTimeout(1000);
    
    // Close the temporary page and context
    await page.close();
    await context.close();
    
    logger.info('Network requests retrieved successfully', { count: requests.length });
    return requests;
  } catch (error) {
    logger.error('Error getting network requests', { error });
    throw new Error(`Failed to get network requests: ${error}`);
  }
}

/**
 * Wait for a specific network request to complete
 * @param urlPattern - URL pattern to match
 * @param timeout - Timeout in milliseconds
 * @returns Success status
 */
export async function waitForRequest(
  urlPattern: string,
  timeout: number = 30000
): Promise<boolean> {
  try {
    logger.info('Waiting for request', { urlPattern, timeout });
    
    const page = await browserManager.getPage();
    
    // Wait for request
    await page.waitForRequest(urlPattern, { timeout });
    
    logger.info('Request detected successfully', { urlPattern });
    return true;
  } catch (error) {
    logger.error('Error waiting for request', { urlPattern, error });
    return false;
  }
}

/**
 * Wait for a specific network response to complete
 * @param urlPattern - URL pattern to match
 * @param timeout - Timeout in milliseconds
 * @returns Success status
 */
export async function waitForResponse(
  urlPattern: string,
  timeout: number = 30000
): Promise<boolean> {
  try {
    logger.info('Waiting for response', { urlPattern, timeout });
    
    const page = await browserManager.getPage();
    
    // Wait for response
    await page.waitForResponse(urlPattern, { timeout });
    
    logger.info('Response detected successfully', { urlPattern });
    return true;
  } catch (error) {
    logger.error('Error waiting for response', { urlPattern, error });
    return false;
  }
}
