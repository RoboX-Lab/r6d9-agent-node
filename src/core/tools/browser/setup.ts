/**
 * @file Browser setup
 * @description Setup functionality for browser instances
 */

import { Browser as PlaywrightBrowser, chromium } from 'playwright';
import axios from 'axios';
import { execFile, ExecFileException } from 'child_process';
import { logger } from '../../utils/logger';

/**
 * Browser configuration options
 */
export interface BrowserConfig {
  /** Whether to run in headless mode */
  headless?: boolean;
  /** Whether to disable security features */
  disableSecurity?: boolean;
  /** Path to Chrome instance */
  chromeInstancePath?: string | null;
  /** Additional Chromium arguments */
  extraChromiumArgs?: string[];
  /** WebSocket URL for remote debugging */
  wssUrl?: string | null;
  /** Chrome DevTools Protocol URL */
  cdpUrl?: string | null;
}

/**
 * Chrome arguments for disabling security
 */
const disableSecurityArgs = [
  '--disable-web-security',
  '--disable-site-isolation-trials',
  '--disable-features=IsolateOrigins,site-per-process',
];

/**
 * Sets up a browser instance based on the provided configuration
 * @param config - Browser configuration
 * @returns Browser instance
 */
export async function setupBrowser(
  config: BrowserConfig,
): Promise<PlaywrightBrowser> {
  if (config.cdpUrl) {
    return (await setupCdp(config.cdpUrl)) as PlaywrightBrowser;
  }
  if (config.wssUrl) {
    return (await setupWss(config.wssUrl)) as PlaywrightBrowser;
  }
  if (config.chromeInstancePath) {
    return (await setupBrowserWithInstance(
      config.chromeInstancePath,
      config,
    )) as PlaywrightBrowser;
  }
  return (await setupStandardBrowser(config)) as PlaywrightBrowser;
}

/**
 * Sets up a browser instance using Chrome DevTools Protocol
 * @param cdpUrl - CDP URL
 * @returns Browser instance
 */
async function setupCdp(
  cdpUrl: string,
): Promise<PlaywrightBrowser | undefined> {
  if (!cdpUrl) {
    throw new Error('CDP URL is required');
  }

  try {
    const browser = await chromium.connectOverCDP(cdpUrl);
    logger.info('CDP connection established', { url: cdpUrl });
    return browser;
  } catch (e) {
    logger.error('Failed to connect CDP', { error: e });
    throw e;
  }
}

/**
 * Sets up a browser instance using WebSocket
 * @param wssUrl - WebSocket URL
 * @returns Browser instance
 */
async function setupWss(
  wssUrl: string,
): Promise<PlaywrightBrowser | undefined> {
  if (!wssUrl) {
    throw new Error('WSS URL is required');
  }

  try {
    const browser = await chromium.connect(wssUrl);
    logger.info('WSS Connection established', { url: wssUrl });
    return browser;
  } catch (e) {
    logger.error('Failed to connect WSS', { error: e });
    throw e;
  }
}

/**
 * Sets up a browser instance using a local Chrome instance
 * @param chromeInstancePath - Path to Chrome executable
 * @param config - Browser configuration
 * @returns Browser instance
 */
async function setupBrowserWithInstance(
  chromeInstancePath: string,
  config: BrowserConfig,
): Promise<PlaywrightBrowser | null> {
  if (!chromeInstancePath) {
    throw new Error('Chrome instance path is required');
  }

  // Check if browser is already running and try to reuse it
  try {
    const response = await axios.get('http://localhost:9222/json/version', {
      timeout: 2000,
    });
    if (response.status === 200) {
      logger.info('Chrome: reusing existing instance');
      return await chromium.connectOverCDP({
        endpointURL: 'http://localhost:9222',
        timeout: 20000,
      });
    }
  } catch (error) {
    logger.info('Chrome: no existing instance found or failed to connect');
  }

  // Define the parameters
  const args: readonly string[] = [
    '--remote-debugging-port=9222',
    // '--no-first-run',
    // '--no-default-browser-check',
    // '--no-startup-window',
  ];

  // Execute the command
  logger.info(`Launching Chrome`, { path: chromeInstancePath, args: args.join(' ') });
  
  await new Promise<void>((resolve, reject) => {
    execFile(
      chromeInstancePath,
      args,
      (
        error: ExecFileException | null,
        stdout: string | Buffer,
        stderr: string | Buffer,
      ) => {
        if (error) {
          logger.error(`Error opening Chrome`, { error: error.message });
          return reject(error);
        }
        if (stderr) {
          logger.error(`Chrome stderr`, { stderr: stderr.toString() });
          return reject(new Error(stderr.toString()));
        }
        logger.info(`Chrome opened successfully`, { stdout: stdout.toString() });
        return resolve();
      },
    );

    // Resolve after a short timeout to avoid blocking
    setTimeout(resolve, 2000);
  });

  // Wait for Chrome to start
  for (let i = 0; i < 10; i++) {
    try {
      const response = await axios.get('http://localhost:9222/json/version', {
        timeout: 2000,
      });
      if (response.status === 200) {
        break;
      }
    } catch (error) {
      logger.debug('Waiting for Chrome to start...', { attempt: i + 1 });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Connect to the new instance
  try {
    return await chromium.connectOverCDP('http://localhost:9222', {
      timeout: 20000,
    });
  } catch (error) {
    logger.error(`Chrome: start failed`, { error });
    throw new Error(
      'Chrome: debug mode requires all instances to be closed first',
    );
  }
}

/**
 * Sets up a standard browser instance
 * @param config - Browser configuration
 * @returns Browser instance
 */
async function setupStandardBrowser(
  config: BrowserConfig,
): Promise<PlaywrightBrowser> {
  logger.info('Launching standard browser', { headless: config.headless });
  return await chromium.launch({
    headless: config.headless,
    args: getChromeArguments(config),
  });
}

/**
 * Gets Chrome arguments based on configuration
 * @param config - Browser configuration
 * @returns Array of Chrome arguments
 */
function getChromeArguments(config: BrowserConfig): string[] {
  return [
    '--no-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--disable-background-timer-throttling',
    '--disable-popup-blocking',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-window-activation',
    '--disable-focus-on-load',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-startup-window',
    '--window-position=0,0',
    ...(config.disableSecurity ? disableSecurityArgs : []),
    ...(config.extraChromiumArgs || []),
  ];
}
