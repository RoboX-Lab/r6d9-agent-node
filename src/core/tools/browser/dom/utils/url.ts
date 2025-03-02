/**
 * @file URL utilities
 * @description Utility functions for working with URLs
 */

/**
 * Checks if a string is a valid URL
 * @param url - URL to validate
 * @returns Whether the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    url = ensureProtocol(url);
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Ensures a URL has a protocol
 * @param url - URL to ensure protocol for
 * @returns URL with protocol
 */
export function ensureProtocol(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
