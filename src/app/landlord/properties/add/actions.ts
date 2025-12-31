'use server';

import {summarizePropertyListings} from '@/ai/flows/summarize-property-listings';
import {z} from 'zod';

const summarySchema = z.object({
    propertyDescription: z.string().min(50, {
        message: "Description must be at least 50 characters long.",
    }),
});

export async function generateSummary(propertyDescription: string): Promise<{
    success: boolean,
    summary: string,
    error?: string
}> {
    const validation = summarySchema.safeParse({propertyDescription});

    if (!validation.success) {
        return {success: false, summary: '', error: validation.error.errors[0].message};
    }

    try {
        const result = await summarizePropertyListings({propertyDescription});
        return {success: true, summary: result.summary};
    } catch (e) {
        console.error(e);
        return {success: false, summary: '', error: "Failed to generate summary due to an unexpected error."};
    }
}
