/**
 * Page Information Example
 * 
 * This example demonstrates page information retrieval tools:
 * - Getting page content
 * - Getting page title and URL
 * - Extracting page metadata
 */

import { BrowserAgent } from '../../src/core/agent';
import { logger } from '../../src/core/utils/logger';
import { injectMMIDAttributes } from '../../src/core/utils/dom-utils';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

async function runPageInfoExample() {
  try {
    logger.info('Starting page information example');
    
    // Create and initialize browser agent
    const browserAgent = new BrowserAgent({
      headless: false, // Set to true for headless mode
      timeout: 10000,
    });
    
    await browserAgent.init();
    logger.info('Browser initialized successfully');
    
    // Get the current page
    const page = await browserAgent.getPage();
    
    // Navigate to a website
    logger.info('Navigating to GitHub...');
    await page.goto('https://github.com');
    logger.info('Navigation completed');
    
    // Inject MMID attributes
    logger.info('Injecting MMID attributes...');
    const elementCount = await injectMMIDAttributes(page);
    logger.info(`Injected MMID attributes to ${elementCount} elements`);
    
    // Get page information
    logger.info('Getting page information...');
    
    // Get page title
    const title = await page.title();
    logger.info(`Page title: ${title}`);
    
    // Get page URL
    const url = page.url();
    logger.info(`Page URL: ${url}`);
    
    // Get page content
    const content = await page.content();
    logger.info(`Page content length: ${content.length} characters`);
    
    // Extract metadata
    logger.info('Extracting page metadata...');
    const metadata = await page.evaluate(() => {
      const meta: Record<string, string> = {};
      
      // Get meta tags
      document.querySelectorAll('meta').forEach(element => {
        const name = element.getAttribute('name') || element.getAttribute('property');
        const content = element.getAttribute('content');
        if (name && content) {
          meta[name] = content;
        }
      });
      
      return meta;
    });
    
    logger.info('Page metadata:');
    Object.entries(metadata).forEach(([key, value]) => {
      logger.info(`  ${key}: ${value}`);
    });
    
    // Save page information to file
    const outputDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const pageData = {
      url,
      title,
      timestamp: new Date().toISOString(),
      metadata,
      contentLength: content.length,
    };
    
    const outputFile = path.join(outputDir, 'page-info-example.json');
    fs.writeFileSync(outputFile, JSON.stringify(pageData, null, 2));
    logger.info(`Page information saved to ${outputFile}`);
    
    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
runPageInfoExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/utils/page-info.ts
 */
