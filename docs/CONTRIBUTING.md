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
   OPENAI_API_MODEL=gpt-4-0125-preview
   BROWSER_HEADLESS=true
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
   git commit -m "feat: add new browser navigation capability"
   # or
   git commit -m "fix: resolve issue with page content extraction"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**

   Open a pull request against the `main` branch of the original repository.

## Pull Request Process

1. **PR Description**

   - Provide a detailed description of the changes
   - Link related issues with "Fixes #123" or "Related to #123"
   - Include screenshots for UI changes
   - List any breaking changes

2. **Review Process**

   - Maintainers will review your PR
   - Address any requested changes
   - Ensure CI checks pass

3. **Merge Requirements**

   - At least one maintainer approval
   - All CI checks passing
   - Up-to-date with main branch

## Coding Standards

We follow TypeScript best practices and have configured ESLint and Prettier to maintain consistent code style.

1. **TypeScript**

   - Use strong typing; avoid `any` when possible
   - Leverage interfaces and type definitions
   - Document public APIs with JSDoc comments

2. **Code Style**

   - Follow the configured ESLint and Prettier rules
   - Run `npm run lint` and `npm run format` before committing

3. **Naming Conventions**

   - Use descriptive names for variables, functions, and classes
   - `camelCase` for variables and functions
   - `PascalCase` for classes, interfaces, and types
   - `UPPER_SNAKE_CASE` for constants

## Testing Guidelines

1. **Test Coverage**

   - Aim for high test coverage for new features
   - Write both unit and integration tests

2. **Test Organization**

   - Place tests in the `/tests` directory
   - Match the source directory structure
   - Name test files with `.test.ts` suffix

3. **Running Tests**

   ```bash
   # Run all tests
   npm test
   
   # Run specific test suites
   npm run test:unit
   npm run test:integration
   
   # Run with coverage
   npm run test:coverage
   ```

## Documentation Guidelines

1. **Code Documentation**

   - Use JSDoc comments for classes, methods, and functions
   - Include parameter descriptions and return types
   - Document exceptions and edge cases

2. **README and Guides**

   - Update README.md with any new features
   - Create or update guides for significant functionality
   - Include examples that demonstrate usage

3. **Example Code**

   - Add examples for new features in the `/examples` directory
   - Ensure examples are well-commented and working

## Architecture Guidelines

1. **Module Structure**

   - Keep modules focused on a single responsibility
   - Follow the established directory structure
   - Use appropriate dependency injection

2. **Agent Design**

   - Agents should have clear, focused responsibilities
   - Agent APIs should be consistent with existing patterns
   - New agents should be extensively tested

3. **Tool Development**

   - Tools should be atomic, focused utilities
   - Tools should have proper error handling
   - Tools should be well-documented

## Community

Join our community discussions:

- **GitHub Discussions**: For feature ideas and community support
- **Issue Tracker**: For bugs and confirmed issues
- **Discord**: For real-time discussion with the community

## Thank You!

Your contributions help make R6D9 Agent Node better for everyone. We truly appreciate your time and effort!
