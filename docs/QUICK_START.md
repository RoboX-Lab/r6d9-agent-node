# R6D9 Agent Node: Quick Start Guide

This guide will help you get started with R6D9 Agent Node quickly, showing you how to install the package, set up your environment, and run your first agent workflow.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js version 20 or higher
- npm or yarn package manager
- An OpenAI API key (with access to vision models like GPT-4o)

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
OPENAI_API_MODEL=gpt-4o           # Vision-capable model required for screenshot analysis
VIEWPORT_WIDTH=1280               # Default viewport width
VIEWPORT_HEIGHT=800               # Default viewport height
SCREENSHOT_DIR=./screenshots      # Directory to store screenshots
LOG_LEVEL=info                    # debug, info, warn, or error
```

## Basic Usage

### Computer Interaction with Screenshot Analysis

Here's a basic example of using the ComputerAgent to interact with your computer using screenshots and mouse/keyboard control:

```typescript
import { ComputerAgent } from 'r6d9-agent-node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Create a new computer agent
  const computerAgent = new ComputerAgent();
  
  try {
    // Interact with the computer using screenshots and mouse/keyboard control
    const result = await computerAgent.interact(
      "Open the calculator app, perform 5+7, and tell me the result"
    );
    
    console.log("Interaction result:", result);
  } catch (error) {
    console.error("Error:", error);
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
  
  const objective = "Search for recent articles about climate change, take screenshots of the results, and save the information to a text file.";
  
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

Use the Orchestrator to run a complete plan-execute-critique workflow using screenshot-based computer interaction:

```typescript
import { Orchestrator, PlannerAgent, ComputerAgent, CritiqueAgent } from 'r6d9-agent-node';
import dotenv from 'dotenv';

dotenv.config();

async function runWorkflow() {
  const planner = new PlannerAgent();
  const computer = new ComputerAgent();
  const critique = new CritiqueAgent();
  
  const orchestrator = new Orchestrator({
    plannerAgent: planner,
    executionAgent: computer,  // Using ComputerAgent for screenshot-based interaction
    critiqueAgent: critique
  });
  
  const objective = "Create a new text file on the desktop named 'report.txt' and write a short message in it.";
  
  try {
    const { start, stop } = orchestrator.run(objective);
    
    // Start the workflow
    await start();
    
    console.log("Workflow completed successfully");
  } catch (error) {
    console.error("Workflow error:", error);
  }
}

runWorkflow();
```

## Low-Level Computer Interaction

For direct control of computer interaction components:

```typescript
import { ComputerService } from 'r6d9-agent-node';
import dotenv from 'dotenv';

dotenv.config();

async function directComputerControl() {
  const computerService = new ComputerService();
  
  try {
    // Take a screenshot
    const screenshotPath = await computerService.takeScreenshot();
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Move mouse to coordinates
    await computerService.mouseMove(500, 500);
    
    // Click
    await computerService.mouseClick();
    
    // Type text
    await computerService.typeText('Hello, world!', 100); // 100ms delay between keystrokes
    
    // Press a key
    await computerService.pressKey('Enter');
    
    // Execute a terminal command
    const { stdout } = await computerService.executeCommand('ls -la');
    console.log('Command output:', stdout);
  } catch (error) {
    console.error("Error:", error);
  }
}

directComputerControl();
```

## Advanced Usage

### Using Computer Tools Individually

```typescript
import { 
  takeScreenshotTool, 
  analyzeScreenTool, 
  mouseMoveClickTool, 
  typeTextTool 
} from 'r6d9-agent-node';
import dotenv from 'dotenv';

dotenv.config();

async function useIndividualTools() {
  try {
    // Take a screenshot
    const screenshotPath = await takeScreenshotTool();
    
    // Analyze the screen
    const analysis = await analyzeScreenTool({
      screenshotPath,
      question: "Where is the search box located?"
    });
    
    // Based on analysis, move and click
    await mouseMoveClickTool({
      x: 500,  // Coordinates determined by analysis
      y: 300
    });
    
    // Type some text
    await typeTextTool({
      text: "climate change research",
      delay: 50  // 50ms delay between keystrokes
    });
    
    console.log("Tools executed successfully");
  } catch (error) {
    console.error("Tool error:", error);
  }
}

useIndividualTools();
```

## Next Steps

Once you've mastered the basics, check out these resources:

- [API Reference](./API_REFERENCE.md) - Complete documentation of all classes and methods
- [Architecture](./ARCHITECTURE.md) - Understanding the framework architecture
- [Extending Framework](./EXTENDING_FRAMEWORK.md) - Building custom agents and tools
- [Contributing](./CONTRIBUTING.md) - How to contribute to the project

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**: Ensure your API key has access to the required models (GPT-4o) and check your API usage limits.

2. **Screenshot Capture Failures**: Different operating systems may require specific permissions for screenshot capture. Check your system settings.

3. **Mouse/Keyboard Control Issues**: Some systems may have security restrictions on programmatic mouse/keyboard control. Check your system permissions.

4. **Vision Model Response Time**: Screenshot analysis can take longer than text-only queries. Adjust your timeouts accordingly.

For more help, please check our GitHub issues or join our community Discord channel.
