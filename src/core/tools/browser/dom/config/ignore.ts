/**
 * @file DOM ignore config
 * @description Configuration for elements to ignore during DOM processing
 */

// Tags that should be ignored during processing
export const TAGS_TO_IGNORE = [
  'head',
  'style',
  'script',
  'link',
  'meta',
  'noscript',
  'template',
  'iframe',
  'g',
  'main',
  'c-wiz',
  'path',
  'html',
] as ReadonlyArray<string>;

// IDs that should be ignored during processing
export const IDS_TO_IGNORE = ['agentDriveAutoOverlay'] as ReadonlyArray<string>;

// Combined configuration
export const IGNORE_CONFIG = Object.freeze({
  tags: TAGS_TO_IGNORE as ReadonlyArray<string>,
  ids: IDS_TO_IGNORE as ReadonlyArray<string>,
});

// Types derived from the constants
export type IgnoredTag = (typeof TAGS_TO_IGNORE)[number];
export type IgnoredId = (typeof IDS_TO_IGNORE)[number];
