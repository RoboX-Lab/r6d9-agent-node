/**
 * @file Tools index
 * @description Exports all available tools for browser automation
 */

import { logger } from '../utils/logger';
import { ToolCategory, ToolSet } from '../types/tool';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

// Import tools
import { openUrlTool } from './browser/open-url-tool';
import { getPageUrlTool } from './browser/get-url-tool';
import { clickTool } from './browser/click-tool';
import { enterTextTool } from './browser/enter-text-tool';
import { getDomFieldsTool } from './browser/get-dom-fields-tool';
import { googleSearchTool } from './search/search-tool';
import { pressKeyCombinationTool } from './browser/press-key-combination-tool';

// Import browser tools from refactored module
import * as browserTools from './browser';

// Define ZodObjectAny type for tool schema compatibility
type ZodObjectAny = z.ZodObject<any, any, any, any>;

/**
 * Map of all available tools by name
 */
export const TOOLS = {
  openUrl: openUrlTool as DynamicStructuredTool<ZodObjectAny>,
  getPageUrl: getPageUrlTool as DynamicStructuredTool<ZodObjectAny>,
  click: clickTool as DynamicStructuredTool<ZodObjectAny>,
  enterText: enterTextTool as DynamicStructuredTool<ZodObjectAny>,
  getDomFields: getDomFieldsTool as DynamicStructuredTool<ZodObjectAny>,
  googleSearch: googleSearchTool as DynamicStructuredTool<ZodObjectAny>,
  pressKeyCombination: pressKeyCombinationTool as DynamicStructuredTool<ZodObjectAny>,
};

// List of all tools in a flat array
export const ALL_TOOLS = Object.values(TOOLS);

/**
 * Map of all tools by category
 */
export const TOOLS_BY_CATEGORY: Record<ToolCategory, DynamicStructuredTool<ZodObjectAny>[]> = {
  [ToolCategory.NAVIGATION]: [
    TOOLS.openUrl,
    TOOLS.getPageUrl,
  ],
  [ToolCategory.INTERACTION]: [
    TOOLS.click,
    TOOLS.enterText,
    TOOLS.pressKeyCombination,
  ],
  [ToolCategory.INFORMATION]: [
    TOOLS.getDomFields,
  ],
  [ToolCategory.SEARCH]: [
    TOOLS.googleSearch,
  ],
  [ToolCategory.UTILITY]: [],
};

/**
 * Get all browser tools
 * @returns Array of browser tools
 */
export function getBrowserTools(): ToolSet {
  logger.debug('Getting browser tools');
  const allTools: ToolSet = {
    navigation: TOOLS_BY_CATEGORY[ToolCategory.NAVIGATION],
    interaction: TOOLS_BY_CATEGORY[ToolCategory.INTERACTION],
    information: TOOLS_BY_CATEGORY[ToolCategory.INFORMATION],
    utility: TOOLS_BY_CATEGORY[ToolCategory.UTILITY],
  };

  return allTools;
}

/**
 * Get tools by category
 * @param category - Tool category to filter by
 * @returns Array of tools in the specified category
 */
export function getToolsByCategory(category: ToolCategory): DynamicStructuredTool<ZodObjectAny>[] {
  logger.debug('Getting tools by category', { category });
  return TOOLS_BY_CATEGORY[category] ?? [];
}

/**
 * Get a specific tool by name
 * @param name - Tool name
 * @returns The requested tool or undefined if not found
 */
export function getToolByName(name: string): DynamicStructuredTool<ZodObjectAny> | undefined {
  logger.debug('Getting tool by name', { name });
  // Use type assertion to ensure correct return type
  return TOOLS[name as keyof typeof TOOLS] as DynamicStructuredTool<ZodObjectAny> | undefined;
}

/**
 * Export all tool categories
 */
export { ToolCategory };

// Export browser tools module
export { browserTools };
