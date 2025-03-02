# R6D9 Agent Node

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/r6d9-agent-node.svg)](https://www.npmjs.com/package/r6d9-agent-node)

A powerful TypeScript framework for building browser automation agents powered by Large Language Models (LLMs).

## Features

- **LLM-Powered Browser Automation**: Control web browsers intelligently with LLMs
- **Agent Architecture**: Modular, loosely-coupled agents for different responsibilities
- **Workflow Orchestration**: Create coordinated workflows with LangGraph
- **Type-Safe**: Fully typed with TypeScript for robust development
- **Extensible Design**: Easily extend with custom tools and agents
- **Zero-Config Operation**: Works out of the box with sensible defaults

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
OPENAI_API_MODEL=gpt-4o-2024-05-13  # Optional
BROWSER_HEADLESS=true               # Optional
BROWSER_TIMEOUT=30000               # Optional
LOG_LEVEL=info                      # Optional
```

## Quick Start

### Basic Usage

```typescript
import { run } from 'r6d9-agent-node';

async function main() {
  const { start, stop } = run();
  await start('Go to google.com and search for "TypeScript automation frameworks"');
  await stop();
}

main().catch(console.error);
```

### Advanced Usage with Orchestrator

```typescript
import { Orchestrator } from 'r6d9-agent-node';

async function main() {
  const orchestrator = new Orchestrator();
  const objective = 'Search for Node.js frameworks on Google and extract the top 3 results';
  const result = await orchestrator.run(objective);
  
  console.log('Workflow completed:', result.success);
  console.log('Steps executed:', result.steps);
}

main().catch(console.error);
```

## Architecture

### Agents
- **BrowserAgent**: Controls browser and executes actions using Playwright
- **PlannerAgent**: Generates step-by-step plans based on user objectives
- **CritiqueAgent**: Evaluates execution results and provides feedback

### Workflows
- **Orchestrator**: Coordinates execution flow between agents using LangGraph

### Tools
- **Navigation Tools**: Browser navigation, history management
- **DOM Tools**: Element selection, form manipulation
- **Search Tools**: Web search capabilities

## Documentation

For detailed API documentation and guides, visit our [documentation site](https://docs.robox-lab.org/r6d9-agent-node) or check the `/docs` directory.

## Use Cases

### Content Monitoring
```typescript
import { BrowserAgent } from 'r6d9-agent-node';

async function monitorWebsite() {
  const agent = new BrowserAgent();
  try {
    const checkForUpdates = await agent.navigate(
      "Go to example.com/blog, check if there are any new articles today, and extract their titles and publish dates"
    );
    console.log("Content check results:", checkForUpdates);
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
  const objective = 'Research the top 3 electric vehicles by range, find their prices, and create a comparison table';
  const result = await orchestrator.run(objective);
  console.log("Comparison results:", result.response);
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
- [Stack Overflow](https://stackoverflow.com/questions/tagged/r6d9-agent-node)

Weekly office hours: Every Thursday at 3PM UTC on Discord.

## License

MIT License - see the [LICENSE](./LICENSE) file for details.

<!-- ## Related Projects -->
