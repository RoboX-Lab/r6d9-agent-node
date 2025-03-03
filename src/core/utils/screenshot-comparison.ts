/**
 * @file Screenshot comparison utilities
 * @description Utilities for comparing screenshots and analyzing differences
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import { logger } from '../utils/logger';

/**
 * Interface for difference regions
 */
export interface DiffRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  diffPercentage: number;
}

/**
 * Options for screenshot comparison
 */
export interface ComparisonOptions {
  threshold?: number;
  alpha?: number;
  aaLevel?: number;
  diffColor?: {
    r: number;
    g: number;
    b: number;
  };
  outputPath?: string;
  includeRegionAnalysis?: boolean;
  minRegionSize?: number;
}

/**
 * Result of screenshot comparison
 */
export interface ComparisonResult {
  diffCount: number;
  diffPercentage: number;
  diffImagePath?: string;
  diffRegions?: DiffRegion[];
}

/**
 * Compare two screenshots and return the difference
 * @param img1Path - Path to the first screenshot
 * @param img2Path - Path to the second screenshot
 * @param options - Comparison options
 * @returns Comparison result
 */
export async function compareScreenshots(
  img1Path: string,
  img2Path: string,
  options: ComparisonOptions = {}
): Promise<ComparisonResult> {
  try {
    logger.info('Comparing screenshots', { img1: img1Path, img2: img2Path });

    // Load the images
    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));

    // Create a PNG for the diff
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    // Set default options
    const {
      threshold = 0.1,
      alpha = 0.1,
      aaLevel = 2,
      diffColor = { r: 255, g: 0, b: 0 },
      outputPath,
      includeRegionAnalysis = true,
      minRegionSize = 10,
    } = options;

    // Compare the images
    const diffCount = pixelmatch(img1.data, img2.data, diff.data, width, height, {
      threshold,
      alpha,
      aaLevel,
      diffColor,
      includeAA: true,
    });

    // Calculate the difference percentage
    const totalPixels = width * height;
    const diffPercentage = (diffCount / totalPixels) * 100;

    logger.info('Screenshot comparison complete', {
      diffCount,
      diffPercentage: diffPercentage.toFixed(2) + '%',
    });

    let diffImagePath: string | undefined;
    let diffRegions: DiffRegion[] | undefined;

    // Save the diff image if an output path is provided
    if (outputPath) {
      const diffDir = path.dirname(outputPath);
      if (!fs.existsSync(diffDir)) {
        fs.mkdirSync(diffDir, { recursive: true });
      }

      // Write the diff image
      fs.writeFileSync(outputPath, PNG.sync.write(diff));
      diffImagePath = outputPath;

      logger.info('Diff image saved', { path: outputPath });
    }

    // Analyze regions if requested
    if (includeRegionAnalysis) {
      diffRegions = analyzeDiffRegions(diff, minRegionSize);

      // Mark regions on the diff image if it was saved
      if (diffImagePath) {
        await markDiffRegions(diffImagePath, diffRegions);
        logger.info('Diff regions marked on image', { path: diffImagePath });
      }
    }

    return {
      diffCount,
      diffPercentage,
      diffImagePath,
      diffRegions,
    };
  } catch (error) {
    logger.error('Error comparing screenshots', { error });
    throw new Error(`Failed to compare screenshots: ${error}`);
  }
}

/**
 * Analyze the diff image to identify distinct regions of difference
 * @param diffImage - The diff image
 * @param minRegionSize - Minimum size of regions to consider
 * @returns Array of difference regions
 */
function analyzeDiffRegions(diffImage: PNG, minRegionSize: number = 10): DiffRegion[] {
  const { width, height, data } = diffImage;

  // Create a matrix to track visited pixels
  const visited = Array(height)
    .fill(0)
    .map(() => Array(width).fill(false));

  // List to store identified regions
  const regions: DiffRegion[] = [];

  // BFS to find connected components (regions)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Check if pixel is a diff pixel and not visited
      const idx = (y * width + x) << 2;
      const isDiffPixel = data[idx] > 0 || data[idx + 1] > 0 || data[idx + 2] > 0;

      if (isDiffPixel && !visited[y][x]) {
        // Found a new diff region, use BFS to explore it
        const region = exploreRegion(diffImage, visited, x, y);

        // Only consider regions larger than minRegionSize
        if (
          region.width >= minRegionSize &&
          region.height >= minRegionSize &&
          region.diffPercentage > 0
        ) {
          regions.push(region);
        }
      }
    }
  }

  logger.info('Diff region analysis complete', {
    regionsFound: regions.length,
  });

  return regions;
}

