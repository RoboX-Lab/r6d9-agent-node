# R6D9 Agent Node: Architecture

This document describes the architecture of the R6D9 Agent Node framework, explaining the key components and their interactions.

## System Architecture Overview

R6D9 Agent Node is built on a component-based architecture focused on computer interaction via screenshot analysis. The framework uses AI-powered agents to analyze visuals, control mouse and keyboard inputs, and execute terminal commands to accomplish tasks.

```
┌─────────────────────────────────────────┐
│             Orchestrator                 │
│  ┌─────────┐  ┌────────┐  ┌──────────┐  │
│  │ Planner │  │Computer│  │ Critique │  │
│  │  Agent  │──▶  Agent │──▶  Agent   │  │
│  └─────────┘  └────────┘  └──────────┘  │
└───────────────────│───────────────────┘
                    │
   ┌────────────────▼─────────────────┐
   │        Computer Service           │
   │                                   │
   │  ┌────────┐  ┌────────────────┐  │
   │  │Screenshot│ │Mouse/Keyboard  │  │
   │  │Analysis │ │   Control      │  │
   │  └────────┘  └────────────────┘  │
   │                                   │
   │  ┌────────────────────────────┐  │
   │  │      Terminal Command      │  │
   │  │        Execution           │  │
   │  └────────────────────────────┘  │
   └───────────────────────────────────┘
```

## Core Components

### 1. Agents

#### ComputerAgent

The `ComputerAgent` is the primary tool for interacting with the computer system. It uses screenshot analysis to understand the screen state and controls mouse/keyboard actions to interact with the system naturally.

Key responsibilities:
- Taking screenshots of the current screen
- Analyzing the screenshots using vision models
- Moving the mouse to target coordinates
- Clicking, typing, and pressing keys
- Executing terminal commands
- Managing the interaction flow using LangGraph

#### PlannerAgent

The `PlannerAgent` breaks down complex objectives into step-by-step plans that can be executed by the ComputerAgent.

Key responsibilities:
- Analyzing the objective
- Creating detailed step-by-step plans
- Refining plans based on feedback
- Adapting plans when environment changes

#### CritiqueAgent

The `CritiqueAgent` evaluates the results of the ComputerAgent's actions and provides feedback for improvements.

Key responsibilities:
- Analyzing execution results against the intended goal
- Determining success or failure of steps
- Providing detailed feedback for improvements
- Suggesting corrective actions

### 2. Services

#### ComputerService

The `ComputerService` provides low-level utilities for interacting with the computer.

Key functionalities:
- Screenshot capture
- Mouse movement and clicking
- Keyboard input (typing and key presses)
- Terminal command execution
- Error handling and retries

### 3. Tools

Tools are atomic functions that implement specific capabilities for the agents to use:

#### Screenshot and Analysis Tools
- `takeScreenshotTool`: Captures the current screen state
- `analyzeScreenTool`: Uses vision models to analyze the screen content

#### Input Control Tools
- `mouseMoveClickTool`: Controls mouse movement and clicking
- `typeTextTool`: Types text into focused input fields
- `pressKeyTool`: Sends keyboard key presses

#### System Tools
- `executeCommandTool`: Runs terminal commands

### 4. Workflows

#### Orchestrator

The `Orchestrator` coordinates the agents in a workflow to accomplish complex tasks:

1. Planning: Uses the PlannerAgent to create a step-by-step plan
2. Execution: Uses the ComputerAgent to execute each step
3. Critique: Uses the CritiqueAgent to evaluate results
4. Refinement: Adjusts the plan based on feedback
5. Iteration: Continues until the objective is met

## Technical Architecture

### LangGraph Integration

R6D9 Agent Node uses LangGraph to implement complex workflows with state management. This enables:

- Step-by-step execution
- Conditional branching
- Error handling and recovery
- Pausing and resuming workflows

### Vision Model Integration

The framework integrates with vision-capable models (like GPT-4o) to analyze screenshots:

- Screenshot capture is optimized for analysis
- Prompts are designed to extract specific information
- Feedback loops improve accuracy

### Cross-Platform Support

Computer interaction is designed to work across different operating systems:

- Abstracted mouse/keyboard control
- Platform-specific implementation
- Consistent interfaces

## Data Flow

1. **User Input**: The user provides an objective to the system
2. **Planning**: The planner creates a step-by-step plan
3. **Screen Analysis**: The computer agent takes a screenshot
4. **Vision Processing**: The screenshot is analyzed
5. **Interaction**: Mouse/keyboard/terminal actions are performed
6. **Verification**: Another screenshot is taken to verify results
7. **Critique**: Results are evaluated against the objective
8. **Iteration**: The process repeats until completion

## Configuration System

The framework uses a hierarchical configuration system that allows:

- Environment-based configuration
- Programmatic overrides
- Per-agent configuration
- Sensible defaults

Key configuration parameters include:
- Model selection
- Screenshot directory
- Viewport dimensions
- Logging level
- Execution parameters

## Error Handling and Recovery

The framework implements robust error handling:

- Agent-level retries
- Workflow-level error recovery
- State persistence
- Comprehensive logging

## Security Model

Security is a core consideration:

- Sandboxed terminal command execution
- Allowlist/blocklist for commands
- Token limits for API usage
- Rate limiting for interaction actions
- Controlled access to system resources

## Extensibility

The architecture is designed for extensibility:

- Custom agents can be created
- New tools can be added
- Workflows can be customized
- Models can be swapped out
- Services can be extended

## Performance Considerations

The system is optimized for:

- Minimal unnecessary screenshot captures
- Efficient vision model token usage
- Parallel processing where appropriate
- Caching of analysis results
- Reduced API calls
