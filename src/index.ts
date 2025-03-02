// Entry point for the R6D9 Agent Node project
// This file exports the main functionalities of the project
// It serves as the central hub for importing and utilizing the core features

import { run } from './core';

const { start, stop, pause, resume } = run();
process.stdout.write('Agent Ready\n');

process.on('message', (message) => {
  if (typeof message === 'string') {
    const [command, cmdData] = message.split(':');

    switch (command) {
      case 'start':
        start(cmdData);
        sendMsg(`Task Started: ${cmdData}`);
        break;
      case 'stop':
        stop();
        sendMsg(`Task Stopped`);
        break;
      case 'pause':
        pause();
        sendMsg(`Task paused`);
        break;
      case 'resume':
        resume();
        sendMsg(`Task resumed`);
        break;
      default:
        sendMsg(`Unknown command: ${command}`);
        break;
    }
  }
});

function sendMsg(message: string) {
  if (typeof process.send === 'function') {
    process.send(`Processed: ${message}`);
  } else {
    console.error('process.send is not a function');
  }
}

/**
 * Exports all core functionalities of the R6D9 Agent Node project.
 * This includes the main agent, browser-agent, and other essential features.
 */
export * from './core';
