/**
 * @file Interaction tools
 * @description Tools for interacting with elements in the browser
 */

import { z } from 'zod';
import browserManager from '../manager';
import { logger } from '../../../utils/logger';

/**
 * Schema for click element parameters
 */
export const ClickElementSchema = z.object({
  mmid: z.string().nonempty(),
  waitForNavigation: z.boolean().optional().default(true),
});

/**
 * Schema for typing into an element parameters
 */
export const TypeIntoElementSchema = z.object({
  mmid: z.string().nonempty(),
  text: z.string().nonempty(),
  delay: z.number().optional(),
  pressEnter: z.boolean().optional().default(false),
});

/**
 * Schema for select option parameters
 */
export const SelectOptionSchema = z.object({
  mmid: z.string().nonempty(),
  value: z.string().optional(),
  label: z.string().optional(),
  index: z.number().optional(),
});

/**
 * Schema for wait for element parameters
 */
export const WaitForElementSchema = z.object({
  selector: z.string().nonempty(),
  timeout: z.number().optional().default(30000),
  state: z
    .enum(['visible', 'hidden', 'attached', 'detached'])
    .optional()
    .default('visible'),
});

/**
 * Click an element by MMID
 * @param params - Click element parameters
 * @returns Success status
 */
export async function clickElement({
  mmid,
  waitForNavigation = true,
}: z.infer<typeof ClickElementSchema>): Promise<boolean> {
  try {
    logger.info('Clicking element', { mmid });
    
    const page = await browserManager.getPage();
    
    // Set up navigation promise before clicking
    const navigationPromise = page.waitForNavigation({ 
      waitUntil: 'networkidle', 
      timeout: 30000 
    }).catch(e => {
      logger.debug('No navigation occurred after click', { mmid });
      return null;
    });
    
    // Click the element using page.click with the handle
    const elementHandle = await page.$(`.mmid-${mmid}`);
    if (!elementHandle) {
      logger.error('Element handle not found', { mmid });
      return false;
    }
    await elementHandle.click();
    
    // Wait for navigation if it happens
    await navigationPromise;
    
    logger.info('Element clicked successfully', { mmid });
    return true;
  } catch (error) {
    logger.error('Error clicking element', { mmid, error });
    return false;
  }
}

/**
 * Type into an element by MMID
 * @param params - Type into element parameters
 * @returns Success status
 */
export async function typeIntoElement({
  mmid,
  text,
  delay,
  pressEnter = false,
}: z.infer<typeof TypeIntoElementSchema>): Promise<boolean> {
  try {
    logger.info('Typing into element', { mmid, textLength: text.length });
    
    const page = await browserManager.getPage();
    
    // Get element handle using selector
    const elementHandle = await page.$(`.mmid-${mmid}`);
    if (!elementHandle) {
      logger.error('Element handle not found for typing', { mmid });
      return false;
    }
    
    // Clear the element first by triple clicking and deleting
    await elementHandle.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    
    // Type the text
    await elementHandle.type(text, { delay });
    
    // Press Enter if requested
    if (pressEnter) {
      await page.keyboard.press('Enter');
    }
    
    logger.info('Text entered successfully', { mmid });
    return true;
  } catch (error) {
    logger.error('Error typing into element', { mmid, error });
    return false;
  }
}

/**
 * Select an option in a select element
 * @param params - Select option parameters
 * @returns Success status
 */
export async function selectOption({
  mmid,
  value,
  label,
  index,
}: z.infer<typeof SelectOptionSchema>): Promise<boolean> {
  try {
    logger.info('Selecting option', { mmid, value, label, index });
    
    const page = await browserManager.getPage();
    
    // Get element handle using selector
    const elementHandle = await page.$(`.mmid-${mmid}`);
    if (!elementHandle) {
      logger.error('Select element handle not found', { mmid });
      return false;
    }
    
    // Create selection options object
    const selectOptions: any = {};
    
    if (value !== undefined) {
      selectOptions.value = value;
    } else if (label !== undefined) {
      selectOptions.label = label;
    } else if (index !== undefined) {
      selectOptions.index = index;
    } else {
      logger.error('No selection criteria provided');
      return false;
    }
    
    // Select the option
    await elementHandle.selectOption(selectOptions);
    
    logger.info('Option selected successfully', { mmid });
    return true;
  } catch (error) {
    logger.error('Error selecting option', { mmid, error });
    return false;
  }
}

/**
 * Wait for an element to appear, disappear, or change state
 * @param params - Wait for element parameters
 * @returns Success status
 */
export async function waitForElement({
  selector,
  timeout = 30000,
  state = 'visible',
}: z.infer<typeof WaitForElementSchema>): Promise<boolean> {
  try {
    logger.info('Waiting for element', { selector, state, timeout });
    
    const page = await browserManager.getPage();
    
    await page.waitForSelector(selector, {
      state: state as any,
      timeout,
    });
    
    logger.info('Element condition met', { selector, state });
    return true;
  } catch (error) {
    logger.error('Error waiting for element', { selector, state, error });
    return false;
  }
}

/**
 * Scroll to an element by MMID
 * @param mmid - MMID of the element
 * @returns Success status
 */
export async function scrollToElement(mmid: string): Promise<boolean> {
  try {
    logger.info('Scrolling to element', { mmid });
    
    const page = await browserManager.getPage();
    
    // Get element handle using selector
    const elementHandle = await page.$(`.mmid-${mmid}`);
    if (!elementHandle) {
      logger.error('Element handle not found for scrolling', { mmid });
      return false;
    }
    
    // Scroll element into view
    await elementHandle.scrollIntoViewIfNeeded();
    
    logger.info('Scrolled to element successfully', { mmid });
    return true;
  } catch (error) {
    logger.error('Error scrolling to element', { mmid, error });
    return false;
  }
}

/**
 * Hover over an element by MMID
 * @param mmid - MMID of the element
 * @returns Success status
 */
export async function hoverElement(mmid: string): Promise<boolean> {
  try {
    logger.info('Hovering over element', { mmid });
    
    const page = await browserManager.getPage();
    
    // Get element handle using selector
    const elementHandle = await page.$(`.mmid-${mmid}`);
    if (!elementHandle) {
      logger.error('Element handle not found for hovering', { mmid });
      return false;
    }
    
    // Hover over the element
    await elementHandle.hover();
    
    logger.info('Element hovered successfully', { mmid });
    return true;
  } catch (error) {
    logger.error('Error hovering over element', { mmid, error });
    return false;
  }
}

/**
 * Scroll the page
 * @param x - X coordinate to scroll to
 * @param y - Y coordinate to scroll to
 * @returns Success status
 */
export async function scrollPage(x: number, y: number): Promise<boolean> {
  try {
    logger.info('Scrolling page', { x, y });
    
    const page = await browserManager.getPage();
    await page.evaluate(
      ([scrollX, scrollY]) => {
        window.scrollTo(scrollX, scrollY);
      },
      [x, y]
    );
    
    logger.info('Page scrolled successfully', { x, y });
    return true;
  } catch (error) {
    logger.error('Error scrolling page', { x, y, error });
    return false;
  }
}
