/**
 * @file Navigation tools
 * @description Tools for browser navigation
 */

import { z } from 'zod';
import { Page } from 'playwright';
import browserManager from '../manager';
import { ensureProtocol } from '../dom/utils/url';
import { logger } from '../../../utils/logger';

/**
 * Schema for navigation parameters
 */
export const NavigateToSchema = z.object({
  url: z.string().nonempty(),
});

/**
 * Navigate to a URL
 * @param url - URL to navigate to
 * @returns Page after navigation
 */
export async function navigateTo({ url }: z.infer<typeof NavigateToSchema>): Promise<Page> {
  try {
    // Ensure URL has protocol
    const formattedUrl = ensureProtocol(url);
    logger.info('Navigating to URL', { url: formattedUrl });
    
    // Get browser manager and navigate
    const page = await browserManager.navigateTo(formattedUrl);
    
    // Wait for network idle
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    logger.info('Navigation completed successfully', { url: formattedUrl });
    
    return page;
  } catch (error) {
    logger.error('Error navigating to URL', { url, error });
    throw new Error(`Failed to navigate to ${url}: ${error}`);
  }
}

/**
 * Go back in browser history
 * @returns Page after navigation
 */
export async function goBack(): Promise<Page> {
  try {
    logger.info('Going back in browser history');
    const page = await browserManager.getPage();
    await page.goBack();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    logger.info('Back navigation completed successfully');
    return page;
  } catch (error) {
    logger.error('Error going back in browser history', { error });
    throw new Error(`Failed to go back: ${error}`);
  }
}

/**
 * Go forward in browser history
 * @returns Page after navigation
 */
export async function goForward(): Promise<Page> {
  try {
    logger.info('Going forward in browser history');
    const page = await browserManager.getPage();
    await page.goForward();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    logger.info('Forward navigation completed successfully');
    return page;
  } catch (error) {
    logger.error('Error going forward in browser history', { error });
    throw new Error(`Failed to go forward: ${error}`);
  }
}

/**
 * Refresh the current page
 * @returns Page after refresh
 */
export async function refreshPage(): Promise<Page> {
  try {
    logger.info('Refreshing page');
    const page = await browserManager.getPage();
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    logger.info('Page refresh completed successfully');
    return page;
  } catch (error) {
    logger.error('Error refreshing page', { error });
    throw new Error(`Failed to refresh page: ${error}`);
  }
}

/**
 * Get the current URL
 * @returns Current URL
 */
export async function getCurrentUrl(): Promise<string> {
  try {
    const page = await browserManager.getPage();
    const url = page.url();
    logger.info('Retrieved current URL', { url });
    return url;
  } catch (error) {
    logger.error('Error getting current URL', { error });
    throw new Error(`Failed to get current URL: ${error}`);
  }
}

/**
 * Wait for navigation to complete
 * @returns Page after navigation
 */
export async function waitForNavigation(): Promise<Page> {
  try {
    logger.info('Waiting for navigation to complete');
    const page = await browserManager.getPage();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    logger.info('Navigation completed');
    return page;
  } catch (error) {
    logger.error('Error waiting for navigation', { error });
    throw new Error(`Failed to wait for navigation: ${error}`);
  }
}
