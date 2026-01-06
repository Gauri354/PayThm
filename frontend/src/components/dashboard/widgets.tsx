'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, RefreshCcw, Briefcase, Calculator, DollarSign, TrendingUp, QrCode, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";

// --- Types ---
export interface Widget {
    id: string;
    title: string;
    width: 'half' | 'full'; // 'half' = 1 col, 'full' = 2 col
    component: React.ReactNode;
}

interface Stock {
    symbol: string;
    price: number;
    change: number; // storing percentage here for UI compatibility
    isUp: boolean;
}

// --- 1. Market Watch Widget ---
export function MarketWatchWidget() {
    const [stocks, setStocks] = useState<Stock[]>([
        { symbol: "NIFTY 50", price: 21456.30, change: 0.45, isUp: true },
        { symbol: "SENSEX", price: 71345.80, change: 0.32, isUp: true },
        { symbol: "PAYTHM", price: 890.50, change: -1.2, isUp: false },
        { symbol: "BITCOIN", price: 3450000, change: 2.1, isUp: true },
    ]);

    useEffect(() => {
        const fetchMarket = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/market/live`);
                if (res.data && Array.isArray(res.data)) {
                    setStocks(res.data.map((item: any) => ({
                        symbol: item.symbol,
                        price: item.price,
                        change: item.changePercent, // Map changePercent to change for UI
                        isUp: item.isUp // backend provides this
                    })));
                }
            } catch (e) {
                console.error("Failed to fetch market data", e);
            }
        };

        fetchMarket(); // Initial fetch
        const interval = setInterval(fetchMarket, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="h-full border border-zinc-200 dark:border-white/10 shadow-lg bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Watch</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {stocks.map((stock) => (
                        <div key={stock.symbol} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-full", stock.isUp ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400")}>
                                    {stock.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                </div>
                                <span className="font-bold text-sm">{stock.symbol}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold">₹{stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                <div className={cn("text-xs font-medium", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                                    {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- 2. Currency Converter Widget ---
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// --- 2. Currency Converter Widget ---
export function CurrencyConverterWidget() {
    const [inr, setInr] = useState("1000");
    const [targetCurrency, setTargetCurrency] = useState("USD");
    const [convertedVal, setConvertedVal] = useState("");

    const CURRENCIES: Record<string, { rate: number, symbol: string, name: string }> = {
        USD: { rate: 83.5, symbol: "$", name: "US Dollar" },
        EUR: { rate: 90.2, symbol: "€", name: "Euro" },
        GBP: { rate: 106.1, symbol: "£", name: "British Pound" },
        JPY: { rate: 0.58, symbol: "¥", name: "Japanese Yen" },
        AED: { rate: 22.7, symbol: "د.إ", name: "UAE Dirham" },
        CAD: { rate: 61.5, symbol: "C$", name: "Canadian Dollar" },
        AUD: { rate: 54.8, symbol: "A$", name: "Australian Dollar" },
    };

    const current = CURRENCIES[targetCurrency];

    useEffect(() => {
        const val = parseFloat(inr);
        if (!isNaN(val)) {
            // INR / Rate = Target Currency Value
            // Example: 83.5 INR = 1 USD -> 1000 / 83.5 = 11.97
            setConvertedVal((val / current.rate).toFixed(2));
        } else {
            setConvertedVal("");
        }
    }, [inr, targetCurrency]);

    return (
        <Card className="h-full border border-zinc-200 dark:border-white/10 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900/50 dark:to-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Currency Converter</CardTitle>
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Indian Rupee (INR)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm font-bold">₹</span>
                        <Input
                            type="number"
                            value={inr}
                            onChange={(e) => setInr(e.target.value)}
                            className="pl-8 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="bg-white dark:bg-zinc-800 p-1 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-700">
                        <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">{current.name} ({targetCurrency})</label>
                        <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                            <SelectTrigger className="h-6 w-[80px] text-xs bg-white/50 dark:bg-zinc-800/50 border-none shadow-none">
                                <SelectValue placeholder="USD" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(CURRENCIES).map((curr) => (
                                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm font-bold">{current.symbol}</span>
                        <Input
                            value={convertedVal}
                            readOnly
                            className="pl-10 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground">1 {targetCurrency} ≈ ₹{current.rate}</p>
            </CardContent>
        </Card>
    );
}

// --- 3. Split Calculator Widget ---
// --- 3. Split Calculator Widget ---
import { SecurityPinModal } from "@/components/security-pin-modal";
import { useToast } from "@/hooks/use-toast";

export function SplitBillWidget() {
    const [amount, setAmount] = useState("2500");
    const [people, setPeople] = useState("4");
    const [receiverId, setReceiverId] = useState("");
    const [isPinOpen, setIsPinOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    const perPerson = (parseFloat(amount) / (parseInt(people) || 1)).toFixed(0);

    const handleSplitPay = () => {
        if (!receiverId) return;
        setIsPinOpen(true);
    };

    const handlePaymentSuccess = async () => {
        setIsPinOpen(false);
        setIsProcessing(true);
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) throw new Error("User not found");
            const user = JSON.parse(userStr);
            const senderId = user.id || user.user?.id;

            // We use 'send-upi' endpoint because it handles generic PayThm IDs, Phone numbers, and proper UPI IDs gracefully.
            // The widget input is "receiverId", which could be any of these.
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-upi`, {
                senderId: Number(senderId),
                upiId: receiverId, // handles 'user@paythm' or '9876543210'
                amount: parseFloat(perPerson)
            });

            toast({
                title: "Payment Successful! 🎉",
                description: `Paid your share of ₹${perPerson} to ${receiverId}`,
                className: "bg-green-500 text-white border-none"
            });

            setReceiverId("");
            setAmount("0");

        } catch (e: any) {
            console.error(e);
            toast({ variant: "destructive", title: "Payment Failed", description: e.response?.data || "Check ID and Balance." });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Card className="h-full border border-zinc-200 dark:border-white/10 shadow-lg bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Split & Pay</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Total Bill</label>
                            <Input className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">People</label>
                            <Input className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" value={people} onChange={(e) => setPeople(e.target.value)} type="number" />
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-zinc-800/50 border border-indigo-100 dark:border-indigo-500/20 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase">Per Person</span>
                        <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{perPerson}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <label className="text-xs font-medium text-muted-foreground">Collect via PayThm ID</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="user@paythm"
                                className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
                                value={receiverId}
                                onChange={(e) => setReceiverId(e.target.value)}
                            />
                            <Button size="icon" variant="outline" className="shrink-0 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800" onClick={() => router.push('/scan-qr')}>
                                <QrCode className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSplitPay} disabled={!receiverId || isProcessing}>
                            {isProcessing ? "Processing..." : "Request / Pay"} <Send className="ml-2 w-3 h-3" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <SecurityPinModal
                isOpen={isPinOpen}
                onClose={() => setIsPinOpen(false)}
                onSuccess={handlePaymentSuccess}
                title="Authorize Split Payment"
                description={`Enter PIN to send ₹${perPerson} to ${receiverId}`}
            />
        </>
    );
}

// --- Widget Registry ---
export const AVAILABLE_WIDGETS = [
    { id: 'market', title: 'Market Watch', component: <MarketWatchWidget />, icon: TrendingUp },
    { id: 'currency', title: 'Currency Converter', component: <CurrencyConverterWidget />, icon: DollarSign },
    { id: 'split', title: 'Split Calculator', component: <SplitBillWidget />, icon: Calculator },
];
