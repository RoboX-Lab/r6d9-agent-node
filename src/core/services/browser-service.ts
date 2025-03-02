/**
 * @file Browser service
 * @description Service for managing browser instances and pages
 */

import { chromium, Browser, Page } from 'playwright';
import { logger } from '../utils/logger';

/**
 * Browser configuration options
 */
interface BrowserOptions {
  /** Whether to run in headless mode */
  headless: boolean;
  /** Browser viewport width */
  viewportWidth: number;
  /** Browser viewport height */
  viewportHeight: number;
  /** Whether to enable browser console logging */
  enableConsoleLogging: boolean;
  /** Browser user agent */
  userAgent?: string;
}

/**
 * Default browser options
 */
const DEFAULT_BROWSER_OPTIONS: BrowserOptions = {
  headless: process.env.HEADLESS !== 'false',
  viewportWidth: parseInt(process.env.VIEWPORT_WIDTH || '1280', 10),
  viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT || '800', 10),
  enableConsoleLogging: process.env.ENABLE_CONSOLE_LOGGING === 'true',
  userAgent: process.env.USER_AGENT,
};

/**
 * Service for managing browser instances
 */
class BrowserService {
  private browser: Browser | null = null;
  private activePage: Page | null = null;
  private options: BrowserOptions;
  
  /**
   * Create a new BrowserService
   * @param options - Browser configuration options
   */
  constructor(options: Partial<BrowserOptions> = {}) {
    this.options = { ...DEFAULT_BROWSER_OPTIONS, ...options };
  }
  
  /**
   * Get browser instance, creating one if it doesn't exist
   * @returns Browser instance
   */
  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      logger.info('Launching browser', { 
        headless: this.options.headless,
        viewport: `${this.options.viewportWidth}x${this.options.viewportHeight}`,
      });
      
      this.browser = await chromium.launch({
        headless: this.options.headless,
      });
      
      // Set up browser logging if enabled
      if (this.options.enableConsoleLogging) {
        this.browser.on('disconnected', () => {
          logger.info('Browser disconnected');
          this.browser = null;
          this.activePage = null;
        });
      }
    }
    
    return this.browser;
  }
  
  /**
   * Get the active page, creating one if it doesn't exist
   * @returns Active page
   */
  async getActivePage(): Promise<Page> {
    if (!this.activePage) {
      const browser = await this.getBrowser();
      const context = await browser.newContext({
        viewport: {
          width: this.options.viewportWidth,
          height: this.options.viewportHeight,
        },
        userAgent: this.options.userAgent,
      });
      
      this.activePage = await context.newPage();
      
      // Set up page logging if enabled
      if (this.options.enableConsoleLogging) {
        this.activePage.on('console', (msg) => {
          logger.debug(`Browser console [${msg.type()}]: ${msg.text()}`);
        });
        
        this.activePage.on('pageerror', (error) => {
          logger.error('Page error', { error: error.message });
        });
      }
    }
    
    return this.activePage;
  }
  
  /**
   * Close the active page
   */
  async closePage(): Promise<void> {
    if (this.activePage) {
      logger.info('Closing active page');
      await this.activePage.close();
      this.activePage = null;
    }
  }
  
  /**
   * Close the browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      logger.info('Closing browser');
      await this.browser.close();
      this.browser = null;
      this.activePage = null;
    }
  }
  
  /**
   * Reset the browser service
   */
  async reset(): Promise<void> {
    await this.closeBrowser();
  }
  
  /**
   * Set browser options
   * @param options - New browser options
   */
  setOptions(options: Partial<BrowserOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

/**
 * Shared browser service instance
 */
export const browserService = new BrowserService();
