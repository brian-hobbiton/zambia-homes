'use server';

/**
 * @fileOverview Summarizes property listings using AI to highlight key features and benefits for tenants.
 *
 * - summarizePropertyListings - A function that takes a property listing description and returns a concise summary.
 * - SummarizePropertyListingsInput - The input type for the summarizePropertyListings function.
 * - SummarizePropertyListingsOutput - The return type for the summarizePropertyListings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePropertyListingsInputSchema = z.object({
  propertyDescription: z
    .string()
    .describe('The full description of the property listing.'),
});
export type SummarizePropertyListingsInput = z.infer<
  typeof SummarizePropertyListingsInputSchema
>;

const SummarizePropertyListingsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the property listing, highlighting key features and benefits.'
    ),
});
export type SummarizePropertyListingsOutput = z.infer<
  typeof SummarizePropertyListingsOutputSchema
>;

export async function summarizePropertyListings(
  input: SummarizePropertyListingsInput
): Promise<SummarizePropertyListingsOutput> {
  return summarizePropertyListingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePropertyListingsPrompt',
  input: {schema: SummarizePropertyListingsInputSchema},
  output: {schema: SummarizePropertyListingsOutputSchema},
  prompt: `You are an expert real estate summarizer. Create a concise summary of the following property listing, highlighting key features and benefits for potential tenants.\n\nProperty Listing:\n{{{propertyDescription}}}`,
});

const summarizePropertyListingsFlow = ai.defineFlow(
  {
    name: 'summarizePropertyListingsFlow',
    inputSchema: SummarizePropertyListingsInputSchema,
    outputSchema: SummarizePropertyListingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
