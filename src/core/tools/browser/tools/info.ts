/**
 * @file Information tools
 * @description Tools for retrieving information from the browser
 */

import { z } from 'zod';
import browserManager from '../manager';
import { getDomInfo } from '../dom/services/dom-info';
import { getPageInfo } from '../dom/services/page-info';
import { logger } from '../../../utils/logger';

/**
 * Schema for get page content parameters
 */
export const GetPageContentSchema = z.object({
  includeHtml: z.boolean().optional().default(false),
});

/**
 * Schema for get page DOM parameters
 */
export const GetPageDomSchema = z.object({
  onlyInputFields: z.boolean().optional().default(false),
});

/**
 * Get the content of the current page
 * @param options - Get page content options
 * @returns Page content
 */
export async function getPageContent(options?: z.infer<typeof GetPageContentSchema>): Promise<{
  title: string;
  url: string;
  content: string;
  html?: string;
}> {
  const { includeHtml = false } = options || {};
  
  try {
    logger.info('Getting page content', { includeHtml });
    
    const page = await browserManager.getPage();
    
    // Get the page title, URL, and text content
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        content: document.body.innerText,
        html: document.documentElement.outerHTML,
      };
    });
    
    // Return the requested information
    return {
      title: data.title,
      url: page.url(),
      content: data.content,
      ...(includeHtml ? { html: data.html } : {}),
    };
  } catch (error) {
    logger.error('Error getting page content', { error });
    throw new Error(`Failed to get page content: ${error}`);
  }
}

/**
 * Get the DOM structure of the current page
 * @param options - Get page DOM options
 * @returns DOM structure
 */
export async function getPageDom(options?: z.infer<typeof GetPageDomSchema>) {
  const { onlyInputFields = false } = options || {};
  
  try {
    logger.info('Getting page DOM', { onlyInputFields });
    
    const page = await browserManager.getPage();
    const domInfo = await getDomInfo(page, onlyInputFields);
    
    return domInfo;
  } catch (error) {
    logger.error('Error getting page DOM', { error });
    throw new Error(`Failed to get page DOM: ${error}`);
  }
}

/**
 * Get comprehensive information about the current page
 * @returns Page information
 */
export async function getPageInformation() {
  try {
    logger.info('Getting page information');
    
    const page = await browserManager.getPage();
    const pageInfo = await getPageInfo(page);
    
    return pageInfo;
  } catch (error) {
    logger.error('Error getting page information', { error });
    throw new Error(`Failed to get page information: ${error}`);
  }
}

/**
 * Get a list of clickable elements on the page
 * @returns Clickable elements
 */
export async function getClickableElements() {
  try {
    logger.info('Getting clickable elements');
    
    const page = await browserManager.getPage();
    
    const clickableElements = await page.evaluate(() => {
      function isElementVisible(element: Element) {
        if (!element.getBoundingClientRect) return false;
        
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.right > 0
        );
      }
      
      const elements = Array.from(document.querySelectorAll('*'));
      
      return elements
        .filter((element) => {
          const elementTagName = element.tagName.toLowerCase();
          const isClickable =
            elementTagName === 'a' ||
            elementTagName === 'button' ||
            (elementTagName === 'input' &&
              ['button', 'submit', 'reset'].includes(
                (element as HTMLInputElement).type
              )) ||
            element.getAttribute('role') === 'button' ||
            element.getAttribute('onclick') !== null ||
            element.getAttribute('mmid') !== null;
            
          return isClickable && isElementVisible(element);
        })
        .map((element) => ({
          mmid: element.getAttribute('mmid'),
          tagName: element.tagName.toLowerCase(),
          text: element.textContent?.trim() || '',
          type: element.getAttribute('type') || undefined,
          role: element.getAttribute('role') || undefined,
          href: element.getAttribute('href') || undefined,
        }));
    });
    
    return clickableElements;
  } catch (error) {
    logger.error('Error getting clickable elements', { error });
    throw new Error(`Failed to get clickable elements: ${error}`);
  }
}

/**
 * Extract links from the current page
 * @returns Links on the page
 */
export async function getPageLinks() {
  try {
    logger.info('Getting page links');
    
    const page = await browserManager.getPage();
    
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map((a) => ({
        mmid: a.getAttribute('mmid'),
        text: a.textContent?.trim() || '',
        href: a.getAttribute('href') || '',
        title: a.getAttribute('title') || undefined,
        target: a.getAttribute('target') || undefined,
      }));
    });
    
    return links;
  } catch (error) {
    logger.error('Error getting page links', { error });
    throw new Error(`Failed to get page links: ${error}`);
  }
}
