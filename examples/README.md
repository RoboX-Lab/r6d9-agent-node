# R6D9 Agent Node Examples

This directory contains example code demonstrating the capabilities of the R6D9 Agent Node library.

## Directory Structure

### 1. Basic Examples (basic/)
- `browser-navigation.ts`: Demonstrates basic browser navigation operations
  - Opening a browser
  - Navigating to different pages
  - Closing the browser
  
- `basic-search-example.ts`: Performs a simple web search and extracts results
  - Illustrates the complete agent workflow
  - Shows coordination between planner, browser, and critique agents

### 2. DOM Operation Examples (dom/)
- `dom-manipulation.ts`: Demonstrates DOM element manipulation
  - Injecting MMID attributes
  - Retrieving elements with MMID
  - Cleaning up MMID attributes
  
- `dom-tree.ts`: Demonstrates DOM tree operations
  - Injecting MMID attributes
  - Retrieving DOM tree information

### 3. Utility Examples (utils/)
- `page-info.ts`: Demonstrates page information retrieval tools
  - Getting page content
  - Retrieving form fields
  - Getting page URL
  - Obtaining page information
  
- `keyboard-input.ts`: Demonstrates keyboard interaction
  - Typing text
  - Using hotkeys
  - Pressing special keys

### 4. Advanced Examples
- `ecommerce-product-comparison.ts`: Compares product prices across multiple e-commerce websites
  - Demonstrates complex multi-step workflows
  - Shows how to structure and parse complex results

## Running Examples

Each example file can be run independently. Use the following commands:

```bash
# Run basic examples
npm run example:basic
npm run example:search

# Run DOM operation examples
npm run example:dom
npm run example:dom-tree

# Run utility examples
npm run example:page-info
npm run example:keyboard

# Run advanced examples
npm run example:ecommerce
```

Or use ts-node directly:

```bash
npx ts-node examples/basic/browser-navigation.ts
npx ts-node examples/basic-search-example.ts
npx ts-node examples/ecommerce-product-comparison.ts
```

## Creating Your Own Examples

When creating your own examples, follow these patterns:

1. Import the necessary components from the library
2. Initialize the required agents (Browser, Planner, Critique)
3. Create an orchestrator to coordinate the workflow
4. Define your automation objective
5. Execute the workflow and process the results
6. Clean up resources (close browser, etc.)

See the basic-search-example.ts for a template to get started.
