/**
 * @file Screenshot comparison demo
 * @description Demonstrates how to use the screenshot comparison utilities
 */

import path from 'path';
import fs from 'fs';
import { PNG } from 'pngjs';
import { compareScreenshots, highlightRegions } from '../src/core/utils/screenshot-comparison';
import { computerService } from '../src/core/services/computer-service';

/**
 * Main function to run the demo
 */
async function main() {
  try {
    console.log('Screenshot Comparison Demo');
    console.log('========================');
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Take before screenshot
    console.log('\n1. Taking first screenshot...');
    const screenshot1 = await computerService.takeScreenshot('before');
    console.log(`   - Saved to: ${screenshot1}`);
    
    // Prompt user to make changes to the screen
    console.log('\n2. Please make some visual changes to your screen (open/close a window, etc.)');
    console.log('   - Press Enter when ready to take the second screenshot...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve(undefined));
    });
    
    // Take after screenshot
    console.log('\n3. Taking second screenshot...');
    const screenshot2 = await computerService.takeScreenshot('after');
    console.log(`   - Saved to: ${screenshot2}`);
    
    // Compare the screenshots
    console.log('\n4. Comparing screenshots...');
    const diffOutputPath = path.join(screenshotsDir, 'diff.png');
    
    const result = await compareScreenshots(screenshot1, screenshot2, {
      threshold: 0.1,
      outputPath: diffOutputPath,
      includeRegionAnalysis: true,
      minRegionSize: 10,
    });
    
    console.log(`   - Differences found: ${result.diffCount} pixels`);
    console.log(`   - Difference percentage: ${result.diffPercentage.toFixed(2)}%`);
    console.log(`   - Diff image saved to: ${result.diffImagePath}`);
    
    // Report on diff regions
    if (result.diffRegions && result.diffRegions.length > 0) {
      console.log(`\n5. Detected ${result.diffRegions.length} difference regions:`);
      
      result.diffRegions.forEach((region, index) => {
        console.log(`   Region #${index + 1}:`);
        console.log(`   - Position: (${region.x}, ${region.y})`);
        console.log(`   - Size: ${region.width} x ${region.height} pixels`);
        console.log(`   - Difference percentage within region: ${region.diffPercentage.toFixed(1)}%`);
      });
      
      // Highlight regions on the second screenshot
      const highlightedPath = path.join(screenshotsDir, 'highlighted.png');
      await highlightRegions(screenshot2, result.diffRegions, highlightedPath);
      console.log(`\n6. Created highlighted image: ${highlightedPath}`);
      
      // Create artificial examples for demonstration purposes
      console.log('\n7. Creating example images for demonstration...');
      
      // Create a sample image with specific differences
      const sampleWidth = 300;
      const sampleHeight = 200;
      
      // Create two sample PNGs
      const sample1 = new PNG({ width: sampleWidth, height: sampleHeight });
      const sample2 = new PNG({ width: sampleWidth, height: sampleHeight });
      
      // Fill sample1 with white
      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          const idx = (y * sampleWidth + x) << 2;
          sample1.data[idx] = 255;     // R
          sample1.data[idx + 1] = 255; // G
          sample1.data[idx + 2] = 255; // B
          sample1.data[idx + 3] = 255; // A
        }
      }
      
      // Copy sample1 to sample2
      sample1.data.copy(sample2.data);
      
      // Add a red rectangle to sample2
      const rect1 = { x: 50, y: 50, width: 50, height: 40 };
      for (let y = rect1.y; y < rect1.y + rect1.height; y++) {
        for (let x = rect1.x; x < rect1.x + rect1.width; x++) {
          const idx = (y * sampleWidth + x) << 2;
          sample2.data[idx] = 255;     // R
          sample2.data[idx + 1] = 0;   // G
          sample2.data[idx + 2] = 0;   // B
          sample2.data[idx + 3] = 255; // A
        }
      }
      
      // Add a blue circle to sample2
      const circle = { x: 200, y: 100, radius: 30 };
      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          const distance = Math.sqrt(
            Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
          );
          
          if (distance < circle.radius) {
            const idx = (y * sampleWidth + x) << 2;
            sample2.data[idx] = 0;       // R
            sample2.data[idx + 1] = 0;   // G
            sample2.data[idx + 2] = 255; // B
            sample2.data[idx + 3] = 255; // A
          }
        }
      }
      
      // Add a green triangle to sample2
      const triangle = {
        x1: 120, y1: 150,
        x2: 170, y2: 150,
        x3: 145, y3: 110
      };
      
      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          // Check if point is inside triangle using barycentric coordinates
          const denominator = (triangle.y2 - triangle.y3) * (triangle.x1 - triangle.x3) +
                              (triangle.x3 - triangle.x2) * (triangle.y1 - triangle.y3);
          
          const a = ((triangle.y2 - triangle.y3) * (x - triangle.x3) +
                    (triangle.x3 - triangle.x2) * (y - triangle.y3)) / denominator;
          const b = ((triangle.y3 - triangle.y1) * (x - triangle.x3) +
                    (triangle.x1 - triangle.x3) * (y - triangle.y3)) / denominator;
          const c = 1 - a - b;
          
          if (a >= 0 && b >= 0 && c >= 0) {
            const idx = (y * sampleWidth + x) << 2;
            sample2.data[idx] = 0;       // R
            sample2.data[idx + 1] = 255; // G
            sample2.data[idx + 2] = 0;   // B
            sample2.data[idx + 3] = 255; // A
          }
        }
      }
      
      // Save the sample images
      const sample1Path = path.join(screenshotsDir, 'sample1.png');
      const sample2Path = path.join(screenshotsDir, 'sample2.png');
      
      fs.writeFileSync(sample1Path, PNG.sync.write(sample1));
      fs.writeFileSync(sample2Path, PNG.sync.write(sample2));
      
      console.log(`   - Created sample images: ${sample1Path} and ${sample2Path}`);
      
      // Compare sample images
      console.log('\n8. Comparing sample images...');
      const sampleDiffPath = path.join(screenshotsDir, 'sample_diff.png');
      
      const sampleResult = await compareScreenshots(sample1Path, sample2Path, {
        threshold: 0.1,
        outputPath: sampleDiffPath,
        includeRegionAnalysis: true,
        minRegionSize: 5,
      });
      
      console.log(`   - Sample differences found: ${sampleResult.diffCount} pixels`);
      console.log(`   - Sample difference percentage: ${sampleResult.diffPercentage.toFixed(2)}%`);
      console.log(`   - Sample diff image saved to: ${sampleResult.diffImagePath}`);
      
      // Report on sample diff regions
      if (sampleResult.diffRegions && sampleResult.diffRegions.length > 0) {
        console.log(`\n9. Detected ${sampleResult.diffRegions.length} difference regions in sample images:`);
        
        sampleResult.diffRegions.forEach((region, index) => {
          console.log(`   Region #${index + 1}:`);
          console.log(`   - Position: (${region.x}, ${region.y})`);
          console.log(`   - Size: ${region.width} x ${region.height} pixels`);
          console.log(`   - Difference percentage within region: ${region.diffPercentage.toFixed(1)}%`);
        });
        
        // Highlight regions on the second sample
        const sampleHighlightedPath = path.join(screenshotsDir, 'sample_highlighted.png');
        await highlightRegions(sample2Path, sampleResult.diffRegions, sampleHighlightedPath, 'yellow');
        console.log(`\n10. Created highlighted sample image: ${sampleHighlightedPath}`);
      }
    } else {
      console.log('\n5. No significant difference regions detected.');
    }
    
    console.log('\nDemo completed successfully!');
    console.log('Check the screenshots directory for all output files.');
    
  } catch (error) {
    console.error('Error running demo:', error);
  }
}

// Run the demo
main().catch(console.error);
