/**
 * Blockchain Market Analysis Example
 * 
 * This advanced example demonstrates the integration of browser automation
 * with blockchain analysis to perform market research on trending tokens.
 * 
 * Features:
 * - Using BrowserAgent to extract market data
 * - Using PlannerAgent to generate execution steps
 * - Using SolanaAgent to analyze blockchain data
 * - Multi-agent orchestration
 */

import { chromium } from 'playwright';
import { BrowserAgent, PlannerAgent, SolanaAgent } from '../../src/core/agent';
import { Orchestrator } from '../../src/core/orchestrator';
import { consola } from 'consola';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the task description
const TASK_DESCRIPTION = `
Research trending tokens on the Solana blockchain:
1. Navigate to a token tracking site
2. Extract information about the top 3 trending tokens
3. For each token, fetch on-chain data using Solana
4. Compile a comprehensive market analysis report
`;

async function main() {
  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    consola.error('OPENAI_API_KEY environment variable not set. This example requires an OpenAI API key.');
    process.exit(1);
  }
  
  // Initialize the browser
  consola.info('Initializing browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Initialize all agents
    const browserAgent = new BrowserAgent(page);
    const plannerAgent = new PlannerAgent();
    const solanaAgent = new SolanaAgent();
    
    // Initialize orchestrator
    const orchestrator = new Orchestrator({
      agents: {
        browser: browserAgent,
        planner: plannerAgent,
        solana: solanaAgent,
      },
    });
    
    // Start the orchestrated workflow
    consola.info('Starting market analysis workflow...');
    const result = await orchestrator.execute(
      async ({ agents }) => {
        // Step 1: Generate execution plan
        consola.info('Generating execution plan...');
        const plan = await agents.planner.generatePlan(TASK_DESCRIPTION);
        consola.log('Execution plan:', plan);
        
        // Step 2: Execute browser automation steps
        consola.info('Executing browser steps...');
        
        // Navigate to token tracking site
        await page.goto('https://hyperspace.xyz/collection/all_solana_collections');
        await page.waitForLoadState('networkidle');
        
        // Extract token information using browser agent
        const trendingTokensData = await agents.browser.executeWithLLM(
          'Extract data about the top 3 trending tokens/collections on this page. For each token, get the name, volume, floor price, and market cap if available.'
        );
        
        consola.info('Found trending tokens:', trendingTokensData);
        
        // Step 3: Analyze token data using Solana agent
        consola.info('Analyzing token data using Solana...');
        
        // Create an array to store all results
        const tokenAnalyses = [];
        
        // We're simulating token addresses here since we can't easily get them from the UI
        // In a real scenario, we would extract these from the page or lookup by token name
        const simulatedAddresses = [
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          'So11111111111111111111111111111111111111112',  // Wrapped SOL
          'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
        ];
        
        // Analyze each token with Solana agent
        for (let i = 0; i < 3; i++) {
          const tokenAddress = simulatedAddresses[i];
          
          consola.info(`Analyzing token at address: ${tokenAddress}`);
          
          const tokenAnalysis = await agents.solana.invoke(
            `Get detailed information about the token at address ${tokenAddress} and analyze its market performance`,
            { address: tokenAddress }
          );
          
          tokenAnalyses.push({
            ...tokenAnalysis,
            uiData: trendingTokensData[i] || { name: `Token ${i + 1}` }
          });
        }
        
        // Step 4: Compile final report
        consola.info('Compiling final market analysis report...');
        
        // Use planner agent to compile report
        const finalReport = await agents.planner.generateReport(
          'Compile a detailed market analysis report based on the browser data and blockchain analysis',
          {
            browserData: trendingTokensData,
            blockchainData: tokenAnalyses
          }
        );
        
        return {
          tokens: tokenAnalyses,
          report: finalReport
        };
      }
    );
    
    // Display the final report
    consola.success('Market analysis completed successfully!');
    consola.info('Final Report:');
    consola.log(result.report);
    
    // Keep the browser open for observation (close after 10 seconds)
    consola.info('Keeping browser open for 10 seconds for observation...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    consola.error('Example failed:', error);
  } finally {
    // Close the browser
    consola.info('Closing browser...');
    await browser.close();
  }
}

// Run the example
main().catch(error => {
  consola.error('Unhandled error in main:', error);
  process.exit(1);
});
