# R6D9 Agent Node

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/r6d9-agent-node.svg)](https://www.npmjs.com/package/r6d9-agent-node)

A powerful TypeScript framework for building computer automation agents powered by Large Language Models (LLMs), focusing on screenshot analysis, mouse/keyboard control, and terminal command execution.

## Features

- **Computer Interaction through Screenshots**: Control computers by analyzing screenshots with vision models
- **Mouse and Keyboard Automation**: Precise control of mouse movements, clicks, and keyboard inputs
- **Terminal Command Execution**: Execute and analyze terminal commands
- **AI-Powered Computer Vision**: Analyze screen content to make intelligent decisions
- **Agent Architecture**: Modular, loosely-coupled agents for different responsibilities
- **Workflow Orchestration**: Create coordinated workflows with LangGraph
- **Type-Safe**: Fully typed with TypeScript for robust development
- **Extensible Design**: Easily extend with custom tools and agents

## Technical Approach

This framework prioritizes natural computer interaction:

1. **Screenshot-based interaction**
   - Captures screenshots to understand screen state
   - Uses vision models to identify UI elements
   - Controls mouse/keyboard based on visual analysis
   - Executes terminal commands when needed

This approach creates versatile agents that can operate across different applications, making them closer to how humans interact with computers.

## Installation

```bash
git clone https://github.com/RoboX-Lab/r6d9-agent-node.git
cd r6d9-agent-node
npm install
```

## Environment Setup

Create a `.env` file in your project root:

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_MODEL=gpt-4o                # Vision model (required)
VIEWPORT_WIDTH=1280                    # Optional 
VIEWPORT_HEIGHT=800                    # Optional
SCREENSHOT_DIR=./screenshots           # Optional
LOG_LEVEL=info                         # Optional
```

## Quick Start

### Basic Usage

```typescript
import { run } from 'r6d9-agent-node';

async function main() {
  const { start, stop } = run();
  await start('Open the calculator app, calculate 125 × 37, and report the result');
  await stop();
}

main().catch(console.error);
```

### Advanced Usage with ComputerAgent

```typescript
import { ComputerAgent } from 'r6d9-agent-node';

async function main() {
  const agent = new ComputerAgent();
  await agent.initialize();
  
  const objective = 'Open the Notes app, create a new note, type "Meeting agenda for tomorrow", and save it';
  const result = await agent.execute(objective);
  
  console.log('Task completed:', result);
  await agent.close();
}

main().catch(console.error);
```

## Architecture

### Agents
- **ComputerAgent**: Controls computer through screenshot analysis, mouse/keyboard, and terminal commands
- **PlannerAgent**: Generates step-by-step plans based on user objectives
- **CritiqueAgent**: Evaluates execution results and provides feedback

### Services
- **ComputerService**: Core service for screen capture, mouse/keyboard control, and command execution

### Tools
- **Screenshot Tools**: Capturing and analyzing screen state
- **Mouse Tools**: Moving cursor and clicking on screen elements
- **Keyboard Tools**: Typing text and keyboard shortcuts
- **Terminal Tools**: Executing shell commands
- **Analysis Tools**: AI-powered screen content analysis

## Documentation

For detailed API documentation and guides, visit our [documentation site](https://docs.robox-lab.org/r6d9-agent-node) or check the `/docs` directory.

## Use Cases

### System Automation
```typescript
import { ComputerAgent } from 'r6d9-agent-node';

async function automateSystem() {
  const agent = new ComputerAgent();
  await agent.initialize();
  try {
    const result = await agent.execute(
      "Open System Preferences, navigate to Display settings, and change the screen resolution to 1920x1080"
    );
    console.log("Automation result:", result);
  } finally {
    await agent.close();
  }
}
```

### Multi-Step Research
```typescript
import { Orchestrator } from 'r6d9-agent-node';

async function researchAndCompare() {
  const orchestrator = new Orchestrator();
  const objective = 'Take a screenshot of the desktop, find all application icons, and create a list with their positions';
  const result = await orchestrator.run(objective);
  console.log("Analysis results:", result.response);
}
```

## Development

```bash
# Build the project
npm run build

# Run tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Lint and format
npm run lint
npm run format
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

## Community and Support

- [GitHub Discussions](https://github.com/RoboX-Lab/r6d9-agent-node/discussions)
- [Discord](https://r6d9.com/discord)
- [Twitter](https://x.com/Roboagent69)
<!-- - [Stack Overflow](https://stackoverflow.com/questions/tagged/r6d9-agent-node) -->

## License

MIT License - see the [LICENSE](./LICENSE) file for details.
