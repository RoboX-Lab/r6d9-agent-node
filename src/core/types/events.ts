/**
 * @file Type definitions for events
 * @description Contains event types used in the agent system
 */

/**
 * Agent execution event
 */
export interface AgentExecutionEvent {
  /** Event messages */
  messages?: any[];
  /** Event type */
  type?: string;
  /** Event data */
  data?: any;
  /** Event timestamp */
  timestamp?: number;
}

/**
 * Agent state change event
 */
export interface AgentStateChangeEvent {
  /** Previous state */
  previousState: string;
  /** Current state */
  currentState: string;
  /** Reason for state change */
  reason?: string;
  /** Timestamp of state change */
  timestamp: number;
}

/**
 * Tool execution event
 */
export interface ToolExecutionEvent {
  /** Tool name */
  toolName: string;
  /** Tool inputs */
  inputs: Record<string, any>;
  /** Tool execution result */
  result?: any;
  /** Error if execution failed */
  error?: Error;
  /** Execution start time */
  startTime: number;
  /** Execution end time */
  endTime?: number;
}

/**
 * Browser navigation event
 */
export interface BrowserNavigationEvent {
  /** Previous URL */
  fromUrl?: string;
  /** Current URL */
  toUrl: string;
  /** Navigation status */
  status: 'started' | 'completed' | 'failed';
  /** Error if navigation failed */
  error?: Error;
  /** Navigation timestamp */
  timestamp: number;
}
