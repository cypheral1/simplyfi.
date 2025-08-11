'use server';

/**
 * @fileOverview Implements a Genkit flow to improve the quality of generated code snippets via prompt.
 *
 * - improveCodeQuality - A function that refines generated code snippets to enhance code quality, efficiency, and readability.
 * - ImproveCodeQualityInput - The input type for the improveCodeQuality function, including the code snippet and refinement instructions.
 * - ImproveCodeQualityOutput - The return type for the improveCodeQuality function, providing the improved code snippet.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ImproveCodeQualityInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to be improved.'),
  refinementInstructions: z
    .string()
    .describe('Specific instructions on how to improve the code quality, efficiency, and readability.'),
});
export type ImproveCodeQualityInput = z.infer<typeof ImproveCodeQualityInputSchema>;

const ImproveCodeQualityOutputSchema = z.object({
  improvedCodeSnippet: z
    .string()
    .describe('The improved code snippet after applying the refinement instructions.'),
});
export type ImproveCodeQualityOutput = z.infer<typeof ImproveCodeQualityOutputSchema>;

export async function improveCodeQuality(input: ImproveCodeQualityInput): Promise<ImproveCodeQualityOutput> {
  return improveCodeQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveCodeQualityPrompt',
  input: {schema: ImproveCodeQualityInputSchema},
  output: {schema: ImproveCodeQualityOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an expert code refactorer.  A user will provide you with a code snippet, along with instructions on how to improve it.  You should return the improved code snippet, following all instructions.

Original Code Snippet:
\`\`\`{{{codeSnippet}}}\`\`\`

Refinement Instructions:
{{{refinementInstructions}}}

Improved Code Snippet:`, 
});

const improveCodeQualityFlow = ai.defineFlow(
  {
    name: 'improveCodeQualityFlow',
    inputSchema: ImproveCodeQualityInputSchema,
    outputSchema: ImproveCodeQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
