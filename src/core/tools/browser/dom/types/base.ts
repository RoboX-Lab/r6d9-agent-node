/**
 * @file DOM base types
 * @description Base interfaces for DOM node representation
 */

/**
 * Base DOM node interface representing the structure of a DOM node
 */
export interface DOMNode {
  role?: string;
  tag?: string;
  name?: string;
  children?: DOMNode[];
  marked_for_deletion_by_mm?: boolean;
  marked_for_unravel_children?: boolean;
  is_clickable?: boolean;
  tabindex?: string;
  'aria-expanded'?: string | null;
  'aria-selected'?: string | null;
  'aria-checked'?: string | null;
  [key: string]: any;
}

/**
 * Interface for DOM node processing options
 */
export interface DOMProcessingOptions {
  onlyInputFields?: boolean;
  shouldFetchInnerText?: boolean;
}
