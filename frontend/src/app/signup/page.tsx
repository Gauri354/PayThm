'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, Building, Eye, EyeOff, ShieldCheck, ArrowLeft, Phone } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { BankCombobox } from '@/components/bank-combobox';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && localStorage.getItem('user')) {
      router.push("/dashboard");
    }
  }, [router]);

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [bankName, setBankName] = useState("");
  const [pin, setPin] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // ... (lines 28-34 skipped)

  // Step 1: Validate and "Send" OTP
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (phone.length < 10) {
      toast({ variant: "destructive", title: "Invalid Phone", description: "Please enter a valid 10-digit number." });
      return;
    }
    if (pin.length !== 4) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Transaction PIN must be 4 digits." });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';
      const res = await axios.post(`${baseUrl}/api/auth/send-otp`, { email });

      // If backend sends back the OTP (in dev mode) or success message
      if (res.data.dev_otp) {
        setGeneratedOtp(res.data.dev_otp);
      } else {
        setGeneratedOtp("SERVER_VERIFY");
      }

      toast({
        title: "📧 OTP Sent",
        description: res.data.message || `Verification code sent to ${email}`,
        duration: 5000,
      });
      setStep('otp');

    } catch (error) {
      console.error("OTP Error:", error);
      toast({ variant: "destructive", title: "Failed to send OTP", description: "Please check your network or try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Account
  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verify OTP
    let isVerified = false;

    if (generatedOtp === "SERVER_VERIFY") {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';
        const verifyRes = await axios.post(`${baseUrl}/api/auth/verify-otp`, { email, otp: otpInput });
        if (verifyRes.data === true) {
          isVerified = true;
        } else {
          toast({ variant: "destructive", title: "Invalid OTP", description: "The code you entered is incorrect." });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Verification Error", description: "Could not verify OTP." });
        setIsLoading(false);
        return;
      }
    } else {
      // Local Check (Fallback/Dev)
      if (otpInput === generatedOtp) {
        isVerified = true;
      } else {
        toast({ variant: "destructive", title: "Incorrect OTP", description: "The code you entered is invalid." });
        setIsLoading(false);
        return;
      }
    }

    if (!isVerified) return;

    try {
      const name = email.split("@")[0];
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';

      // Backend Call
      await axios.post(`${baseUrl}/api/users/signup`, {
        fullName: name,
        email,
        password,
        phone,
        bankName,
        pin,
      }, { withCredentials: true });

      toast({ title: "Account Verified & Created! 🎉", description: "Welcome to PayThm." });
      if (typeof window !== 'undefined') {
        localStorage.setItem('signup_fresh', 'true');
      }
      router.push("/login");

    } catch (error: any) {
      console.error("Signup Error:", error);
      const errorMessage = error.response?.data || "Could not create account. Please try again.";
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden items-center justify-center p-12 order-2">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-800 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        {/* Animated Shapes */}
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-white/10 backdrop-blur-3xl rounded-3xl rotate-12 animate-pulse" />

        <div className="relative z-10 max-w-lg text-white space-y-8 text-right">
          <div className="flex justify-end mb-8">
            <Logo className="text-white scale-150" variant="light" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Your Financial Freedom Starts Here.
          </h1>
          <p className="text-lg text-pink-100/90 leading-relaxed">
            Join millions of users who trust PayThm for secure, instant, and rewarding payments.
          </p>

          <div className="flex flex-col items-end space-y-4 pt-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 w-fit border border-white/20">
              <ShieldCheck className="h-8 w-8 text-green-300" />
              <div className="text-left">
                <p className="font-bold">Bank Grade Security</p>
                <p className="text-xs text-white/70">Verified Email Signups</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 lg:p-24 bg-white dark:bg-zinc-950 order-1">
        <div className="w-full max-w-md space-y-8">
          {/* Step 1: Details */}
          {step === 'details' && (
            <div className="space-y-8 fade-in">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                <p className="text-muted-foreground">Enter your details to verify your email.</p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm font-bold text-zinc-500">+91</span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      className="pl-12 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setPhone(val);
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 pr-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm</Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">Transaction PIN (4 Digits)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pin"
                      type="password"
                      placeholder="Type 4-digit security code"
                      maxLength={4}
                      className="pl-9 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 tracking-widest"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">This code will be required for all payments.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank">Link Bank Account</Label>
                  <BankCombobox value={bankName} onChange={setBankName} />
                </div>

                <Button
                  type="submit"
                  className={`w-full h-11 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 ${isLoading ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-purple-500/30'}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Verification...
                    </>
                  ) : (
                    "Verify Email & Sign Up"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account? {' '}
                <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
                  Sign In instead
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-8 fade-in slide-up text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 animate-pulse">
                  <Mail className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Check your Inbox</h2>
                  <p className="text-muted-foreground mt-2">
                    We've sent a 4-digit verification code to <br />
                    <span className="font-bold text-foreground">{email}</span>
                  </p>
                </div>

                {/* Development Helper */}
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg text-sm font-mono border border-yellow-200 dark:border-yellow-800 mt-2">
                  🔑 <b>Demo OTP:</b> {generatedOtp}
                </div>
              </div>

              <form onSubmit={handleFinalSignup} className="space-y-6">
                <div className="flex justify-center">
                  <Input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-48 text-center text-3xl font-bold tracking-[0.5em] h-14 border-2 border-purple-200 focus:border-purple-500"
                    placeholder="••••"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full h-11 text-base bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ${isLoading ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/20'}`}
                  disabled={isLoading || otpInput.length !== 4}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>
              </form>

              <Button variant="ghost" onClick={() => { setStep('details'); setOtpInput(""); }} className="text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Change Email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
