# Extending the R6D9 Agent Node Framework

This guide explains how to extend the R6D9 Agent Node framework by creating custom agents, tools, and workflows to fit your specific use cases.

## Table of Contents

- [Overview](#overview)
- [Creating Custom Agents](#creating-custom-agents)
- [Developing Custom Tools](#developing-custom-tools)
- [Building Custom Workflows](#building-custom-workflows)
- [Best Practices](#best-practices)
- [Advanced Examples](#advanced-examples)

## Overview

R6D9 Agent Node is designed to be modular and extensible, allowing you to:

1. Create custom agents with specialized capabilities
2. Develop new tools for computer interaction, screenshot analysis, and data processing
3. Build custom workflows that coordinate multiple agents
4. Extend existing functionality without modifying core components

## Creating Custom Agents

### Basic Agent Structure

All agents in R6D9 Agent Node should follow a consistent interface pattern:

```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { TAgentConfig } from '../types/agent';
import { createLLM } from '../utils/llm';

export class CustomAgent {
  private llm: ChatOpenAI;
  
  constructor(config: TAgentConfig = {}) {
    // Set up the language model
    this.llm = createLLM(config);
  }
  
  // Core agent functionality
  async invoke(input: YourInputType): Promise<YourOutputType> {
    // Implementation logic
    return result;
  }
  
  // Alias for invoke to maintain consistent interface
  async run(input: YourInputType): Promise<YourOutputType> {
    return this.invoke(input);
  }
}
```

### Example: Creating a Screenshot Analysis Agent

Here's an example of a custom agent that specializes in analyzing screenshots:

```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { TAgentConfig } from '../types/agent';
import { createLLM } from '../utils/llm';
import { getImageBase64 } from '../utils/image';
import { ChatPromptTemplate } from 'langchain/prompts';

export class ScreenshotAnalysisAgent {
  private llm: ChatOpenAI;
  private computerService: ComputerService;
  
  constructor(config: TAgentConfig = {}) {
    this.llm = createLLM({
      ...config,
      model: config.model ?? 'gpt-4o', // Vision model required
    });
    this.computerService = new ComputerService();
  }
  
  async analyzeScreenshot(question: string): Promise<string> {
    // Take a screenshot
    const screenshotPath = await this.computerService.takeScreenshot();
    
    // Convert to base64 for vision model
    const base64Image = await getImageBase64(screenshotPath);
    
    // Create a prompt with the image
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a screen analysis expert. Analyze the screenshot and answer the question: ${question}`],
      ["human", { image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]
    ]);
    
    // Get analysis from vision model
    const chain = prompt.pipe(this.llm);
    const response = await chain.invoke({});
    
    return response.content as string;
  }
  
  // Standard interface method
  async invoke({ question }: { question: string }): Promise<string> {
    return this.analyzeScreenshot(question);
  }
  
  async run(input: { question: string }): Promise<string> {
    return this.invoke(input);
  }
}
```

## Developing Custom Tools

Tools are the building blocks for agent capabilities. Each tool should perform a specific function and return a defined output.

### Tool Structure

A basic tool consists of:

1. A function that performs the action
2. A registration object that defines metadata for the tool

```typescript
import { ComputerService } from '../services/computer-service';

// Tool implementation function
async function customScreenshotTool(
  params: { region?: { x: number, y: number, width: number, height: number } }
): Promise<string> {
  const computerService = new ComputerService();
  const screenshotPath = await computerService.takeScreenshot(params.region);
  return screenshotPath;
}

// Tool registration object
export const registerCustomScreenshotTool = {
  name: 'takeCustomScreenshot',
  description: 'Takes a screenshot of a specific region of the screen',
  func: customScreenshotTool,
};
```

### Example: Creating a UI Element Detection Tool

Here's an example of a tool that detects UI elements in a screenshot:

```typescript
import { ComputerService } from '../services/computer-service';
import { getImageBase64 } from '../utils/image';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';

// Tool implementation
async function detectUIElementsTool(
  params: { elementType: string }
): Promise<Array<{ element: string, coordinates: { x: number, y: number } }>> {
  const computerService = new ComputerService();
  
  // Take a screenshot
  const screenshotPath = await computerService.takeScreenshot();
  const base64Image = await getImageBase64(screenshotPath);
  
  // Initialize vision model
  const visionModel = new ChatOpenAI({ 
    model: 'gpt-4o',
    temperature: 0.2
  });
  
  // Create prompt to find UI elements
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `Identify all ${params.elementType} elements in this screenshot. 
      Return a JSON array with each element containing:
      1. element: brief description
      2. coordinates: {x, y} position to click`],
    ["human", { image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]
  ]);
  
  // Get response from vision model
  const chain = prompt.pipe(visionModel);
  const response = await chain.invoke({});
  
  // Parse and return the elements
  try {
    const elements = JSON.parse(response.content as string);
    return Array.isArray(elements) ? elements : [];
  } catch (error) {
    console.error("Failed to parse UI elements", error);
    return [];
  }
}

