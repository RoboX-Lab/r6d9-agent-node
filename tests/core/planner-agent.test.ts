/**
 * Planner Agent Tests
 * 
 * This file contains tests for the PlannerAgent class.
 */

import { PlannerAgent } from '../../src/core/agents/planner-agent';

describe('PlannerAgent', () => {
  let plannerAgent: PlannerAgent;

  beforeEach(() => {
    // Mock OpenAI environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
    plannerAgent = new PlannerAgent();
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  test('should initialize correctly', () => {
    expect(plannerAgent).toBeDefined();
  });

  test('should generate a plan', async () => {
    // Mock LangChain chat invoke
    const mockResponse = {
      plan: ['Step 1: Visit example.com', 'Step 2: Click a button'],
      next_step: 'Step 1: Visit example.com'
    };
    
    // @ts-ignore - Mocking private methods
    plannerAgent.chain = {
      invoke: jest.fn().mockResolvedValue(mockResponse)
    };
    
    const objective = 'Visit example.com and click a button';
    const result = await plannerAgent.invoke(objective);
    
    expect(result).toBeDefined();
    expect(result.plan).toHaveLength(2);
    expect(result.plan[0]).toBe('Step 1: Visit example.com');
    expect(result.plan[1]).toBe('Step 2: Click a button');
    expect(result.next_step).toBe('Step 1: Visit example.com');
  });

  test('should handle errors during plan generation', async () => {
    // @ts-ignore - Mocking private methods
    plannerAgent.chain = {
      invoke: jest.fn().mockRejectedValue(new Error('API Error'))
    };
    
    const objective = 'Visit example.com and click a button';
    
    await expect(plannerAgent.invoke(objective)).rejects.toThrow();
  });
  
  test('should use run method properly', async () => {
    // Mock LangChain chat invoke (via invoke)
    const mockResponse = {
      plan: ['Step 1: Visit example.com', 'Step 2: Click a button'],
      next_step: 'Step 1: Visit example.com'
    };
    
    // Spy on invoke method
    jest.spyOn(plannerAgent, 'invoke').mockResolvedValue(mockResponse);
    
    const objective = 'Visit example.com and click a button';
    const result = await plannerAgent.run(objective);
    
    expect(result).toBeDefined();
    expect(result).toEqual(mockResponse);
    expect(plannerAgent.invoke).toHaveBeenCalledWith(objective, '', '');
  });
});
