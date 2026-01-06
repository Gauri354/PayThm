'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Loader2, ArrowLeft, History, Check } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SecurityPinModal } from "@/components/security-pin-modal";

// Utils
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-xl rounded-[2rem] overflow-hidden ${className}`}>
        {children}
    </div>
);

export default function BankTransferPage() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [amount, setAmount] = useState("");
    const [bankAcc, setBankAcc] = useState("");
    const [bankIfsc, setBankIfsc] = useState("");
    const [bankName, setBankName] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Initial Verification
    const handleSubmit = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
            return;
        }
        if (!bankAcc || !bankIfsc || !bankName) {
            toast({ variant: "destructive", title: "Missing Details", description: "All bank fields are required." });
            return;
        }
        setIsPinModalOpen(true);
    };

    // Final Action
    const handleTransfer = async () => {
        setIsPinModalOpen(false);
        setIsLoading(true);
        try {
            const str = localStorage.getItem("user");
            if (!str) throw new Error("User not found");
            const user = JSON.parse(str);
            const senderId = user.id || user.user?.id;

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-bank`, {
                senderId: Number(senderId),
                accountNumber: bankAcc,
                ifsc: bankIfsc,
                recipientName: bankName,
                amount: parseFloat(amount),
            });

            toast({
                title: "Transfer Successful! 🏦",
                description: `₹${amount} sent to ${bankName}`,
                className: "bg-green-500 text-white border-none"
            });

            // Delay to show success state?
            setTimeout(() => router.push("/dashboard"), 1000);

        } catch (e: any) {
            console.error(e);
            toast({ variant: "destructive", title: "Transfer Failed", description: e.response?.data || "Check details and try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F7] dark:bg-black p-4 lg:p-8 flex items-center justify-center font-sans">
            <div className="w-full max-w-2xl space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white dark:hover:bg-zinc-800">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            <Landmark className="w-8 h-8 text-blue-600" /> Bank Transfer
                        </h1>
                        <p className="text-zinc-500 font-medium">Send money directly to any bank account.</p>
                    </div>
                </div>

                <GlassCard className="p-8 relative overflow-hidden">
                    {/* Background Blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

                    <div className="space-y-6 relative z-10">

                        {/* 1. Account Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Recipient Details</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500">Account Number</label>
                                    <Input
                                        value={bankAcc}
                                        onChange={(e) => setBankAcc(e.target.value)}
                                        className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-blue-500 font-mono tracking-wide"
                                        placeholder="0000 0000 0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500">IFSC Code</label>
                                    <Input
                                        value={bankIfsc}
                                        onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                                        className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-blue-500 font-mono uppercase"
                                        placeholder="SBIN000...."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-500">Account Holder Name</label>
                                <Input
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-blue-500"
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

                        {/* 2. Amount */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Amount to Transfer</label>
                            <div className="relative flex items-center px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all h-20">
                                <span className="text-3xl font-black text-zinc-400 mr-2">₹</span>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full h-full text-4xl font-black bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-zinc-200"
                                />
                            </div>
                        </div>

                        {/* 3. Pay Button */}
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full h-16 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify & Transfer"}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                            <Check className="w-3 h-3 text-green-500" />
                            Secure 256-bit Encrypted Transaction
                        </div>
                    </div>
                </GlassCard>

                {/* Recent Bank Transfers (Mock) */}
                <div className="pt-4">
                    <h3 className="ml-2 mb-3 text-sm font-bold text-zinc-500 uppercase tracking-wider">Recent Transfers</h3>
                    <GlassCard className="p-0">
                        {[1].map((_, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">HDFC Bank - 8821</p>
                                        <p className="text-xs text-zinc-500">Sent to Amit Ku...</p>
                                    </div>
                                </div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">-₹5,000</span>
                            </div>
                        ))}
                    </GlassCard>
                </div>

            </div>

            <SecurityPinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleTransfer}
                title="Confirm Transfer"
                description={`Sending ₹${amount} to ${bankName}`}
            />
        </div>
    );
}
