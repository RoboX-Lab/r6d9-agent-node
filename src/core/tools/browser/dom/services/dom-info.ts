/**
 * @file DOM info service
 * @description Service for retrieving comprehensive DOM information
 */

import { Page } from 'playwright';
import { DOMNode } from '../types/base';
import { ElementAttributes } from '../types/element';
// Rename the imported function to avoid name conflict
import { injectMmidAttributes as injectMmidAttributesToElements } from '../utils/element';
import { logger } from '../../../../utils/logger';

/**
 * Processes a single DOM node
 * @param page - Playwright Page object
 * @param node - DOM node to process
 */
async function processDomNode(page: Page, node: DOMNode): Promise<void> {
  try {
    const elementAttributes = await page.evaluate(
      ({ selector, originalRole }) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return null;

        // Define helper functions in page context
        function processInputElement(element: HTMLInputElement): {
          description: string;
          category: string;
        } {
          let description = '';
          const inputType = element.type;
          description += `Input type: ${inputType}. `;

          // Add input category
          let category = '';
          switch (inputType) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
            case 'search':
              category = 'Text Input';
              break;
            case 'password':
              category = 'Password Input';
              break;
            case 'number':
              category = 'Number Input';
              break;
            case 'checkbox':
              category = 'Checkbox';
              break;
            case 'radio':
              category = 'Radio Button';
              break;
            case 'file':
              category = 'File Upload';
              break;
            case 'submit':
              category = 'Submit Button';
              break;
            case 'reset':
              category = 'Reset Button';
              break;
            case 'button':
              category = 'Generic Button';
              break;
            default:
              category = `${inputType} input`;
          }
          description += `Category: ${category}. `;

          // Add input state
          if (element.required) {
            description += 'Required. ';
          }
          if (element.readOnly) {
            description += 'Read-only. ';
          }
          if (element.disabled) {
            description += 'Disabled. ';
          }
          if (element.checked) {
            description += 'Checked. ';
          }
          if (element.maxLength > 0) {
            description += `Max length: ${element.maxLength}. `;
          }

          return { description, category };
        }

        function processSelectElement(element: HTMLSelectElement): string {
          let description = '';
          const optionsCount = element.options.length;
          description += `Options count: ${optionsCount}. `;
          if (element.multiple) {
            description += 'Multiple selection allowed. ';
          }
          return description;
        }

        /**
         * Check if an element should be treated as a button
         */
        function isButtonLike(element: HTMLElement, role?: string): boolean {
          // 1. Explicit button indicators (highest priority)
          if (role === 'button') return true;
          if (element.tagName.toLowerCase() === 'button') return true;
          if (
            element instanceof HTMLInputElement &&
            ['button', 'submit', 'reset'].includes(element.type)
          ) {
            return true;
          }

          // 2. Strong ARIA button characteristics
          const hasStrongAriaButton =
            element.getAttribute('aria-pressed') !== null || // Toggle button
            (element.getAttribute('aria-expanded') !== null &&
              element.hasAttribute('aria-controls')) || // Controlled expansion
            (element.getAttribute('aria-haspopup') === 'true' &&
              element.hasAttribute('aria-controls')); // Popup control

          if (hasStrongAriaButton) return true;

          // 3. Button class patterns with interaction behavior
          const classNames = element.className.toLowerCase();
          const buttonClassPatterns = ['btn', 'button'];
          const hasButtonClass = buttonClassPatterns.some((pattern) => {
            // Ensure it's a complete word match, not a partial match
            const regex = new RegExp(`\\b${pattern}\\b`);
            return regex.test(classNames);
          });

          if (
            hasButtonClass &&
            (element.onclick !== null ||
              element.getAttribute('onclick') !== null ||
              element.getAttribute('tabindex') !== null)
          )
            return true;

          // 4. Interactive elements with strong button characteristics
          const style = window.getComputedStyle(element);
          const hasStrongInteractiveTraits =
            element.getAttribute('role') === 'button' || // Explicit button role
            (element.getAttribute('tabindex') === '0' &&
              element.onclick !== null) || // Focusable with click handler
            (style.cursor === 'pointer' && // Pointer cursor with additional traits
              ((element.hasAttribute('aria-label') &&
                element.onclick !== null) || // Labeled clickable
                (element.hasAttribute('title') && element.onclick !== null))); // Titled clickable

          if (hasStrongInteractiveTraits) return true;

          // 5. Nested interactive content with strict conditions
          const hasNestedInteractiveContent = () => {
            // Check for icon elements
            const iconElement = element.querySelector(
              'i[class*="icon"], svg, img.icon, .icon',
            );
            if (!iconElement) return false;

            // Must have additional button characteristics
            return (
              element.onclick !== null && // Must be clickable
              style.cursor === 'pointer' && // Must show pointer
              // Must have accessible label
              (element.hasAttribute('aria-label') ||
                element.hasAttribute('title') ||
                element.getAttribute('role') === 'button') && // Must have interactive styling
              (style.userSelect === 'none' ||
                element.getAttribute('tabindex') === '0' ||
                style.backgroundColor !== 'transparent' ||
                style.border !== 'none')
            );
          };

          if (hasNestedInteractiveContent()) return true;

          // 6. Control elements with specific behaviors
          const isControlElement =
            element.hasAttribute('aria-controls') && // Controls something
            element.hasAttribute('aria-expanded') && // Can expand/collapse
            style.cursor === 'pointer' && // Shows pointer
            // Has either click handler or keyboard support
            (element.onclick !== null ||
              element.getAttribute('tabindex') === '0');

          if (isControlElement) return true;

          return false;
        }

        function processButtonElement(
          element: HTMLElement,
          role?: string,
        ): { description: string; category: string } {
          let description = '';
          let category = 'Generic Button';

          if (isButtonLike(element, role)) {
            // Determine button category
            if (element.getAttribute('type') === 'submit') {
              category = 'Submit Button';
            } else if (element.getAttribute('type') === 'reset') {
              category = 'Reset Button';
            } else if (element.getAttribute('aria-pressed') !== null) {
              category = 'Toggle Button';
            } else if (element.getAttribute('aria-expanded') !== null) {
              category = 'Expandable Button';
            } else if (element.getAttribute('aria-haspopup') === 'true') {
              category = 'Popup Button';
            } else if (element.tagName.toLowerCase() === 'button') {
              category = 'HTML Button';
            } else if (
              element instanceof HTMLInputElement &&
              element.type === 'button'
            ) {
              category = 'Input Button';
            } else if (element.getAttribute('role') === 'button') {
              category = 'ARIA Button';
            }

            // Add button state
            const ariaPressed = element.getAttribute('aria-pressed');
            if (ariaPressed !== null) {
              description += `State: ${
                ariaPressed === 'true' ? 'Pressed' : 'Not pressed'
              }. `;
            }

            const ariaExpanded = element.getAttribute('aria-expanded');
            if (ariaExpanded !== null) {
              description += `State: ${
                ariaExpanded === 'true' ? 'Expanded' : 'Collapsed'
              }. `;
            }

            // Add additional button info
            const ariaControls = element.getAttribute('aria-controls');
            if (ariaControls) {
              description += `Controls: ${ariaControls}. `;
            }
          }

          return { description, category };
        }

        function getElementInfo(element: HTMLElement): ElementAttributes {
          // Common attributes
          const attrs: ElementAttributes = {
            tag: element.tagName.toLowerCase(),
            role: element.getAttribute('role') || undefined,
            ariaLabel: element.getAttribute('aria-label') || undefined,
            ariaDescription:
              element.getAttribute('aria-description') || undefined,
            ariaKeyshortcuts:
              element.getAttribute('aria-keyshortcuts') || undefined,
            ariaExpanded:
              element.getAttribute('aria-expanded') === 'true' || undefined,
            ariaHidden:
              element.getAttribute('aria-hidden') === 'true' || undefined,
            ariaDisabled:
              element.getAttribute('aria-disabled') === 'true' || undefined,
            mmid: element.getAttribute('mmid') || undefined,
            class: element.className || undefined,
            has_svg: element.querySelector('svg') !== null,
            innerText: element.innerText?.trim() || undefined,
          };

          // Type-specific processing
          if (element instanceof HTMLInputElement) {
            attrs.tag_type = element.type;
            const { description, category } = processInputElement(element);
            attrs.description = description;
            attrs.category = category;
          } else if (element instanceof HTMLSelectElement) {
            attrs.description = processSelectElement(element);
            attrs.category = 'Select Dropdown';
            // Process options
            attrs.options = Array.from(element.options).map((option) => ({
              mmid: option.getAttribute('mmid') || null,
              text: option.text,
              value: option.value,
              selected: option.selected,
            }));
          } else if (element instanceof HTMLTextAreaElement) {
            attrs.category = 'Text Area';
            attrs.description = element.required
              ? 'Required. '
              : element.readOnly
              ? 'Read-only. '
              : '';
          } else {
            // Check if it's button-like
            const { description, category } = processButtonElement(
              element,
              attrs.role,
            );
            if (description) {
              attrs.description = description;
              attrs.category = category;
            }
          }

          // Determine if clickable
          try {
            const style = window.getComputedStyle(element);
            attrs.is_clickable =
              element.onclick != null ||
              style.cursor === 'pointer' ||
              attrs.role === 'button' ||
              element.hasAttribute('tabindex') ||
              (element.className || '').toLowerCase().includes('trigger') ||
              (element.className || '').toLowerCase().includes('clickable') ||
              element.querySelector('svg') !== null ||
              element.tagName.toLowerCase() === 'button' ||
              element.tagName.toLowerCase() === 'a' ||
              attrs.role === 'link' ||
              attrs.role === 'tab';
          } catch (e) {
            console.error('Error checking clickability:', e);
          }

          return attrs;
        }

        // Main processing
        const attrs = getElementInfo(element);
        return attrs;
      },
      { selector: `[mmid="${node.mmid}"]`, originalRole: node.role },
    );

    if (elementAttributes) {
      Object.assign(node, elementAttributes);
    }
  } catch (error) {
    logger.error('Error processing DOM node', { error, nodeId: node.mmid });
  }
}

