'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Phone, Landmark, Check, Loader2, Search, Zap, History, CreditCard, Plus } from "lucide-react"; // Icons
import Cookies from "js-cookie"; // Keep if needed, though mostly using localStorage in logic
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SecurityPinModal } from "@/components/security-pin-modal";

// --- Types ---
type PaymentMode = 'paythm' | 'upi' | 'bank';

// --- Utils ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-xl rounded-[2rem] overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Main Page Component ---
export default function SendMoneyPage() {
  const router = useRouter();
  const { toast } = useToast();

  // 1. State: Payment Data
  const [recipient, setRecipient] = useState(""); // Shared for PayThm/UPI
  const [amount, setAmount] = useState("");

  // Bank Specific State
  const [bankAcc, setBankAcc] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");

  // UI State
  const [mode, setMode] = useState<PaymentMode>('paythm');
  const [isLoading, setIsLoading] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // 2. Load Initial Data (URL Params)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  useEffect(() => {
    const initAmount = searchParams?.get('amount');
    const initRecip = searchParams?.get('recipientId');
    const initMode = searchParams?.get('mode');

    const isAuto = searchParams?.get('auto') === 'true';

    if (initAmount) setAmount(initAmount);
    if (initRecip) setRecipient(initRecip);
    if (initMode === 'bank') setMode('bank');
    else if (initRecip && initRecip.includes('@') && !initRecip.endsWith('@paythm')) setMode('upi');

    // Auto-trigger PIN if all details are present
    if (initAmount && initRecip) {
      // Small delay to ensure state is set
      setTimeout(() => {
        // Only auto-open if 'auto' flag is set or implies intent
        if (isAuto) {
          setIsPinModalOpen(true);
          // Set pending action based on mode (calculated from current params since state might lag slightly in this sync block if we didn't use refs, but init vars are safe)
          if (initRecip.includes('@') && !initRecip.endsWith('@paythm')) {
            setPendingAction(() => handleSendUpi);
          } else {
            setPendingAction(() => handleSendPaythm);
          }
        }
      }, 500);
    }
  }, []);

  // 3. API Handlers
  const getUserData = () => {
    const str = localStorage.getItem("user");
    if (!str) throw new Error("User not found");
    return JSON.parse(str);
  };

  const handleSendPaythm = async () => {
    setIsLoading(true);
    try {
      const user = getUserData();
      const senderId = user.id || user.user?.id;
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send/${senderId}/${recipient}/${amount}`);
      toast({ title: "Transfer Successful! 🎉", description: `Sent ₹${amount} to ${recipient}` });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transfer Failed", description: e.response?.data || "Check details." });
    } finally { setIsLoading(false); }
  };

  const handleSendUpi = async () => {
    setIsLoading(true);
    try {
      const user = getUserData();
      const senderId = user.id || user.user?.id;
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-upi`, {
        senderId: Number(senderId),
        upiId: recipient,
        amount: parseFloat(amount),
      });
      toast({ title: "UPI Payment Successful! 🚀", description: `Sent ₹${amount} to ${recipient}` });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "UPI Failed", description: e.response?.data || "Check UPI ID." });
    } finally { setIsLoading(false); }
  };

  const handleSendBank = async () => {
    setIsLoading(true);
    try {
      const user = getUserData();
      const senderId = user.id || user.user?.id;
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-bank`, {
        senderId: Number(senderId),
        accountNumber: bankAcc,
        ifsc: bankIfsc,
        recipientName: bankName,
        amount: parseFloat(amount),
      });
      toast({ title: "Bank Transfer Successful! 🏦", description: `Sent ₹${amount} to ${bankName}` });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Bank Transfer Failed", description: e.response?.data || "Check details." });
    } finally { setIsLoading(false); }
  };

  // 4. Verification & Submission Flow
  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }

    if (mode === 'paythm' || mode === 'upi') {
      if (!recipient) {
        toast({ variant: "destructive", title: "Missing Recipient", description: "Please enter a phone number, ID, or UPI ID." });
        return;
      }
      setPendingAction(() => mode === 'paythm' ? handleSendPaythm : handleSendUpi);
    }
    else if (mode === 'bank') {
      if (!bankAcc || !bankIfsc || !bankName) {
        toast({ variant: "destructive", title: "Missing Details", description: "All bank fields are required." });
        return;
      }
      setPendingAction(() => handleSendBank);
    }

    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // 5. Shared Quick Contacts
  const QUICK_CONTACTS = [
    { name: "Rahul", id: "Rahul", initials: "RV", color: "bg-indigo-100 text-indigo-600" },
    { name: "Mom", id: "9876543210", initials: "M", color: "bg-pink-100 text-pink-600" },
    { name: "Priya", id: "Priya", initials: "PS", color: "bg-purple-100 text-purple-600" },
    { name: "Shop", id: "shop@paythm.com", initials: "S", color: "bg-blue-100 text-blue-600" },
  ];

  const handleContactSelect = (contact: any) => {
    setAmount("");
    setBankAcc(""); setBankIfsc(""); setBankName("");

    if (contact.id.includes("@") && !contact.id.endsWith("@paythm")) {
      setMode('upi');
      setRecipient(contact.id);
    } else {
      setMode('paythm');
      setRecipient(contact.id);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#F2F4F7] dark:bg-black p-4 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Main Payment Interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="mb-2">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Send Money</h1>
            <p className="text-zinc-500 font-medium">Fast, secure payments to anyone.</p>
          </div>


          {/* Main Form Card */}
          <GlassCard className="p-6 lg:p-8 min-h-[300px] flex flex-col justify-center relative">

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 w-full max-w-lg mx-auto"
              >
                {/* 1. Recipient Input */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    {mode === 'paythm' ? 'Send To' : 'Enter UPI ID'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      {mode === 'paythm' ? <Search className="w-5 h-5 text-zinc-400" /> : <Zap className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <Input
                      autoFocus
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        // Auto switch mode based on input
                        if (e.target.value.includes("@") && !e.target.value.endsWith("@paythm")) {
                          setMode('upi');
                        } else {
                          setMode('paythm');
                        }
                      }}
                      placeholder="Name, Phone, or UPI ID"
                      className="h-14 pl-12 text-lg bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium transition-all"
                    />
                  </div>
                  {/* Mode Indicator */}
                  <div className="flex justify-end px-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${mode === 'paythm' ? 'text-indigo-500' : 'text-pink-500'}`}>
                      Mode: {mode === 'paythm' ? 'PayThm / Contact' : 'UPI Payment'}
                    </span>
                  </div>

                  {mode === 'paythm' && (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none pt-2">
                      {QUICK_CONTACTS.map((c, i) => (
                        <div key={i} onClick={() => handleContactSelect(c)} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 pl-2 pr-5 py-2 rounded-full cursor-pointer hover:border-indigo-500 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md transition-all whitespace-nowrap group">
                          <div className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center text-sm font-bold shadow-sm`}>{c.initials}</div>
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Amount Input (Refined) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Amount</label>
                  <div className="relative flex items-center px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-indigo-500 transition-all h-16">
                    <span className="text-2xl font-bold text-zinc-400 mr-2">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full h-full text-3xl font-bold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-zinc-200"
                    />
                  </div>
                </div>

                {/* 3. Action Button */}
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01]"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Proceed to Pay"}
                </Button>

              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* RIGHT COLUMN: Quick Contacts & Recents */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="mb-2 lg:mt-0 mt-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Quick Pay</h2>
          </div>

          {/* Horizontal Scroll avatars */}
          <GlassCard className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {QUICK_CONTACTS.map((contact, i) => (
                <div key={i} onClick={() => handleContactSelect(contact)} className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className={`w-16 h-16 rounded-full ${contact.color} flex items-center justify-center text-xl font-bold ring-2 ring-transparent group-hover:ring-indigo-500 transition-all shadow-sm scale-100 group-hover:scale-105`}>
                    {contact.initials}
                  </div>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 transition-colors">{contact.name}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700 border-2 border-dashed border-zinc-300 dark:border-zinc-600 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-indigo-600 transition-colors">Add New</span>
              </div>
            </div>
          </GlassCard>

          <div className="mb-2 mt-8">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Recent Transactions</h2>
          </div>

          <GlassCard className="p-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Paid to Store</p>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">Yesterday • 10:30 AM</p>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">-₹450.00</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Promo Card */}
          <div className="relative rounded-[2rem] overflow-hidden p-6 text-white shadow-xl cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600" />
            <div className="absolute top-0 right-0 p-16 bg-white/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />

            <div className="relative z-10">
              <CreditCard className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-lg font-bold leading-tight mb-1">Get PayThm Card</h3>
              <p className="text-sm opacity-80 mb-4">5% Cashback on all spends.</p>
              <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                Apply Now <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="Authorize Payment"
        description="Enter your 4-digit security PIN to proceed."
      />
    </div>
  );
}
