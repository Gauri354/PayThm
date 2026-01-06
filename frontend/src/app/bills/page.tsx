'use client';

export const dynamic = 'force-dynamic';
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Zap, Droplet, Flame, Wifi, Smartphone, Tv, Car, CreditCard, Shield, Landmark, History, Search } from "lucide-react";
import { motion } from "framer-motion";

// Enhanced Categories with Specific Icons
const categories = [
  {
    title: "Utilities",
    items: [
      { id: "electricity", name: "Electricity", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
      { id: "water", name: "Water", icon: Droplet, color: "text-blue-500", bg: "bg-blue-500/10" },
      { id: "gas", name: "Piped Gas", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
      { id: "broadband", name: "Broadband", icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ]
  },
  {
    title: "Recharge",
    items: [
      { id: "mobile", name: "Mobile", icon: Smartphone, color: "text-indigo-500", bg: "bg-indigo-500/10" },
      { id: "dth", name: "DTH / Cable", icon: Tv, color: "text-pink-500", bg: "bg-pink-500/10" },
      { id: "fastag", name: "FASTag", icon: Car, color: "text-violet-500", bg: "bg-violet-500/10" },
    ]
  },
  {
    title: "Finance",
    items: [
      { id: "credit_card", name: "Credit Card", icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10" },
      { id: "insurance", name: "Insurance", icon: Shield, color: "text-cyan-500", bg: "bg-cyan-500/10" },
      { id: "loan", name: "Loan Repayment", icon: Landmark, color: "text-teal-500", bg: "bg-teal-500/10" },
    ]
  }
];

const recentBills = [
  { id: 1, name: "Jio Fiber", date: "Due in 3 days", amount: "₹999", icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 2, name: "Bescom", date: "Due 15 Jul", amount: "₹2,450", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: 3, name: "Airtel", date: "Due Today", amount: "₹499", icon: Smartphone, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

export default function BillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getFieldDetails = (id: string) => {
    switch (id) {
      case 'mobile': return { label: "Mobile Number", placeholder: "9876543210", type: "tel" };
      case 'electricity': return { label: "Consumer Number", placeholder: "10000001234", type: "text" };
      case 'dth': return { label: "Subscriber ID", placeholder: "1234567890", type: "text" };
      case 'gas': return { label: "Customer ID", placeholder: "500000123", type: "text" };
      case 'broadband': return { label: "Account Number", placeholder: "1122334455", type: "text" };
      default: return { label: "Consumer ID", placeholder: "ID123456", type: "text" };
    }
  };

  const fieldDetails = selectedCategory ? getFieldDetails(selectedCategory.id) : { label: "", placeholder: "", type: "text" };

  const handlePay = async () => {
    if (!amount || parseFloat(amount) <= 0 || !identifier) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Please check details." });
      return;
    }
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not found");
      const user = JSON.parse(userStr);
      const senderId = user.id || user.user?.id;

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-upi`, {
        senderId: Number(senderId),
        upiId: `${selectedCategory.name} - ${identifier}`,
        amount: parseFloat(amount),
      });

      toast({ title: "Bill Paid Successfully!", description: `Paid ₹${amount} to ${selectedCategory.name}.` });
      setSelectedCategory(null);
      setAmount("");
      setIdentifier("");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Bill Payment Error:", error);
      toast({ variant: "destructive", title: "Payment Failed", description: error.response?.data || "Insufficient balance or server error." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Bill Payments"
          description="Manage and pay your utilities securely."
        />
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input placeholder="Search billers..." className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full" />
        </div>
      </div>

      {/* Recent Bills Carousel */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          <History className="w-4 h-4" /> Recent Due
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentBills.map((bill) => (
            <div key={bill.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setSelectedCategory({ id: 'quick_pay', name: bill.name });
              setAmount(bill.amount.replace('₹', '').replace(',', ''));
              setIdentifier("88888888"); // Mock ID
            }}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bill.bg} ${bill.color}`}>
                  <bill.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{bill.name}</h4>
                  <p className="text-xs text-red-500 font-medium">{bill.date}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50">Pay {bill.amount}</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Sections */}
      {categories.map((section) => (
        <section key={section.title} className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white px-1 border-l-4 border-indigo-500 pl-3">{section.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {section.items.map((item) => (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} key={item.id}>
                <Card
                  className="border-none shadow-sm hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-zinc-900 overflow-hidden relative group"
                  onClick={() => setSelectedCategory(item)}
                >
                  <div className={`absolute top-0 right-0 p-8 ${item.bg} rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`} />
                  <CardContent className="flex flex-col items-center justify-center gap-3 p-6 relative z-10">
                    <div className={`p-4 rounded-full ${item.bg} ${item.color} mb-1 group-hover:ring-2 ring-offset-2 ring-${item.color.split('-')[1]}-200 transition-all`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {/* Payment Dialog */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className={`w-12 h-12 rounded-full ${selectedCategory?.bg || 'bg-zinc-100'} ${selectedCategory?.color || 'text-zinc-600'} flex items-center justify-center mb-2 mx-auto`}>
              {selectedCategory?.icon ? <selectedCategory.icon className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <DialogTitle className="text-center text-xl">Pay {selectedCategory?.name}</DialogTitle>
            <DialogDescription className="text-center">Enter your details to fetch the bill.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier" className="text-zinc-500">
                {fieldDetails.label}
              </Label>
              <Input
                id="identifier"
                type={fieldDetails.type}
                placeholder={fieldDetails.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-12 text-lg bg-zinc-50 dark:bg-zinc-900"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-zinc-500">Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-zinc-400 font-bold text-lg">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-12 text-lg font-bold bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePay} disabled={isLoading} className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
              {isLoading ? "Processing..." : `Pay ₹${amount || '0'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
