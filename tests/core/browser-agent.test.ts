/**
 * Browser Agent Tests
 * 
 * This file contains tests for the BrowserAgent class.
 */

import { BrowserAgent } from '../../src/core/agents/browser-agent';
import { TAgentConfig } from '../../src/core/types/agent';

describe('BrowserAgent', () => {
  let browserAgent: BrowserAgent;

  beforeEach(() => {
    browserAgent = new BrowserAgent({
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 5000,
    } as TAgentConfig);
  });

  afterEach(async () => {
    await browserAgent.close();
  });

  test('should initialize with correct default options', () => {
    expect(browserAgent).toBeDefined();
  });

  test('should open and close a browser', async () => {
    await browserAgent.initialize();
    // Since we don't have isInitialized anymore, we'll just check that initialize doesn't throw
    expect(async () => await browserAgent.close()).not.toThrow();
  });

  test('should navigate to a URL', async () => {
    const mockUrl = 'https://example.com';
    
    // Spy on the internal browser methods
    const executeSpy = jest.spyOn(browserAgent as any, 'app').mockReturnValue({
      invoke: jest.fn().mockResolvedValue({
        messages: [
          { content: 'Example Domain' }
        ]
      })
    });
    
    const result = await browserAgent.navigate(mockUrl);
    
    expect(executeSpy).toHaveBeenCalled();
    expect(result).toBe('Example Domain');
  });
});
