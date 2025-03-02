# R6D9 Agent Node API Reference

This document provides a comprehensive reference for the main classes and methods available in the R6D9 Agent Node library.

## Table of Contents

- [Core Agents](#core-agents)
  - [ComputerAgent](#computeragent)
  - [PlannerAgent](#planneragent)
  - [CritiqueAgent](#critiqueagent)
- [Services](#services)
  - [ComputerService](#computerservice)
- [Tools](#tools)
  - [Computer Interaction Tools](#computer-interaction-tools)
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

### ComputerAgent

The `ComputerAgent` handles general computer automation using screenshot analysis and natural mouse/keyboard interactions.

```typescript
import { ComputerAgent } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor(config: TAgentConfig = {})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| config | TAgentConfig | Optional configuration for the agent |

#### Methods

##### interact

Interacts with the computer to complete a specific task using screenshot analysis and mouse/keyboard controls.

```typescript
async interact(task: string): Promise<string>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| task | string | The task to execute on the computer |

**Returns**: Promise resolving to a string containing the result of the interaction.

##### run

Runs the computer agent with control functions.

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

Generates a step-by-step plan for completing an objective.

```typescript
async generatePlan(
  objective: string, 
  originalPlan?: string, 
  feedback?: string
): Promise<string[]>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The objective to plan for |
| originalPlan | string | Optional original plan to revise |
| feedback | string | Optional feedback to improve the plan |

**Returns**: Promise resolving to an array of step strings.

##### revise

Revises an existing plan based on feedback.

```typescript
async revise(
  objective: string, 
  originalPlan: string, 
  feedback: string
): Promise<string[]>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The objective being planned for |
| originalPlan | string | The original plan to revise |
| feedback | string | Feedback to incorporate into the revised plan |

**Returns**: Promise resolving to an array of revised step strings.

### CritiqueAgent

The `CritiqueAgent` evaluates the results of executed steps.

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

Evaluates the result of a step execution against the objective.

```typescript
async evaluate(
  objective: string, 
  step: string, 
  result: string
): Promise<CritiqueResult>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The overall objective |
| step | string | The step that was executed |
| result | string | The result of the step execution |

**Returns**: Promise resolving to a `CritiqueResult` object.

## Services

### ComputerService

The `ComputerService` provides low-level functions for interacting with the computer.

```typescript
import { ComputerService } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor(config: TComputerServiceConfig = {})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| config | TComputerServiceConfig | Optional configuration for the service |

#### Methods

##### takeScreenshot

Takes a screenshot of the current screen.

```typescript
async takeScreenshot(options?: TScreenshotOptions): Promise<string>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| options | TScreenshotOptions | Optional screenshot configuration |

**Returns**: Promise resolving to the path of the saved screenshot.

##### mouseMove

Moves the mouse to the specified coordinates.

```typescript
async mouseMove(x: number, y: number): Promise<void>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| x | number | X coordinate |
| y | number | Y coordinate |

##### mouseClick

Clicks at the current mouse position or at specified coordinates.

```typescript
async mouseClick(options?: TMouseClickOptions): Promise<void>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| options | TMouseClickOptions | Optional click configuration |

##### typeText

Types the specified text.

```typescript
async typeText(text: string, delay?: number): Promise<void>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| text | string | Text to type |
| delay | number | Optional delay between keystrokes in ms |

##### pressKey

Presses a specific keyboard key.

```typescript
async pressKey(key: string): Promise<void>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | Key to press |

##### executeCommand

Executes a terminal command.

```typescript
async executeCommand(command: string): Promise<{ stdout: string, stderr: string }>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| command | string | Command to execute |

**Returns**: Promise resolving to an object with stdout and stderr strings.

## Tools

### Computer Interaction Tools

Core tools for computer interaction via screenshot analysis and natural mouse/keyboard controls:

- `takeScreenshotTool`: Captures the current screen
- `analyzeScreenTool`: Analyzes screen content using vision models
- `mouseMoveClickTool`: Moves and clicks the mouse at specified coordinates
- `typeTextTool`: Types text into the focused input
- `pressKeyTool`: Presses specified keyboard keys
- `executeCommandTool`: Runs terminal commands

## Workflows

### Orchestrator

The `Orchestrator` coordinates the execution of agents in a workflow.

```typescript
import { Orchestrator } from 'r6d9-agent-node';
```

#### Constructor

```typescript
constructor({
  plannerAgent,
  executionAgent,
  critiqueAgent
}: {
  plannerAgent: PlannerAgent,
  executionAgent: ComputerAgent,
  critiqueAgent: CritiqueAgent
})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| plannerAgent | PlannerAgent | Agent for generating plans |
| executionAgent | ComputerAgent | Agent for executing steps |
| critiqueAgent | CritiqueAgent | Agent for evaluating results |

#### Methods

##### run

Runs a workflow for a given objective.

```typescript
run(objective: string): { 
  start: Function, 
  stop: Function, 
  pause: Function, 
  resume: Function 
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| objective | string | The objective to accomplish |

**Returns**: Control functions for the workflow.

## Utilities

### Logger

The `Logger` utility provides standardized logging across the framework.

```typescript
import { logger } from 'r6d9-agent-node';
```

#### Methods

- `debug(message: string, context?: any)`: Logs debug information
- `info(message: string, context?: any)`: Logs informational messages
- `warn(message: string, context?: any)`: Logs warnings
- `error(message: string, error?: Error, context?: any)`: Logs errors

### Config

The `Config` utility manages configuration settings.

```typescript
import { config } from 'r6d9-agent-node';
```

#### Methods

- `get(key: string, defaultValue?: any)`: Gets a configuration value
- `set(key: string, value: any)`: Sets a configuration value
- `load(path?: string)`: Loads configuration from a file

## Types

### TAgentConfig

Configuration options for agents.

```typescript
type TAgentConfig = {
  /** Model name to use */
  model?: string;
  /** Temperature for generation (0.0-2.0) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
};
```

### PlanExecuteState

State object for plan-execute workflows.

```typescript
type PlanExecuteState = {
  /** The objective to accomplish */
  objective: string;
  /** The plan steps */
  plan: string[];
  /** Current step index */
  current_step_idx: number;
  /** Current step content */
  current_step: string;
  /** Result of current step execution */
  step_result: string;
  /** Feedback from critique */
  critique: string;
  /** Whether the step was successful */
  step_success: boolean;
  /** Overall workflow success */
  success: boolean;
  /** Final response */
  response: string;
  /** Execution history */
  history: string[];
};
```

### CritiqueResult

Result of step critique.

```typescript
type CritiqueResult = {
  /** Whether the step was successful */
  success: boolean;
  /** Reason for success/failure */
  reason: string;
  /** Suggestions for improvement */
  suggestions: string[];
  /** Next action to execute */
  next_step: string;
};
```
