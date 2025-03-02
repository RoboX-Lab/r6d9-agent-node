/**
 * @file Text utilities
 * @description Utility functions for working with text content
 */

/**
 * Normalizes text content by removing extra whitespace and joining with a delimiter
 * @param text - Text to normalize
 * @param delimiter - Delimiter to join lines with
 * @returns Normalized text
 */
export function normalizeText(text: string, delimiter: string = '、'): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(delimiter)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filters and joins array of texts with a delimiter
 * @param texts - Array of texts to join
 * @param delimiter - Delimiter to join texts with
 * @returns Joined text
 */
export function joinTexts(texts: (string | null | undefined)[], delimiter: string = '、'): string {
  return texts.filter(Boolean).join(delimiter);
}

/**
 * Checks if source text includes target text (case-insensitive)
 * @param source - Source text
 * @param target - Target text to check for
 * @returns Whether source includes target
 */
export function textIncludes(source: string, target: string): boolean {
  return source.toLowerCase().includes(target.toLowerCase());
}
