'use server';
/**
 * @fileOverview A Genkit flow for executing dynamic AI workflows.
 * 
 * - executeWorkflow - A function that takes a workflow definition and executes it.
 * - WorkflowExecutionInput - The input type for the executeWorkflow function.
 * - WorkflowExecutionOutput - The return type for the executeWorkflow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Node, Edge } from 'reactflow';

const NodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.any(),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional(),
});

const WorkflowExecutionInputSchema = z.object({
  prompt: z.string().describe('The initial user prompt for the workflow.'),
  nodes: z.array(NodeSchema).describe('The nodes of the workflow graph.'),
  edges: z.array(EdgeSchema).describe('The edges connecting the workflow nodes.'),
});
export type WorkflowExecutionInput = z.infer<typeof WorkflowExecutionInputSchema>;

const WorkflowExecutionOutputSchema = z.object({
  result: z.string().describe('The final result of the workflow execution.'),
  log: z.array(z.string()).describe('A log of the execution steps.'),
});
export type WorkflowExecutionOutput = z.infer<typeof WorkflowExecutionOutputSchema>;

export async function executeWorkflow(input: WorkflowExecutionInput): Promise<WorkflowExecutionOutput> {
  return executeWorkflowFlow(input);
}

// A simple sequential runner.
// A more advanced version would handle parallel execution, branching, etc.
const runWorkflow = async (nodes: Node[], edges: Edge[], initialPrompt: string) => {
    const log: string[] = [];
    let currentData = initialPrompt;

    // A very basic topological sort based on the assumption of a simple chain.
    const sortedNodes = [];
    let currentNodeId = edges.length > 0 ? edges[0].source : nodes[0]?.id;

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edgeMap = new Map(edges.map(e => [e.source, e]));
    
    while(currentNodeId && sortedNodes.length < nodes.length) {
        const node = nodeMap.get(currentNodeId);
        if (node) {
            sortedNodes.push(node);
            const nextEdge = edgeMap.get(currentNodeId);
            currentNodeId = nextEdge ? nextEdge.target : '';
        } else {
            break;
        }
    }

    log.push(`Starting workflow with prompt: "${currentData}"`);
    log.push(`Execution order: ${sortedNodes.map(n => n.data.label).join(' -> ')}`);
    
    for (const node of sortedNodes) {
        log.push(`Executing node: ${node.data.label} (${node.data.agentType})`);
        
        // This is a placeholder for actual agent execution.
        // In a real scenario, you would call other Genkit flows or tools here.
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        currentData = `Result from ${node.data.label} processing: "${currentData}"`;
        log.push(`Node ${node.data.label} completed.`);
    }

    log.push('Workflow finished.');
    return { result: currentData, log };
}


const executeWorkflowFlow = ai.defineFlow(
  {
    name: 'executeWorkflowFlow',
    inputSchema: WorkflowExecutionInputSchema,
    outputSchema: WorkflowExecutionOutputSchema,
  },
  async (input) => {
    const { nodes, edges, prompt } = input;
    const { result, log } = await runWorkflow(nodes, edges, prompt);
    return { result, log };
  }
);
