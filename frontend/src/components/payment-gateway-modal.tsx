'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Landmark, Smartphone, Loader2, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: string;
    onSuccess: () => void;
    bankName?: string;
    accountNumber?: string;
}

export function PaymentGatewayModal({ isOpen, onClose, amount, onSuccess, bankName, accountNumber }: PaymentGatewayModalProps) {
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'select' | 'otp' | 'processing' | 'success'>('select');
    const [otp, setOtp] = useState("");

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('select');
            setProcessing(false);
            setOtp("");
        }
    }, [isOpen]);

    const handleRazorpayPayment = async () => {
        setProcessing(true);
        try {
            // 1. Create Order via Backend (or use Mock)
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';
            let orderData = null;

            // Try backend, fallback to mock if error (since secret might be missing)
            try {
                // Fetch User ID
                const userStr = localStorage.getItem("user");
                const userId = userStr ? (JSON.parse(userStr).id || JSON.parse(userStr).user?.id) : null;

                const res = await axios.post(`${baseUrl}/api/payment/create-order`, {
                    amount: parseFloat(amount),
                    userId: userId
                });
                orderData = res.data;
            } catch (err) {
                console.warn("Backend order creation failed, using client-side mock for demo", err);
                orderData = {
                    id: "order_" + Math.random().toString(36).substring(7),
                    amount: parseFloat(amount) * 100,
                    keyId: "rzp_test_1DP5mmOlF5G5ag" // Use public test key
                };
            }

            // 2. Initialize Razorpay Options
            const options = {
                key: orderData.keyId,
                amount: orderData.amount, // Amount in paise
                currency: "INR",
                name: "PayThm Team App",
                description: "Wallet Top-up",
                image: "https://example.com/your_logo", // You can add a logo url here
                order_id: orderData.orderId, // This comes from backend
                handler: async function (response: any) {
                    // console.log(response.razorpay_payment_id);
                    // console.log(response.razorpay_order_id);
                    // console.log(response.razorpay_signature);

                    try {
                        // Verify payment on backend
                        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';
                        await axios.post(`${baseUrl}/api/payment/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        setStep('success');
                        setTimeout(() => {
                            onSuccess();
                        }, 1500);
                    } catch (error) {
                        console.error("Verification Failed", error);
                        toast({
                            variant: "destructive",
                            title: "Payment Verification Failed",
                            description: "The payment succeeded but verification failed."
                        });
                        // Optional fallback: success anyway for demo?
                        // setStep('success'); onSuccess();
                    }
                },
                prefill: {
                    name: "Gauri Sankar", // Ideally from user context
                    email: "gauri@example.com",
                    contact: "9999999999"
                },
                notes: {
                    address: "PayThm Office"
                },
                theme: {
                    color: "#7c3aed" // Primary purple color
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast({
                    variant: "destructive",
                    title: "Payment Failed",
                    description: response.error.description
                });
            });
            rzp1.open();

            // Close the internal modal to let Razorpay take over, or keep it as background
            // We'll keep it open but maybe show "Processing" state to indicate external window
            // Actually, we can just stop processing loading state once modal opens
            setProcessing(false);

        } catch (error) {
            console.error("Razorpay Error", error);
            setProcessing(false);
            toast({
                variant: "destructive",
                title: "Failed to initiate payment",
            });
        }
    };

    const handleInitiatePayment = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setStep('otp');
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) return;
        setStep('processing');
        setProcessing(true);

        // Simulate payment processing delay (2-4 seconds)
        setTimeout(() => {
            setProcessing(false);
            setStep('success');

            // Wait a bit more on success screen before actually completing
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={processing ? undefined : onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg glass-card overflow-hidden text-foreground"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-primary/10">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-sm uppercase tracking-wide text-primary">Secure Payment Gateway</span>
                            </div>
                            <div className="font-bold text-lg">₹{parseFloat(amount).toFixed(2)}</div>
                        </div>

                        <div className="p-6 min-h-[400px]">
                            {step === 'select' && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Choose Payment Method</h3>
                                        <p className="text-muted-foreground text-sm">Select how you would like to pay</p>
                                    </div>

                                    {/* Razorpay Button */}
                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-[#3395ff] hover:bg-[#2d84e4] shadow-lg shadow-blue-500/20 mb-6 flex items-center justify-center gap-2"
                                        onClick={handleRazorpayPayment}
                                        disabled={processing}
                                    >
                                        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                                            <span className="text-[#3395ff] font-bold text-xs">R</span>
                                        </div>
                                        Pay with Razorpay
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border/50" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or Manual Simulation</span>
                                        </div>
                                    </div>

                                    <Tabs defaultValue="netbanking" className="w-full mt-6">
                                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
                                            <TabsTrigger value="netbanking">NetBanking</TabsTrigger>
                                            <TabsTrigger value="card">Card</TabsTrigger>
                                            <TabsTrigger value="upi">UPI</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="netbanking" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Linked Bank Account</Label>
                                                <div className="relative">
                                                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-primary/10 px-3 py-2 pl-9 text-sm font-semibold text-primary ring-offset-background">
                                                        {bankName || "Loading..."}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Account linked: {accountNumber}
                                                </p>
                                                <p className="text-xs text-amber-600">
                                                    *Only your registered bank can be used for this transaction.
                                                </p>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="card" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Card Number</Label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="0000 0000 0000 0000" className="pl-9 font-mono bg-background/50" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Expiry</Label>
                                                    <Input placeholder="MM/YY" className="font-mono bg-background/50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>CVV</Label>
                                                    <Input placeholder="123" type="password" className="font-mono bg-background/50" maxLength={3} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Card Holder Name</Label>
                                                <Input placeholder="John Doe" className="bg-background/50" />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="upi" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>UPI ID</Label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="username@bank" className="pl-9 bg-background/50" />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM</p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <Button className="w-full h-12 text-lg mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg" onClick={handleInitiatePayment} disabled={processing}>
                                        {processing ? <Loader2 className="animate-spin" /> : `Simulate Pay ₹${amount}`}
                                    </Button>
                                </div>
                            )}

                            {step === 'otp' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="text-center mb-6">
                                        <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                            <Lock className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Bank Verification</h3>
                                        <p className="text-muted-foreground text-sm">Enter the OTP sent to your mobile number</p>
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 4-digit OTP"
                                            className="text-center text-2xl tracking-[1em] h-14 font-mono bg-background/50"
                                            maxLength={4}
                                        />
                                        <p className="text-xs text-center text-muted-foreground">Try '1234' </p>
                                    </div>

                                    <Button className="w-full h-12 text-lg mt-4 bg-primary hover:bg-primary/90" onClick={handleVerifyOtp} disabled={otp.length < 4}>
                                        Verify & Pay
                                    </Button>
                                </div>
                            )}

                            {step === 'processing' && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-muted/30" />
                                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-primary animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Processing securely</h3>
                                        <p className="text-muted-foreground">Connecting to bank servers...</p>
                                    </div>
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                    </motion.div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-green-500">Payment Successful</h3>
                                        <p className="text-muted-foreground">Transaction ID: TXN_{Math.floor(Math.random() * 1000000)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!processing && step === 'select' && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-muted/50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
