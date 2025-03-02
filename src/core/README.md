# R6D9 Agent Core

A powerful Node.js library for browser automation and control powered by LLMs.

## Architecture

The R6D9 Agent Core is built with a modular architecture focused on extensibility, maintainability, and performance. The system is organized into several key components:

### Agents

- **BrowserAgent**: Handles browser automation tasks
- **PlannerAgent**: Creates step-by-step plans for complex objectives
- **CritiqueAgent**: Evaluates execution success and provides feedback

### Workflows

- **Orchestrator**: Coordinates the agent execution in a LangGraph workflow

### Tools

Tools are organized by category:

- **Navigation Tools**: URL navigation, page history, loading management
- **Interaction Tools**: Clicking, text entry, key presses, form filling 
- **Information Tools**: DOM structure, form fields, page content
- **Search Tools**: Web search capabilities
- **Utility Tools**: Helper functions and general utilities

### Services

- **BrowserService**: Manages browser instances and page navigation

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
import { run, Orchestrator } from 'r6d9-agent-node';

// Simple usage with the run function
const { start, stop, pause, resume } = run();
start('Go to google.com and search for "LangGraph tutorial"');

// Advanced usage with the Orchestrator
const orchestrator = new Orchestrator();
const result = await orchestrator.run(
  'Go to google.com and search for "LangGraph tutorial". Extract the title and price of the first result.'
);
console.log('Result:', result);
```

## Directory Structure

```
core/
├── agents/            # Agent implementations
├── config/            # Configuration
├── prompts/           # System prompts
├── services/          # Service implementations
├── tools/             # Tool implementations
│   ├── browser/       # Browser-related tools
│   ├── search/        # Search-related tools
│   └── ...
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── workflows/         # Workflow definitions
└── index.ts           # Main entry point
```

## Best Practices

1. **Modularity**: Each component should have a single responsibility
2. **Type Safety**: Use TypeScript types for all interfaces
3. **Error Handling**: Proper error handling and reporting
4. **Documentation**: Comprehensive documentation for all components
5. **Testing**: Unit and integration tests for all components
6. **Configurability**: Make components configurable via options
7. **Extensibility**: Design for extension and customization

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](../../CONTRIBUTING.md) file for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
