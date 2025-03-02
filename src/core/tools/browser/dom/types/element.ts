/**
 * @file DOM element types
 * @description Type definitions for DOM element attributes and fields
 */

/**
 * Interface for element attributes returned from DOM processing
 */
export interface ElementAttributes {
  role?: string;
  tag?: string;
  tag_type?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  ariaKeyshortcuts?: string;
  ariaExpanded?: boolean;
  ariaHidden?: boolean;
  ariaDisabled?: boolean;
  mmid?: string;
  innerText?: string;
  description?: string;
  class?: string;
  has_svg?: boolean;
  is_clickable?: boolean;
  options?: Array<{
    mmid: string | null;
    text: string;
    value: string;
    selected: boolean;
  }>;
  [key: string]: any;
}

/**
 * Interface for DOM field information
 */
export interface DOMField {
  type: string;
  value?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: Array<{
    text: string;
    value: string;
    selected: boolean;
  }>;
}
