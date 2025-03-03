/**
 * @file Compare screenshots tool
 * @description Tool for comparing screenshots and analyzing differences
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import path from 'path';
import { compareScreenshots, highlightRegions, ComparisonOptions } from '../../utils/screenshot-comparison';
import { logger } from '../../utils/logger';

/**
 * Schema for screenshot comparison parameters
 */
const compareScreenshotsSchema = z.object({
  screenshot1: z.string().describe(
    'Path to the first screenshot to compare'
  ),
  screenshot2: z.string().describe(
    'Path to the second screenshot to compare'
  ),
  threshold: z.number().min(0).max(1).optional().describe(
    'Threshold for considering pixels different (0-1, default: 0.1)'
  ),
  outputPath: z.string().optional().describe(
    'Path to save the diff image (default: auto-generated)'
  ),
  highlightColor: z.string().optional().describe(
    'Color to use for highlighting differences (default: red)'
  ),
  minRegionSize: z.number().optional().describe(
    'Minimum size of regions to identify (default: 10 pixels)'
  ),
});

/**
 * Generate default diff image path
 * @param screenshot1 - Path to the first screenshot
 * @param screenshot2 - Path to the second screenshot
 * @returns Default diff image path
 */
function generateDefaultDiffPath(screenshot1: string, screenshot2: string): string {
  const baseName1 = path.basename(screenshot1, path.extname(screenshot1));
  const baseName2 = path.basename(screenshot2, path.extname(screenshot2));
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(
    path.dirname(screenshot1),
    `diff_${baseName1}_${baseName2}_${now}.png`
  );
}

/**
 * Tool for comparing screenshots and analyzing differences
 */
export const compareScreenshotsTool = new DynamicStructuredTool({
  name: 'compareScreenshots',
  description: 'Compares two screenshots to identify and analyze differences',
  schema: compareScreenshotsSchema,
  func: async ({ 
    screenshot1, 
    screenshot2, 
    threshold = 0.1, 
    outputPath,
    highlightColor = 'red',
    minRegionSize = 10
  }) => {
    try {
      logger.info('Comparing screenshots', { 
        screenshot1, 
        screenshot2, 
        threshold 
      });
      
      // Generate default output path if not provided
      const diffOutputPath = outputPath || generateDefaultDiffPath(screenshot1, screenshot2);
      
      // Set comparison options
      const options: ComparisonOptions = {
        threshold,
        outputPath: diffOutputPath,
        includeRegionAnalysis: true,
        minRegionSize,
        diffColor: { r: 255, g: 0, b: 0 },
      };
      
      // Compare the screenshots
      const result = await compareScreenshots(screenshot1, screenshot2, options);
      
      // Format the response
      const response: any = {
        success: true,
        diffCount: result.diffCount,
        diffPercentage: result.diffPercentage.toFixed(2) + '%',
        diffImagePath: result.diffImagePath
      };
      
      // Include regions if available
      if (result.diffRegions && result.diffRegions.length > 0) {
        response.regionsCount = result.diffRegions.length;
        response.regions = result.diffRegions.map(region => ({
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          diffPercentage: region.diffPercentage.toFixed(1) + '%'
        }));
        
        // Create a version of the second screenshot with regions highlighted
        if (result.diffRegions.length > 0) {
          const highlightedPath = screenshot2.replace(
            path.extname(screenshot2),
            '.highlighted' + path.extname(screenshot2)
          );
          
          await highlightRegions(
            screenshot2,
            result.diffRegions,
            highlightedPath,
            highlightColor
          );
          
          response.highlightedImagePath = highlightedPath;
        }
      } else {
        response.regionsCount = 0;
        response.regions = [];
      }
      
      return JSON.stringify(response, null, 2);
    } catch (error: any) {
      logger.error('Error comparing screenshots', { error: error.message });
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
});
