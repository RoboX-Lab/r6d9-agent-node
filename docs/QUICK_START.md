# R6D9 Agent Node: Quick Start Guide

This guide will help you get started with R6D9 Agent Node quickly, showing you how to install the package, set up your environment, and run your first agent workflow.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js version 20 or higher
- npm or yarn package manager
- An OpenAI API key

## Installation

### 1. Install the package

```bash
npm install r6d9-agent-node
# or
yarn add r6d9-agent-node
```

### 2. Set up environment variables

Create a `.env` file in your project root with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_MODEL=gpt-4o-2024-05-13  # Optional, defaults to latest model
BROWSER_HEADLESS=true               # Set to false to see the browser
BROWSER_TIMEOUT=30000               # Browser timeout in milliseconds
LOG_LEVEL=info                      # debug, info, warn, or error
```

## Basic Usage

### Simple Browser Automation

Here's a basic example of using the BrowserAgent to navigate to a website and extract information:

```typescript
import { BrowserAgent } from 'r6d9-agent-node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Create a new browser agent
  const browserAgent = new BrowserAgent();
  
  try {
    // Navigate to a website and perform a task
    const result = await browserAgent.navigate(
      "Go to wikipedia.org, search for 'artificial intelligence', and summarize the first paragraph."
    );
    
    console.log("Navigation result:", result);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Always close the browser when done
    await browserAgent.close();
  }
}

main();
```

### Using the Planner Agent

Create a step-by-step plan for a complex task:

```typescript
import { PlannerAgent } from 'r6d9-agent-node';
import dotenv from 'dotenv';

dotenv.config();

async function createPlan() {
  const planner = new PlannerAgent();
  
  const objective = "Research the latest AI developments in healthcare and compile a summary.";
  
  try {
    const plan = await planner.generatePlan(objective);
    console.log("Generated Plan:");
    plan.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
  } catch (error) {
    console.error("Planning error:", error);
  }
}

createPlan();
```

### Executing a Complete Workflow

Use the Orchestrator to run a complete plan-execute-critique workflow:

```typescript
import { Orchestrator } from 'r6d9-agent-node';
import dotenv from 'dotenv';

dotenv.config();

async function runWorkflow() {
  const orchestrator = new Orchestrator();
  
  const objective = "Find the latest smartphone reviews on The Verge and summarize the top 3 phones.";
  
  try {
    console.log("Starting workflow for objective:", objective);
    
    const finalState = await orchestrator.run(objective);
    
    console.log("Workflow complete!");
    console.log("Final response:", finalState.response);
    console.log("Success:", finalState.success);
    console.log("History:", finalState.history);
  } catch (error) {
    console.error("Workflow error:", error);
  }
}

runWorkflow();
```

## Customizing Agents

### Custom Browser Agent Configuration

You can customize the behavior of the BrowserAgent:

```typescript
import { BrowserAgent } from 'r6d9-agent-node';

const browserAgent = new BrowserAgent({
  modelName: 'gpt-4o-2024-05-13',
  temperature: 0.2,
  maxTokens: 2000,
  maxRetries: 3
});

// Use the custom configured agent
const result = await browserAgent.navigate("Your task here");
```

### Custom Planner Agent

Customize the planner for different planning styles:

```typescript
import { PlannerAgent } from 'r6d9-agent-node';

const detailedPlanner = new PlannerAgent({
  modelName: 'gpt-4o-2024-05-13',
  temperature: 0.1, // Low temperature for more deterministic plans
  maxTokens: 4000  // More tokens for detailed plans
});

const plan = await detailedPlanner.generatePlan(
  "Research and compile a comprehensive report on renewable energy trends.",
  "", // No original plan
  "Make sure to include market projections and policy impacts." // Feedback
);
```

## Advanced Usage

### Handling Plan Revisions

When a step fails, you can use feedback to revise the plan:

```typescript
import { PlannerAgent, CritiqueAgent, BrowserAgent } from 'r6d9-agent-node';

async function planWithRevision() {
  const planner = new PlannerAgent();
  const browser = new BrowserAgent();
  const critique = new CritiqueAgent();
  
  const objective = "Find the current weather in Tokyo.";
  
  try {
    // Generate initial plan
    let plan = await planner.generatePlan(objective);
    console.log("Initial plan:", plan);
    
    // Try executing the first step
    const currentStep = plan[0];
    const pageContent = await browser.navigate(currentStep);
    
    // Evaluate the result
    const evaluation = await critique.evaluate(objective, currentStep, pageContent);
    
    if (!evaluation.success) {
      console.log("Step failed. Reason:", evaluation.reason);
      console.log("Revising plan with feedback...");
      
      // Generate a revised plan based on feedback
      const revisedPlan = await planner.generatePlan(
        objective,
        plan.join('\n'),
        evaluation.reason
      );
      
      console.log("Revised plan:", revisedPlan);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

planWithRevision();
```

### Using Run Controls

The `run` method provides control functions to manage execution:

```typescript
import { BrowserAgent } from 'r6d9-agent-node';

async function controlledExecution() {
  const browser = new BrowserAgent();
  
  // Start a controllable execution
  const controls = browser.run(
    "Research electric vehicles, focusing on Tesla, Rivian, and Lucid."
  );
  
  // You can now control the execution
  setTimeout(() => {
    console.log("Pausing execution...");
    controls.pause();
    
    setTimeout(() => {
      console.log("Resuming execution...");
      controls.resume();
      
      setTimeout(() => {
        console.log("Stopping execution...");
        controls.stop();
      }, 10000);
    }, 5000);
  }, 5000);
}

controlledExecution();
```

## Error Handling

Implement proper error handling in your applications:

```typescript
import { BrowserAgent, logger } from 'r6d9-agent-node';

async function robustNavigation() {
  const browser = new BrowserAgent();
  
  try {
    const result = await browser.navigate("Go to a non-existent website example123456789.com");
    console.log(result);
  } catch (error) {
    logger.error("Navigation failed", error);
    
    // Try an alternative approach
    try {
      logger.info("Attempting alternative approach");
      const altResult = await browser.navigate(
        "Search for 'example123456789.com' on Google and check if it exists"
      );
      console.log("Alternative approach result:", altResult);
    } catch (altError) {
      logger.error("Alternative approach also failed", altError);
    }
  } finally {
    await browser.close();
  }
}

robustNavigation();
```

## Next Steps

Now that you're familiar with the basics of R6D9 Agent Node, explore these resources to learn more:

- [API Reference](./API_REFERENCE.md) - Detailed documentation of all classes and methods
- [Architecture Overview](./ARCHITECTURE.md) - Understanding the system design
- [Example Recipes](../examples/README.md) - Common patterns and use cases
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to the project

## Troubleshooting

### Common Issues

1. **Browser Launch Failures**
   - Ensure you have the necessary browser dependencies installed
   - Try setting `BROWSER_HEADLESS=false` to see what's happening

2. **API Key Errors**
   - Check that your `OPENAI_API_KEY` is correctly set
   - Verify that your API key has sufficient permissions and quota

3. **Timeout Errors**
   - Increase `BROWSER_TIMEOUT` for complex navigation tasks
   - Consider breaking complex tasks into smaller steps

4. **TypeScript Errors**
   - Ensure you're using TypeScript 5.x or higher
   - Check that the types are correctly imported

### Getting Help

If you encounter issues not covered here:

- Check the [GitHub Issues](https://github.com/RoboX-Lab/r6d9-agent-node/issues) for similar problems
- Join our community Discord for real-time assistance
- Review the detailed logs (set `LOG_LEVEL=debug` for verbose logging)
