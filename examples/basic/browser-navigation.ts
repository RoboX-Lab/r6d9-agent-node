/**
 * Basic Browser Navigation Example
 * 
 * This example demonstrates basic browser operations using the BrowserAgent:
 * - Opening a browser
 * - Navigating to different pages
 * - Closing the browser
 */

import { BrowserAgent } from '../../src/core/agent';
import { logger } from '../../src/core/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runBrowserNavigationExample() {
  try {
    logger.info('Starting basic browser navigation example');
    
    // Create and initialize browser agent
    const browserAgent = new BrowserAgent({
      headless: false, // Set to true for headless mode
      timeout: 10000,
    });
    
    await browserAgent.init();
    logger.info('Browser initialized successfully');
    
    // Navigate to various pages
    logger.info('Navigating to Google...');
    const googleResult = await browserAgent.navigate('https://google.com');
    logger.info(`Navigation result: ${googleResult.success ? 'Success' : 'Failed'}`);
    logger.info(`Page title: ${googleResult.data?.title || 'Unknown'}`);
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info('Navigating to Bing...');
    const bingResult = await browserAgent.navigate('https://bing.com');
    logger.info(`Navigation result: ${bingResult.success ? 'Success' : 'Failed'}`);
    logger.info(`Page title: ${bingResult.data?.title || 'Unknown'}`);
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info('Navigating to DuckDuckGo...');
    const duckResult = await browserAgent.navigate('https://duckduckgo.com');
    logger.info(`Navigation result: ${duckResult.success ? 'Success' : 'Failed'}`);
    logger.info(`Page title: ${duckResult.data?.title || 'Unknown'}`);
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
runBrowserNavigationExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/basic/browser-navigation.ts
 */
