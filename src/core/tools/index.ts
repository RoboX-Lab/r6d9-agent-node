/**
 * @file Tools index
 * @description Exports all available tools for computer automation
 */

import { logger } from '../utils/logger';
import { ToolCategory, ToolSet } from '../types/tool';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

// Import computer tools
import { COMPUTER_TOOLS } from './computer';
import { 
  takeScreenshotTool, 
  executeCommandTool, 
  mouseMoveClickTool, 
  typeTextTool, 
  pressKeyTool, 
  analyzeScreenTool 
} from './computer';

// Import search tools
import { googleSearchTool } from './search/search-tool';

// Define ZodObjectAny type for tool schema compatibility
type ZodObjectAny = z.ZodObject<any, any, any, any>;

/**
 * Map of all available tools by name
 */
export const TOOLS = {
  takeScreenshot: takeScreenshotTool as DynamicStructuredTool<ZodObjectAny>,
  executeCommand: executeCommandTool as DynamicStructuredTool<ZodObjectAny>,
  mouseMoveClick: mouseMoveClickTool as DynamicStructuredTool<ZodObjectAny>,
  typeText: typeTextTool as DynamicStructuredTool<ZodObjectAny>,
  pressKey: pressKeyTool as DynamicStructuredTool<ZodObjectAny>,
  analyzeScreen: analyzeScreenTool as DynamicStructuredTool<ZodObjectAny>,
  googleSearch: googleSearchTool as DynamicStructuredTool<ZodObjectAny>,
};

// List of all tools in a flat array
export const ALL_TOOLS = Object.values(TOOLS);

/**
 * Map of all tools by category
 */
export const TOOLS_BY_CATEGORY: Record<ToolCategory, DynamicStructuredTool<ZodObjectAny>[]> = {
  [ToolCategory.SCREENSHOT]: [
    TOOLS.takeScreenshot,
    TOOLS.analyzeScreen,
  ],
  [ToolCategory.INTERACTION]: [
    TOOLS.mouseMoveClick,
    TOOLS.typeText,
    TOOLS.pressKey,
  ],
  [ToolCategory.TERMINAL]: [
    TOOLS.executeCommand,
  ],
  [ToolCategory.SEARCH]: [
    TOOLS.googleSearch,
  ],
  [ToolCategory.UTILITY]: [],
};

/**
 * Get all computer tools
 * @returns Array of computer tools
 */
export function getComputerTools(): ToolSet {
  logger.debug('Getting computer tools');
  const allTools: ToolSet = {
    screenshot: TOOLS_BY_CATEGORY[ToolCategory.SCREENSHOT],
    interaction: TOOLS_BY_CATEGORY[ToolCategory.INTERACTION],
    terminal: TOOLS_BY_CATEGORY[ToolCategory.TERMINAL],
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

// Export computer tools
export { COMPUTER_TOOLS };
