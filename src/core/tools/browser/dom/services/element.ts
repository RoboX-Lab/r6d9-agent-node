/**
 * @file Element service
 * @description Services for working with DOM elements
 */

import { Page } from 'playwright';
import { cleanupMmidAttributes, injectMmidAttributes } from '../utils/element';

/**
 * Retrieves all elements with valid mmid attributes
 * @param page - Playwright Page object
 * @param autoReinject - Whether to automatically reinject mmid attributes
 * @returns Dictionary of elements by mmid
 */
export async function getElementsWithMmid(
  page: Page,
  autoReinject = false,
): Promise<Record<string, Element>> {
  if (autoReinject) {
    await cleanupMmidAttributes(page);
    await injectMmidAttributes(page);
  }
  return await page.evaluate(() => {
    function isSpaceDelimitedMmid(s: string): boolean {
      // Use test() to check if the entire string matches the pattern
      return /^[\d ]+$/.test(s);
    }

    const allElements = document.querySelectorAll('*[mmid]');
    const dict: Record<string, Element> = {};

    allElements.forEach((element) => {
      const mmid = element.getAttribute('mmid');
      if (mmid !== null && isSpaceDelimitedMmid(mmid)) {
        dict[mmid] = element;
        // mmids.push(mmid);
      }
    });

    return dict;
  });
}

/**
 * Get an element by MMID
 * @param page - Playwright Page object
 * @param mmid - MMID of the element
 * @returns The element handle if found, null otherwise
 */
export async function getElementByMmid(
  page: Page,
  mmid: string
): Promise<any> {
  try {
    // Use page.$ to get the ElementHandle for the element with the given mmid
    return await page.$(`.mmid-${mmid}`);
  } catch (error) {
    console.error(`Error getting element by MMID: ${error}`);
    return null;
  }
}
