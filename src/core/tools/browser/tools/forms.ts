/**
 * @file Form tools
 * @description Tools for handling forms in the browser
 */

import { z } from 'zod';
import browserManager from '../manager';
import { getDomFields } from '../dom/services/dom-field';
import { logger } from '../../../utils/logger';

/**
 * Schema for form field
 */
export const FormFieldSchema = z.object({
  mmid: z.string(),
  value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
});

/**
 * Schema for filling a form
 */
export const FillFormSchema = z.object({
  fields: z.array(FormFieldSchema),
  submit: z.boolean().optional().default(false),
  waitForNavigation: z.boolean().optional().default(true),
});

/**
 * Get form fields on the current page
 * @returns Form fields on the page
 */
export async function getFormFields() {
  try {
    logger.info('Getting form fields');
    
    const page = await browserManager.getPage();
    const fields = await getDomFields(page);
    
    logger.info('Form fields retrieved successfully', { count: fields.length });
    return fields;
  } catch (error) {
    logger.error('Error getting form fields', { error });
    throw new Error(`Failed to get form fields: ${error}`);
  }
}

/**
 * Fill a form with the provided field values
 * @param params - Fill form parameters
 * @returns Success status
 */
export async function fillForm({
  fields,
  submit = false,
  waitForNavigation = true,
}: z.infer<typeof FillFormSchema>): Promise<boolean> {
  try {
    logger.info('Filling form', { fieldsCount: fields.length, submit });
    
    const page = await browserManager.getPage();
    
    // Process each field
    for (const field of fields) {
      const { mmid, value } = field;
      
      // Find the element by MMID
      const selector = `[mmid="${mmid}"]`;
      const element = await page.$(selector);
      
      if (!element) {
        logger.warn('Field not found', { mmid });
        continue;
      }
      
      // Determine the element type and fill accordingly
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const type = await element.evaluate(el => el.getAttribute('type')?.toLowerCase() || '');
      
      switch (tagName) {
        case 'input':
          switch (type) {
            case 'checkbox':
            case 'radio':
              // Handle checkbox/radio
              const checked = Boolean(value);
              if (checked) {
                await element.check();
              } else {
                await element.uncheck();
              }
              break;
              
            case 'file':
              // Handle file input
              if (typeof value === 'string') {
                await element.setInputFiles(value);
              } else if (Array.isArray(value)) {
                await element.setInputFiles(value as string[]);
              }
              break;
              
            default:
              // Handle text-like inputs
              await element.fill(String(value));
              break;
          }
          break;
          
        case 'select':
          // Handle select element
          if (Array.isArray(value)) {
            await element.selectOption(value as string[]);
          } else if (typeof value === 'string') {
            await element.selectOption(value);
          } else {
            // Convert number or boolean to string
            await element.selectOption(String(value));
          }
          break;
          
        case 'textarea':
          // Handle textarea
          await element.fill(String(value));
          break;
          
        default:
          logger.warn('Unsupported field type', { mmid, tagName, type });
          break;
      }
    }
    
    // Submit the form if requested
    if (submit) {
      // Find the form element
      const formElement = await page.evaluateHandle(() => {
        // Find first form element
        return document.querySelector('form');
      });
      
      if (formElement) {
        if (waitForNavigation) {
          // Set up navigation promise before submitting
          const navigationPromise = page.waitForNavigation({ 
            waitUntil: 'networkidle', 
            timeout: 30000 
          }).catch(e => {
            logger.debug('No navigation occurred after form submission');
            return null;
          });
          
          // Submit the form
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              form.submit();
            }
          });
          
          // Wait for navigation if it happens
          await navigationPromise;
        } else {
          // Just submit without waiting
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              form.submit();
            }
          });
        }
      } else {
        // If no form element found, try to find and click a submit button
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        
        if (submitButton) {
          if (waitForNavigation) {
            // Set up navigation promise before clicking
            const navigationPromise = page.waitForNavigation({ 
              waitUntil: 'networkidle', 
              timeout: 30000 
            }).catch(e => {
              logger.debug('No navigation occurred after submit button click');
              return null;
            });
            
            // Click the submit button
            await submitButton.click();
            
            // Wait for navigation if it happens
            await navigationPromise;
          } else {
            // Just click without waiting
            await submitButton.click();
          }
        } else {
          logger.warn('No form or submit button found');
        }
      }
    }
    
    logger.info('Form filled successfully', { fieldsCount: fields.length });
    return true;
  } catch (error) {
    logger.error('Error filling form', { error });
    return false;
  }
}

/**
 * Clear all form fields on the page
 * @returns Success status
 */
export async function clearFormFields(): Promise<boolean> {
  try {
    logger.info('Clearing form fields');
    
    const page = await browserManager.getPage();
    
    await page.evaluate(() => {
      // Clear text inputs and textareas
      document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], input[type="search"], input[type="number"], textarea').forEach((el) => {
        (el as HTMLInputElement | HTMLTextAreaElement).value = '';
      });
      
      // Uncheck checkboxes and radio buttons
      document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((el) => {
        (el as HTMLInputElement).checked = false;
      });
      
      // Reset selects to first option
      document.querySelectorAll('select').forEach((el) => {
        (el as HTMLSelectElement).selectedIndex = 0;
      });
    });
    
    logger.info('Form fields cleared successfully');
    return true;
  } catch (error) {
    logger.error('Error clearing form fields', { error });
    return false;
  }
}

/**
 * Find form field by label text
 * @param labelText - Label text to search for
 * @returns Field MMID if found, null otherwise
 */
export async function findFieldByLabel(labelText: string): Promise<string | null> {
  try {
    logger.info('Finding field by label', { labelText });
    
    const page = await browserManager.getPage();
    
    const fieldMmid = await page.evaluate((text) => {
      // Try to find label elements containing the text
      const labels = Array.from(document.querySelectorAll('label')).filter(
        (label) => label.textContent?.trim().includes(text)
      );
      
      if (labels.length > 0) {
        // Check for 'for' attribute
        for (const label of labels) {
          const forAttr = label.getAttribute('for');
          if (forAttr) {
            const input = document.getElementById(forAttr);
            if (input) {
              return input.getAttribute('mmid');
            }
          }
          
          // Check for nested input
          const input = label.querySelector('input, select, textarea');
          if (input) {
            return input.getAttribute('mmid');
          }
        }
      }
      
      // Try to find aria-label attributes
      const elements = Array.from(document.querySelectorAll('[aria-label]')).filter(
        (el) => el.getAttribute('aria-label')?.includes(text)
      );
      
      if (elements.length > 0) {
        return elements[0].getAttribute('mmid');
      }
      
      return null;
    }, labelText);
    
    if (fieldMmid) {
      logger.info('Field found by label', { labelText, mmid: fieldMmid });
    } else {
      logger.info('No field found for label', { labelText });
    }
    
    return fieldMmid;
  } catch (error) {
    logger.error('Error finding field by label', { labelText, error });
    return null;
  }
}
