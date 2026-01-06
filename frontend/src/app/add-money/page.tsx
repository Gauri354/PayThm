'use client';

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IndianRupee, Loader2, Wallet, CreditCard, ShieldCheck, Ticket, Check } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PaymentGatewayModal } from "@/components/payment-gateway-modal";
import { SecurityPinModal } from "@/components/security-pin-modal";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  // Security PIN State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Bank Details State
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const initialAmount = searchParams.get('amount');
      if (initialAmount) {
        setAmount(initialAmount);
      }

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user.id || user.user?.id;
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/bank-details/${userId}`)
          .then(res => {
            setBankName(res.data.bankName || "Linked Bank");
            setAccountNumber(res.data.accountNumber || "****");
          })
          .catch(err => console.error("Failed to fetch bank info", err));
      } else {
        router.push("/login");
      }
    }
  }, []);

  const handleAmountChange = (val: string) => {
    // Prevent negative inputs
    if (parseFloat(val) < 0) return;
    setAmount(val);
  };

  const handleSliderChange = (vals: number[]) => {
    setAmount(vals[0].toString());
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "PAYTHM50") {
      setPromoApplied(true);
      toast({ title: "Promo Applied!", description: "You will get ₹50 cashback on this transaction." });
    } else {
      toast({ variant: "destructive", title: "Invalid Code", description: "Try 'PAYTHM50'" });
    }
  };

  const handleInitiatePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }
    // Step 1: Verify PIN
    setIsPinModalOpen(true);
  };

  const handlePinVerified = () => {
    // Step 2: Open Gateway
    setIsPinModalOpen(false);
    setIsModalOpen(true);
  };

  const handleSuccess = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not found");
      const user = JSON.parse(userStr);
      const userId = user.id || user.user?.id;

      // Optional: Send promo info to backend if needed
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/add/${userId}/${amount}`);

      // Simulator: Deduct from Linked Bank Account
      const bankKey = `paythm_bank_balance_${userId}`;
      const currentBankBalance = parseFloat(localStorage.getItem(bankKey) || "142390");
      const newBankBalance = currentBankBalance - parseFloat(amount);
      localStorage.setItem(bankKey, newBankBalance.toString());

      toast({
        title: "Payment Successful! 🎉",
        description: `₹${amount} has been added to your wallet.`,
        className: "bg-green-600 text-white border-none"
      });

      setIsModalOpen(false);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Add Money Error:", error);
      toast({ variant: "destructive", title: "Failed to add money", description: error.response?.data || "Please try again later." });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-4xl mx-auto">
      <PageHeader
        title="Top-up Wallet"
        description="Securely add funds to your PayThm balance."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Card */}
        <div className="md:col-span-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-none shadow-2xl relative overflow-hidden bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

              <CardHeader className="relative">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-600" /> Enter Amount
                </CardTitle>
                <CardDescription>How much would you like to add?</CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 relative">
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                      <IndianRupee className="w-8 h-8" />
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="h-24 pl-14 text-6xl font-bold border-none bg-transparent shadow-none focus-visible:ring-0 placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                      autoFocus
                    />
                  </div>

                  <Slider
                    defaultValue={[0]}
                    max={20000}
                    step={100}
                    value={[parseFloat(amount || "0")]}
                    onValueChange={handleSliderChange}
                    className="py-4"
                  />

                  <div className="flex flex-wrap gap-2 justify-center">
                    {PRESET_AMOUNTS.map((val) => (
                      <Badge
                        key={val}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-200 px-4 py-2 text-sm transition-all"
                        onClick={() => setAmount(val.toString())}
                      >
                        + ₹{val.toLocaleString()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4 relative bg-zinc-50/50 dark:bg-zinc-900/50 p-6">
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/20"
                  onClick={handleInitiatePayment}
                >
                  Proceed to Pay ₹{amount || "0"}
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  <span>Secured by Razorpay. 100% Safe & Secure.</span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar / Promo */}
        <div className="md:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Top-up Amount</span>
                  <span>₹{amount || "0"}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Processing Fee</span>
                  <span>Free</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-purple-600 font-medium">
                    <span>Cashback Applied</span>
                    <span>₹50</span>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total Payable</span>
                  <span>₹{amount || "0"}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card>
              <Collapsible open={isPromoOpen} onOpenChange={setIsPromoOpen}>
                <div className="p-6">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Ticket className="w-4 h-4 text-purple-500" />
                        Have a Promo Code?
                      </div>
                      <Check className={cn("w-4 h-4 text-green-500 transition-opacity", promoApplied ? "opacity-100" : "opacity-0")} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="uppercase"
                      />
                      <Button variant="outline" onClick={handleApplyPromo} disabled={promoApplied}>Apply</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Try code <span className="font-mono text-purple-500">PAYTHM50</span></p>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </Card>
          </motion.div>
        </div>
      </div>

      <PaymentGatewayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount || "0"}
        onSuccess={handleSuccess}
        bankName={bankName}
        accountNumber={accountNumber}
      />

      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinVerified}
        title="Secure Wallet Top-up"
        description="Verify your identity to proceed with adding funds."
      />
    </div>
  );
}
