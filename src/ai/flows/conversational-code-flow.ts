'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating code snippets from natural language prompts in a conversational manner.
 *
 * - conversationalCodeGeneration - A function that takes a natural language prompt and returns a friendly response containing the generated code.
 * - ConversationalCodeGenerationInput - The input type for the conversationalCodeGeneration function.
 * - ConversationalCodeGenerationOutput - The return type for the conversationalCodeGeneration function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ConversationalCodeGenerationInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt describing the desired code snippet.'),
});
export type ConversationalCodeGenerationInput = z.infer<typeof ConversationalCodeGenerationInputSchema>;

const ConversationalCodeGenerationOutputSchema = z.object({
  response: z.string().describe('A friendly, conversational response that includes the generated code snippet as a markdown block.'),
});
export type ConversationalCodeGenerationOutput = z.infer<typeof ConversationalCodeGenerationOutputSchema>;

export async function conversationalCodeGeneration(input: ConversationalCodeGenerationInput): Promise<ConversationalCodeGenerationOutput> {
  return conversationalCodeGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalCodeGenerationPrompt',
  input: {schema: ConversationalCodeGenerationInputSchema},
  output: {schema: ConversationalCodeGenerationOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are a friendly and helpful AI code assistant. Your goal is to generate code based on the user's prompt and explain it in a conversational way.

You can generate code in any programming language the user asks for.

Always wrap the generated code in a markdown block with the correct language identifier (e.g., \`\`\`javascript).

Respond in a friendly, conversational tone. For example, if the user asks for a Python function, you could say: "Of course! Here is a Python function that does what you asked for:" followed by the code block and a brief explanation.

User Prompt:
{{{prompt}}}`,
});

const conversationalCodeGenerationFlow = ai.defineFlow(
  {
    name: 'conversationalCodeGenerationFlow',
    inputSchema: ConversationalCodeGenerationInputSchema,
    outputSchema: ConversationalCodeGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
