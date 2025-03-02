/**
 * @file Analyze screen tool
 * @description Tool for analyzing the current screen state
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { computerService } from '../../services/computer-service';
import { logger } from '../../utils/logger';
import { createLLM } from '../../config/config';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

/**
 * Schema for screen analysis parameters
 */
const analyzeScreenSchema = z.object({
  query: z.string().describe(
    'What to look for or analyze on the screen'
  ),
  detailed: z.boolean().optional().describe(
    'Whether to provide a detailed analysis'
  ),
});

/**
 * Tool for analyzing the current screen state using AI
 */
export const analyzeScreenTool = new DynamicStructuredTool({
  name: 'analyzeScreen',
  description: 'Analyzes the current screen state to identify elements, text, and UI components',
  schema: analyzeScreenSchema,
  func: async ({ query, detailed = false }) => {
    try {
      logger.info('Analyzing screen', { query, detailed });
      
      // Take a screenshot
      const screenshotPath = await computerService.takeScreenshot();
      const screenshotBase64 = await computerService.getScreenshotBase64();
      
      // Create a vision-enabled LLM for analysis
      const visionModel = new ChatOpenAI({
        modelName: 'gpt-4o',
        maxTokens: detailed ? 1000 : 400,
      });
      
      // Create a prompt for the LLM
      const systemPrompt = 'You are a computer vision assistant that analyzes screenshots. ' +
        'Provide accurate descriptions of what you see, focusing on UI elements, text, and structure.';
      
      // Call the vision model
      const response = await visionModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage({
          content: [
            {
              type: 'text',
              text: `Analyze this screenshot of a computer screen and respond to: ${query}\n\n${detailed ? 'Please provide a detailed analysis including all visible UI elements, text content, and structure.' : 'Focus on the key elements relevant to the query.'}\n\nIf you need to interact with elements on the screen, provide coordinates (x,y) for mouse operations.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
              },
            },
          ],
        }),
      ]);
      
      return JSON.stringify({
        success: true,
        analysis: response.content,
        screenshotPath,
        query,
      });
    } catch (error: any) {
      logger.error('Error analyzing screen', { error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
