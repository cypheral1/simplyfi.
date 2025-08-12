'use server';

import { executeWorkflow } from '@/ai/flows/workflow-execution-flow';
import type { Node, Edge } from 'reactflow';
import { z } from 'zod';

const ExecuteWorkflowActionSchema = z.object({
  prompt: z.string(),
  nodes: z.any(), // ReactFlow nodes are complex, skipping full zod validation for now
  edges: z.any(),
});

export async function executeWorkflowAction(input: {
  prompt: string;
  nodes: Node[];
  edges: Edge[];
}) {
  try {
    const validatedInput = ExecuteWorkflowActionSchema.parse(input);
    const result = await executeWorkflow({
      prompt: validatedInput.prompt,
      nodes: validatedInput.nodes,
      edges: validatedInput.edges,
    });
    return { success: true, ...result };
  } catch (error) {
    console.error('Error executing workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
