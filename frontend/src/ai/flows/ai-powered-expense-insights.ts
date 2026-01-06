'use server';

/**
 * @fileOverview Provides AI-powered expense insights by analyzing transaction patterns,
 * detecting unusual spending, and offering category-wise insights with interactive charts.
 *
 * - aiPoweredExpenseInsights - a function that returns expense insights for a given user.
 * - AIPoweredExpenseInsightsInput - The input type for the aiPoweredExpenseInsights function.
 * - AIPoweredExpenseInsightsOutput - The return type for the aiPoweredExpenseInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPoweredExpenseInsightsInputSchema = z.object({
  transactionHistory: z.string().describe('The transaction history of the user.'),
});
export type AIPoweredExpenseInsightsInput = z.infer<typeof AIPoweredExpenseInsightsInputSchema>;

const AIPoweredExpenseInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s spending habits.'),
  unusualSpending: z.string().describe('Any unusual spending detected.'),
  categoryInsights: z.string().describe('Insights into spending by category.'),
  recommendations: z.string().describe('Recommendations for managing finances effectively.'),
});
export type AIPoweredExpenseInsightsOutput = z.infer<typeof AIPoweredExpenseInsightsOutputSchema>;

export async function aiPoweredExpenseInsights(input: AIPoweredExpenseInsightsInput): Promise<AIPoweredExpenseInsightsOutput> {
  return aiPoweredExpenseInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredExpenseInsightsPrompt',
  input: { schema: AIPoweredExpenseInsightsInputSchema },
  output: { schema: AIPoweredExpenseInsightsOutputSchema },
  prompt: `You are a personal finance advisor. Analyze the following transaction history and provide highly specific and actionable insights.
  
Transaction History: {{{transactionHistory}}}

1. **Summary**: Provide a brief, engaging summary of the user's spending habits. Mention specific frequent merchants (e.g., "You order a lot from Swiggy") or patterns.
2. **Unusual Spending**: Detect outliers or high-value transactions that deviate from the norm. Be specific about the amount and the merchant.
3. **Category Insights**: Comment on the distribution of spending. If one category is very high, point it out.
4. **Recommendations**: Give 3 concrete, actionable tips to save money based on *this specific data*. Avoid generic advice.

Structure your response to be easily understood, friendly, and helpful.`,
});

const aiPoweredExpenseInsightsFlow = ai.defineFlow(
  {
    name: 'aiPoweredExpenseInsightsFlow',
    inputSchema: AIPoweredExpenseInsightsInputSchema,
    outputSchema: AIPoweredExpenseInsightsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
