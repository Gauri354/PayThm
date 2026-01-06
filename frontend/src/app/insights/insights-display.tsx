'use client';

import React, { useState, useEffect } from 'react';
import { getAIInsights } from './actions';
import type { AIPoweredExpenseInsightsOutput } from '@/ai/flows/ai-powered-expense-insights';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BotMessageSquare, Lightbulb, TrendingUp, PieChart } from 'lucide-react';
import { CategorySpendChart } from '@/components/charts/category-spend-chart';

type InsightsData = AIPoweredExpenseInsightsOutput;

function InsightCard({ title, icon: Icon, children, isLoading }: { title: string, icon: React.ElementType, children: React.ReactNode, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Icon className="size-6 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <p className="text-muted-foreground">{children}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ChartDataPoint {
  category: string;
  amount: number;
}

export function InsightsDisplay() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);

        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("User not found. Please log in.");
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        const userId = user.id || user.user?.id;

        if (!userId) {
          setError("Invalid user session.");
          setLoading(false);
          return;
        }

        // Fetch Real Transactions
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/history/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const transactions = await res.json();

        if (!transactions || transactions.length === 0) {
          setInsights({
            summary: "No transactions found yet. Start spending to get insights!",
            unusualSpending: "N/A",
            recommendations: "Make your first payment to see AI recommendations here.",
            categoryInsights: "No data available."
          });
          setLoading(false);
          return;
        }

        // Prepare History String for AI
        const historyString = transactions.map((t: any) =>
          `Date: ${t.timestamp}, Type: ${t.type}, Amount: ${t.amount}, Description: ${t.message || 'Unknown'}`
        ).join('\n');

        // Calculate Category Data for Chart (Enhanced Client-side Categorization)
        const categories: Record<string, number> = {};

        transactions.forEach((t: any) => {
          if (t.type === 'DEBIT') { // Only track spending
            let category = 'Others';
            const desc = (t.message || '').toLowerCase();

            // 1. Food & Dining
            if (desc.match(/(food|swiggy|zomato|restaurant|cafe|pizza|burger|mcdonalds|kfc|starbucks|dominos|biryani|tea|coffee|bakery|hotel)/)) {
              category = 'Food & Dining';
            }
            // 2. Groceries
            else if (desc.match(/(grocery|haryana|blinkit|zepto|instamart|bigbasket|reliance fresh|dmart|supermarket|kirana|vegetable|fruit|milk|dairy)/)) {
              category = 'Groceries';
            }
            // 3. Travel & Commute
            else if (desc.match(/(travel|uber|ola|rapido|metro|irctc|railway|train|flight|indigo|air india|vistara|makemytrip|goibibo|bus|taxi|cab|fuel|petrol|diesel|shell|hpcl|bpcl|fastag)/)) {
              category = 'Travel';
            }
            // 4. Bills & Utilities
            else if (desc.match(/(bill|electricity|water|gas|cylinder|adani|tata power|bescom|recharge|jio|airtel|vi|bsnl|dth|broadband|wifi|internet|mobile)/)) {
              category = 'Bills & Utilities';
            }
            // 5. Shopping
            else if (desc.match(/(shop|amazon|flipkart|myntra|ajio|meesho|zara|h&m|uniqlo|retail|store|mall|cloth|shoe|fashion|electronics|gadget)/)) {
              category = 'Shopping';
            }
            // 6. Entertainment
            else if (desc.match(/(movie|cinema|film|netflix|prime|hotstar|spotify|youtube|pvr|inox|bookmyshow|game|steam|playstation|entertainment|park|museum|concert)/)) {
              category = 'Entertainment';
            }
            // 7. Health & Wellness
            else if (desc.match(/(medicine|pharmacy|apollo|pharmeasy|1mg|hospital|clinic|doctor|lab|test|gym|fitness|cult|yoga|meditation|health)/)) {
              category = 'Health';
            }
            // 8. Rent & Housing
            else if (desc.match(/(rent|landlord|maintenance|housing|society|broker|flat|apartment)/)) {
              category = 'Rent';
            }
            // 9. Investment
            else if (desc.match(/(invest|zerodha|groww|upstox|coin|mutual fund|sip|stock|share|market|trading|gold|deposit|fd|rd)/)) {
              category = 'Investment';
            }
            // 10. Education
            else if (desc.match(/(fee|school|college|university|tuition|course|udemy|coursera|book|stationery|library)/)) {
              category = 'Education';
            }

            categories[category] = (categories[category] || 0) + t.amount;
          }
        });

        const chartDataArray = Object.entries(categories)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount); // Sort by highest spend

        setChartData(chartDataArray.length > 0 ? chartDataArray : [{ category: 'No Spending', amount: 0 }]);

        // Get AI Insights
        const result = await getAIInsights(historyString);
        if ('error' in result) {
          setError(result.error);
        } else {
          setInsights(result);
        }
      } catch (e: any) {
        console.error(e);
        setError('Failed to fetch insights.');
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  // ... error handling ...

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {error && (
        <div className="lg:col-span-3">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        <InsightCard title="Spending Summary" icon={BotMessageSquare} isLoading={loading}>
          {insights?.summary}
        </InsightCard>
        <InsightCard title="Unusual Spending" icon={TrendingUp} isLoading={loading}>
          {insights?.unusualSpending}
        </InsightCard>
        <InsightCard title="Recommendations" icon={Lightbulb} isLoading={loading}>
          {insights?.recommendations}
        </InsightCard>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <PieChart className="size-6 text-primary" />
            <div>
              <CardTitle>Category Insights</CardTitle>
              <CardDescription>A breakdown of your spending by category.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground text-sm">
              {loading ? <Skeleton className="h-10 w-full" /> : <p>{insights?.categoryInsights}</p>}
            </div>
            <div className="h-[300px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <CategorySpendChart data={chartData} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
