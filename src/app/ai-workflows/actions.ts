
'use server';

import { z } from 'zod';
import { executeWorkflow } from '@/ai/flows/workflow-execution-flow';

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
});

const WorkflowSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

const ExecuteWorkflowActionSchema = z.object({
  workflow: WorkflowSchema,
  prompt: z.string(),
});

export async function executeWorkflowAction(
  input: z.infer<typeof ExecuteWorkflowActionSchema>
) {
  const validatedInput = ExecuteWorkflowActionSchema.parse(input);
  try {
    const result = await executeWorkflow({
      workflow: validatedInput.workflow,
      prompt: validatedInput.prompt,
    });
    return { success: true, log: result.log };
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    return { success: false, error: error.message || 'Failed to execute workflow.' };
  }
}
