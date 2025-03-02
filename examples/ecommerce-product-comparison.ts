/**
 * E-commerce Product Comparison Example
 * 
 * This example demonstrates how to use the R6D9 Agent Node library
 * to compare product prices across multiple e-commerce websites.
 */

import { BrowserAgent, PlannerAgent, CritiqueAgent } from '../src/core/agent';
import { Orchestrator } from '../src/core/orchestrator';
import { logger } from '../src/core/utils/logger';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface ProductData {
  productName: string;
  price: string;
  website: string;
  url: string;
  available: boolean;
  imageUrl?: string;
  rating?: string;
  reviews?: string;
}

async function runProductComparisonExample(productName: string) {
  try {
    logger.info(`Starting e-commerce product comparison for: ${productName}`);
    
    // Create agents
    const browserAgent = new BrowserAgent({
      headless: false, // Set to true for headless mode
      timeout: 60000,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    });
    
    const plannerAgent = new PlannerAgent();
    const critiqueAgent = new CritiqueAgent();
    
    // Create orchestrator
    const orchestrator = new Orchestrator({
      browserAgent,
      plannerAgent,
      critiqueAgent,
    });
    
    // Define the comparison objective
    const objective = `
    Compare prices for "${productName}" across Amazon, Best Buy, and Walmart.
    For each website:
    1. Search for the product
    2. Find the price of the first relevant result
    3. Capture the product name, price, availability, and URL
    4. Take a screenshot of the product page
    5. Move on to the next website
    Finally, compile all the information into a structured format.
    `;
    
    // Start the workflow
    logger.info('Starting workflow with objective:', objective);
    const results = await orchestrator.execute(objective);
    
    // Process and save the results
    const outputDir = path.join(__dirname, '../data/product-comparison');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save results as JSON
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
    fs.writeFileSync(
      path.join(outputDir, filename),
      JSON.stringify(results, null, 2)
    );
    
    // Log the results
    logger.info('Workflow execution completed');
    console.log('\nProduct Comparison Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Clean up
    await browserAgent.close();
    logger.info('Browser closed, example completed');
    
    // Format and display a simple report
    const productData = results.data as ProductData[];
    if (Array.isArray(productData) && productData.length > 0) {
      console.log('\n=== PRICE COMPARISON REPORT ===');
      console.log(`Product: ${productName}\n`);
      
      productData.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || Number.MAX_VALUE;
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || Number.MAX_VALUE;
        return priceA - priceB;
      });
      
      productData.forEach((product, index) => {
        console.log(`${index + 1}. ${product.website}`);
        console.log(`   Product: ${product.productName}`);
        console.log(`   Price: ${product.price}`);
        console.log(`   Available: ${product.available ? 'Yes' : 'No'}`);
        console.log(`   URL: ${product.url}`);
        if (product.rating) console.log(`   Rating: ${product.rating}`);
        console.log('');
      });
      
      // Identify best deal
      const bestDeal = productData[0];
      console.log('BEST DEAL:');
      console.log(`${bestDeal.website} - ${bestDeal.price}`);
      console.log(`URL: ${bestDeal.url}`);
    }
    
  } catch (error) {
    logger.error('Error running example:', error);
    process.exit(1);
  }
}

// Product to compare
const productToCompare = process.argv[2] || 'MacBook Air M2';

// Run the example
runProductComparisonExample(productToCompare);

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/ecommerce-product-comparison.ts "Product Name"
 * 
 * For example:
 *    npx ts-node examples/ecommerce-product-comparison.ts "Sony WH-1000XM5"
 */
