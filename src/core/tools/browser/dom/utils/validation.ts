/**
 * @file Validation utilities
 * @description Utility functions for validation in DOM processing
 */

/**
 * Checks if a string is a space-delimited mmid
 * @param value - String to check
 * @returns Whether the string is a space-delimited mmid
 */
export function isSpaceDelimitedMmid(value: string): boolean {
  return /^\d+(\s+\d+)*$/.test(value);
}

/**
 * Extracts mmid from keyshortcuts
 * @param keyshortcuts - Key shortcuts string
 * @returns Extracted mmid or null
 */
export function extractMmid(keyshortcuts: string | undefined): number | null {
  if (!keyshortcuts) return null;

  const mmidTemp = isSpaceDelimitedMmid(keyshortcuts)
    ? keyshortcuts.split(' ').pop()
    : keyshortcuts;

  try {
    const mmid = parseInt(mmidTemp || '');
    return isNaN(mmid) ? null : mmid;
  } catch {
    return null;
  }
}

/**
 * Validates and normalizes a DOM node's properties
 * @param node - Node to clean up
 */
export function cleanupNodeProperties(node: Record<string, any>): void {
  Object.keys(node).forEach((key) => {
    if (node[key] === undefined) {
      delete node[key];
    }
  });
}
