/**
 * @file Element utilities
 * @description Utility functions for working with DOM elements
 */

/**
 * Checks if an element is interactive
 * @param element - DOM element to check
 * @returns Whether the element is interactive
 */
export function isElementInteractive(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const type = (element as HTMLInputElement).type?.toLowerCase();

  // Check common interactive elements
  if (['a', 'button', 'select', 'textarea'].includes(tagName)) return true;
  if (
    tagName === 'input' &&
    [
      'text',
      'password',
      'number',
      'email',
      'tel',
      'url',
      'search',
      'date',
      'time',
      'datetime-local',
      'month',
      'week',
      'checkbox',
      'radio',
      'file',
      'submit',
      'reset',
      'button',
    ].includes(type)
  )
    return true;

  // Check ARIA roles
  const role = element.getAttribute('role') || '';
  if (role === 'WebArea') return true;
  if (
    [
      'button',
      'link',
      'checkbox',
      'radio',
      'textbox',
      'combobox',
      'listbox',
      'switch',
      'slider',
      'spinbutton',
      'menuitem',
      'option',
    ].includes(role)
  )
    return true;

  // Check tabindex
  if (
    element.hasAttribute('tabindex') &&
    element.getAttribute('tabindex') !== '-1'
  )
    return true;

  // Check event listeners
  const interactiveEvents = [
    'click',
    'mousedown',
    'mouseup',
    'touchstart',
    'touchend',
    'keydown',
    'keyup',
  ];
  for (const event of interactiveEvents) {
    if (element.hasAttribute(`on${event}`)) return true;
  }

  // Check computed style
  const style = window.getComputedStyle(element);
  if (['pointer', 'cursor', 'grab', 'grabbing'].includes(style.cursor))
    return true;

  return false;
}
