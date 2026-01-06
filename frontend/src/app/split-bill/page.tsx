'use client';

import { useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Users, Receipt, ArrowUpRight, Check, X, User, ArrowRight, Share2, Wallet, Banknote, Calculator, QrCode, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Types
import { BillSplit } from "@/lib/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SecurityPinModal } from "@/components/security-pin-modal";


// --- Mock Data ---
const mockSplits: BillSplit[] = [
  // Keeping mock data for structure
  {
    id: 's1', description: 'Dinner at Punjab Grill', totalAmount: 4500, date: '2024-07-20', status: 'Pending',
    participants: [{ name: 'You', amount: 1500, status: 'Paid' }, { name: 'Rahul', amount: 1500, status: 'Unpaid' }, { name: 'Priya', amount: 1500, status: 'Unpaid' }]
  },
  {
    id: 's2', description: 'Uber Attempt', totalAmount: 450, date: '2024-07-22', status: 'Settled',
    participants: [{ name: 'You', amount: 225, status: 'Paid' }, { name: 'Amit', amount: 225, status: 'Paid' }]
  }
];

// --- Utils ---
const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-xl transition-all duration-300 hover:shadow-2xl ${className}`}
  >
    {children}
  </div>
);

// --- Component ---
export default function SplitBillPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [splits, setSplits] = useState<BillSplit[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<BillSplit | null>(null);

  // Security Pin
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);


  // Form State
  const [newDesc, setNewDesc] = useState("");
  const [newTotal, setNewTotal] = useState("");
  const [newFriend, setNewFriend] = useState("");
  const [newPeople, setNewPeople] = useState("2");
  const [newFriendId, setNewFriendId] = useState("");

  const handleModalRequest = () => {
    if (!newFriendId) return;
    const amountPerPerson = (parseFloat(newTotal) / (parseInt(newPeople) || 1)).toFixed(0);
    router.push(`/send-money?amount=${amountPerPerson}&to=${newFriendId}`);
  }

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const uid = user.id || user.user?.id;
        setUserId(uid);
        if (uid) {
          const stored = localStorage.getItem(`paythm_splits_${uid}`);
          setSplits(stored ? JSON.parse(stored) : mockSplits);
        }
      } catch (e) {
        setSplits(mockSplits);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const saveSplits = (newSplits: BillSplit[]) => {
    setSplits(newSplits);
    if (userId) localStorage.setItem(`paythm_splits_${userId}`, JSON.stringify(newSplits));
  };


  const executeAddSplit = async () => {
    const total = parseFloat(newTotal);
    const people = parseInt(newPeople) || 2;
    const share = total / people;

    const split: BillSplit = {
      id: `split-${Date.now()}`,
      description: newDesc,
      totalAmount: total,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      participants: [
        { name: 'You', amount: share * (people - 1), status: 'Paid' },
        { name: newFriend || 'Friend', amount: share, status: 'Unpaid' }
      ]
    };

    saveSplits([split, ...splits]);
    setIsAddOpen(false);
    setNewDesc(""); setNewTotal(""); setNewFriend(""); setNewPeople("2"); setNewFriendId("");
    toast({ title: "Split Created! 💸", description: `Recorded split of ₹${total}` });
  }

  const handleInitiateAddSplit = () => {
    if (!userId) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to track splits." });
      return;
    }
    const total = parseFloat(newTotal);
    if (!total || total <= 0) return;

    setPendingAction(() => executeAddSplit);
    setIsPinModalOpen(true);
  };


  const executeSettle = async () => {
    if (!selectedSplit || !userId) return;
    setIsLoading(true);
    try {
      const share = selectedSplit.participants.find(p => p.name !== 'You')?.amount || 0;
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/add/${userId}/${share}`);

      const updated = splits.map(s => s.id === selectedSplit.id ? { ...s, status: 'Settled' as const } : s);
      saveSplits(updated);

      setIsSettleOpen(false);
      setSelectedSplit(null);
      toast({ title: "Settled & Received! 💰", description: `₹${share} added to your wallet.` });
      router.refresh();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update wallet." });
    } finally { setIsLoading(false); }
  };

  const handleInitiateSettle = () => {
    setPendingAction(() => executeSettle);
    setIsSettleOpen(false); // Close confirmation modal first
    setIsPinModalOpen(true);
  }

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }

  const totalOwed = splits.filter(s => s.status === 'Pending').reduce((acc, split) => {
    const unpaid = split.participants.filter(p => p.name !== 'You' && p.status === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);
    return acc + unpaid;
  }, 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F2F4F7] dark:bg-black p-6 lg:p-10 font-sans flex justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Header & Main Card */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">Split Bills</h1>
              <p className="text-zinc-500 font-medium">Split expenses with friends easily.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 shadow-lg text-base font-bold">
              <Plus className="mr-2 w-5 h-5" /> New Expense
            </Button>
          </motion.div>

          {/* Expenses List */}
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-400 text-sm uppercase tracking-wider pl-2">Recent Activity</h3>
            <AnimatePresence>
              {splits.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-6 h-6 text-zinc-400" />
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">No expenses yet</h3>
                  <p className="text-zinc-500 text-sm mt-1">Add a bill to start splitting.</p>
                </motion.div>
              ) : (
                splits.map((split) => (
                  <motion.div key={split.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <GlassCard className="p-0 border-l-4 border-l-indigo-500">
                      <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {split.description.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight">{split.description}</h4>
                            <p className="text-zinc-500 text-xs font-medium mt-1 flex items-center gap-1">
                              Paid by You • {split.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Bill</p>
                            <p className="font-bold text-zinc-900 dark:text-white">₹{split.totalAmount}</p>
                          </div>
                          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                          <div className="text-right min-w-[80px]">
                            {split.status === 'Pending' ? (
                              <div className="flex flex-col items-end">
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">You lent</p>
                                <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">₹{
                                  (split.participants.find(p => p.status === 'Unpaid')?.amount || 0).toFixed(0)
                                }</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1">Settled</span>
                                <p className="font-bold text-zinc-400 line-through text-sm">₹{
                                  (split.participants.find(p => p.name !== 'You')?.amount || 0).toFixed(0)
                                }</p>
                              </div>
                            )}
                          </div>

                          {split.status === 'Pending' && (
                            <Button size="icon" className="rounded-full h-10 w-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" onClick={() => { setSelectedSplit(split); setIsSettleOpen(true); }}>
                              <Check className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Summary & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white min-h-[300px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] translate-x-10 -translate-y-10" />
            <div className="relative z-10">
              <h3 className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
                Total Receivables <ArrowUpRight className="w-4 h-4" />
              </h3>
              <h2 className="text-5xl font-black tracking-tight mb-8">₹{totalOwed.toLocaleString('en-IN')}</h2>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase opacity-70">Active Splits</span>
                    <Users className="w-4 h-4 opacity-70" />
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[60%] rounded-full" />
                  </div>
                  <p className="text-xs mt-2 opacity-80">{splits.filter(s => s.status === 'Pending').length} Pending payments</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-600 border-none backdrop-blur-md">
                <Share2 className="w-4 h-4 mr-2" /> Remind
              </Button>
              <Button variant="default" className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 font-bold">
                Details
              </Button>
            </div>
          </GlassCard>

          {/* Cleaned up: Removed Quick Split Widget from sidebar as per request */}

          <GlassCard className="p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
              <Banknote className="w-5 h-5 text-green-500" /> Quick Settle
            </h4>
            <div className="space-y-3">
              {['Rahul', 'Priya', 'Amit'].map(name => (
                <div key={name} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-zinc-200">
                      <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`} />
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm">{name}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-green-600">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add Split Modal - ENHANCED with Features */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-6 text-center border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold">Add New Expense</h2>
            <p className="text-zinc-500 text-sm">Split a bill equally with a friend.</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Description</label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="e.g. Dinner, Uber" className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Total Bill</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">₹</span>
                    <Input type="number" value={newTotal} onChange={(e) => setNewTotal(e.target.value)} placeholder="0" className="h-12 pl-8 font-bold bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">People</label>
                  <Input type="number" value={newPeople} onChange={(e) => setNewPeople(e.target.value)} className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl flex justify-between items-center border border-indigo-100 dark:border-indigo-500/20">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Per Person</span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">₹{((parseFloat(newTotal) || 0) / (parseInt(newPeople) || 1)).toFixed(0)}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Friend Details</label>
                <Input value={newFriend} onChange={(e) => setNewFriend(e.target.value)} placeholder="Name (for Record)" className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="PayThm ID (Optional)"
                    className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-sm h-12 rounded-xl"
                    value={newFriendId}
                    onChange={(e) => setNewFriendId(e.target.value)}
                  />
                  <Button size="icon" type="button" variant="outline" className="shrink-0 h-12 w-12 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800" onClick={() => router.push('/scan-qr')}>
                    <QrCode className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleInitiateAddSplit} className="h-14 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                Save Split
              </Button>
              <Button onClick={handleModalRequest} disabled={!newFriendId} className="h-14 rounded-xl text-lg font-bold bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50">
                Request <Send className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Settle Modal */}
      <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
        <DialogContent className="sm:max-w-sm rounded-[2.5rem] text-center p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-pulse">
            <Wallet className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Money Received?</h2>
          <p className="text-zinc-500 mb-6 px-4">
            Confirm that you received <span className="font-bold text-zinc-900 dark:text-white">₹{(selectedSplit?.totalAmount ? selectedSplit.totalAmount / 2 : 0).toFixed(0)}</span> from your friend.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800" onClick={() => setIsSettleOpen(false)}>Cancel</Button>
            <Button onClick={handleInitiateSettle} className="h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="Authorize Split"
        description="Enter your 4-digit security PIN to confirm."
      />

    </div>
  );
}
