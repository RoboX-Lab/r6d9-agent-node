/**
 * Critique Agent Tests
 * 
 * This file contains tests for the CritiqueAgent class.
 */

import { CritiqueAgent } from '../../src/core/agents/critique-agent';

describe('CritiqueAgent', () => {
  let critiqueAgent: CritiqueAgent;

  beforeEach(() => {
    // Mock OpenAI environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
    critiqueAgent = new CritiqueAgent();
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  test('should initialize correctly', () => {
    expect(critiqueAgent).toBeDefined();
  });

  test('should evaluate a successful step execution', async () => {
    // Mock the chain invoke method
    const mockEvaluation = {
      success: true,
      reason: 'Found the login button successfully',
    };
    
    // @ts-ignore - Mock the private chain property
    critiqueAgent.chain = {
      invoke: jest.fn().mockResolvedValue(mockEvaluation)
    };
    
    const objective = 'Log in to the website';
    const step = 'Find and click the login button';
    const pageContent = '<html><body><button id="login">Login</button></body></html>';
    
    const result = await critiqueAgent.evaluate(objective, step, pageContent);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.reason).toBe('Found the login button successfully');
  });

  test('should evaluate a failed step execution', async () => {
    // Mock the chain invoke method
    const mockEvaluation = {
      success: false,
      reason: 'Login button not found',
      suggestions: ['Look for a Sign In link instead', 'Check if the page is fully loaded']
    };
    
    // @ts-ignore - Mock the private chain property
    critiqueAgent.chain = {
      invoke: jest.fn().mockResolvedValue(mockEvaluation)
    };
    
    const objective = 'Log in to the website';
    const step = 'Find and click the login button';
    const pageContent = '<html><body><a href="/signin">Sign In</a></body></html>';
    
    const result = await critiqueAgent.evaluate(objective, step, pageContent);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.reason).toBe('Login button not found');
    expect(result.suggestions).toHaveLength(2);
  });

  test('should handle errors during evaluation', async () => {
    // @ts-ignore - Mock the private chain property
    critiqueAgent.chain = {
      invoke: jest.fn().mockRejectedValue(new Error('Chain Error'))
    };
    
    const objective = 'Log in to the website';
    const step = 'Find and click the login button';
    const pageContent = '<html><body><button id="login">Login</button></body></html>';
    
    const result = await critiqueAgent.evaluate(objective, step, pageContent);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.reason).toContain('Evaluation failed');
    expect(result.suggestions).toBeDefined();
  });
  
  test('should support invoke method as an alias for evaluate', async () => {
    // Mock the chain invoke method
    const mockEvaluation = {
      success: true,
      reason: 'Found the login button successfully',
    };
    
    // Spy on the evaluate method to verify it's called by invoke
    const evaluateSpy = jest.spyOn(critiqueAgent, 'evaluate').mockResolvedValue(mockEvaluation);
    
    const objective = 'Log in to the website';
    const step = 'Find and click the login button';
    const pageContent = '<html><body><button id="login">Login</button></body></html>';
    
    const result = await critiqueAgent.invoke(objective, step, pageContent);
    
    expect(evaluateSpy).toHaveBeenCalledWith(objective, step, pageContent);
    expect(result).toBe(mockEvaluation);
  });
  
  test('should support run method for agent interface compatibility', async () => {
    // Mock the chain invoke method
    const mockEvaluation = {
      success: true,
      reason: 'Found the login button successfully',
    };
    
    // Spy on the evaluate method to verify it's called by run
    const evaluateSpy = jest.spyOn(critiqueAgent, 'evaluate').mockResolvedValue(mockEvaluation);
    
    const objective = 'Log in to the website';
    const step = 'Find and click the login button';
    const pageContent = '<html><body><button id="login">Login</button></body></html>';
    
    const result = await critiqueAgent.run(objective, step, pageContent);
    
    expect(evaluateSpy).toHaveBeenCalledWith(objective, step, pageContent);
    expect(result).toBe(mockEvaluation);
  });
});
