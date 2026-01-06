'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface CategorySpendChartProps {
  data: { category: string; amount: number }[];
}

const chartConfig = {
  amount: {
    label: 'Amount (Rs)',
    color: 'hsl(var(--primary))',
  },
};

export function CategorySpendChart({ data }: CategorySpendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -20, top: 10, right: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `Rs ${value}`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="amount"
            type="monotone"
            fill="var(--color-amount)"
            fillOpacity={0.4}
            stroke="var(--color-amount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
