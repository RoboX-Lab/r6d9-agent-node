/**
 * @file Page info service
 * @description Service for retrieving comprehensive information about the current page
 */

import { Page } from 'playwright';
import { getDomInfo } from './dom-info';

/**
 * Gets content from the page
 * @param page - Playwright Page object
 * @returns Object containing different types of page content
 */
export async function getPageContent(
  page: Page,
): Promise<Record<string, string[]>> {
  return page.evaluate(() => {
    const getAttributeContent = (
      elements: NodeListOf<Element>,
      attr: string,
    ): string[] => {
      return Array.from(elements)
        .map((el) => el.getAttribute(attr)?.trim())
        .filter((text): text is string => !!text && text.length > 0);
    };

    function cleanText(text: string): string[] {
      return text
        .trim()
        .split('\n') // Split by lines
        .map((line) => line.trim()) // Remove leading/trailing spaces from each line
        .filter((line) => line.length > 0); // Remove empty lines
    }
    // Array of query selectors to filter out
    const selectorsToFilter: string[] = ['#tawebagent-overlay'];

    // Store the original visibility values to revert later
    const originalStyles: {
      element: HTMLElement;
      originalVisibility: string;
    }[] = [];

    // Hide the elements matching the query selectors
    selectorsToFilter.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        originalStyles.push({
          element: element as HTMLElement,
          originalVisibility: (element as HTMLElement).style.visibility,
        });
        (element as HTMLElement).style.visibility = 'hidden';
      });
    });

    // Get the text content of the page
    const visibleTexts = cleanText(
      document?.body?.innerText || document?.documentElement?.innerText || '',
    );

    // Get alt text from images
    const altTexts = getAttributeContent(
      document.querySelectorAll('img[alt]'),
      'alt',
    );

    // Get aria-label text from elements
    const ariaLabelTexts = getAttributeContent(
      document.querySelectorAll('[aria-label]'),
      'aria-label',
    );

    // Get placeholder text from form elements
    const placeholderTexts = getAttributeContent(
      document.querySelectorAll('[placeholder]'),
      'placeholder',
    );

    return {
      'Page visible texts': visibleTexts,
      'Page alt texts': altTexts,
      'Page aria-label texts': ariaLabelTexts,
      'Page placeholder texts': placeholderTexts,
    };
  });
}

/**
 * Gets comprehensive page information
 * @param page - Playwright Page object
 * @returns Formatted string with page information
 */
export async function getPageInfo(page: Page): Promise<string> {
  try {
    const url = page.url();
    const title = await page.title();
    const content = await getPageContent(page);
    const domInfo = await getDomInfo(page);

    return `
      Url: ${url}
      Title: ${title}
      ${Object.keys(content)
        .map((key) => `${key}: ${content[key].join('、')}`)
        .join('\n')}
      Dom Tree: ${JSON.stringify(domInfo)}
    `;
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return `Failed to get page info. Error: ${errorMessage}`;
  }
}
