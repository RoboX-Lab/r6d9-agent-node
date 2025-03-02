/**
 * @file Execute command tool
 * @description Tool for executing terminal commands
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { computerService } from '../../services/computer-service';
import { logger } from '../../utils/logger';

/**
 * Schema for command execution parameters
 */
const executeCommandSchema = z.object({
  command: z.string().describe(
    'The terminal command to execute'
  ),
});

/**
 * Tool for executing terminal commands
 */
export const executeCommandTool = new DynamicStructuredTool({
  name: 'executeCommand',
  description: 'Executes a terminal command and returns the output',
  schema: executeCommandSchema,
  func: async ({ command }) => {
    try {
      logger.info('Executing command', { command });
      
      // Check for potentially dangerous commands
      const dangerousCommands = ['rm -rf', 'dd', 'mkfs', 'format', ':(){:|:&};:'];
      const isDangerous = dangerousCommands.some(cmd => command.includes(cmd));
      
      if (isDangerous) {
        logger.warn('Potentially dangerous command detected', { command });
        return JSON.stringify({
          success: false,
          error: 'This command may be destructive and has been blocked for safety reasons.',
        });
      }
      
      // Execute the command
      const { stdout, stderr } = await computerService.executeCommand(command);
      
      if (stderr && stderr.length > 0) {
        logger.warn('Command executed with errors', { command, stderr });
        return JSON.stringify({
          success: true,
          stdout,
          stderr,
          message: 'Command executed with possible errors. See stderr for details.',
        });
      }
      
      return JSON.stringify({
        success: true,
        stdout,
        message: 'Command executed successfully.',
      });
    } catch (error: any) {
      logger.error('Error executing command', { command, error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
