/**
 * @file Type definitions for tools
 * @description Contains shared types used for browser and other tools
 */

import { DynamicStructuredTool } from '@langchain/core/tools';

/**
 * Basic browser interaction types
 */
export type ElementSelector = {
  /** CSS selector to identify the element */
  query_selector: string;
};

/**
 * Text entry parameters
 */
export type EnterTextEntry = ElementSelector & {
  /** Text to enter in the element */
  text: string;
};

/**
 * Click parameters
 */
export type ClickEntry = ElementSelector & {
  /** Optional text description of what is being clicked */
  description?: string;
};

/**
 * URL navigation parameters
 */
export type NavigationParams = {
  /** URL to navigate to */
  url: string;
  /** Optional timeout in milliseconds */
  timeout?: number;
};

/**
 * Key combination parameters
 */
export type KeyCombinationParams = {
  /** Key combination string (e.g., "Control+A") */
  keys: string;
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
  navigation: DynamicStructuredTool[];
  interaction: DynamicStructuredTool[];
  information: DynamicStructuredTool[];
  utility: DynamicStructuredTool[];
};

/**
 * Tool categories for organization
 */
export enum ToolCategory {
  NAVIGATION = 'navigation',
  INTERACTION = 'interaction',
  INFORMATION = 'information',
  SEARCH = 'search',
  UTILITY = 'utility',
}
