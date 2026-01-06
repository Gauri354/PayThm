'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, ShoppingBag, Utensils, Car, Lightbulb, HeartPulse, MoreHorizontal, TrendingUp, AlertTriangle, Coffee, Gift, Music, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
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
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Initial Mock Data
const initialCategories = [
    { id: 1, name: "Groceries", spent: 8500, total: 15000, iconName: 'ShoppingBag', color: "#10B981" }, // Emerald
    { id: 2, name: "Dining Out", spent: 4800, total: 5000, iconName: 'Utensils', color: "#F59E0B" }, // Amber
    { id: 3, name: "Transport", spent: 2200, total: 4000, iconName: 'Car', color: "#3B82F6" }, // Blue
    { id: 4, name: "Utilities", spent: 3800, total: 4000, iconName: 'Lightbulb', color: "#EAB308" }, // Yellow
    { id: 5, name: "Entertainment", spent: 1500, total: 3000, iconName: 'Music', color: "#8B5CF6" }, // Violet
];

const iconMap: Record<string, any> = {
    ShoppingBag, Utensils, Car, Lightbulb, HeartPulse, Wallet, Coffee, Gift, Music, Shield
};

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EAB308', '#8B5CF6', '#EC4899', '#6366F1'];

export default function BudgetPage() {
    const [categories, setCategories] = useState<any[]>(initialCategories);
    const [userId, setUserId] = useState<number | null>(null);

    // Create Budget State
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newLimit, setNewLimit] = useState("");
    const [newIcon, setNewIcon] = useState("Wallet");

    // Add Expense State
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState<string>("");

    const { toast } = useToast();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.id || user.user?.id);
            // Load from local storage or backend in real app
        }
    }, []);

    const handleCreateBudget = () => {
        if (!newName || !newLimit) return;
        const newCat = {
            id: Date.now(),
            name: newName,
            spent: 0,
            total: parseFloat(newLimit),
            iconName: newIcon,
            color: COLORS[categories.length % COLORS.length]
        };
        setCategories([...categories, newCat]);
        setCreateOpen(false);
        setNewName("");
        setNewLimit("");
        toast({ title: "Budget Added", description: `${newName} added to your planner.` });
    };

    const handleAddExpense = () => {
        if (!expenseAmount || !expenseCategory) return;
        const amount = parseFloat(expenseAmount);

        const updated = categories.map(c => {
            if (c.name === expenseCategory) {
                const newSpent = c.spent + amount;
                if (newSpent <= c.total && c.spent < c.total) { // Only celebrate if staying under budget (simple logic)
                    // no confetti for spending, maybe for saving?
                }
                return { ...c, spent: newSpent };
            }
            return c;
        });

        setCategories(updated);
        setExpenseOpen(false);
        setExpenseAmount("");
        setExpenseCategory("");
        toast({ title: "Expense Logged", description: `Added ₹${amount} to ${expenseCategory}.` });
    };

    // Derived Stats
    const totalBudget = categories.reduce((acc, curr) => acc + curr.total, 0);
    const totalSpent = categories.reduce((acc, curr) => acc + curr.spent, 0);
    const remaining = totalBudget - totalSpent;
    const healthScore = Math.max(0, 100 - ((totalSpent / totalBudget) * 100));

    // Chart Data
    const chartData = categories.map(c => ({
        name: c.name,
        value: c.spent,
        color: c.color
    }));

    // Add "Remaining" slice if positive
    if (remaining > 0) {
        chartData.push({ name: "Unspent", value: remaining, color: "#e4e4e7" }); // zinc-200
    }

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <PageHeader
                    title="Smart Budget"
                    description="Master your money with intelligent tracking."
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setExpenseOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md">
                                <Wallet className="mr-2 h-4 w-4" /> New Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Category</DialogTitle>
                                <DialogDescription>What would you like to track?</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input placeholder="e.g. Gym, Netflix..." value={newName} onChange={(e) => setNewName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Limit (₹)</Label>
                                    <Input type="number" placeholder="2000" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Icon</Label>
                                    <Select value={newIcon} onValueChange={setNewIcon}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(iconMap).map(icon => (
                                                <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateBudget}>Create Planner</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Card */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                        <CardTitle>Spending Breakdown</CardTitle>
                        <CardDescription>Visual analysis of your current month expenses.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '12px', borderColor: '#f4f4f5' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Score Card */}
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-none shadow-xl rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-green-400 h-5 w-5" />
                            <span className="text-sm font-medium text-zinc-300">Financial Health</span>
                        </div>
                        <h2 className="text-5xl font-bold tracking-tighter">{healthScore.toFixed(0)}<span className="text-2xl text-zinc-500">/100</span></h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="text-zinc-400 text-sm">Spent</div>
                            <div className="text-xl font-bold">₹{totalSpent.toLocaleString()}</div>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-400 to-indigo-400 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-zinc-400 text-sm">Budget</div>
                            <div className="font-medium">₹{totalBudget.toLocaleString()}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Categories */}
            <div>
                <h3 className="text-lg font-semibold mb-4 px-1">Your Envelopes</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                        {categories.map((cat, i) => {
                            const Icon = iconMap[cat.iconName] || Wallet;
                            const percent = (cat.spent / cat.total) * 100;
                            const isOver = percent > 100;
                            const isClose = percent > 85;

                            return (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-all border-none bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 group">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div
                                                    className="p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <h4 className="font-bold text-lg mb-1">{cat.name}</h4>
                                            <div className="flex justify-between text-sm text-muted-foreground mb-3">
                                                <span>₹{cat.spent.toLocaleString()} spent</span>
                                                <span>of ₹{cat.total.toLocaleString()}</span>
                                            </div>

                                            <Progress
                                                value={Math.min(percent, 100)}
                                                className={cn("h-2.5 bg-zinc-200 dark:bg-zinc-800", isOver && "bg-red-100")}
                                                indicatorClassName={cn(isOver ? "bg-red-500" : isClose ? "bg-amber-500" : "bg-green-500")}
                                                style={{ backgroundColor: isOver ? '#fee2e2' : undefined }}
                                            />

                                            {isOver && (
                                                <div className="mt-2 flex items-center text-xs text-red-600 font-medium animate-pulse">
                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Over Budget!
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Quick Add Expense Dialog */}
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Quick Expense</DialogTitle>
                        <DialogDescription>Track it before you forget it.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input type="number" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddExpense}>Save Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