/**
 * Explore a connected region using BFS
 * @param diffImage - The diff image
 * @param visited - Matrix tracking visited pixels
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate
 * @returns Information about the explored region
 */
function exploreRegion(
  diffImage: PNG,
  visited: boolean[][],
  startX: number,
  startY: number
): DiffRegion {
  const { width, height, data } = diffImage;

  // Queue for BFS
  const queue: [number, number][] = [[startX, startY]];
  visited[startY][startX] = true;

  // Track region boundaries
  let minX = startX;
  let maxX = startX;
  let minY = startY;
  let maxY = startY;
  let diffPixelCount = 0;

  // Directions for BFS (up, right, down, left)
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    diffPixelCount++;

    // Update region boundaries
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    // Check all four directions
    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];

      // Check bounds
      if (nx < 0 || nx >= width || ny < 0 || ny >= height || visited[ny][nx]) {
        continue;
      }

      // Check if the pixel is a diff pixel
      const idx = (ny * width + nx) << 2;
      const isDiffPixel = data[idx] > 0 || data[idx + 1] > 0 || data[idx + 2] > 0;

      if (isDiffPixel) {
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }

  // Calculate region dimensions
  const regionWidth = maxX - minX + 1;
  const regionHeight = maxY - minY + 1;
  const totalPixels = regionWidth * regionHeight;
  const diffPercentage = (diffPixelCount / totalPixels) * 100;

  return {
    x: minX,
    y: minY,
    width: regionWidth,
    height: regionHeight,
    diffPercentage,
  };
}

/**
 * Mark identified difference regions on the diff image
 * @param diffImagePath - Path to the diff image
 * @param regions - Array of difference regions
 */
async function markDiffRegions(diffImagePath: string, regions: DiffRegion[]): Promise<void> {
  try {
    // Load the diff image
    let image = sharp(diffImagePath);

    // Create SVG with rectangles for each region
    let svgContent = `<svg width="${(await image.metadata()).width}" height="${(await image.metadata()).height}">`;

    // Add rectangles for each region
    for (const region of regions) {
      svgContent += `
        <rect
          x="${region.x}"
          y="${region.y}"
          width="${region.width}"
          height="${region.height}"
          fill="none"
          stroke="yellow"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
        <text
          x="${region.x + 5}"
          y="${region.y - 5}"
          font-family="Arial"
          font-size="12"
          fill="yellow"
        >
          ${region.width}x${region.height} (${region.diffPercentage.toFixed(1)}%)
        </text>
      `;
    }

    svgContent += '</svg>';

    // Create a Buffer from the SVG
    const svgBuffer = Buffer.from(svgContent);

    // Composite the SVG on top of the diff image
    await image
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toFile(diffImagePath + '.marked.png');

    // Replace the original diff image with the marked one
    fs.renameSync(diffImagePath + '.marked.png', diffImagePath);
  } catch (error) {
    logger.error('Error marking diff regions', { error });
    throw new Error(`Failed to mark diff regions: ${error}`);
  }
}

/**
 * Highlight specific regions on an image
 * @param imagePath - Path to the image
 * @param regions - Array of regions to highlight
 * @param outputPath - Path to save the highlighted image
 * @param color - Color of the highlight
 */
export async function highlightRegions(
  imagePath: string,
  regions: DiffRegion[],
  outputPath: string,
  color: string = 'yellow'
): Promise<string> {
  try {
    // Load the image
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      throw new Error('Could not determine image dimensions');
    }

    // Create SVG with rectangles for each region
    let svgContent = `<svg width="${width}" height="${height}">`;

    // Add rectangles for each region
    for (const region of regions) {
      svgContent += `
        <rect
          x="${region.x}"
          y="${region.y}"
          width="${region.width}"
          height="${region.height}"
          fill="none"
          stroke="${color}"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
        <text
          x="${region.x + 5}"
          y="${region.y - 5}"
          font-family="Arial"
          font-size="12"
          fill="${color}"
        >
          ${region.width}x${region.height}
        </text>
      `;
    }

    svgContent += '</svg>';

    // Create a Buffer from the SVG
    const svgBuffer = Buffer.from(svgContent);

    // Composite the SVG on top of the image
    await image
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toFile(outputPath);

    logger.info('Regions highlighted on image', {
      path: outputPath,
      regionsCount: regions.length,
    });

    return outputPath;
  } catch (error) {
    logger.error('Error highlighting regions', { error });
    throw new Error(`Failed to highlight regions: ${error}`);
  }
}
