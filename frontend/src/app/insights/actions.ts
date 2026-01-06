'use server';

import { aiPoweredExpenseInsights } from '@/ai/flows/ai-powered-expense-insights';
import { transactions } from '@/lib/data';

export async function getAIInsights(transactionHistory: string) {
  try {
    const insights = await aiPoweredExpenseInsights({ transactionHistory });
    return insights;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    // Returning a structured error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to generate AI insights: ${errorMessage}` };
  }
}
