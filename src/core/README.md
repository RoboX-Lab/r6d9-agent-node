# R6D9 Agent Core

A powerful Node.js library for general computer automation and control powered by LLMs, focusing on screenshot analysis and natural user interactions.

## Architecture

The R6D9 Agent Core is built with a modular architecture focused on versatile computer automation, extensibility, and maintainability. The system is organized into several key components:

### Primary Interaction Approach

R6D9 uses a comprehensive approach to computer automation:

1. **Screenshot Analysis**: Captures and analyzes screen content to understand UI state
2. **Mouse/Keyboard Control**: Interacts with applications like a human would
3. **Terminal Commands**: Executes system operations via command line
4. **AI-Powered Decision Making**: Uses LLMs to interpret screens and decide actions

This approach allows agents to work with any application, making them versatile and human-like in their operation.

### Agents

- **ComputerAgent**: Controls computer through screenshots, mouse/keyboard, and terminal commands
- **PlannerAgent**: Creates step-by-step plans for complex objectives
- **CritiqueAgent**: Evaluates execution success and provides feedback

### Services

- **ComputerService**: Core service that manages:
  - Screenshot capture and analysis
  - Mouse and keyboard control
  - Terminal command execution

### Tools

Tools are organized by category:

- **Computer Tools**:
  - **Screenshot Tools**: Capturing and analyzing screen
  - **Mouse Tools**: Cursor movement and clicking
  - **Keyboard Tools**: Text typing and key presses
  - **Terminal Tools**: Shell command execution
  - **Analysis Tools**: Screen content interpretation

### Configuration

- Centralized configuration with sensible defaults
- Environment variable support for customization
- Type-safe configuration interfaces

### Types

- Comprehensive TypeScript type definitions
- Zod schema validation for input/output

### Utilities

- Logger with configurable verbosity
- Helper functions for common operations

## Usage

```typescript
import { ComputerAgent, run } from 'r6d9-agent-node';

// Simple usage with the run function
const { start, stop, pause, resume } = run();
start('Open the Settings app and turn on Dark Mode');

// Advanced usage with the ComputerAgent
const agent = new ComputerAgent();
await agent.initialize();

const result = await agent.execute(
  'Open VS Code, create a new file, write a "Hello World" program in Python, and run it'
);
console.log('Result:', result);
await agent.close();
```

## Directory Structure

```
core/
├── agents/            # Agent implementations
│   ├── computer-agent.ts  # Main computer automation agent
│   └── ...
├── config/            # Configuration
├── prompts/           # System prompts
├── services/          # Service implementations
│   ├── computer-service.ts  # Core computer interaction service
│   └── ...
├── tools/             # Tool implementations
│   ├── computer/      # Computer interaction tools
│   └── ...
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── workflows/         # Workflow definitions
└── index.ts           # Main entry point
```

## Best Practices

1. **Screenshot-First Approach**: Base interactions on screenshot analysis
2. **Human-Like Interaction**: Use mouse/keyboard operations that mimic human behavior
3. **Modularity**: Each component should have a single responsibility
4. **Type Safety**: Use TypeScript types for all interfaces
5. **Error Handling**: Proper error handling and reporting
6. **Documentation**: Comprehensive documentation for all components
7. **Testing**: Unit and integration tests for all components
8. **Configurability**: Make components configurable via options

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](../../CONTRIBUTING.md) file for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