// Tool registration
export const registerDetectUIElementsTool = {
  name: 'detectUIElements',
  description: 'Detects UI elements of a specific type (buttons, links, inputs, etc.) in the current screen',
  func: detectUIElementsTool,
};
```

## Building Custom Workflows

Custom workflows combine agents and tools to solve complex tasks. LangGraph allows you to create sophisticated flows with branching logic.

### Basic Workflow

Here's a simple workflow that uses screenshot analysis to complete a task:

```typescript
import { StateGraph, END } from 'langchain/langgraph';
import { ComputerAgent } from '../agents/computer-agent';
import { ComputerService } from '../services/computer-service';

// Define state type
interface WorkflowState {
  objective: string;
  currentStep: string;
  screenshot: string;
  analysis: string;
  actions: string[];
  success: boolean;
}

async function createScreenshotWorkflow(objective: string) {
  // Initialize services and agents
  const computerService = new ComputerService();
  const computerAgent = new ComputerAgent();
  
  // Create the graph
  const workflow = new StateGraph<WorkflowState>({
    channels: ["objective", "currentStep", "screenshot", "analysis", "actions", "success"]
  });
  
  // Define nodes
  
  // 1. Take screenshot
  workflow.addNode("takeScreenshot", async (state) => {
    const screenshotPath = await computerService.takeScreenshot();
    return { screenshot: screenshotPath };
  });
  
  // 2. Analyze screenshot
  workflow.addNode("analyzeScreenshot", async (state) => {
    const analysis = await computerAgent.analyzeScreen(state.screenshot, state.objective);
    return { analysis };
  });
  
  // 3. Determine actions
  workflow.addNode("planActions", async (state) => {
    const actions = await computerAgent.planActions(state.analysis, state.objective);
    return { actions, currentStep: actions[0] || "" };
  });
  
  // 4. Execute action
  workflow.addNode("executeAction", async (state) => {
    if (!state.currentStep) {
      return { success: true };
    }
    
    await computerAgent.executeStep(state.currentStep);
    
    // Remove the current step from actions
    const remainingActions = state.actions.slice(1);
    return { 
      actions: remainingActions,
      currentStep: remainingActions[0] || "",
      success: remainingActions.length === 0
    };
  });
  
  // Define edges
  workflow.addEdge("takeScreenshot", "analyzeScreenshot");
  workflow.addEdge("analyzeScreenshot", "planActions");
  workflow.addEdge("planActions", "executeAction");
  
  // Add conditional edge: if more actions, take another screenshot
  workflow.addConditionalEdge(
    "executeAction",
    (state) => state.success ? END : "takeScreenshot",
  );
  
  // Set the entry point
  workflow.setEntryPoint("takeScreenshot");
  
  // Compile the workflow
  const runnable = workflow.compile();
  
  // Execute with initial state
  return await runnable.invoke({
    objective,
    currentStep: "",
    screenshot: "",
    analysis: "",
    actions: [],
    success: false
  });
}
```

## Best Practices

### 1. Screenshot Analysis

- **Resolution and Quality**: Ensure screenshots are high quality for better analysis
- **Error Handling**: Add robust error handling for screen parsing failures
- **Vision Model Selection**: Use the best available vision model (e.g., GPT-4o)
- **Contextual Prompts**: Provide clear instructions when analyzing screenshots

### 2. Mouse and Keyboard Interaction

- **Safe Coordinates**: Verify coordinates before clicking
- **Natural Typing**: Add random delays between keystrokes for natural typing
- **Fallback Methods**: Provide alternative methods if primary interaction fails
- **Error Recovery**: Implement retry logic for failed interactions

### 3. Agent Implementation

- **Clear Responsibilities**: Each agent should have a focused purpose
- **State Management**: Keep track of agent state for resumability
- **Debugging Support**: Include debug logging and visualization
- **Performance Optimization**: Cache results when appropriate

### 4. Tool Development

- **Tools should be atomic**, focused utilities
- **Tools should have proper error handling**
- **Tools should be well-documented**
- **Prefer screenshot-based tools** over API-based when possible

## Advanced Examples

### Complex Computer Interaction Agent

This example creates a specialized agent for complex computer interaction tasks:

```typescript
import { ComputerService } from '../services/computer-service';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { TAgentConfig } from '../types/agent';
import { createLLM } from '../utils/llm';
import { getImageBase64 } from '../utils/image';

