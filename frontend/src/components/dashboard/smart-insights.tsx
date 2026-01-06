"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Brain, TrendingUp, TrendingDown, AlertCircle, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";

interface Transaction {
    id: number;
    amount: number;
    type: "CREDIT" | "DEBIT";
    message: string;
    timestamp?: string;
}

export function SmartInsights() {
    const [insight, setInsight] = useState("Initializing PayThm AI Neural Engine...");
    const [analyzing, setAnalyzing] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [stats, setStats] = useState({ spent: 0, received: 0, txCount: 0 });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const id = user.id || user.user?.id;
                setUserId(id);
            } catch (e) {
                console.error("User parse error", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!userId) return;

        const analyzeFinances = async () => {
            setAnalyzing(true);
            try {
                // Call Backend AI Engine
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/insights/${userId}`);
                const data = res.data;

                // Update Stats
                setStats({
                    spent: data.totalSpent,
                    received: data.totalReceived,
                    txCount: 0 // Backend doesn't return count yet, maybe ignore or add to DTO later. For now 0 is fine or we hide it.
                });

                // Update Insight Text
                if (data.aiSuggestions && data.aiSuggestions.length > 0) {
                    // Pick a random one from the server suggestions
                    const randomInsight = data.aiSuggestions[Math.floor(Math.random() * data.aiSuggestions.length)];
                    setInsight(randomInsight);
                } else {
                    setInsight("Financial patterns stable. Continue transacting to generate deeper insights.");
                }

                setAnalyzing(false);

            } catch (error) {
                console.error("AI Analysis Failed", error);
                setInsight("Unable to connect to Neural Core. Please try again later.");
                setAnalyzing(false);
            }
        };

        analyzeFinances();
    }, [userId]);

    return (
        <Card className="border sm:border-zinc-200 sm:dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden">
            {/* Abstract tech background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            PayThm Neural Engine
                        </CardTitle>
                        <p className="text-xs text-zinc-500 font-medium">Real-time Financial Observation</p>
                    </div>
                </div>
                {analyzing ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Observing...</span>
                    </div>
                ) : (
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => setUserId(prev => prev ? Number(prev) : null)}>
                        Refresh Analysis
                    </Button>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                <div className="min-h-[80px] p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 flex items-start gap-4">
                    {analyzing ? (
                        <div className="space-y-3 w-full animate-pulse">
                            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4 items-start"
                        >
                            <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {insight}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Micro Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20">
                        <div className="p-1.5 rounded-md bg-red-50 text-red-600">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Observed Outflow</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">₹{stats.spent.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20">
                        <div className="p-1.5 rounded-md bg-green-50 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Net Reserve</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">₹{(stats.received - stats.spent).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
