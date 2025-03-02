/**
 * @file Orchestrator workflow
 * @description Coordinates the execution of agents in a workflow
 */

import { END, START, StateGraph } from '@langchain/langgraph';
import { BrowserAgent } from '../agents/browser-agent';
import { PlannerAgent } from '../agents/planner-agent';
import { CritiqueAgent } from '../agents/critique-agent';
import { PlanExecuteState } from '../types/agent';
import { logger } from '../utils/logger';

/**
 * Orchestrator class that manages the planning and execution workflow
 */
export class Orchestrator {
  private workflow: StateGraph<typeof PlanExecuteState>;
  private app: ReturnType<typeof this.workflow.compile>;
  private browserAgent: BrowserAgent;
  private plannerAgent: PlannerAgent;
  private critiqueAgent: CritiqueAgent;

  /**
   * Creates a new Orchestrator instance
   */
  constructor() {
    this.browserAgent = new BrowserAgent();
    this.plannerAgent = new PlannerAgent();
    this.critiqueAgent = new CritiqueAgent();
    
    // Create workflow graph
    this.workflow = new StateGraph(PlanExecuteState);
    
    // Add planning node
    this.workflow.addNode(
      'plan',
      async (
        state: typeof PlanExecuteState.State,
      ): Promise<Partial<typeof PlanExecuteState.State>> => {
        logger.info('Planning phase', { objective: state.objective });
        state.steps = await this.plannerAgent.generatePlan(state.objective);
        logger.debug('Generated steps', { steps: state.steps });
        return { ...state, currentStep: 0 };
      },
    );
    
    // Add execution node
    this.workflow.addNode(
      'execute',
      async (
        state: typeof PlanExecuteState.State,
      ): Promise<Partial<typeof PlanExecuteState.State>> => {
        const currentStepIndex = state.currentStep || 0;
        const currentStep = state.steps?.[currentStepIndex];
        
        if (!currentStep) {
          logger.warn('No step to execute', { currentStepIndex });
          return { ...state, success: false };
        }
        
        logger.info('Executing step', { step: currentStep, index: currentStepIndex });
        
        await this.browserAgent.initialize();
        const pageContent = await this.browserAgent.navigate(currentStep);
        await this.browserAgent.close();
        
        return { 
          ...state, 
          pageContent,
          history: [...(state.history || []), pageContent],
        };
      },
    );
    
    // Add evaluation node
    this.workflow.addNode(
      'evaluate',
      async (
        state: typeof PlanExecuteState.State,
      ): Promise<Partial<typeof PlanExecuteState.State>> => {
        const currentStepIndex = state.currentStep || 0;
        const currentStep = state.steps?.[currentStepIndex];
        
        if (!currentStep) {
          logger.warn('No step to evaluate', { currentStepIndex });
          return { ...state, success: false };
        }
        
        logger.info('Evaluating step', { step: currentStep, index: currentStepIndex });
        
        const { success, reason } = await this.critiqueAgent.evaluate(
          state.objective || '',
          currentStep,
          state.pageContent || '',
        );
        
        logger.debug('Evaluation result', { success, reason });
        
        return { ...state, success };
      },
    );
    
    // Add decision node
    this.workflow.addNode(
      'decide',
      async (
        state: typeof PlanExecuteState.State,
      ): Promise<Partial<typeof PlanExecuteState.State>> => {
        const currentStepIndex = state.currentStep || 0;
        const success = state.success || false;
        
        if (!success) {
          logger.warn('Step failed, retrying with modified approach', { 
            step: state.steps?.[currentStepIndex], 
            index: currentStepIndex 
          });
          
          // In a real implementation, we could modify the approach here
          // For now, we'll just try again with the same step
          return { ...state };
        }
        
        // Move to the next step if available
        if (state.steps && currentStepIndex < state.steps.length - 1) {
          logger.info('Moving to next step', { nextIndex: currentStepIndex + 1 });
          return { ...state, currentStep: currentStepIndex + 1 };
        }
        
        // All steps completed successfully
        logger.info('All steps completed successfully');
        return { 
          ...state, 
          response: 'All steps completed successfully.' 
        };
      },
    );
    
    // Define workflow edges
    // @ts-ignore - LangGraph types can be challenging to align perfectly
    this.workflow
      .addEdge(START as any, 'plan' as any)
      .addEdge('plan' as any, 'execute' as any)
      .addEdge('execute' as any, 'evaluate' as any)
      .addEdge('evaluate' as any, 'decide' as any)
      .addConditionalEdges(
        'decide' as any,
        (state: any) => {
          const currentStepIndex = state.currentStep || 0;
          const success = state.success || false;
          
          if (!success) {
            return 'execute'; // Retry the current step
          }
          
          if (state.steps && currentStepIndex < state.steps.length - 1) {
            return 'execute'; // Execute the next step
          }
          
          return END as any; // All steps completed
        }
      );
    
    // Compile the workflow
    this.app = this.workflow.compile();
  }

  /**
   * Run the orchestrator with a specific objective
   * @param objective - The objective to accomplish
   * @returns The result of the workflow execution
   */
  async run(objective: string): Promise<typeof PlanExecuteState.State> {
    logger.info('Starting workflow', { objective });
    
    try {
      const result = await this.app.invoke({
        objective,
        steps: [],
        history: [],
        pageContent: '',
        currentUrl: '',
        currentStep: 0,
        success: false,
      });
      
      logger.info('Workflow completed', { 
        success: result.success,
        stepsExecuted: result.steps?.length
      });
      
      return result;
    } catch (error) {
      logger.error('Workflow execution failed', error);
      throw new Error(`Workflow execution failed: ${(error as Error).message}`);
    }
  }
}

/**
 * Run the orchestrator with a specific objective
 * @param objective - The objective to accomplish
 * @returns The result of the workflow execution
 */
export async function run(objective: string): Promise<typeof PlanExecuteState.State> {
  const orchestrator = new Orchestrator();
  return orchestrator.run(objective);
}
