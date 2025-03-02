/**
 * @file Browser manager
 * @description Manager for browser operations
 */

import { Browser, Page } from 'playwright';
import { setupBrowser } from './setup';
import type { BrowserConfig } from './setup';
import { logger } from '../../utils/logger';

/**
 * Manager for browser operations
 */
class BrowserManager {
  private static instance: BrowserManager;
  private config: BrowserConfig;
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Create a new BrowserManager
   * @param config - Browser configuration
   */
  private constructor(config: BrowserConfig) {
    this.config = config;
  }

  /**
   * Get the BrowserManager instance
   * @param config - Browser configuration
   * @returns BrowserManager instance
   */
  static getInstance(config: BrowserConfig): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager(config);
    }
    return BrowserManager.instance;
  }

  /**
   * Ensure browser and page are initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.browser || !this.page) {
      logger.info('Initializing browser', { config: this.config });
      this.browser = await setupBrowser(this.config);
      const context = await this.browser.newContext({});
      this.page = await context.newPage();
      await this.page.setViewportSize({ width: 1280, height: 800 });
      logger.info('Browser initialized successfully');
    }
  }

  /**
   * Execute an action with browser and page
   * @param action - Action to execute
   * @returns Result of the action
   */
  private async withBrowserAndPage<T>(
    action: (browser: Browser, page: Page) => Promise<T>,
  ): Promise<T> {
    await this.ensureInitialized();
    return action(this.browser!, this.page!);
  }

  /**
   * Navigate to a URL
   * @param url - URL to navigate to
   * @returns Page instance
   */
  async navigateTo(url: string): Promise<Page> {
    logger.info('Navigating to URL', { url });
    return this.withBrowserAndPage(async (_, page) => {
      await page.goto(url, { waitUntil: 'networkidle' });
      return page;
    });
  }

  /**
   * Get the active page
   * @returns Page instance
   */
  async getPage(): Promise<Page> {
    return this.withBrowserAndPage((_, page) => Promise.resolve(page));
  }

  /**
   * Get the browser instance
   * @returns Browser instance
   */
  async getBrowser(): Promise<Browser> {
    return this.withBrowserAndPage((browser) => Promise.resolve(browser));
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      logger.info('Closing browser');
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

/**
 * Shared browser manager instance
 */
export default BrowserManager.getInstance({
  headless: false,
  disableSecurity: true,
  // Uncomment and adjust the path for local Chrome usage if needed
  // chromeInstancePath:
  //   process.platform === 'darwin'
  //     ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  //     : process.platform === 'win32'
  //       ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  //       : '/usr/bin/google-chrome',
});