/**
 * Injects mmid attributes into the DOM tree
 * @param page - Playwright Page object
 * @param node - DOM node to inject attributes into
 */
export async function injectMmidAttributes(page: Page): Promise<void> {
  logger.debug('Injecting mmid attributes');
  await page.evaluate(() => {
    // Generate a unique mmid for each element
    const allElements = document.querySelectorAll('*');
    let id = 1;

    allElements.forEach((element) => {
      if (!element.hasAttribute('mmid')) {
        element.setAttribute('mmid', String(id++));
      }
    });
  });
}

/**
 * Process a DOM node and return its information
 * @param node - DOM node to process
 * @returns Processed DOM node
 */
function processNodeForOutput(node: DOMNode | null): DOMNode {
  if (!node) {
    return { name: 'Empty node' };
  }

  // Deep clone the node to avoid modifying the original
  const output = JSON.parse(JSON.stringify(node));

  // Process children recursively
  if (output.children && output.children.length > 0) {
    output.children = output.children
      .map(processNodeForOutput)
      .filter(Boolean);
  }

  // Remove internal properties
  delete output.marked_for_deletion_by_mm;
  delete output.marked_for_unravel_children;

  return output;
}

/**
 * Gets DOM information for a page
 * @param page - Playwright Page object
 * @param onlyInputFields - Whether to only include input fields
 * @returns DOM node tree
 */
