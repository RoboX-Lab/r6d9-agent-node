/**
 * Solana Token Information Example
 * 
 * This example demonstrates how to use the SolanaAgent to retrieve
 * token information from the Solana blockchain.
 * 
 * Features:
 * - Connecting to Solana blockchain
 * - Querying account information
 * - Parsing token data
 */

import { SolanaAgent } from '../../src/core/agent';
import { consola } from 'consola';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Check for required environment variables
  if (!process.env.SOLANA_RPC_URL) {
    consola.warn('SOLANA_RPC_URL environment variable not set. Using public RPC endpoint.');
  }
  
  if (!process.env.OPENAI_API_KEY) {
    consola.error('OPENAI_API_KEY environment variable not set. This example requires an OpenAI API key.');
    process.exit(1);
  }
  
  // Initialize the Solana agent
  consola.info('Initializing Solana agent...');
  const solanaAgent = new SolanaAgent();
  
  try {
    // Example 1: Query a token account
    consola.info('Example 1: Querying a token account');
    const tokenAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC token address
    
    const accountInfo = await solanaAgent.invoke(
      `Get information about the token at address ${tokenAddress}`,
      { account_type: 'token' }
    );
    
    consola.success('Successfully retrieved token account information:');
    consola.log(accountInfo);
    
    // Example 2: Get a recent transaction
    consola.info('\nExample 2: Analyzing a transaction');
    
    // Example transaction hash (this is a placeholder - you can replace with a real one)
    const txHash = '4oBFNe4qpeP6MyLoQ6hQJPfnYmGXb7xmgtuu6P74ws9LvQSLw88GYTYQgVFCpKQ7GNyFKjnAXHiXpK8n81zKxwSP';
    
    const transactionInfo = await solanaAgent.invoke(
      `Analyze the transaction with hash ${txHash} and explain what operations it performed`,
      { type: 'transaction_analysis' }
    );
    
    consola.success('Successfully analyzed transaction:');
    consola.log(transactionInfo);
    
    // Example 3: Smart contract interaction simulation
    consola.info('\nExample 3: Simulating a contract interaction');
    
    const contractInteraction = await solanaAgent.invoke(
      'Simulate an interaction with a token swap contract to exchange 10 SOL for USDC',
      { 
        simulation: true,
        params: {
          from_token: 'SOL',
          to_token: 'USDC',
          amount: 10
        }
      }
    );
    
    consola.success('Contract interaction simulation:');
    consola.log(contractInteraction);
    
  } catch (error) {
    consola.error('Example failed:', error);
  }
}

// Run the example
main().catch(error => {
  consola.error('Unhandled error in main:', error);
  process.exit(1);
});
