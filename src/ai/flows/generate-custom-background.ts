'use server';

/**
 * @fileOverview AI flow to generate a custom background for an image after background removal.
 *
 * - generateCustomBackground - Function to generate custom backgrounds.
 * - GenerateCustomBackgroundInput - Input type for the function.
 * - GenerateCustomBackgroundOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// STEP 1: Import an image generation model from the GoogleAI plugin
import imagen3 from '@genkit-ai/googleai';

// ... (Your schema definitions remain the same) ...
const GenerateCustomBackgroundInputSchema = z.object({
  originalImageDataUri: z.object({
    url: z.string().describe('The data URI of the image'),
    mimeType: z.string().describe('The MIME type of the image')
  }).describe('The original image data with MIME type information'),
  backgroundPrompt: z.string().describe('A description of the desired custom background'),
});
export type GenerateCustomBackgroundInput = z.infer<
  typeof GenerateCustomBackgroundInputSchema
>;

const GenerateCustomBackgroundOutputSchema = z.object({
  generatedImageDataUri: z
    .string()
    .describe('The generated image data URI with the custom background.'),
});
export type GenerateCustomBackgroundOutput = z.infer<
  typeof GenerateCustomBackgroundOutputSchema
>;


const generateCustomBackgroundPrompt = ai.definePrompt({
  name: 'generateCustomBackgroundPrompt',
  input: {schema: GenerateCustomBackgroundInputSchema},
  output: {schema: GenerateCustomBackgroundOutputSchema},
  prompt: [
    {media: {
      url: '{{{originalImageDataUri.url}}}',
      contentType: '{{{originalImageDataUri.mimeType}}}'
    }},
    {
      text: 'Generate a new image using the object in the provided image, but with a new background as described: {{{backgroundPrompt}}}.'
    },
  ],
  config: {
    // STEP 2: Explicitly tell Genkit to use the Imagen model for this prompt
    model: imagen3,
    responseModalities: ["TEXT", "IMAGE"],
  },
});

const generateCustomBackgroundFlow = ai.defineFlow(
  {
    name: 'generateCustomBackgroundFlow',
    inputSchema: GenerateCustomBackgroundInputSchema,
    outputSchema: GenerateCustomBackgroundOutputSchema,
  },
  async input => {
    const dataUri = input.originalImageDataUri.url;
    const mimeType = dataUri.split(';')[0].split(':')[1];
    
    const result = await generateCustomBackgroundPrompt({
      backgroundPrompt: input.backgroundPrompt,
      originalImageDataUri: {
        url: dataUri,
        mimeType: mimeType
      }
    });

    if (!result.media) {
      throw new Error('No media returned from AI generation');
    }

    return { generatedImageDataUri: result.media.url };
  }
);

// Update the main function to match the new input structure
export async function generateCustomBackground(
  input: { originalImageDataUri: string; backgroundPrompt: string }
): Promise<GenerateCustomBackgroundOutput> {
  const dataUri = input.originalImageDataUri;
  const mimeType = dataUri.split(';')[0].split(':')[1];

  return generateCustomBackgroundFlow({
    backgroundPrompt: input.backgroundPrompt,
    originalImageDataUri: {
      url: dataUri,
      mimeType: mimeType
    }
  });
}
