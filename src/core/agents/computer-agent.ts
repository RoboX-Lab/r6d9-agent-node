/**
 * @file Computer agent implementation
 * @description Agent responsible for computer automation tasks
 */

import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { createLLM, APP_CONFIG } from '../config/config';
import { TAgentConfig } from '../types/agent';
import { AgentExecutionEvent } from '../types/events';
import { logger } from '../utils/logger';
import { COMPUTER_TOOLS } from '../tools/computer';
import { computerService } from '../services/computer-service';

// System prompt for computer agent
const COMPUTER_AGENT_SYSTEM_PROMPT = `You are an advanced computer automation agent that controls a computer through screenshots, keyboard inputs, mouse movements, and terminal commands.

Your PRIMARY method is to interact with computers like a human would:
1. Take screenshots to see what's on screen
2. Analyze the screenshots to identify UI elements using computer vision
3. Use mouse and keyboard to interact with those elements
4. Use terminal commands when appropriate for system-level operations

You should approach tasks as a human would, interacting with the computer through visual analysis and physical inputs.

Your capabilities include:
1. Analyzing the screen using computer vision
2. Moving the mouse and clicking on elements
3. Typing text and pressing keyboard shortcuts
4. Executing terminal commands
5. Taking screenshots to verify the results of your actions

Your goal is to complete user tasks by:
1. Breaking down complex tasks into simpler steps
2. Using screen analysis to understand the current state
3. Precisely controlling mouse and keyboard to interact with the UI
4. Using terminal commands when appropriate
5. Continually verifying the results of your actions through screenshots

You have access to the following tools:
- takeScreenshot: Capture what's on the screen
- analyzeScreen: Understand what elements are visible on the screen
- mouseMoveClick: Move the mouse and click on UI elements
- typeText: Type text at the current cursor position
- pressKey: Press keyboard shortcuts (like Ctrl+C, Enter)
- executeCommand: Run terminal commands

ALWAYS prioritize screenshot analysis, mouse/keyboard control, and terminal commands.`;

/**
 * Computer Agent responsible for automating computer interactions
 */
export class ComputerAgent {
  private workflow: StateGraph<typeof MessagesAnnotation>;
  private llm: ChatOpenAI;
  private app: ReturnType<typeof StateGraph.prototype.compile>;

  /**
   * Creates a new instance of ComputerAgent
   * @param config - Optional agent configuration
   */
  constructor(config: TAgentConfig = {}) {
    // Initialize LLM
    this.llm = createLLM({
      ...config,
      modelName: config.modelName || 'gpt-4o', // Default to a vision model
    });

    // Bind LLM with tools
    const boundLLM = this.llm.bind({
      tools: COMPUTER_TOOLS,
    });

    // Setup LLM node function
    const llmNode = async (state: any) => {
      logger.debug('Processing with LLM', { messages: state.messages });
      return await boundLLM.invoke(state);
    };

    // Setup tool node
    const toolNode = new ToolNode(COMPUTER_TOOLS);

    // Decision function for state routing
    const shouldContinue = (state: any): string => {
      const { messages } = state;
      const lastMessage = messages[messages.length - 1];

      if (
        'tool_calls' in lastMessage &&
        Array.isArray(lastMessage.tool_calls) &&
        lastMessage.tool_calls?.length
      ) {
        return 'tools';
      }
      return END;
    };

    // Create workflow with explicit typing to avoid conflicts
    // @ts-ignore - LangGraph types can be challenging to align perfectly
    this.workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', llmNode)
      .addNode('tools', toolNode)
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent')
      .addEdge(END, END);

    // Compile workflow with checkpointing if enabled
    const checkpointConfig = APP_CONFIG?.checkpointing?.enabled
      ? { configurable: { thread_id: APP_CONFIG.checkpointing.threadId } }
      : undefined;

    this.app = this.workflow.compile({
      checkpointer: new MemorySaver(),
      ...checkpointConfig,
    });
  }