export async function getDomInfo(
  page: Page,
  onlyInputFields: boolean = false,
): Promise<DOMNode> {
  try {
    // Ensure mmid attributes are injected
    await injectMmidAttributes(page);

    // Get the root node from the page
    const rootNode: DOMNode = await page.evaluate(() => {
      // Create a node for the document
      return {
        role: 'WebArea',
        tag: 'document',
        name: document.title,
        children: [],
        mmid: '0',
      };
    });

    // Process the DOM tree
    await processNode(page, rootNode);

    // Prune the tree if needed
    const prunedTree = pruneTree(rootNode, onlyInputFields);

    // Return the processed tree
    return processNodeForOutput(prunedTree);
  } catch (error) {
    logger.error('Error getting DOM info', { error });
    return { role: 'WebArea', name: 'Error getting DOM info' };
  }
}

/**
 * Recursively processes a node and its children
 * @param page - Playwright Page object
 * @param node - DOM node to process
 */
async function processNode(page: Page, node: DOMNode): Promise<void> {
  // Process the current node
  if (node.mmid && node.mmid !== '0') {
    await processDomNode(page, node);
  }

  // Process children recursively
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      await processNode(page, child);
    }
  }
}

/**
 * Prunes the DOM tree based on specified criteria
 * @param node - DOM node to prune
 * @param onlyInputFields - Whether to only include input fields
 * @returns Pruned DOM node or null if pruned
 */
function pruneTree(node: DOMNode, onlyInputFields: boolean): DOMNode | null {
  // Mark nodes for deletion based on criteria
  if (onlyInputFields && !isInputNode(node)) {
    node.marked_for_deletion_by_mm = true;
  }

  // Process children recursively
  if (node.children && node.children.length > 0) {
    /* DOM node filtering logic */
    const filteredChildren = (node.children || []).filter(
      (child: any) => !child.marked_for_deletion_by_mm,
    );
    node.children = filteredChildren;

    // If all children are marked for deletion, mark parent for deletion too
    if (
      node.children.length === 0 &&
      onlyInputFields &&
      !isInputNode(node) &&
      node.role !== 'WebArea'
    ) {
      node.marked_for_deletion_by_mm = true;
    }
  }

  // Return null if node is marked for deletion
  return node.marked_for_deletion_by_mm ? null : node;
}

/**
 * Check if a node is an input node
 * @param node - DOM node to check
 * @returns Whether the node is an input node
 */
function isInputNode(node: DOMNode): boolean {
  // Check tag type
  if (
    node.tag === 'input' ||
    node.tag === 'select' ||
    node.tag === 'textarea' ||
    node.tag === 'button'
  ) {
    return true;
  }

  // Check role
  if (
    [
      'textbox',
      'button',
      'checkbox',
      'combobox',
      'listbox',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'option',
      'radio',
      'searchbox',
      'slider',
      'spinbutton',
      'switch',
      'tab',
    ].includes(node.role || '')
  ) {
    return true;
  }

  // Check for interactive attributes
  if (
    node.is_clickable ||
    node.tabindex ||
    node['aria-expanded'] !== undefined ||
    node['aria-selected'] !== undefined ||
    node['aria-checked'] !== undefined
  ) {
    return true;
  }

  return false;
}
