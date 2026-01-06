import { PageHeader } from "@/components/page-header";
import { InsightsDisplay } from "./insights-display";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AI-Powered Expense Insights"
        description="Analyze your spending habits and get smart recommendations."
      />
      <InsightsDisplay />
    </div>
  );
}
