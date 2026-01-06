'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/logo";

interface SecurityPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    description?: string;
}

export function SecurityPinModal({ isOpen, onClose, onSuccess, title = "Security Verification", description = "Enter your 4-digit PIN to confirm this transaction." }: SecurityPinModalProps) {
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const { toast } = useToast();

    // Handle Countdown Timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (lockoutEnd) {
            timer = setInterval(() => {
                const left = Math.ceil((lockoutEnd - Date.now()) / 1000);
                if (left <= 0) {
                    setLockoutEnd(null);
                    setAttempts(0); // Reset attempts after lockout
                    setRemainingTime(0);
                    clearInterval(timer);
                } else {
                    setRemainingTime(left);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [lockoutEnd]);

    const handleVerify = async () => {
        if (lockoutEnd) {
            toast({
                variant: "destructive",
                title: "Locked Out",
                description: `Please wait ${remainingTime} seconds before trying again.`
            });
            return;
        }

        setIsLoading(true);

        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) throw new Error("User not found");
            const user = JSON.parse(userStr);
            const userId = user.id || user.user?.id;

            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/verify-pin`, {
                userId: userId,
                pin: pin
            });

            if (res.data === true) {
                // Success
                setIsLoading(false);
                setPin("");
                setAttempts(0); // Reset attempts on success
                onSuccess();
            } else {
                throw new Error("Invalid PIN");
            }

        } catch (error) {
            console.error("PIN Verification Error", error);
            setIsLoading(false);
            setPin("");

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 3) {
                const endTime = Date.now() + 50000; // 50 seconds
                setLockoutEnd(endTime);
                setRemainingTime(50);
                toast({
                    variant: "destructive",
                    title: "Too Many Attempts",
                    description: "You have entered the wrong PIN 3 times. Payments are disabled for 50 seconds."
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Incorrect PIN",
                    description: `Incorrect PIN. You have ${3 - newAttempts} attempts remaining.`
                });
            }
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (lockoutEnd) return; // Prevent input during lockout
        const value = e.target.value;
        if (value.length <= 4 && /^\d*$/.test(value)) {
            setPin(value);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            if (!val && lockoutEnd) {
                // Optional: Prevent closing if strictly required, but usually user can close and come back. 
                // For this request, we'll allow closing but the state is local so it might reset if component unmounts.
                // If persistence is needed across re-opens, we'd need context or localStorage. 
                // Assuming local state is sufficient for "during verification flow".
            }
            onClose();
        }}>
            <DialogContent className="sm:max-w-[400px] border-none shadow-2xl bg-white dark:bg-zinc-900 p-0 overflow-hidden">

                {/* Header Visual */}
                <div className={`p-6 flex flex-col items-center justify-center text-white space-y-2 transition-colors duration-500 ${lockoutEnd ? 'bg-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        {lockoutEnd ? <LockKeyhole className="w-8 h-8 text-white animate-pulse" /> : <ShieldCheck className="w-8 h-8 text-white" />}
                    </div>
                    <DialogTitle className="text-xl font-bold">{lockoutEnd ? "Temporarily Locked" : title}</DialogTitle>
                    <p className="text-indigo-100 text-sm text-center">
                        {lockoutEnd
                            ? `Too many failed attempts. Try again in ${remainingTime}s.`
                            : description}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="relative space-y-4">
                        <div className="flex justify-center gap-4">
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${lockoutEnd
                                    ? 'border-red-200 bg-red-50 text-red-400 opacity-50'
                                    : pin[index]
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'
                                    }`}>
                                    {pin[index] ? '•' : ''}
                                </div>
                            ))}
                        </div>

                        {/* Hidden Input for Focus Handling */}
                        <input
                            type="tel"
                            value={pin}
                            onChange={handlePinChange}
                            className="absolute opacity-0 inset-0 cursor-default"
                            autoFocus={!lockoutEnd}
                            disabled={!!lockoutEnd}
                        />

                        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                            {lockoutEnd ? (
                                <span className="text-red-500 font-bold">Payments Disabled</span>
                            ) : (
                                <>
                                    <LockKeyhole className="w-3 h-3" /> Secured by PayThm Shield
                                </>
                            )}
                        </p>
                    </div>

                    <Button
                        onClick={handleVerify}
                        className={`w-full h-11 text-base ${lockoutEnd ? 'bg-zinc-400 hover:bg-zinc-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                        disabled={pin.length !== 4 || isLoading || !!lockoutEnd}
                    >
                        {lockoutEnd ? `Wait ${remainingTime}s` : (isLoading ? "Verifying..." : "Confirm & Pay")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
