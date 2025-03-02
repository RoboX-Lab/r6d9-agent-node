/**
 * Orchestrator Tests
 * 
 * This file contains tests for the Orchestrator class.
 */

import { Orchestrator } from '../../src/core/workflows/orchestrator';
import { BrowserAgent } from '../../src/core/agents/browser-agent';
import { PlannerAgent } from '../../src/core/agents/planner-agent';
import { CritiqueAgent } from '../../src/core/agents/critique-agent';

// Mock the dependencies
jest.mock('../../src/core/agents/browser-agent');
jest.mock('../../src/core/agents/planner-agent');
jest.mock('../../src/core/agents/critique-agent');

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;
  let mockBrowserAgent: jest.Mocked<BrowserAgent>;
  let mockPlannerAgent: jest.Mocked<PlannerAgent>;
  let mockCritiqueAgent: jest.Mocked<CritiqueAgent>;

  beforeEach(() => {
    // @ts-ignore - Using mocked versions
    mockBrowserAgent = new BrowserAgent() as jest.Mocked<BrowserAgent>;
    // @ts-ignore - Using mocked versions
    mockPlannerAgent = new PlannerAgent() as jest.Mocked<PlannerAgent>;
    // @ts-ignore - Using mocked versions
    mockCritiqueAgent = new CritiqueAgent() as jest.Mocked<CritiqueAgent>;
    
    // Temporarily modify the Orchestrator constructor to use our mocks
    // @ts-ignore - Override private field for testing
    Orchestrator.prototype.browserAgent = mockBrowserAgent;
    // @ts-ignore - Override private field for testing
    Orchestrator.prototype.plannerAgent = mockPlannerAgent;
    // @ts-ignore - Override private field for testing
    Orchestrator.prototype.critiqueAgent = mockCritiqueAgent;
    
    orchestrator = new Orchestrator();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should initialize correctly', () => {
    expect(orchestrator).toBeDefined();
  });

  test('should execute a workflow', async () => {
    const objective = 'Search for something on Google';
    
    // Mock the planner agent
    mockPlannerAgent.generatePlan = jest.fn().mockResolvedValue([
      'Navigate to https://google.com',
      'Type "something" into the search box',
      'Click the search button'
    ]);
    
    // Mock the browser agent
    mockBrowserAgent.navigate = jest.fn().mockResolvedValue('<html><body>Search results</body></html>');
    
    // Mock the critique agent
    mockCritiqueAgent.evaluate = jest.fn().mockResolvedValue({
      success: true,
      reason: 'Action performed successfully',
    });
    
    // Mock the workflow app's invoke method
    // @ts-ignore - Mock private property
    orchestrator.app = {
      invoke: jest.fn().mockResolvedValue({
        success: true,
        steps: [
          'Navigate to https://google.com',
          'Type "something" into the search box',
          'Click the search button'
        ],
        history: ['Step 1 completed', 'Step 2 completed', 'Step 3 completed'],
        objective: objective
      })
    };
    
    // Execute the workflow
    const result = await orchestrator.run(objective);
    
    // Verify expectations
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(3);
  });

  test('should handle errors during execution', async () => {
    const objective = 'Search for something on Google';
    
    // Mock the app to throw an error
    // @ts-ignore - Mock private property
    orchestrator.app = {
      invoke: jest.fn().mockRejectedValue(new Error('Planning error'))
    };
    
    // Execute the workflow and expect it to fail
    await expect(orchestrator.run(objective)).rejects.toThrow('Workflow execution failed: Planning error');
  });
});
