# R6D9 Agent Node Examples

This directory contains example code demonstrating the capabilities of the R6D9 Agent Node library.

## Directory Structure

### 1. Basic Examples (basic/)
- `computer-interaction.ts`: Demonstrates basic computer interaction operations
  - Taking screenshots
  - Analyzing screen content
  - Controlling the mouse and keyboard
  
- `basic-search-example.ts`: Performs a simple web search and extracts results
  - Illustrates the complete agent workflow
  - Shows coordination between planner, computer, and critique agents

### 2. Screenshot Analysis Examples (screenshot/)
- `screen-analysis.ts`: Demonstrates screenshot analysis capabilities
  - Capturing screen content
  - Identifying UI elements
  - Making decisions based on visual information
  
- `ui-automation.ts`: Demonstrates UI automation through screenshots
  - Locating buttons and UI controls
  - Recognizing text and images
  - Performing actions based on visual analysis

### 3. Utility Examples (utils/)
- `system-info.ts`: Demonstrates system information retrieval tools
  - Getting system status
  - Retrieving computer information
  - Monitoring resources
  
- `keyboard-input.ts`: Demonstrates keyboard interaction
  - Typing text
  - Using hotkeys
  - Pressing special keys

### 4. Advanced Examples
- `application-automation.ts`: Automates tasks across multiple desktop applications
  - Demonstrates complex multi-step workflows
  - Shows how to structure and parse complex results

## Running Examples

Each example file can be run independently. Use the following commands:

```bash
# Run basic examples
npm run example:basic
npm run example:search

# Run screenshot analysis examples
npm run example:screen
npm run example:ui

# Run utility examples
npm run example:system
npm run example:keyboard

# Run advanced examples
npm run example:apps
```

Or use ts-node directly:

```bash
npx ts-node examples/basic/computer-interaction.ts
npx ts-node examples/basic-search-example.ts
npx ts-node examples/application-automation.ts
```

## Creating Your Own Examples

When creating your own examples, follow these patterns:

1. Import the necessary components from the library
2. Initialize the required agents (Computer, Planner, Critique)
3. Create an orchestrator to coordinate the workflow
4. Define your automation objective
5. Execute the workflow and process the results
6. Clean up resources

See the basic-search-example.ts for a template to get started.
