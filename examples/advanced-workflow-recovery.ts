/**
 * Advanced Workflow with Recovery Example
 * 
 * This example demonstrates how to:
 * 1. Create a complex multi-step workflow
 * 2. Handle step failures
 * 3. Implement recovery strategies
 * 4. Use structured output extraction
 */

import { BrowserAgent, PlannerAgent, CritiqueAgent } from '../src/core/agents';
import { logger } from '../src/core/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runAdvancedWorkflowExample() {
  // Create agents with custom configurations
  const browserAgent = new BrowserAgent({
    modelName: 'gpt-4o-2024-05-13',
    temperature: 0.2,
    maxRetries: 3
  });
  
  const plannerAgent = new PlannerAgent({
    modelName: 'gpt-4o-2024-05-13',
    temperature: 0.1, // Lower temperature for more deterministic plans
    maxTokens: 3000   // Higher token limit for complex planning
  });
  
  const critiqueAgent = new CritiqueAgent({
    modelName: 'gpt-4o-2024-05-13',
    temperature: 0.1  // Lower temperature for more accurate evaluations
  });
  
  // The complex multi-step objective
  const objective = 'Research the latest electric vehicle models, compare the top 3 by range, price, and features, then create a summary table';
  
  try {
    logger.info('Starting advanced workflow example', { objective });
    
    // Step 1: Generate a detailed plan
    logger.info('Generating execution plan');
    const plan = await plannerAgent.generatePlan(objective);
    
    logger.info('Generated plan with steps:', { steps: plan.length });
    plan.forEach((step, index) => {
      logger.debug(`Step ${index + 1}: ${step}`);
    });
    
    // Track execution state
    const state = {
      currentStep: 0,
      steps: plan,
      results: [],
      retries: 0,
      maxRetries: 3,
      history: [],
      evData: {
        models: []
      }
    };
    
    // Step 2: Execute plan with recovery handling
    while (state.currentStep < state.steps.length) {
      const currentStepText = state.steps[state.currentStep];
      logger.info(`Executing step ${state.currentStep + 1}/${state.steps.length}`, {
        step: currentStepText
      });
      
      try {
        // Execute the current step
        const pageContent = await browserAgent.navigate(currentStepText);
        
        // Evaluate the execution result
        const evaluation = await critiqueAgent.evaluate(
          objective,
          currentStepText,
          pageContent
        );
        
        logger.info(`Step evaluation`, {
          success: evaluation.success,
          reason: evaluation.reason
        });
        
        if (evaluation.success) {
          // Success path: record results and move to next step
          state.results.push({
            step: currentStepText,
            content: pageContent,
            success: true
          });
          
          // Process extracted data if this is a data collection step
          if (currentStepText.toLowerCase().includes('collect') || 
              currentStepText.toLowerCase().includes('extract') ||
              currentStepText.toLowerCase().includes('compare')) {
            
            // Use the browser agent to extract structured data
            const extractionPrompt = `Extract the following information from the page:
1. Electric vehicle model names
2. Price ranges
3. Battery range in miles
4. Key features

Format the response as JSON with the following structure:
{
  "model": "Model Name",
  "price": "Price Range",
  "range": "Range in miles",
  "features": ["Feature 1", "Feature 2", ...]
}`;
            
            const extractedData = await browserAgent.navigate(extractionPrompt);
            
            try {
              // Attempt to parse the extracted data as JSON
              const parsedData = JSON.parse(extractedData);
              state.evData.models.push(parsedData);
              logger.info('Successfully extracted structured data', { model: parsedData.model });
            } catch (parseError) {
              logger.warn('Failed to parse extracted data as JSON, storing as text', { error: parseError.message });
              // Store the raw text if parsing fails
              state.evData.rawData = extractedData;
            }
          }
          
          // Add to history and advance to next step
          state.history.push(`✓ ${currentStepText}`);
          state.currentStep++;
          state.retries = 0; // Reset retry counter on success
          
        } else {
          // Failure path: implement recovery strategy
          logger.warn(`Step failed`, { 
            reason: evaluation.reason,
            suggestions: evaluation.suggestions,
            retryCount: state.retries
          });
          
          if (state.retries < state.maxRetries) {
            // Attempt recovery with revised approach
            state.retries++;
            
            // Generate a revised approach for the current step
            logger.info('Generating revised approach', { attempt: state.retries });
            const feedback = evaluation.reason + '\n' + (evaluation.suggestions?.join('\n') || '');
            
            // Regenerate the plan from the current step
            const revisedPlan = await plannerAgent.generatePlan(
              objective,
              state.steps.join('\n'),
              feedback
            );
            
            // Replace the current step with revised approach
            if (revisedPlan.length > 0) {
              state.steps[state.currentStep] = revisedPlan[0];
              
              logger.info('Revised approach generated', { 
                originalStep: currentStepText,
                revisedStep: revisedPlan[0]
              });
              
              state.history.push(`✗ ${currentStepText} - Failed: ${evaluation.reason.substring(0, 100)}...`);
              state.history.push(`↻ Retry with: ${revisedPlan[0]}`);
            }
          } else {
            // Max retries exceeded, move to next step
            logger.error('Max retries exceeded, skipping step', { step: currentStepText });
            state.history.push(`✗ ${currentStepText} - Skipped after ${state.maxRetries} failed attempts`);
            state.currentStep++;
            state.retries = 0;
          }
        }
      } catch (stepError) {
        // Handle runtime errors
        logger.error('Error executing step', { 
          error: stepError.message, 
          step: currentStepText
        });
        
        if (state.retries < state.maxRetries) {
          state.retries++;
          state.history.push(`⚠ ${currentStepText} - Error: ${stepError.message}`);
          logger.info(`Retrying step (${state.retries}/${state.maxRetries})`);
          // No change to the step, just retry the same one
        } else {
          // Max retries exceeded for runtime errors
          logger.error('Max retries exceeded for runtime error, skipping step');
          state.history.push(`✗ ${currentStepText} - Skipped due to runtime errors`);
          state.currentStep++;
          state.retries = 0;
        }
      }
    }
    
    // Step 3: Generate final summary
    logger.info('All steps completed, generating summary');
    
    let summaryPrompt = `Generate a summary of the research on electric vehicles comparing models by range, price, and features. 
Create a markdown table with the comparison and add a brief analysis of the findings.
Include only verified information from the research.`;
    
    // Add data context if available
    if (state.evData.models.length > 0) {
      summaryPrompt += `\n\nUse this structured data for your summary:\n${JSON.stringify(state.evData.models, null, 2)}`;
    } else if (state.evData.rawData) {
      summaryPrompt += `\n\nUse this extracted information for your summary:\n${state.evData.rawData}`;
    }
    
    const summary = await browserAgent.navigate(summaryPrompt);
    
    // Step 4: Display results
    console.log('\n\n===== EXECUTION SUMMARY =====');
    console.log(`Objective: ${objective}`);
    console.log('\nExecution History:');
    state.history.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry}`);
    });
    
    console.log('\n===== RESEARCH SUMMARY =====');
    console.log(summary);
    
    logger.info('Workflow completed successfully');
    
  } catch (error) {
    logger.error('Workflow failed with error', { error: error.message, stack: error.stack });
  } finally {
    // Clean up resources
    await browserAgent.close();
    logger.info('Browser closed, advanced workflow example completed');
  }
}

// Run the example
runAdvancedWorkflowExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/advanced-workflow-recovery.ts
 */
