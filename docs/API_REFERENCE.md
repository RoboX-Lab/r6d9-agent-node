# R6D9 Agent Node API Reference

This document provides a comprehensive reference for the main classes and methods available in the R6D9 Agent Node library.

## Table of Contents

- [Core Agents](#core-agents)
  - [BrowserAgent](#browseragent)
  - [PlannerAgent](#planneragent)
  - [CritiqueAgent](#critiqueagent)
- [Workflows](#workflows)
  - [Orchestrator](#orchestrator)
- [Utilities](#utilities)
  - [Logger](#logger)
  - [Config](#config)
- [Types](#types)
  - [TAgentConfig](#tagentconfig)
  - [PlanExecuteState](#planexecutestate)
  - [CritiqueResult](#critiqueresult)
  - [Plan](#plan)

## Core Agents

### BrowserAgent

The `BrowserAgent` handles browser automation using Playwright.

```typescript
import { BrowserAgent } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor(config: TAgentConfig = {})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| config | TAgentConfig | Optional configuration for the agent |

#### Methods

##### navigate

Navigates to complete a specific task in the browser.

```typescript
async navigate(task: string): Promise<string>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| task | string | The task to execute in the browser |

**Returns**: Promise resolving to a string containing the page content after navigation.

##### close

Closes the browser.

```typescript
async close(): Promise<void>
```

**Returns**: Promise that resolves when the browser is closed.

##### run

Runs the browser agent with control functions.

```typescript
run(task?: string): { start: Function, stop: Function, pause: Function, resume: Function }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| task | string | Optional initial task to run |

**Returns**: An object with control functions for the running task.

### PlannerAgent

The `PlannerAgent` generates step-by-step plans for completing objectives.

```typescript
import { PlannerAgent } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor(config: TAgentConfig = {})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| config | TAgentConfig | Optional configuration for the agent |

#### Methods

##### generatePlan

Generates a plan based on an objective.

```typescript
async generatePlan(
  objective: string,
  originalPlan: string = '',
  feedback: string = ''
): Promise<string[]>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The objective to plan for |
| originalPlan | string | Optional original plan for refinement |
| feedback | string | Optional feedback on previous plan |

**Returns**: Promise resolving to an array of strings representing steps in the plan.

##### invoke

Direct invocation of the planner.

```typescript
async invoke(
  objective: string,
  originalPlan: string = '',
  feedback: string = ''
): Promise<Plan>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The objective to plan for |
| originalPlan | string | Optional original plan for refinement |
| feedback | string | Optional feedback on previous plan |

**Returns**: Promise resolving to a `Plan` object containing the plan and next step.

##### run

Run method for compatibility with the agent interface.

```typescript
async run(
  objective: string,
  originalPlan: string = '',
  feedback: string = ''
): Promise<Plan>
```

**Returns**: Promise resolving to a `Plan` object (same as `invoke`).

### CritiqueAgent

The `CritiqueAgent` evaluates the success of task execution.

```typescript
import { CritiqueAgent } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor(config: TAgentConfig = {})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| config | TAgentConfig | Optional configuration for the agent |

#### Methods

##### evaluate

Evaluates the success of a task step.

```typescript
async evaluate(
  objective: string,
  currentStep: string,
  pageContent: string
): Promise<CritiqueResult>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The overall objective |
| currentStep | string | The current step being evaluated |
| pageContent | string | The page content after step execution |

**Returns**: Promise resolving to a `CritiqueResult` object.

##### invoke

Direct invocation of the critique agent (alias for evaluate).

```typescript
async invoke(
  objective: string,
  currentStep: string,
  pageContent: string
): Promise<CritiqueResult>
```

**Returns**: Promise resolving to a `CritiqueResult` object.

##### run

Run method for compatibility with the agent interface.

```typescript
async run(
  objective: string,
  currentStep: string,
  pageContent: string
): Promise<CritiqueResult>
```

**Returns**: Promise resolving to a `CritiqueResult` object.

## Workflows

### Orchestrator

The `Orchestrator` coordinates the execution of agents in a workflow.

```typescript
import { Orchestrator } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor()
```

Creates a new Orchestrator instance with default agent configurations.

#### Methods

##### run

Runs the orchestrator with a specific objective.

```typescript
async run(objective: string): Promise<typeof PlanExecuteState.State>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The objective to accomplish |

**Returns**: Promise resolving to the final state of the workflow execution.

## Utilities

### Logger

The `logger` provides structured logging capabilities.

```typescript
import { logger } from 'r6d9-agent-node';
```

#### Methods

```typescript
logger.debug(message: string, context?: object): void
logger.info(message: string, context?: object): void
logger.warn(message: string, context?: object): void
logger.error(message: string, error?: Error | object): void
```

### Config

The `createLLM` function creates a configured LLM instance.

```typescript
import { createLLM } from 'r6d9-agent-node';
```

```typescript
function createLLM(config: TAgentConfig = {}): ChatOpenAI
```

| Parameter | Type | Description |
|-----------|------|-------------|
| config | TAgentConfig | Configuration for the LLM |

**Returns**: A configured `ChatOpenAI` instance.

## Types

### TAgentConfig

Configuration interface for agents.

```typescript
type TAgentConfig = {
  /** LLM model name to use */
  modelName?: string;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
};
```

### PlanExecuteState

State object used by the Orchestrator workflow.

```typescript
const PlanExecuteState = Annotation.Root({
  /** User's objective/task to accomplish */
  objective: Annotation<string>(),
  /** Current browser URL */
  currentUrl: Annotation<string>(),
  /** Current page content */
  pageContent: Annotation<string>(),
  /** Current step number in the execution plan */
  currentStep: Annotation<number>(),
  /** History of visited pages and actions */
  history: Annotation<string[]>(),
  /** Agent's response to the user */
  response: Annotation<string>(),
  /** Generated execution plan steps */
  steps: Annotation<string[]>(),
  /** Success status of the current step */
  success: Annotation<boolean>(),
});
```

### CritiqueResult

Type for critique evaluation results.

```typescript
type CritiqueResult = {
  /** Whether the step was successful */
  success: boolean;
  /** Reason for the success/failure */
  reason: string;
  /** Suggestions for improvement if failed */
  suggestions?: string[];
};
```

### Plan

Type for the plan generated by the planner agent.

```typescript
type Plan = {
  /** Complete step-by-step plan */
  plan: string[];
  /** Next action to execute */
  next_step: string;
};
```