export class AdvancedComputerAgent {
  private llm: ChatOpenAI;
  private computerService: ComputerService;
  private memory: { screenshots: string[], actions: string[] } = { screenshots: [], actions: [] };
  
  constructor(config: TAgentConfig = {}) {
    this.llm = createLLM({
      ...config,
      model: 'gpt-4o',
    });
    this.computerService = new ComputerService();
  }
  
  // Take screenshot and perform analysis
  async analyzeCurrentScreen(question: string): Promise<string> {
    // Capture screen
    const screenshotPath = await this.computerService.takeScreenshot();
    this.memory.screenshots.push(screenshotPath);
    
    // Analyze with vision model
    const base64Image = await getImageBase64(screenshotPath);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an expert at analyzing computer screens. 
        Analyze this screenshot and answer: ${question}
        Be detailed and precise in your analysis.`],
      ["human", { image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]
    ]);
    
    const chain = prompt.pipe(this.llm);
    const response = await chain.invoke({});
    return response.content as string;
  }
  
  // Find and click an element based on description
  async findAndClickElement(elementDescription: string): Promise<boolean> {
    const screenshotPath = await this.computerService.takeScreenshot();
    const base64Image = await getImageBase64(screenshotPath);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `Find the element described as: "${elementDescription}".
        Return a JSON object with x and y coordinates where it should be clicked.
        Format: {"x": number, "y": number}`],
      ["human", { image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]
    ]);
    
    const chain = prompt.pipe(this.llm);
    const response = await chain.invoke({});
    
    try {
      const coordinates = JSON.parse(response.content as string);
      if (typeof coordinates.x === 'number' && typeof coordinates.y === 'number') {
        // Move mouse and click
        await this.computerService.mouseMove(coordinates.x, coordinates.y);
        await this.computerService.mouseClick();
        
        // Record action
        this.memory.actions.push(`Clicked at (${coordinates.x}, ${coordinates.y}) for element: ${elementDescription}`);
        return true;
      }
    } catch (error) {
      console.error("Failed to parse coordinates or click element", error);
    }
    
    return false;
  }
  
  // Execute a complex computer interaction task
  async executeTask(task: string): Promise<string> {
    // Initial screen analysis
    const initialAnalysis = await this.analyzeCurrentScreen("Describe what you see on the screen");
    
    // Generate plan based on task and current screen
    const planPrompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a computer automation expert. Create a step-by-step plan to accomplish this task: "${task}"
        Current screen state: ${initialAnalysis}
        Return a JSON array of steps to take.`],
      ["human", "Generate a detailed plan with specific actions."]
    ]);
    
    const planChain = planPrompt.pipe(this.llm);
    const planResponse = await planChain.invoke({});
    
    try {
      const plan = JSON.parse(planResponse.content as string);
      
      // Execute each step in the plan
      for (const step of plan) {
        if (typeof step === 'string') {
          // Analyze current state
          const stepAnalysis = await this.analyzeCurrentScreen(`Evaluate if we can perform step: ${step}`);
          
          // Determine action type and execute
          if (step.toLowerCase().includes("click")) {
            const elementToClick = step.replace(/^click /i, "").replace(/\.$/, "");
            await this.findAndClickElement(elementToClick);
          } else if (step.toLowerCase().includes("type")) {
            const textMatch = step.match(/type ["'](.+?)["']/i);
            if (textMatch && textMatch[1]) {
              await this.computerService.typeText(textMatch[1]);
              this.memory.actions.push(`Typed: ${textMatch[1]}`);
            }
          } else if (step.toLowerCase().includes("press")) {
            const keyMatch = step.match(/press ["'](.+?)["']/i);
            if (keyMatch && keyMatch[1]) {
              await this.computerService.pressKey(keyMatch[1]);
              this.memory.actions.push(`Pressed key: ${keyMatch[1]}`);
            }
          }
          
          // Wait briefly between steps
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Final analysis to verify completion
      const finalAnalysis = await this.analyzeCurrentScreen(`Did we successfully complete the task: "${task}"? Explain in detail.`);
      return finalAnalysis;
      
    } catch (error) {
      console.error("Error executing task", error);
      return `Failed to execute task: ${error.message}`;
    }
  }
  
  // Standard interface methods
  async invoke(input: { task: string }): Promise<string> {
    return this.executeTask(input.task);
  }
  
  async run(input: { task: string }): Promise<string> {
    return this.invoke(input);
  }
}
```

This advanced agent demonstrates:

1. Screenshot capture and analysis
2. Smart element detection and clicking
3. Task planning based on screen analysis
4. Flexible interaction methods (click, type, press)
5. Memory of actions and screenshots
6. Self-verification of task completion

You can extend this pattern to create even more specialized agents for your specific use cases.
