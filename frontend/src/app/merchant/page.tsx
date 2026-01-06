'use client';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { transactions, placeholderImages } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, QrCode, TrendingUp } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PageHeader } from '@/components/page-header';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function MerchantPage() {
  const merchantTransactions = transactions.filter(tx => tx.category === 'Merchant Payment');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id || user.user?.id);
    }
  }, []);

  // Use a reliable QR code API
  const qrUrl = userId ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=paythm://pay?uid=${userId}` : "";

  const handleDownloadQr = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `paythm-merchant-qr-${userId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download QR", error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AuroraBackground className="p-8">
      <motion.div
        className="flex flex-col gap-8 w-full max-w-7xl mx-auto z-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Merchant Dashboard"
            description="Manage your business payments and offers."
          />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div variants={item}>
            <Card className="premium-card border-none bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs 15,231.89</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="premium-card border-none bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.2% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="premium-card border-none bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Create Offer</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Attract more customers by creating special offers.</p>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0">
                  New Offer
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="premium-card border-none bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Here's a list of recent payments you've received.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-black/5 dark:border-b-white/5">
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchantTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-black/5 dark:hover:bg-white/5 border-b-black/5 dark:border-b-white/5">
                        <TableCell className="font-medium">{tx.name}</TableCell>
                        <TableCell className="font-semibold">Rs {tx.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={tx.status === 'Completed' ? 'default' : 'secondary'}
                            className={cn(
                              tx.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                              tx.status === 'Pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            )}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="premium-card border-none bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Your QR Code</CardTitle>
                <CardDescription>Customers can scan this to pay you.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="Merchant QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="h-[200px] w-[200px] flex items-center justify-center bg-gray-100 rounded-lg text-muted-foreground">
                      Loading QR...
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5" onClick={handleDownloadQr}>
                  Download QR
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
