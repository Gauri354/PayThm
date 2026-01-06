import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Zap, Landmark } from "lucide-react";
import Cookies from 'js-cookie';
import axios from 'axios';

interface Transaction {
  id: number;
  amount: number;
  type: string; // 'Credit' or 'Debit'
  status: string;
  date: string;
  name: string; // Sender or Receiver name
}

export function RecentActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) { setIsLoading(false); return; }

        const user = JSON.parse(userStr);
        const userId = user.id || user.user?.id;

        if (!userId) { setIsLoading(false); return; }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/history/${userId}`);

        // Map backend data to frontend interface
        const mappedData = res.data.map((item: any) => ({
          id: item.id,
          amount: item.amount,
          type: item.type === 'CREDIT' ? 'Credit' : 'Debit', // Normalize case
          status: item.status || 'Completed',
          date: item.timestamp || new Date().toISOString(),
          name: item.message || 'Transaction'
        }));

        // Sort by date descending (newest first)
        mappedData.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Show all transactions, scrollable
        setTransactions(mappedData);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory(); // Initial fetch
    const intervalId = setInterval(fetchHistory, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  return (
    <Card className="premium-card h-full border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
              <TableRow className="hover:bg-transparent border-primary/10">
                <TableHead>Transaction</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden md:table-cell text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-75" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No recent transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="hover:bg-primary/5 transition-colors border-primary/5"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full transition-transform hover:scale-110",
                          tx.type === 'Credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
                          (tx.name.toLowerCase().includes('bill') || tx.name.toLowerCase().includes('electricity')) && 'bg-orange-100 dark:bg-orange-900/30',
                          tx.name.toLowerCase().includes('bank') && 'bg-blue-100 dark:bg-blue-900/30'
                        )}>
                          {tx.type === 'Credit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (tx.name.toLowerCase().includes('bill') || tx.name.toLowerCase().includes('electricity')) ? (
                            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          ) : tx.name.toLowerCase().includes('bank') ? (
                            <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{tx.name}</div>
                          <div className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      tx.type === 'Credit' ? 'text-green-600 dark:text-green-400' : ''
                    )}>
                      {tx.type === 'Credit' ? '+' : '-'}Rs {tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      <Badge
                        variant={
                          tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'
                        }
                        className={cn(
                          "shadow-sm",
                          tx.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200',
                          tx.status === 'Pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 hover:bg-yellow-200',
                          tx.status === 'Failed' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200',
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
