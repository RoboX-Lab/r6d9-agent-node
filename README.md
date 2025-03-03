# R6D9 Agent Node

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/r6d9-agent-node.svg)](https://www.npmjs.com/package/r6d9-agent-node)

## What is R6D9?

R6D9 is a next-generation AI-powered automation platform that integrates Large Language Models (LLMs) and Visual Language Models (VLMs) to automate tasks across computers, mobile devices, and more. R6D9 serves as your personal AI assistant, understanding tasks, breaking them down into subtasks, and handling execution with the ability to effectively manage failures.

What sets R6D9 apart is its vision-based end-to-end training strategy, making it highly adaptable to handle unseen tasks and new tools. The platform leverages a flexible combination of VLMs and LLMs to tackle tasks dynamically, making it more resilient, adaptive, and intelligent than traditional rule-based automation solutions.

## Why is R6D9 Different?

Unlike traditional rule-based automation tools that don't adapt well to change, R6D9:

- **Uses Multimodal Collaboration**: VLMs visually interact with your device's interface, avoiding outdated and error-prone methods used by traditional automation scripts.
  
- **Employs Contextual Planning**: Through LLMs and reinforcement learning, R6D9 learns from each task and adapts to new ones, optimizing its actions based on what it's learned.
  
- **Enables Cross-Device Integration**: Designed to run across different devices, from desktops to phones to robotics, making it perfect for users who need automation across multiple platforms.
  
- **Harnesses Community Contributions**: Improves through user prompts, task recordings, and feedback, creating a continuous learning loop.

## Features

- **Computer Interaction through Screenshots**: Control computers by analyzing screenshots with vision models
- **Mouse and Keyboard Automation**: Precise control of mouse movements, clicks, and keyboard inputs
- **Terminal Command Execution**: Execute and analyze terminal commands
- **AI-Powered Computer Vision**: Analyze screen content to make intelligent decisions
- **Multi-Agentic Architecture**: Coordinated agents with different responsibilities working together to complete tasks
- **Workflow Orchestration**: Create complex workflows with LangGraph
- **Adaptive Learning**: Continuously improve through reinforcement learning and community feedback
- **Type-Safe**: Fully typed with TypeScript for robust development
- **Extensible Design**: Easily extend with custom tools and agents

## Technical Approach & Architecture

R6D9's intelligent automation architecture combines:

1. **Action Space**: Operations corresponding to different devices (clicking, copying, pasting, etc.)
2. **Contextual DB**: Stores the interaction history, including model planning, executed actions, and key frames
3. **Reinforcement Learning**: Dynamically adjusts action execution strategy based on feedback
4. **Multi-Agentic Controller**: Uses VLM technology to perceive the current environment and determine the next action

Our framework prioritizes natural computer interaction:

- **Screenshot-based interaction**
  - Captures screenshots to understand screen state
  - Uses vision models to identify UI elements
  - Controls mouse/keyboard based on visual analysis
  - Executes terminal commands when needed

This approach creates versatile agents that operate across different applications, mimicking how humans interact with computers and making automation more intuitive and effective.

## Vision & Roadmap

We're building R6D9 with an ambitious vision:

1. **Expanding to Full Computer Use Agents**: Taking automation beyond browsers into every aspect of computer usage
2. **Creating Specialized Agents**: Building a system of agents with different skills working across multiple devices
3. **Developing an Agent Training Platform**: Creating tools to train, generate, and customize agents
4. **Leveraging Web3 Technologies**: Building a decentralized ecosystem where privacy and security are guaranteed

Through community collaboration and continuous improvement, R6D9 aims to become a platform that bridges agents and humans to digital worlds (Web2 + Web3).

## Competitive Comparison

### R6D9-Agent-Node vs Browser-Use Automation Solutions

<table>
  <tr>
    <th>Category</th>
    <th>R6D9-Agent-Node</th>
    <th>Browser-Use</th>
  </tr>
  <tr>
    <td>Core Differences</td>
    <td>
      • TypeScript-based multi-agent collaborative system<br><br>
      • Vision-driven + system API hybrid automation<br><br>
      • LangGraph state diagram-driven workflow<br><br>
      • System-wide operation capabilities
    </td>
    <td>
      • Single agent model, limited to browser environment<br><br>
      • DOM structure-dependent interaction method<br><br>
      • Linear execution flow + simple branching<br><br>
      • Browser sandbox scope limitations
    </td>
  </tr>
  <tr>
    <td>Advantages</td>
    <td>
      • Cross-system multi-application automation capability<br><br>
      • Visual understanding reduces page structure dependency<br><br>
      • Strong adaptability to UI changes<br><br>
      • Multi-agent collaboration for complex problem solving
    </td>
    <td>
      • Low resource consumption and fast execution<br><br>
      • Simple deployment and quick start<br><br>
      • Security provided by browser sandbox<br><br>
      • Optimized performance for web-specific interactions
    </td>
  </tr>
  <tr>
    <td>Disadvantages</td>
    <td>
      • High computational resource requirements<br><br>
      • Complex setup and steep learning curve<br><br>
      • Security considerations from system permission requirements<br><br>
      • Execution delays due to visual processing
    </td>
    <td>
      • Operation scope limited to browser environment<br><br>
      • Heavy dependency on DOM structure stability<br><br>
      • Prone to failure when websites update<br><br>
      • High maintenance difficulty in complex scenarios
    </td>
  </tr>
  <tr>
    <td>Best Application Scenarios</td>
    <td>
      • Cross-application complex workflows<br><br>
      • Interactions requiring visual understanding<br><br>
      • System-level automation tasks
    </td>
    <td>
      • Simple webpage form filling<br><br>
      • Lightweight data scraping<br><br>
      • Resource-constrained environments
    </td>
  </tr>
</table>

R6D9-Agent-Node provides a more robust, adaptable solution for complex automation scenarios that span across multiple applications and require visual understanding. While browser-based automation tools are simpler to set up and use for basic web tasks, they often struggle with UI changes and complex workflows that R6D9-Agent-Node handles naturally.

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

  const objective =
    'Open the Notes app, create a new note, type "Meeting agenda for tomorrow", and save it';
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
      'Open System Preferences, navigate to Display settings, and change the screen resolution to 1920x1080'
    );
    console.log('Automation result:', result);
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
  const objective =
    'Take a screenshot of the desktop, find all application icons, and create a list with their positions';
  const result = await orchestrator.run(objective);
  console.log('Analysis results:', result.response);
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

- [Telegram](https://t.me/Roboagent69)
- [Twitter](https://x.com/Roboagent69)

## License

MIT License - see the [LICENSE](./LICENSE) file for details.
