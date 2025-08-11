
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const SaveComponentSchema = z.object({
  componentName: z.string().min(1),
  code: z.string().min(1),
});

export async function saveComponentToFile(input: z.infer<typeof SaveComponentSchema>) {
  try {
    const validatedInput = SaveComponentSchema.parse(input);
    const { componentName, code } = validatedInput;

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
      throw new Error('Component name must be in PascalCase.');
    }

    const dirPath = path.join(process.cwd(), 'src', 'components', 'generated');
    await fs.mkdir(dirPath, { recursive: true });
    
    const filePath = path.join(dirPath, `${componentName}.tsx`);
    
    await fs.writeFile(filePath, code, 'utf-8');

    const relativePath = path.relative(process.cwd(), filePath);

    return { success: true, path: relativePath };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return { success: false, error: "Invalid input." };
    }
    return { success: false, error: error.message || 'Failed to save component.' };
  }
}
