/**
 * DOM Manipulation Example
 * 
 * This example demonstrates DOM element manipulation capabilities:
 * - Injecting MMID attributes
 * - Getting elements with MMID
 * - Cleaning up MMID attributes
 */

import { BrowserAgent } from '../../src/core/agent';
import { logger } from '../../src/core/utils/logger';
import { 
  injectMMIDAttributes, 
  cleanMMIDAttributes, 
  getAllInteractiveElements 
} from '../../src/core/utils/dom-utils';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runDomManipulationExample() {
  try {
    logger.info('Starting DOM manipulation example');
    
    // Create and initialize browser agent
    const browserAgent = new BrowserAgent({
      headless: false, // Set to true for headless mode
      timeout: 10000,
    });
    
    await browserAgent.init();
    logger.info('Browser initialized successfully');
    
    // Get the current page
    const page = await browserAgent.getPage();
    
    // Navigate to Google
    logger.info('Navigating to Google...');
    await page.goto('https://google.com');
    logger.info('Navigation completed');
    
    // Inject MMID attributes
    logger.info('Injecting MMID attributes...');
    const elementCount = await injectMMIDAttributes(page);
    logger.info(`Injected MMID attributes to ${elementCount} elements`);
    
    // Get all interactive elements
    logger.info('Getting all interactive elements...');
    const elements = await getAllInteractiveElements(page);
    logger.info(`Found ${elements.length} interactive elements`);
    
    // Print information about the first 3 elements
    elements.slice(0, 3).forEach((element, index) => {
      logger.info(`Element ${index + 1}:`);
      logger.info(`  Tag: ${element.tagName}`);
      logger.info(`  Text: ${element.text.substring(0, 30)}${element.text.length > 30 ? '...' : ''}`);
      logger.info(`  Visible: ${element.isVisible}`);
      logger.info(`  MMID: ${element.mmid}`);
    });
    
    // Clean up MMID attributes
    logger.info('Cleaning up MMID attributes...');
    const cleanedCount = await cleanMMIDAttributes(page);
    logger.info(`Cleaned up MMID attributes from ${cleanedCount} elements`);
    
    // Verify cleanup results
    logger.info('Verifying cleanup...');
    const elementsAfterCleanup = await getAllInteractiveElements(page);
    logger.info(`Elements after cleanup: ${elementsAfterCleanup.length}`);
    
    // Close the browser
    logger.info('Closing the browser...');
    await browserAgent.close();
    logger.info('Browser closed successfully');
    
  } catch (error) {
    logger.error('Error running example:', error);
    process.exit(1);
  }
}

// Run the example
runDomManipulationExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/dom/dom-manipulation.ts
 */
