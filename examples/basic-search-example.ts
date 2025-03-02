/**
 * Basic Search Example
 * 
 * This example demonstrates how to use the R6D9 Agent Node library
 * to perform a web search and extract information.
 */

import { BrowserAgent, PlannerAgent, CritiqueAgent } from '../src/core/agent';
import { Orchestrator } from '../src/core/orchestrator';
import { logger } from '../src/core/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runSearchExample() {
  try {
    logger.info('Starting basic search example');
    
    // Create agents
    const browserAgent = new BrowserAgent({
      headless: false, // Set to true for headless mode
      timeout: 30000,
    });
    
    const plannerAgent = new PlannerAgent();
    const critiqueAgent = new CritiqueAgent();
    
    // Create orchestrator
    const orchestrator = new Orchestrator({
      browserAgent,
      plannerAgent,
      critiqueAgent,
    });
    
    // Define the search objective
    const objective = 'Search for "r6d9 browser automation" on Google and extract the top 3 results with their titles and URLs';
    
    // Start the workflow
    logger.info('Starting workflow with objective:', objective);
    const results = await orchestrator.execute(objective);
    
    // Log the results
    logger.info('Workflow execution completed');
    console.log('\nSearch Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Clean up
    await browserAgent.close();
    logger.info('Browser closed, example completed');
    
  } catch (error) {
    logger.error('Error running example:', error);
    process.exit(1);
  }
}

// Run the example
runSearchExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/basic-search-example.ts
 */
