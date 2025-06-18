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

const GenerateCustomBackgroundInputSchema = z.object({
  originalImageDataUri: z
    .string()
    .describe(
      'The original image data URI with the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  backgroundPrompt: z
    .string()
    .describe('A description of the desired custom background.'),
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

export async function generateCustomBackground(
  input: GenerateCustomBackgroundInput
): Promise<GenerateCustomBackgroundOutput> {
  return generateCustomBackgroundFlow(input);
}

const generateCustomBackgroundPrompt = ai.definePrompt({
  name: 'generateCustomBackgroundPrompt',
  input: {schema: GenerateCustomBackgroundInputSchema},
  output: {schema: GenerateCustomBackgroundOutputSchema},
  prompt: [
    {media: {url: '{{{originalImageDataUri}}}'}},
    {
      text:
        'Generate a new image using the object in the provided image, but with a new background as described: {{{backgroundPrompt}}}.'
    },
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const generateCustomBackgroundFlow = ai.defineFlow(
  {
    name: 'generateCustomBackgroundFlow',
    inputSchema: GenerateCustomBackgroundInputSchema,
    outputSchema: GenerateCustomBackgroundOutputSchema,
  },
  async input => {
    const {media} = await generateCustomBackgroundPrompt(input);
    return {generatedImageDataUri: media.url!};
  }
);