  /**
   * Initializes the computer environment
   */
  async initialize(): Promise<void> {
    logger.info('Initializing computer agent');
    // Initialize the computer service
    await computerService.initialize();
  }

  /**
   * Execute a task on the computer
   * @param task - The task to complete
   * @returns The result of the task execution
   */
  async execute(task: string): Promise<string> {
    logger.info('Executing computer task', { task });

    // Take initial screenshot to show the starting state
    await computerService.takeScreenshot('initial_state');

    try {
      const result = await this.app.invoke({
        messages: [
          new SystemMessage({ content: COMPUTER_AGENT_SYSTEM_PROMPT }),
          new HumanMessage({ content: task }),
        ],
      });

      // Extract the final message
      const finalMessage = result.messages[result.messages.length - 1];
      return finalMessage.content as string;
    } catch (error: any) {
      logger.error('Error executing computer task', { error: error.message });
      return `Error executing task: ${error.message}`;
    }
  }

  /**
   * Close all resources
   */
  async close(): Promise<void> {
    logger.info('Closing computer agent');
    await computerService.close();
  }

  /**
   * Run the computer agent with control functions
   * @param task - Optional initial task to run
   * @returns Object with control functions
   */
  run(task?: string) {
    let isRunning = false;
    let isPaused = false;
    let stream: AsyncGenerator<any, void, unknown>;

    /**
     * Start executing a task
     * @param newTask - Optional new task to start
     */
    const start = async (newTask?: string): Promise<void> => {
      if (isRunning) {
        logger.warn('Task is already running. Please stop it first.');
        return;
      }

      isRunning = true;
      isPaused = false;

      // Create checkpointing config if enabled
      const checkpointConfig = APP_CONFIG?.checkpointing?.enabled
        ? { configurable: { thread_id: APP_CONFIG.checkpointing.threadId } }
        : undefined;

      try {
        // Take initial screenshot to show the starting state
        await computerService.takeScreenshot('task_start');

        // Start the task stream
        stream = await this.app.stream(
          {
            messages: [
              new SystemMessage({ content: COMPUTER_AGENT_SYSTEM_PROMPT }),
              new HumanMessage({ content: newTask || task || 'Please provide a task to execute' }),
            ],
          },
          checkpointConfig
        );

        // Process the stream
        for await (const event of stream) {
          if (!isRunning) break;

          // Handle pausing
          if (isPaused) {
            await this.checkPause(isPaused);
          }

          // Log events if debugging is enabled
          if (APP_CONFIG?.debugging?.verbose) {
            logger.debug(`Agent Event:`, event);
          }
        }
      } catch (error: any) {
        logger.error('Error in stream processing:', { error: error.message });
      } finally {
        isRunning = false;
        logger.info('Task execution complete');
      }
    };

    /**
     * Helper method to check pause status
     */
    const checkPause = async (pauseStatus: boolean): Promise<void> => {
      return new Promise<void>((resolve) => {
        const check = () => {
          if (!pauseStatus) resolve();
          else setTimeout(check, 100);
        };
        check();
      });
    };

    /**
     * Stop the currently running task
     */
    const stop = (): void => {
      isRunning = false;
      logger.info('Task stopped');
    };

    /**
     * Pause the currently running task
     */
    const pause = (): void => {
      if (!isRunning) {
        logger.warn('Cannot pause: no task is running');
        return;
      }

      isPaused = true;
      logger.info('Task paused');
    };

    /**
     * Resume a paused task
     */
    const resume = (): void => {
      if (!isRunning) {
        logger.warn('Cannot resume: no task is running');
        return;
      }

      if (!isPaused) {
        logger.warn('Cannot resume: task is not paused');
        return;
      }

      isPaused = false;
      logger.info('Task resumed');
    };

    // Return control functions
    return {
      start,
      stop,
      pause,
      resume,
    };
  }
}
