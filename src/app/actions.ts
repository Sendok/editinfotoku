'use server';

import { generateCustomBackground as generateCustomBackgroundFlow, type GenerateCustomBackgroundInput } from '@/ai/flows/generate-custom-background';

interface AiBackgroundResult {
  imageDataUri?: string;
  error?: string;
}

export async function processImageWithAI(
  originalImageDataUri: string,
  backgroundPrompt: string
): Promise<AiBackgroundResult> {
  if (!originalImageDataUri) {
    return { error: 'Original image data is missing.' };
  }
  if (!backgroundPrompt) {
    return { error: 'Background prompt is missing.' };
  }

  try {
    const input: GenerateCustomBackgroundInput = {
      originalImageDataUri,
      backgroundPrompt,
    };
    const result = await generateCustomBackgroundFlow(input);
    return { imageDataUri: result.generatedImageDataUri };
  } catch (e: any) {
    console.error('AI processing error:', e);
    return { error: e.message || 'Failed to process image with AI.' };
  }
}
