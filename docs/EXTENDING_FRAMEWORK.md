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
2. Develop new tools for browser interaction and data processing
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

### Example: Creating a Data Analysis Agent

Here's an example of a custom agent that specializes in data analysis:

```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { TAgentConfig } from '../types/agent';
import { createLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

export class DataAnalysisAgent {
  private llm: ChatOpenAI;
  
  constructor(config: TAgentConfig = {}) {
    this.llm = createLLM({
      ...config,
      temperature: config.temperature ?? 0.1, // Lower temperature for analytical tasks
    });
  }
  
  async analyze(data: string, query: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a data analysis expert. Analyze the following data:
      
      {data}
      
      Answer the following query about the data:
      {query}
      
      Provide a detailed analysis with insights, trends, and recommendations.
    `);
    
    const chain = prompt.pipe(this.llm);
    const response = await chain.invoke({ data, query });
    
    return response.content as string;
  }
  
  // Standard interface method
  async invoke({ data, query }: { data: string; query: string }): Promise<string> {
    return this.analyze(data, query);
  }
  
  async run(input: { data: string; query: string }): Promise<string> {
    return this.invoke(input);
  }
}
```

## Developing Custom Tools

Tools in R6D9 Agent Node are specialized functions that agents can use to interact with the browser or perform specific tasks.

### Tool Structure

A tool typically consists of:

1. A function that performs a specific task
2. Type definitions for its inputs and outputs
3. Proper error handling
4. Documentation

### Example: Creating a Custom DOM Extraction Tool

```typescript
import { Page } from 'playwright';
import { logger } from '../../utils/logger';

export interface ExtractTableOptions {
  selector: string;
  includeHeaders: boolean;
}

export interface ExtractedTable {
  headers: string[];
  rows: string[][];
}

/**
 * Extracts tabular data from the page
 * @param page Playwright Page object
 * @param options Configuration options for table extraction
 * @returns Structured table data
 */
export async function extractTableTool(
  page: Page,
  options: ExtractTableOptions
): Promise<ExtractedTable> {
  try {
    const { selector, includeHeaders } = options;
    
    // Check if table exists
    const tableExists = await page.$(selector);
    if (!tableExists) {
      throw new Error(`Table with selector "${selector}" not found`);
    }
    
    // Extract headers
    const headers = includeHeaders 
      ? await page.$$eval(`${selector} th`, (ths) => ths.map(th => th.textContent?.trim() || ''))
      : [];
    
    // Extract rows
    const rows = await page.$$eval(`${selector} tr`, (trs) => {
      return trs.map(tr => {
        const cells = Array.from(tr.querySelectorAll('td'));
        return cells.map(cell => cell.textContent?.trim() || '');
      }).filter(row => row.length > 0); // Filter out empty rows
    });
    
    return { headers, rows };
  } catch (error) {
    logger.error('Error extracting table from page', error as Error);
    throw error;
  }
}

// Register the tool for use in the browser agent
export const registerTableExtractionTool = {
  name: 'extractTable',
  description: 'Extracts tabular data from the page',
  func: extractTableTool,
};
```

## Building Custom Workflows

Workflows coordinate the execution of multiple agents to accomplish complex tasks.

### Example: Custom Research Workflow

```typescript
import { SimpleRunnable, Annotation, StateGraph, Edge } from 'langgraph';
import { BrowserAgent } from '../agents/browser';
import { PlannerAgent } from '../agents/planner';
import { CustomAgent } from '../agents/custom';
import { logger } from '../utils/logger';

// Define workflow state
const ResearchState = Annotation.Root({
  query: Annotation<string>(),
  sources: Annotation<string[]>(),
  extractedData: Annotation<Record<string, any>>(),
  analysis: Annotation<string>(),
  complete: Annotation<boolean>(),
});

export class ResearchWorkflow {
  private browser: BrowserAgent;
  private planner: PlannerAgent;
  private analyzer: CustomAgent;
  private graph: StateGraph<typeof ResearchState.State>;
  
  constructor() {
    this.browser = new BrowserAgent();
    this.planner = new PlannerAgent();
    this.analyzer = new CustomAgent();
    
    // Initialize state graph
    this.graph = new StateGraph<typeof ResearchState.State>();
    
    // Add nodes
    this.graph.addNode('plan', this.planResearch.bind(this));
    this.graph.addNode('search', this.searchSources.bind(this));
    this.graph.addNode('extract', this.extractData.bind(this));
    this.graph.addNode('analyze', this.analyzeData.bind(this));
    
    // Add edges
    this.graph.addEdge('plan', 'search');
    this.graph.addEdge('search', 'extract');
    this.graph.addEdge('extract', 'analyze');
    this.graph.addConditionalEdges(
      'analyze',
      this.checkCompletion,
      new Map([
        [true, 'END'],
        [false, 'plan'],
      ])
    );
    
    // Set entry point
    this.graph.setEntryPoint('plan');
  }
  
