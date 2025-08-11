"use server";

import { generateCode } from "@/ai/flows/generate-code-from-prompt";
import { z } from "zod";

const GenerateCodeActionSchema = z.object({
  prompt: z.string(),
  language: z.string(),
});

export async function generateCodeAction(input: z.infer<typeof GenerateCodeActionSchema>) {
  const validatedInput = GenerateCodeActionSchema.parse(input);

  const fullPrompt = `Generate a ${validatedInput.language} code snippet based on the following prompt. The code should be complete and runnable. Only output the raw code, without any markdown fences or explanations.\n\nPrompt: ${validatedInput.prompt}`;

  try {
    const result = await generateCode({ prompt: fullPrompt });
    return { success: true, code: result.code };
  } catch (error) {
    console.error("Error generating code:", error);
    return { success: false, error: "Failed to generate code." };
  }
}
