/**
 * @file DOM field service
 * @description Service for retrieving form fields from the DOM
 */

import { Page } from 'playwright';
import { DOMField } from '../types/element';

/**
 * Gets form fields from the page
 * @param page - Playwright Page object
 * @returns Dictionary of DOM fields by mmid
 */
export async function getDomFields(
  page: Page,
): Promise<Record<string, any>> {
  return page.evaluate(() => {
    const dict: Record<string, any> = {};

    // Process each form field
    document.querySelectorAll('input, select, textarea').forEach((element) => {
      const field: Record<string, any> = {
        type: element.tagName.toLowerCase(),
      };

      // Special handling for textarea
      if (element instanceof HTMLTextAreaElement) {
        const text = element.value;
        // Only include text content, limited to 100 characters
        field.value = text ? text.replace(/\s+/g, ' ').trim().substring(0, 100) : '';
      }
      // Special handling for select
      else if (element instanceof HTMLSelectElement) {
        field.value = Array.from(element.selectedOptions).map(opt => opt.text).join(', ');
        field.options = Array.from(element.options).map(opt => opt.text);
      }
      // Special handling for input
      else if (element instanceof HTMLInputElement) {
        field.type = element.type || 'text';
        field.value = element.value;
      }

      // Add common attributes
      field.placeholder = element.getAttribute('placeholder') || '';
      field.required = element.hasAttribute('required');
      field.disabled = element.hasAttribute('disabled');
      field.readonly = element.hasAttribute('readonly');

      // Get associated label
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          field.label = label.textContent?.trim();
        }
      }

      // Store in dictionary using mmid as key
      const mmid = element.getAttribute('mmid');
      if (mmid) {
        dict[mmid] = field;
      }
    });

    return dict;
  });
}