  private async planResearch(state: typeof ResearchState.State): Promise<typeof ResearchState.State> {
    // Implementation of planning logic
    return { ...state };
  }
  
  private async searchSources(state: typeof ResearchState.State): Promise<typeof ResearchState.State> {
    // Implementation of source search logic
    return { ...state };
  }
  
  private async extractData(state: typeof ResearchState.State): Promise<typeof ResearchState.State> {
    // Implementation of data extraction logic
    return { ...state };
  }
  
  private async analyzeData(state: typeof ResearchState.State): Promise<typeof ResearchState.State> {
    // Implementation of data analysis logic
    return { ...state };
  }
  
  private checkCompletion(state: typeof ResearchState.State): boolean {
    return state.complete;
  }
  
  async run(query: string): Promise<typeof ResearchState.State> {
    try {
      const compiler = this.graph.compile();
      const initialState = {
        query,
        sources: [],
        extractedData: {},
        analysis: '',
        complete: false,
      };
      
      const result = await compiler.invoke(initialState);
      return result;
    } catch (error) {
      logger.error('Error in research workflow', error as Error);
      throw error;
    } finally {
      await this.browser.close();
    }
  }
}
```

## Best Practices

When extending the R6D9 Agent Node framework, follow these best practices:

1. **Maintain Type Safety**
   - Use TypeScript interfaces and types
   - Avoid using `any` type when possible
   - Document parameter and return types

2. **Error Handling**
   - Implement proper try/catch blocks
   - Log meaningful error messages
   - Provide graceful degradation

3. **Modularity**
   - Keep agents and tools focused on a single responsibility
   - Design for composability
   - Avoid tight coupling between components

4. **Testing**
   - Write unit tests for custom agents and tools
   - Create integration tests for workflows
   - Use mocks for external dependencies

5. **Documentation**
   - Document public APIs with JSDoc comments
   - Include usage examples
   - Explain input and output formats

## Advanced Examples

### Integration with External APIs

```typescript
import axios from 'axios';
import { TAgentConfig } from '../types/agent';
import { createLLM } from '../utils/llm';

export class WeatherAgent {
  private llm: ChatOpenAI;
  private apiKey: string;
  
  constructor(config: TAgentConfig = {}, apiKey: string) {
    this.llm = createLLM(config);
    this.apiKey = apiKey;
  }
  
  async getWeather(location: string): Promise<string> {
    try {
      // Call external weather API
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(location)}`
      );
      
      const weatherData = response.data;
      
      // Use LLM to format response
      const prompt = ChatPromptTemplate.fromTemplate(`
        Summarize the following weather data in a user-friendly way:
        
        {weatherData}
        
        Provide temperature, conditions, and recommendations for the day.
      `);
      
      const chain = prompt.pipe(this.llm);
      const result = await chain.invoke({ 
        weatherData: JSON.stringify(weatherData, null, 2) 
      });
      
      return result.content as string;
    } catch (error) {
      logger.error('Error fetching weather data', error as Error);
      throw error;
    }
  }
  
  async invoke({ location }: { location: string }): Promise<string> {
    return this.getWeather(location);
  }
  
  async run(input: { location: string }): Promise<string> {
    return this.invoke(input);
  }
}
```

### Custom Prompt Engineering

```typescript
import { PromptTemplate } from 'langchain/prompts';

export const createCustomBrowserPrompt = (
  task: string, 
  currentUrl: string,
  pageContent: string
): string => {
  const template = `
    You are a web browser automation agent with the following capabilities:
    - Navigation: Go to URLs, click links, use back/forward buttons
    - Form interaction: Fill in forms, select options, check boxes
    - Content extraction: Extract text, tables, and other data
    
    Current URL: {currentUrl}
    
    Your task: {task}
    
    Current page content:
    {pageContent}
    
    Based on the current page and your task, determine the next action to take.
    Respond with a JSON object in the following format:
    
    ```json
    {
      "action": "One of: navigate, click, type, extract, wait, back, forward",
      "parameters": {
        // Parameters specific to the action
      },
      "reasoning": "Your step-by-step reasoning for this action"
    }
    ```
  `;
  
  const prompt = new PromptTemplate({
    template,
    inputVariables: ['task', 'currentUrl', 'pageContent'],
  });
  
  return prompt.format({
    task,
    currentUrl,
    pageContent,
  });
};
```

By following this guide, you should be able to extend the R6D9 Agent Node framework to meet your specific requirements while maintaining compatibility with the core architecture.
