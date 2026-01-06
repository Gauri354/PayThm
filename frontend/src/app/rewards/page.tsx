'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Zap, TrendingUp, Calendar, ShoppingBag, Coffee, Ticket, Percent, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import confetti from 'canvas-confetti';
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

// Mock Deals Data
const deals = [
    { id: 1, title: "50% Off at Starbucks", desc: "Get flat 50% discount on coffee orders above ₹300.", code: "COFFEE50", color: "bg-green-100 text-green-700", icon: Coffee },
    { id: 2, title: "Buy 1 Get 1 Movie Ticket", desc: "Valid on BookMyShow for weekend shows.", code: "MOVIEBZ", color: "bg-red-100 text-red-700", icon: Ticket },
    { id: 3, title: "Flat ₹100 Off on Electricity", desc: "Valid on bill payments above ₹500.", code: "POWER100", color: "bg-yellow-100 text-yellow-700", icon: Zap },
    { id: 4, title: "₹50 Cashback on Recharge", desc: "Get ₹50 cashback on prepaid recharges of ₹199+.", code: "TALK50", color: "bg-blue-100 text-blue-700", icon: Smartphone },
    { id: 5, title: "10% Off on Rent Payment", desc: "Max discount ₹500 using PayThm UPI.", code: "RENT10", color: "bg-purple-100 text-purple-700", icon: Home },
    { id: 6, title: "Free 3GB Data Voucher", desc: "Applicable on Jio and Airtel plans.", code: "DATA3GB", color: "bg-pink-100 text-pink-700", icon: Wifi },
];

function UtensilsIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    )
}

function Smartphone(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
}
function Home(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function Wifi(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
}


export default function RewardsPage() {
    const [transactionCount, setTransactionCount] = useState(0);
    const [festivalBonus, setFestivalBonus] = useState(false);
    const [revealedReward, setRevealedReward] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch user stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userId = user.id || user.user?.id;
                    if (userId) {
                        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/history/${userId}`);
                        setTransactionCount(res.data.length);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch history for rewards", error);
            }
        };
        fetchStats();

        // Simple festival check logic (e.g., if today is a holiday)
        const checkFestival = () => {
            // Mocking a festival day for demo
            setFestivalBonus(true);
        };
        checkFestival();
    }, []);

    // Logic to control scratch card availability
    const isScratchUnlocked = transactionCount > 0 && transactionCount % 5 === 0;
    const statsNeeded = 5 - (transactionCount % 5);

    const handleScratch = async () => {
        if (revealedReward) return;

        if (!isScratchUnlocked) {
            toast({
                title: "Locked! 🔒",
                description: `Make ${statsNeeded} more transaction${statsNeeded > 1 ? 's' : ''} to unlock this card.`,
                variant: "destructive"
            });
            return;
        }

        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF4500']
        });

        // Use more beneficial rewards
        const rewards = [
            "₹50 Cashback",
            "₹100 Electricity Bill Voucher",
            "₹25 Mobile Recharge Cashback",
            "₹10 Cashback",
            "50 PayThm Coins",
            "₹500 Flight Discount",
            "Free Movie Ticket",
            "₹200 Grocery Coupon"
        ];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        setRevealedReward(reward);

        if (reward.includes("Cashback") || reward.includes("Voucher") || reward.includes("Discount") || reward.includes("Coupon") || reward.includes("Ticket")) {
            // Here we could technically call the API to add money
            // For safety in this demo, we'll just show a toast
            toast({
                title: "Congratulations! 🎉",
                description: `${reward} has been unlocked!`
            });
        } else if (reward.includes("Coins")) {
            toast({
                title: "Coins Added! 🪙",
                description: "You earned 50 Loyalty Coins."
            });
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast({ title: "Copied!", description: `Coupon code ${code} copied to clipboard.` });
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto">
            <PageHeader
                title="Rewards & Deals"
                description="Earn cashback, unlock deals, and celebrate festivals with PayThm."
            />

            {/* Festival Banner */}
            {festivalBonus && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-1 rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-xl"
                >
                    <div className="bg-white dark:bg-zinc-950 rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="z-10 flex items-center gap-4">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                                <Gift className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                                    Festival Bonanza is Live!
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    Get <span className="font-bold text-orange-600">2x Cashback</span> on every transaction today.
                                </p>
                            </div>
                        </div>

                        <Button className="z-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 shadow-lg shadow-orange-500/20" onClick={() => toast({ title: "Bonus Applied!", description: "2x Cashback active for next 24 hours." })}>
                            Claim Bonus
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Daily Streak & Scratch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="premium-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="fill-yellow-300 text-yellow-300" /> Payment Streak
                        </CardTitle>
                        <CardDescription className="text-indigo-100">
                            Complete 5 transactions to unlock a Mega Scratch Card.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                            <span>{transactionCount % 5} / 5 txns</span>
                            <span>Next Reward</span>
                        </div>
                        <Progress value={(transactionCount % 5) * 20} className="h-3 bg-indigo-800/50" indicatorClassName="bg-yellow-300" />
                        <p className="mt-4 text-xs bg-white/10 p-2 rounded-lg inline-block">
                            💡 Total Transactions: {transactionCount}
                        </p>
                    </CardContent>
                </Card>

                <Card className="premium-card relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 z-0" />
                    <CardHeader className="relative z-10">
                        <CardTitle>Mystery Scratch Card</CardTitle>
                        <CardDescription>
                            {isScratchUnlocked
                                ? "You have a reward waiting!"
                                : `Complete ${statsNeeded} more transaction${statsNeeded > 1 ? 's' : ''} to unlock.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex items-center justify-center p-6">
                        <motion.div
                            whileHover={isScratchUnlocked ? { scale: 1.05 } : {}}
                            whileTap={isScratchUnlocked ? { scale: 0.95 } : {}}
                            onClick={handleScratch}
                            className={cn(
                                "w-full h-32 rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-lg select-none",
                                revealedReward
                                    ? "bg-white dark:bg-zinc-800 text-green-600 border-2 border-green-500 border-dashed"
                                    : (isScratchUnlocked
                                        ? "bg-gradient-to-r from-purple-400 to-pink-500 cursor-pointer text-white"
                                        : "bg-zinc-200 dark:bg-zinc-800 cursor-not-allowed text-zinc-400")
                            )}
                        >
                            {revealedReward ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-2 text-lg">
                                    {revealedReward} 🎉
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {isScratchUnlocked ? (
                                        <>
                                            <SparklesIcon className="w-8 h-8 mb-2 animate-pulse" />
                                            <span>Click to Scratch!</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 mb-2 border-2 border-zinc-400 rounded-full flex items-center justify-center">
                                                <span className="text-xl">🔒</span>
                                            </div>
                                            <span>Locked</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </CardContent>
                </Card>
            </div>

            {/* Exclusive Deals */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-indigo-500" /> Exclusive Deals For You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deals.map((deal) => (
                        <Card key={deal.id} className="hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between border border-zinc-200 dark:border-zinc-800/50">
                            <CardHeader className="pb-2">
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", deal.color)}>
                                    <deal.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-base">{deal.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground pb-2 flex-grow">
                                {deal.desc}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 justify-between group/btn"
                                    onClick={() => handleCopyCode(deal.code)}
                                >
                                    <span className="font-mono font-bold tracking-widest">{deal.code}</span>
                                    {copiedCode === deal.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover/btn:text-zinc-600" />}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M5 10v4" /><path d="M9 10v4" /></svg>
    )
}
