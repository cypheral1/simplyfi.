"use server";

import { conversationalCodeGeneration } from "@/ai/flows/conversational-code-flow";
import { z } from "zod";

const ConversationalCodeGenerationActionSchema = z.object({
  prompt: z.string(),
});

export async function conversationalCodeGenerationAction(input: z.infer<typeof ConversationalCodeGenerationActionSchema>) {
  const validatedInput = ConversationalCodeGenerationActionSchema.parse(input);
  try {
    const result = await conversationalCodeGeneration({ prompt: validatedInput.prompt });
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error generating code:", error);
    return { success: false, error: "Failed to generate response." };
  }
}
