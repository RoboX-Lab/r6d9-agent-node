/**
 * @file Cookie tools
 * @description Tools for managing cookies in the browser
 */

import { z } from 'zod';
import browserManager from '../manager';
import { logger } from '../../../utils/logger';

/**
 * Schema for cookie object
 */
export const CookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  domain: z.string().optional(),
  path: z.string().optional().default('/'),
  expires: z.number().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
});

/**
 * Schema for setting a cookie
 */
export const SetCookieSchema = CookieSchema;

/**
 * Schema for deleting a cookie
 */
export const DeleteCookieSchema = z.object({
  name: z.string(),
  domain: z.string().optional(),
  path: z.string().optional().default('/'),
});

/**
 * Get all cookies for the current page
 * @returns Array of cookies
 */
export async function getAllCookies() {
  try {
    logger.info('Getting all cookies');
    
    const page = await browserManager.getPage();
    const context = page.context();
    const cookies = await context.cookies();
    
    logger.info('Retrieved cookies successfully', { count: cookies.length });
    return cookies;
  } catch (error) {
    logger.error('Error getting cookies', { error });
    throw new Error(`Failed to get cookies: ${error}`);
  }
}

/**
 * Get a specific cookie by name
 * @param name - Cookie name
 * @returns Cookie if found, null otherwise
 */
export async function getCookie(name: string) {
  try {
    logger.info('Getting cookie', { name });
    
    const page = await browserManager.getPage();
    const context = page.context();
    const cookies = await context.cookies();
    
    const cookie = cookies.find((c) => c.name === name);
    
    if (cookie) {
      logger.info('Cookie found', { name });
    } else {
      logger.info('Cookie not found', { name });
    }
    
    return cookie || null;
  } catch (error) {
    logger.error('Error getting cookie', { name, error });
    throw new Error(`Failed to get cookie '${name}': ${error}`);
  }
}

/**
 * Set a cookie
 * @param cookie - Cookie to set
 * @returns Success status
 */
export async function setCookie(cookie: z.infer<typeof SetCookieSchema>): Promise<boolean> {
  try {
    logger.info('Setting cookie', { name: cookie.name });
    
    const page = await browserManager.getPage();
    const context = page.context();
    
    // If domain is not provided, use the current page's domain
    if (!cookie.domain) {
      const url = new URL(page.url());
      cookie.domain = url.hostname;
    }
    
    await context.addCookies([cookie as any]);
    
    logger.info('Cookie set successfully', { name: cookie.name });
    return true;
  } catch (error) {
    logger.error('Error setting cookie', { name: cookie.name, error });
    return false;
  }
}

/**
 * Delete a cookie
 * @param params - Delete cookie parameters
 * @returns Success status
 */
export async function deleteCookie({
  name,
  domain,
  path = '/',
}: z.infer<typeof DeleteCookieSchema>): Promise<boolean> {
  try {
    logger.info('Deleting cookie', { name });
    const page = await browserManager.getPage();
    const context = page.context();
    
    // If domain is not provided, use the current page's domain
    if (!domain) {
      const url = new URL(page.url());
      domain = url.hostname;
    }
    
    await context.clearCookies({
      name, 
      domain, 
      path 
    });
    
    logger.info('Cookie deleted successfully', { name });
    return true;
  } catch (error) {
    logger.error('Error deleting cookie', { name, error });
    return false;
  }
}

/**
 * Clear all cookies
 * @returns Success status
 */
export async function clearAllCookies(): Promise<boolean> {
  try {
    logger.info('Clearing all cookies');
    
    const page = await browserManager.getPage();
    const context = page.context();
    
    await context.clearCookies();
    
    logger.info('All cookies cleared successfully');
    return true;
  } catch (error) {
    logger.error('Error clearing cookies', { error });
    return false;
  }
}
