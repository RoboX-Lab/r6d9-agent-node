/**
 * @file DOM attributes config
 * @description Configuration for DOM attribute processing
 */

// Attributes that we care about when processing DOM elements
export const ATTRIBUTES_TO_CARE_ABOUT = [
  'name',
  'aria-expanded',
  'aria-hidden',
  'aria-disabled',
  'aria-pressed',
  'aria-selected',
  'aria-keyshortcuts',
  'aria-description',
  'aria-label',
  'placeholder',
  'mmid',
  'id',
  'for',
  'data-testid',
  'role',
  'class',
  'tabindex',
  'target',
  'category', // Add category attribute
] as const;

// Attributes that should be deleted during processing
export const ATTRIBUTES_TO_DELETE = [
  'level',
  'multiline',
  'haspopup',
  'id',
  'for',
  'keyshortcuts',
] as const;

// Types derived from the constants
export type CaredAttribute = typeof ATTRIBUTES_TO_CARE_ABOUT[number];
export type DeletedAttribute = typeof ATTRIBUTES_TO_DELETE[number];
