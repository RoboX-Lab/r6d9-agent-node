/**
 * @file Browser agent implementation
 * @description Agent responsible for browser automation tasks
 */

import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { createLLM, APP_CONFIG } from '../config/config';
import { TAgentConfig } from '../types/agent';
import { AgentExecutionEvent } from '../types/events';
import { BROWSER_AGENT_SYSTEM_PROMPT } from '../prompts/browser-agent-prompt';
import { ALL_TOOLS } from '../tools';
import { logger } from '../utils/logger';

/**
 * Browser Agent responsible for automating browser interactions
 */
export class BrowserAgent {
  private workflow: StateGraph<typeof MessagesAnnotation>;
  private llm: ChatOpenAI;
  private app: ReturnType<typeof this.workflow.compile>;

  /**
   * Creates a new instance of BrowserAgent
   * @param config - Optional agent configuration
   */
  constructor(config: TAgentConfig = {}) {
    // Initialize LLM
    this.llm = createLLM(config);
    
    // Bind LLM with tools
    const boundLLM = this.llm.bind({ 
      tools: ALL_TOOLS
    });
    
    // Setup LLM node function
    const llmNode = async (state: any) => {
      logger.debug('Processing with LLM', { messages: state.messages });
      return await boundLLM.invoke(state);
    };
    
    // Setup tool node
    const toolNode = new ToolNode(ALL_TOOLS);
    
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
      .addEdge('agent', 'tools');
    
    // Compile workflow with checkpointing if enabled
    const checkpointConfig = APP_CONFIG.checkpointing.enabled
      ? { configurable: { thread_id: APP_CONFIG.checkpointing.threadId } }
      : undefined;
      
    this.app = this.workflow.compile({ 
      checkpointer: new MemorySaver(),
      ...checkpointConfig 
    });
  }

  /**
   * Initializes the browser environment
   */
  async initialize(): Promise<void> {
    logger.info('Initializing browser agent');
    // Initialization logic would typically set up the browser environment
  }

  /**
   * Navigate to a URL and complete a task
   * @param task - The task to complete
   * @returns The page content after task completion
   */
  async navigate(task: string): Promise<string> {
    logger.info('Navigating to complete task', { task });
    
    const result = await this.app.invoke({
      messages: [
        new SystemMessage({ content: BROWSER_AGENT_SYSTEM_PROMPT }),
        new HumanMessage({ content: task }),
      ],
    });
    
    // Extract the final page content from the result
    const finalMessage = result.messages[result.messages.length - 1];
    return finalMessage.content as string;
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    logger.info('Closing browser agent');
    // Cleanup logic would go here
  }

  /**
   * Run the browser agent with control functions
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
      const checkpointConfig = APP_CONFIG.checkpointing.enabled
        ? { configurable: { thread_id: APP_CONFIG.checkpointing.threadId } }
        : undefined;
      
      // Start the task stream
      stream = await this.app.stream(
        {
          messages: [
            new SystemMessage({ content: BROWSER_AGENT_SYSTEM_PROMPT }),
            new HumanMessage({ content: newTask || task || 'Please provide a task to execute' }),
          ],
        },
        checkpointConfig,
      );

      try {
        // Process the stream
        for await (const event of stream) {
          if (!isRunning) break;
          
          // Handle pausing
          if (isPaused) {
            await new Promise<void>((resolve) => {
              const checkPause = () => {
                if (!isPaused) resolve();
                else setTimeout(checkPause, 100);
              };
              checkPause();
            });
          }
          
          // Log events if debugging is enabled
          if (APP_CONFIG.debugging.verbose) {
            for (const [key, value] of Object.entries(event as AgentExecutionEvent)) {
              logger.debug(`Event: ${key}`, value);
            }
          }
        }
      } catch (error) {
        logger.error('Error in stream processing:', error);
      } finally {
        isRunning = false;
      }
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
      if (isRunning && !isPaused) {
        isPaused = true;
        logger.info('Task paused');
      } else {
        logger.warn('Cannot pause: Task is not running or already paused');
      }
    };

    /**
     * Resume the paused task
     */
    const resume = (): void => {
      if (isRunning && isPaused) {
        isPaused = false;
        logger.info('Task resumed');
      } else {
        logger.warn('Cannot resume: Task is not paused or not running');
      }
    };

    return { start, stop, pause, resume };
  }
}
