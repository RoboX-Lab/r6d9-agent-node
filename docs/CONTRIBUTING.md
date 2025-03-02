# Contributing to R6D9 Agent Node

Thank you for considering contributing to R6D9 Agent Node! This document provides guidelines and workflows for contributing to the project. By participating, you agree to abide by our [Code of Conduct](../md/CODE_OF_CONDUCT.md).

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Architecture Guidelines](#architecture-guidelines)
- [Community](#community)

## Code of Conduct

Please review our [Code of Conduct](../md/CODE_OF_CONDUCT.md) to understand expected behavior when participating in our community.

## Development Environment Setup

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/r6d9-agent-node.git
   cd r6d9-agent-node
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory based on `.env.example`:

   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_API_MODEL=gpt-4o
   SCREENSHOT_DIR=./screenshots
   LOG_LEVEL=debug
   ```

4. **Build the Project**

   ```bash
   npm run build
   ```

5. **Run Tests to Verify Setup**

   ```bash
   npm test
   ```

## Development Workflow

1. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Your Changes**

   - Implement your feature or fix
   - Add or update tests as necessary
   - Update documentation to reflect your changes

3. **Run Linting and Tests**

   ```bash
   npm run lint
   npm test
   ```

4. **Commit Your Changes**

   Use conventional commit messages:

   ```bash
   git commit -m "feat: add new screenshot analysis capability"
   # or
   git commit -m "fix: resolve issue with mouse click positioning"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**

   Open a pull request against the `main` branch of the original repository.

## Pull Request Process

1. **Ensure all tests pass**
2. **Update documentation** to reflect any changes
3. **Add necessary unit and integration tests**
4. **Describe your changes** in detail in the PR description
5. **Link any related issues** using GitHub keywords
6. **Request review** from at least one maintainer

## Coding Standards

### 1. TypeScript Best Practices

- Use strong typing; avoid `any` where possible
- Follow [TypeScript coding guidelines](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md)
- Document public functions with JSDoc comments

### 2. Project Structure

- Place new agents in the `src/core/agents` directory
- Place new tools in `src/core/tools` (organized by category)
- Place services in `src/core/services`
- Place utility functions in `src/core/utils`

### 3. Error Handling

- Use try/catch blocks for error handling
- Log errors with appropriate context
- Provide meaningful error messages

## Testing Guidelines

### 1. Test Types

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test interactions between components
- **Visual Tests**: Test screenshot analysis and computer interaction

### 2. Testing Tools

- Use Jest for unit and integration tests
- Use mocks for external services
- Test screenshot analysis with sample images

### 3. Test Coverage

- Aim for 80% code coverage
- Focus on testing critical paths
- Test error handling

## Documentation Guidelines

### 1. Code Documentation

- Use JSDoc for all public APIs
- Document parameters and return types
- Include examples for complex functions

### 2. Markdown Documentation

- Keep README and other markdown files up to date
- Use proper headings and formatting
- Include code examples where appropriate

### 3. Architecture Documentation

- Document significant architectural decisions
- Update diagrams when architecture changes
- Explain interaction patterns and data flow

## Architecture Guidelines

### 1. Component Design

- Follow the single responsibility principle
- Design for reusability and testability
- Minimize dependencies between components

### 2. Agent Development

- Agents should focus on a specific task domain
- Agents should expose a consistent API
- Agents should handle their own resources

### 3. Tool Development

- Tools should be atomic, focused utilities
- Tools should have proper error handling
- Tools should be well-documented

### 4. Vision and Computer Interaction Principles

- Prefer screenshot analysis over API-based interactions
- Design robust UI element detection
- Include fallback strategies when vision-based methods fail
- Implement natural, human-like mouse and keyboard interactions
- Handle coordinate systems consistently across platforms

## Community

- Join our [Discord server](https://discord.gg/r6d9-community) for discussions
- Participate in community calls (announced on Discord)
- Follow our [Twitter](https://twitter.com/r6d9project) for updates

Thank you for contributing to make R6D9 Agent Node better!
