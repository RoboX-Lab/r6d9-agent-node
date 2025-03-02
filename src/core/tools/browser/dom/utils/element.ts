/**
 * @file Element utilities
 * @description Utility functions for working with DOM elements
 */

import { Page } from 'playwright';
import { IGNORE_CONFIG } from '../config/ignore';
import { isElementInteractive } from './element-utils';

/**
 * Checks if an element is clickable
 * @param element - DOM element to check
 * @returns Whether the element is clickable
 */
export function isElementClickable(element: Element | null): boolean {
  if (!element) return false;

  try {
    const style = window.getComputedStyle(element);
    const className = (element.className || '').toLowerCase();

    return (
      (element as HTMLElement).onclick != null ||
      style.cursor === 'pointer' ||
      element.getAttribute('role') === 'button' ||
      element.hasAttribute('tabindex') ||
      className.includes('trigger') ||
      className.includes('clickable') ||
      element.querySelector('svg') !== null ||
      element.tagName.toLowerCase() === 'button' ||
      element.tagName.toLowerCase() === 'a' ||
      element.getAttribute('role') === 'link' ||
      element.getAttribute('role') === 'tab'
    );
  } catch (e) {
    console.error('Error checking clickability:', e);
    return false;
  }
}

/**
 * Checks if an element should be ignored during processing
 * @param element - DOM element to check
 * @returns Whether the element should be ignored
 */
export function shouldIgnoreElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const id = element.id;

  return (
    IGNORE_CONFIG.tags.includes(tagName as any) ||
    (id && IGNORE_CONFIG.ids.includes(id as any)) ||
    false
  );
}

/**
 * Injects necessary attributes into the DOM for accessibility processing
 * @param page - Playwright Page object
 * @returns Whether injection was successful
 */
export async function injectMmidAttributes(page: Page): Promise<boolean> {
  const last_mmid = await page.evaluate(
    ({ tags_to_ignore, ids_to_ignore, is_element_interactive }) => {
      // Convert string to function
      const isElementInteractive = new Function(
        'return ' + is_element_interactive,
      )();

      const allElements = document.getElementsByTagName('*');
      let id = +(document.body.getAttribute('last-mmid') ?? -1);

      // Convert HTMLCollection to Array to ensure proper iteration
      const elementsArray = Array.from(allElements);
      for (const element of elementsArray) {
        const tagName = element.tagName.toLocaleLowerCase();

        if (
          tags_to_ignore.includes(tagName) ||
          ids_to_ignore.includes(element.id) ||
          !isElementInteractive(element)
        ) {
          continue;
        }
        const mmid = element.getAttribute('mmid') || String(++id);
        element.setAttribute('mmid', mmid);

        const htmlElement = element as HTMLElement;
        const origOutline = htmlElement.style.outline;
        htmlElement.style.border = '2px solid #3498db';
        if (origOutline) {
          element.setAttribute('orig-border', origOutline);
        }
      }

      document.body.setAttribute('last-mmid', id.toString());
      return id;
    },
    {
      tags_to_ignore: IGNORE_CONFIG.tags,
      ids_to_ignore: IGNORE_CONFIG.ids,
      is_element_interactive: isElementInteractive.toString(),
    },
  );

  return last_mmid !== -1;
}

/**
 * Cleans up injected attributes from the DOM
 * @param page - Playwright Page object
 */
export async function cleanupMmidAttributes(page: Page): Promise<void> {
  await page.evaluate(() => {
    const allElements = document.querySelectorAll('*[mmid]');
    allElements.forEach((element) => {
      element.removeAttribute('mmid');

      const htmlElement = element as HTMLElement;
      htmlElement.style.outline = '';
      const origBorder = element.getAttribute('orig-border');
      if (origBorder) {
        htmlElement.style.border = origBorder;
        element.removeAttribute('orig-border');
      }
    });
  });
}
