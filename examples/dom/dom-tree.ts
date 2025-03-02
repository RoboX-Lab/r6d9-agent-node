/**
 * DOM Tree Example
 * 
 * This example demonstrates DOM tree operations:
 * - Injecting MMID attributes
 * - Getting simplified DOM tree information
 */

import { BrowserAgent } from '../../src/core/agent';
import { logger } from '../../src/core/utils/logger';
import { 
  injectMMIDAttributes, 
  getSimplifiedDOMTree 
} from '../../src/core/utils/dom-utils';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

async function runDomTreeExample() {
  try {
    logger.info('Starting DOM tree example');
    
    // Create and initialize browser agent
    const browserAgent = new BrowserAgent({
      headless: false, // Set to true for headless mode
      timeout: 10000,
    });
    
    await browserAgent.init();
    logger.info('Browser initialized successfully');
    
    // Get the current page
    const page = await browserAgent.getPage();
    
    // Navigate to a page
    logger.info('Navigating to example.com...');
    await page.goto('https://example.com');
    logger.info('Navigation completed');
    
    // Inject MMID attributes
    logger.info('Injecting MMID attributes...');
    const elementCount = await injectMMIDAttributes(page);
    logger.info(`Injected MMID attributes to ${elementCount} elements`);
    
    // Get simplified DOM tree
    logger.info('Getting simplified DOM tree...');
    const domTree = await getSimplifiedDOMTree(page);
    
    // Save DOM tree to file
    const outputDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputFile = path.join(outputDir, 'dom-tree-example.json');
    fs.writeFileSync(outputFile, JSON.stringify(domTree, null, 2));
    logger.info(`DOM tree saved to ${outputFile}`);
    
    // Log simplified info about the DOM tree
    logger.info('DOM Tree Summary:');
    logger.info(`Root tag: ${domTree.tagName}`);
    
    if (domTree.children && domTree.children.length > 0) {
      logger.info(`Number of direct children: ${domTree.children.length}`);
      
      // List first level children
      domTree.children.forEach((child, index) => {
        logger.info(`Child ${index + 1}: ${child.tagName}${child.id ? ` (id: ${child.id})` : ''}`);
      });
    }
    
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
runDomTreeExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/dom/dom-tree.ts
 */
