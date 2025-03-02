/**
 * @file Computer service
 * @description Service for managing computer interaction through screenshots, keyboard, mouse, and terminal
 */

import * as robotjs from 'robotjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger';

// Promisify exec for async/await usage
const execAsync = promisify(exec);

/**
 * Computer configuration options
 */
interface ComputerOptions {
  /** Screenshot capture width */
  screenshotWidth: number;
  /** Screenshot capture height */
  screenshotHeight: number;
  /** Directory for storing screenshots */
  screenshotDir: string;
  /** Mouse movement speed (1-100) */
  mouseSpeed: number;
  /** Typing delay in milliseconds */
  typingDelay: number;
}

/**
 * Default computer options
 */
const DEFAULT_COMPUTER_OPTIONS: ComputerOptions = {
  screenshotWidth: parseInt(process.env.VIEWPORT_WIDTH || '1280', 10),
  screenshotHeight: parseInt(process.env.VIEWPORT_HEIGHT || '800', 10),
  screenshotDir: process.env.SCREENSHOT_DIR || './screenshots',
  mouseSpeed: parseInt(process.env.MOUSE_SPEED || '50', 10),
  typingDelay: parseInt(process.env.TYPING_DELAY || '10', 10),
};

/**
 * Service for managing computer interaction
 */
class ComputerService {
  private options: ComputerOptions;
  private screenshotCounter = 0;
  
  /**
   * Create a new ComputerService
   * @param options - Computer configuration options
   */
  constructor(options: Partial<ComputerOptions> = {}) {
    this.options = { ...DEFAULT_COMPUTER_OPTIONS, ...options };
    this.ensureScreenshotDir();
  }
  
  /**
   * Ensure the screenshot directory exists
   */
  private async ensureScreenshotDir(): Promise<void> {
    try {
      await fs.mkdir(this.options.screenshotDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create screenshot directory', { error });
    }
  }
  
  /**
   * Initialize the computer service
   */
  async initialize(): Promise<void> {
    logger.info('Initializing computer service');
    // Set mouse speed
    robotjs.setMouseDelay(this.options.mouseSpeed);
    
    // Ensure screenshot directory exists
    await this.ensureScreenshotDir();
  }
  
  /**
   * Take a screenshot of the current screen state
   * @param name - Optional name for the screenshot
   * @returns The path to the saved screenshot
   */
  async takeScreenshot(name?: string): Promise<string> {
    await this.ensureScreenshotDir();
    this.screenshotCounter += 1;
    const fileName = name ? `${name}.png` : `screenshot_${Date.now()}_${this.screenshotCounter}.png`;
    const filePath = path.join(this.options.screenshotDir, fileName);
    
    try {
      // Capture screen using robotjs
      const bitmap = robotjs.screen.capture(
        0, 
        0, 
        this.options.screenshotWidth, 
        this.options.screenshotHeight
      );
      
      // Convert to PNG and save
      // Note: This is a simplified version - actual implementation would need to convert bitmap data to PNG
      const imageBuffer = this.bitmapToBuffer(bitmap);
      await fs.writeFile(filePath, imageBuffer);
      
      logger.info('Screenshot captured', { filePath });
      return filePath;
    } catch (error) {
      logger.error('Failed to capture screenshot', { error });
      throw error;
    }
  }
  
  /**
   * Convert robotjs bitmap to buffer (placeholder implementation)
   * @param bitmap - The robotjs bitmap
   * @returns Buffer containing image data
   */
  private bitmapToBuffer(bitmap: any): Buffer {
    // This is a placeholder - actual implementation would convert robotjs bitmap to PNG
    // You would need to use a library like jimp or sharp to do this properly
    return Buffer.from(bitmap.image);
  }
  
  /**
   * Get the current screen content as base64
   * @returns Base64 encoded screenshot
   */
  async getScreenshotBase64(): Promise<string> {
    try {
      const bitmap = robotjs.screen.capture(
        0, 
        0, 
        this.options.screenshotWidth, 
        this.options.screenshotHeight
      );
      
      const buffer = this.bitmapToBuffer(bitmap);
      return buffer.toString('base64');
    } catch (error) {
      logger.error('Failed to capture screenshot as base64', { error });
      throw error;
    }
  }
  
  /**
   * Execute a terminal command
   * @param command - The command to execute
   * @returns The command output
   */
  async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    logger.info('Executing terminal command', { command });
    try {
      const { stdout, stderr } = await execAsync(command);
      return { stdout, stderr };
    } catch (error: any) {
      logger.error('Command execution failed', { error: error.message });
      return { stdout: '', stderr: error.message };
    }
  }
  
  /**
   * Move the mouse to a specific position
   * @param x - The x coordinate
   * @param y - The y coordinate
   */
  async moveMouse(x: number, y: number): Promise<void> {
    logger.info('Moving mouse', { x, y });
    try {
      robotjs.moveMouse(x, y);
    } catch (error) {
      logger.error('Failed to move mouse', { error });
      throw error;
    }
  }
  
  /**
   * Click at the current mouse position
   * @param button - Mouse button to click (left, right, middle)
   */
  async clickMouse(button: 'left' | 'right' | 'middle' = 'left'): Promise<void> {
    logger.info('Clicking mouse', { button });
    try {
      robotjs.mouseClick(button);
    } catch (error) {
      logger.error('Failed to click mouse', { error });
      throw error;
    }
  }
  
  /**
   * Type text using the keyboard
   * @param text - The text to type
   * @param options - Options for typing
   */
  async typeText(text: string, options?: { delay?: number }): Promise<void> {
    logger.info('Typing text', { 
      textLength: text.length,
      preview: text.length > 10 ? `${text.substring(0, 10)}...` : text,
      delay: options?.delay
    });
    
    try {
      const delay = options?.delay || this.options.typingDelay;
      robotjs.setKeyboardDelay(delay);
      robotjs.typeString(text);
    } catch (error) {
      logger.error('Failed to type text', { error });
      throw error;
    }
  }
  
  /**
   * Press a key or key combination
   * @param key - The key or key combination to press
   */
  async pressKey(key: string): Promise<void> {
    logger.info('Pressing key', { key });
    try {
      // Handle key combinations (e.g., "command+c")
      if (key.includes('+')) {
        const keys = key.split('+');
        const modifiers = keys.slice(0, -1);
        const mainKey = keys[keys.length - 1];
        
        robotjs.keyToggle(mainKey, 'down', modifiers);
        robotjs.keyToggle(mainKey, 'up', modifiers);
      } else {
        // Single key press
        robotjs.keyTap(key);
      }
    } catch (error) {
      logger.error('Failed to press key', { error });
      throw error;
    }
  }
  
  /**
   * Close all resources
   */
  async close(): Promise<void> {
    logger.info('Closing computer service');
    // No actual resources to close in this implementation
    // This is kept for API compatibility
  }
}

/**
 * Shared computer service instance
 */
export const computerService = new ComputerService();
