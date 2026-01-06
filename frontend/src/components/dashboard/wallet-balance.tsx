import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Eye, EyeOff } from "lucide-react";
import Cookies from 'js-cookie';
import axios from 'axios';
import { Button } from "@/components/ui/button";

export function WalletBalance() {
  const [balance, setBalance] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const userId = Cookies.get("token");

  // Poll for balance updates every 3 seconds to ensure real-time feel
  useEffect(() => {
    fetchBalance(); // Fetch immediately once
    if (userId || localStorage.getItem("user")) {
      const interval = setInterval(fetchBalance, 3000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchBalance = async () => {
    try {
      // Handle legacy cookie storage or localStorage
      let currentUserId = userId;
      if (!currentUserId || currentUserId === 'undefined') {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          currentUserId = user.id || user.user?.id;
        }
      }

      if (currentUserId) {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/balance/${currentUserId}`);
        setBalance(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  };

  return (
    <Card className="premium-card lg:col-span-1 bg-gradient-to-br from-card to-primary/5 border-primary/10 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold gradient-text mb-1">
          {isVisible ? `Rs ${balance.toLocaleString()}` : 'Rs ••••'}
        </div>
        <p className="text-xs text-muted-foreground">
          Available for payments and transfers
        </p>
      </CardContent>
    </Card>
  );
}
