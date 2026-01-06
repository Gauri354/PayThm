'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Target, TrendingUp, Plane, Car, Home, Smartphone, Gift, Star, Zap, PartyPopper, Laptop, Shield, GraduationCap, Gem, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { SecurityPinModal } from "@/components/security-pin-modal";

const iconMap: Record<string, React.ElementType> = {
    'laptop': Laptop,
    'plane': Plane,
    'shield': Shield,
    'car': Car,
    'home': Home,
    'gift': Gift,
    'grad': GraduationCap,
    'gem': Gem
};

interface SavingsGoal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    icon: string;
    // color property removed as we'll derive it or use backend provided if extended
}

export default function SavingsPage() {
    const { toast } = useToast();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState<number | null>(null);

    // Modals & State
    const [createOpen, setCreateOpen] = useState(false);
    const [addMoneyOpen, setAddMoneyOpen] = useState(false);
    const [pinOpen, setPinOpen] = useState(false);

    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '', icon: 'gem' });

    // Fetch User & Data
    const getUserId = () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user.id || user.user?.id;
    };

    const fetchData = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const [goalsRes, balanceRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals?userId=${userId}`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/balance/${userId}`)
            ]);
            setGoals(goalsRes.data);
            setBalance(balanceRes.data);
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = getUserId();
        if (!userId) return;

        try {
            setIsProcessing(true);
            const goalData = {
                name: newGoal.name,
                targetAmount: parseFloat(newGoal.targetAmount),
                currentAmount: 0,
                deadline: newGoal.deadline,
                icon: newGoal.icon
            };
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals?userId=${userId}`, goalData);

            toast({ title: "Goal Created! 🎯", description: "Start saving now!" });
            setCreateOpen(false);
            setNewGoal({ name: '', targetAmount: '', deadline: '', icon: 'gem' });
            fetchData(); // Refresh list

            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (e) {
            toast({ variant: "destructive", title: "Failed to create goal", description: "Please try again." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddMoneyClick = (goal: SavingsGoal) => {
        setSelectedGoal(goal);
        setAmountToAdd('');
        setAddMoneyOpen(true);
    };

    const handleConfirmAmount = () => {
        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
            return;
        }
        if (balance !== null && balance < amount) {
            toast({ variant: "destructive", title: "Insufficient Funds", description: "Wallet balance is low." });
            return;
        }

        setAddMoneyOpen(false);
        setPinOpen(true);
    };

    // Actual Transaction
    const handlePinSuccess = async () => {
        setPinOpen(false);
        if (!selectedGoal || !amountToAdd) return;

        try {
            setIsProcessing(true);
            const amount = parseFloat(amountToAdd);

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${selectedGoal.id}/add-money/${amount}`);

            // Success
            toast({ title: "Money Added! 💰", description: `Added ₹${amount} to ${selectedGoal.name}` });
            fetchData(); // Refresh goals and wallet balance (KEY REQUIREMENT)

            // Check if goal reached (optimistic check)
            if (selectedGoal.currentAmount + amount >= selectedGoal.targetAmount) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#10B981', '#34D399', '#FFFF00']
                });
            }
        } catch (e: any) {
            toast({ variant: "destructive", title: "Transaction Failed", description: e.response?.data?.message || "Could not add money." });
        } finally {
            setIsProcessing(false);
            setSelectedGoal(null);
        }
    };

    const quickAdd = (amount: number) => {
        setAmountToAdd(amount.toString());
    };

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pink-600 w-10 h-10" /></div>;
    }

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <PageHeader
                    title="Dreams & Goals"
                    description="Turn your financial targets into reality."
                />

                {/* Total Summary Card (Small and embedded in header area or separate) */}
                <Card className="bg-zinc-900 dark:bg-zinc-800 text-white border-none shadow-lg py-2 px-6 flex items-center gap-6 rounded-full">
                    <div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Saved</p>
                        <p className="text-2xl font-bold">₹{goals.reduce((acc, g) => acc + g.currentAmount, 0).toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-zinc-700"></div>
                    <div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Wallet Bal</p>
                        <p className="text-xl font-bold text-zinc-300">₹{balance?.toLocaleString() || '0'}</p>
                    </div>
                </Card>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-full bg-pink-600 hover:bg-pink-700 font-bold shadow-lg shadow-pink-500/20">
                            <PlusCircle className="mr-2 h-5 w-5" /> New Dream
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Start a New Dream</DialogTitle>
                            <DialogDescription>What are you saving for?</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateGoal} className="space-y-4 py-4">
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {Object.entries(iconMap).map(([key, Icon]) => (
                                    <div key={key}
                                        onClick={() => setNewGoal({ ...newGoal, icon: key })}
                                        className={cn(
                                            "cursor-pointer h-12 flex items-center justify-center rounded-xl border transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800",
                                            newGoal.icon === key ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600" : "border-zinc-200 dark:border-zinc-700 text-zinc-500"
                                        )}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Label>Goal Name</Label>
                                <Input placeholder="e.g. Europe Trip" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Amount (₹)</Label>
                                <Input type="number" placeholder="50000" value={newGoal.targetAmount} onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Date</Label>
                                <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} required />
                            </div>
                            <Button type="submit" disabled={isProcessing} className="w-full bg-pink-600 hover:bg-pink-700">
                                {isProcessing ? <Loader2 className="animate-spin" /> : "Create Goal"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {goals.length === 0 && (
                    <div className="col-span-full h-60 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <Target className="w-10 h-10 mb-4 opacity-50" />
                        <p>No goals yet. Start dreaming big!</p>
                    </div>
                )}

                {goals.map((goal) => {
                    const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                    const isCompleted = percentage >= 100;
                    const IconComponent = iconMap[goal.icon] || Star;

                    return (
                        <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className={cn(
                                "group hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800 relative overflow-hidden",
                                isCompleted ? "bg-green-50 dark:bg-green-900/10 border-green-200" : "bg-white dark:bg-zinc-900"
                            )}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                                            <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                                        </div>
                                        {isCompleted && (
                                            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" /> DONE
                                            </div>
                                        )}
                                        {!isCompleted && (
                                            <div className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                                                {percentage}%
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4 text-xl">{goal.name}</CardTitle>
                                    <CardDescription className="text-xs font-medium">
                                        Target: ₹{goal.targetAmount.toLocaleString()} • By {goal.deadline}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm font-semibold">
                                                <span className={isCompleted ? "text-green-600" : "text-zinc-600"}>₹{goal.currentAmount.toLocaleString()}</span>
                                                <span className="text-zinc-400">₹{goal.targetAmount.toLocaleString()}</span>
                                            </div>
                                            <Progress value={percentage} className={cn("h-3 rounded-full", isCompleted ? "bg-green-100" : "bg-zinc-100")} indicatorClassName={isCompleted ? "bg-green-500" : "bg-gradient-to-r from-pink-500 to-indigo-500"} />
                                        </div>

                                        <Button
                                            variant={isCompleted ? "outline" : "default"}
                                            className={cn("w-full font-bold", isCompleted ? "text-green-600 border-green-200" : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900")}
                                            onClick={() => !isCompleted && handleAddMoneyClick(goal)}
                                            disabled={isCompleted || isProcessing}
                                        >
                                            {isCompleted ? "Goal Achieved!" : "Add Funds"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add Money Modal */}
            <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Add Money to '{selectedGoal?.name}'
                        </DialogTitle>
                        <DialogDescription>Money will be deducted from your main wallet.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="flex justify-center flex-col items-center gap-2">
                            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">₹{amountToAdd || '0'}</span>
                            <p className="text-xs text-zinc-400">Wallet Balance: ₹{balance?.toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[100, 500, 1000, 2000, 5000].map(amt => (
                                <Button key={amt} variant="outline" size="sm" onClick={() => quickAdd(amt)} className="hover:border-pink-500 hover:text-pink-600">
                                    + ₹{amt}
                                </Button>
                            ))}
                            <Input
                                type="number"
                                placeholder="Custom"
                                value={amountToAdd}
                                onChange={(e) => setAmountToAdd(e.target.value)}
                                className="col-span-1 h-9"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddMoneyOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmAmount} className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
                            <Zap className="w-4 h-4 mr-2" /> Add Money
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SecurityPinModal
                isOpen={pinOpen}
                onClose={() => setPinOpen(false)}
                onSuccess={handlePinSuccess}
                title="Authorize Savings"
                description={`Enter PIN to add ₹${amountToAdd} to ${selectedGoal?.name}`}
            />
        </div>
    );
}
