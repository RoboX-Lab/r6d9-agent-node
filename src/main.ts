// Main initialization script for the R6D9 Agent Node project
// This script sets up and starts the application
// It is responsible for initializing the core components and forking a child process
// The child process is used to run the main application logic

import { fork } from 'child_process';
import { initializeCore } from './core';

// Initialize the core components
// This includes setting up the necessary dependencies and configurations
initializeCore();

const path = require('path');
const childPath = path.join(__dirname, 'index.js');

// Fork the child process
// This creates a new process that runs the main application logic
const child = fork(childPath);

// Listen for messages from the child process
// This allows the main process to receive updates and notifications from the child process
child.on('message', (message) => {
  console.log(`Main Process Received: ${message}`);
});

// Send commands to the child process
// This allows the main process to control the child process and send instructions
// Example of how to use the agent - uncomment to test:
// child.send('start:open the google and search for TypeScript tutorial');
// setTimeout(() => child.send('pause'), 10000);
// setTimeout(() => child.send('resume'), 15000);
// setTimeout(() => child.send('stop'), 30000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  child.send('stop');
  setTimeout(() => {
    child.kill();
    process.exit(0);
  }, 1000);
});

console.log('R6D9 Agent Node initialized and ready');
