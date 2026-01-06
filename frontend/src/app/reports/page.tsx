'use client';

import React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { transactions } from '@/lib/data';
import { Download } from 'lucide-react';
import axios from 'axios';

/**
 * Reports page – displays a table of recent transactions and allows the user to
 * export the data as a CSV file. The UI follows the premium design language used
 * throughout the app (gradient cards, subtle shadows, smooth hover effects).
 */
export default function ReportsPage() {
    const [realTransactions, setRealTransactions] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) return;
                const user = JSON.parse(userStr);
                const userId = user.id || user.user?.id;
                if (!userId) return;

                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/history/${userId}`);
                // Map to UI format
                const mapped = res.data.map((item: any) => ({
                    id: item.id,
                    date: item.timestamp || new Date().toISOString(),
                    name: item.message || "Transaction",
                    type: item.type,
                    amount: item.amount,
                    status: item.status || "Completed",
                    category: "General" // Backend doesn't have category yet
                }));
                // Sort descending
                mapped.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setRealTransactions(mapped);
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        };
        fetchHistory();
    }, []);

    // Export all transactions to a CSV file
    const exportTransactionsToCSV = () => {
        const header = ['ID', 'Date', 'Name', 'Type', 'Amount', 'Status', 'Category'];
        const rows = realTransactions.map(t => [
            t.id,
            new Date(t.date).toLocaleString(),
            t.name,
            t.type,
            t.amount,
            t.status,
            t.category,
        ]);
        const csvContent = [header, ...rows]
            .map(row => row.join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transactions_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 fade-in">
            <PageHeader
                title="Transaction Report"
                description="Review your recent activity and export it for bookkeeping."
            />

            <Card className="premium-card bg-gradient-to-br from-background to-primary/5 shadow-lg slide-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-2xl font-semibold">Recent Transactions</CardTitle>
                    <Button onClick={exportTransactionsToCSV} variant="outline" className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Date</th>
                                <th className="px-4 py-2 text-left font-medium">Name</th>
                                <th className="px-4 py-2 text-left font-medium">Type</th>
                                <th className="px-4 py-2 text-right font-medium">Amount (Rs)</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {realTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No transactions found.</td>
                                </tr>
                            ) : (
                                realTransactions.map((tx: any) => (
                                    <tr key={tx.id} className="border-b border-muted/20 hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-2 text-sm text-muted-foreground">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium">{tx.name}</td>
                                        <td className="px-4 py-2 text-sm capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-2 text-sm text-right font-medium ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'} {tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm">{tx.status}</td>
                                        <td className="px-4 py-2 text-sm text-muted-foreground">{tx.category}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
