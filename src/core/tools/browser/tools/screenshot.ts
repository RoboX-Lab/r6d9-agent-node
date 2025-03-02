/**
 * @file Screenshot tools
 * @description Tools for taking screenshots in the browser
 */

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import browserManager from '../manager';
import { logger } from '../../../utils/logger';

/**
 * Schema for screenshot parameters
 */
export const TakeScreenshotSchema = z.object({
  outputPath: z.string().optional(),
  fullPage: z.boolean().optional().default(false),
});

/**
 * Ensure directory exists
 * @param directoryPath - Directory path
 */
function ensureDirectoryExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

/**
 * Generate default screenshot path
 * @returns Default screenshot path
 */
function generateDefaultScreenshotPath(): string {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(process.cwd(), 'screenshots');
  ensureDirectoryExists(outputDir);
  return path.join(outputDir, `screenshot-${dateStr}.png`);
}

/**
 * Take a screenshot of the current page
 * @param options - Screenshot options
 * @returns Path to the saved screenshot
 */
export async function takeScreenshot(
  options?: z.infer<typeof TakeScreenshotSchema>
): Promise<string> {
  try {
    const { outputPath, fullPage = false } = options || { fullPage: false };
    
    // Determine output path
    const screenshotPath = outputPath || generateDefaultScreenshotPath();
    const screenshotDir = path.dirname(screenshotPath);
    
    // Ensure directory exists
    ensureDirectoryExists(screenshotDir);
    
    logger.info('Taking screenshot', { path: screenshotPath, fullPage });
    
    // Get page and take screenshot
    const page = await browserManager.getPage();
    await page.screenshot({
      path: screenshotPath,
      fullPage,
    });
    
    logger.info('Screenshot taken successfully', { path: screenshotPath });
    return screenshotPath;
  } catch (error) {
    logger.error('Error taking screenshot', { error });
    throw new Error(`Failed to take screenshot: ${error}`);
  }
}

/**
 * Take a screenshot of a specific element
 * @param selector - CSS selector for the element
 * @param outputPath - Optional output path
 * @returns Path to the saved screenshot
 */
export async function takeElementScreenshot(
  selector: string,
  outputPath?: string
): Promise<string> {
  try {
    // Determine output path
    const screenshotPath = outputPath || generateDefaultScreenshotPath();
    const screenshotDir = path.dirname(screenshotPath);
    
    // Ensure directory exists
    ensureDirectoryExists(screenshotDir);
    
    logger.info('Taking element screenshot', { selector, path: screenshotPath });
    
    // Get page and take screenshot
    const page = await browserManager.getPage();
    const element = await page.$(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    await element.screenshot({
      path: screenshotPath,
    });
    
    logger.info('Element screenshot taken successfully', { path: screenshotPath });
    return screenshotPath;
  } catch (error) {
    logger.error('Error taking element screenshot', { selector, error });
    throw new Error(`Failed to take element screenshot: ${error}`);
  }
}
