/**
 * @file Computer tools index
 * @description Exports all available tools for computer interaction
 */

import { takeScreenshotTool } from './take-screenshot-tool';
import { executeCommandTool } from './execute-command-tool';
import { mouseMoveClickTool } from './mouse-move-click-tool';
import { typeTextTool } from './type-text-tool';
import { pressKeyTool } from './press-key-tool';
import { analyzeScreenTool } from './analyze-screen-tool';

// Export all computer tools
export {
  takeScreenshotTool,
  executeCommandTool,
  mouseMoveClickTool,
  typeTextTool,
  pressKeyTool, 
  analyzeScreenTool
};

// Export all tools as an array
export const COMPUTER_TOOLS = [
  takeScreenshotTool,
  executeCommandTool,
  mouseMoveClickTool,
  typeTextTool,
  pressKeyTool,
  analyzeScreenTool
];
