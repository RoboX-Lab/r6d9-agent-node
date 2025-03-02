/**
 * @file Type definitions for tools
 * @description Contains shared types used for computer interaction tools
 */

import { DynamicStructuredTool } from '@langchain/core/tools';

/**
 * Screen coordinates for mouse operations
 */
export type ScreenCoordinates = {
  /** X coordinate on screen */
  x: number;
  /** Y coordinate on screen */
  y: number;
};

/**
 * Mouse click parameters
 */
export type MouseClickParams = ScreenCoordinates & {
  /** Mouse button to use (left, right, middle) */
  button?: 'left' | 'right' | 'middle';
  /** Optional description of what is being clicked */
  description?: string;
};

/**
 * Text typing parameters
 */
export type TypeTextParams = {
  /** Text to type */
  text: string;
  /** Optional delay between keystrokes in milliseconds */
  delay?: number;
};

/**
 * Key press parameters
 */
export type KeyPressParams = {
  /** Key or key combination to press (e.g., "enter", "control+c") */
  key: string;
};

/**
 * Command execution parameters
 */
export type CommandParams = {
  /** Command to execute */
  command: string;
  /** Optional working directory */
  cwd?: string;
};

/**
 * Screenshot parameters
 */
export type ScreenshotParams = {
  /** Optional name for the screenshot */
  name?: string;
};

/**
 * Screen analysis parameters
 */
export type AnalyzeScreenParams = {
  /** Optional region of screen to analyze */
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Optional prompt to guide the analysis */
  prompt?: string;
};

/**
 * Search parameters
 */
export type SearchParams = {
  /** Search query */
  query: string;
  /** Optional number of results */
  num?: number;
};

/**
 * Collection of all tool instances
 */
export type ToolSet = {
  screenshot: DynamicStructuredTool[];
  interaction: DynamicStructuredTool[];
  terminal: DynamicStructuredTool[];
  utility: DynamicStructuredTool[];
};

/**
 * Tool categories for organization
 */
export enum ToolCategory {
  SCREENSHOT = 'screenshot',
  INTERACTION = 'interaction',
  TERMINAL = 'terminal',
  SEARCH = 'search',
  UTILITY = 'utility',
}
