'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && localStorage.getItem('user')) {
      router.push("/dashboard");
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';
      const res = await axios.post(`${baseUrl}/api/users/login`, {
        email,
        password,
      }, { withCredentials: true });

      const displayName = res.data.user.fullName || email.split('@')[0];
      const user = {
        ...res.data.user,
        name: displayName,
        fullName: displayName
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);

        const isFreshSignup = localStorage.getItem('signup_fresh');
        if (isFreshSignup === 'true') {
          localStorage.setItem('welcome_status', 'new');
          localStorage.removeItem('signup_fresh');
        } else {
          localStorage.setItem('welcome_status', 'back');
        }
      }
      localStorage.setItem("user", JSON.stringify(user));

      // toast({ title: `Welcome back, ${user.name}!` }); // Moved to dashboard for custom message
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || error.response?.data || "Please check your email and password.";
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: typeof msg === 'string' ? msg : "Invalid credentials"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        {/* Animated Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-40 animate-pulse delay-1000" />

        <div className="relative z-10 max-w-lg text-white space-y-8">
          <Logo className="text-white mb-8 scale-150 origin-left" variant="light" />
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Simpler, Faster, Secure Payments.
          </h1>
          <p className="text-lg text-indigo-100/90 leading-relaxed">
            Join millions of users who trust PayThm for their daily transactions, bill payments, and financial management.
          </p>

          <div className="space-y-4 pt-8">
            {['Instant Bank Transfers', 'Secure Bill Payments', 'Expense Tracking & Rewards'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400 h-6 w-6" />
                <span className="font-medium text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 lg:p-24 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot Password?
                </Link>
              </div>
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

            <Button
              type="submit"
              className={`w-full h-11 text-base bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ${isLoading ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/20'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-11">
              <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.54-2.09-.48-3.09 0-.91.47-1.95.54-3-.35C6.73 18.91 5 15.39 5 11.23c.27-5.07 4.19-5.32 5.38-5.32 1.37 0 1.95.84 3.4.84 1.45 0 1.97-.84 3.29-.84 1.25 0 2.22.44 2.93 1.37-2.63 1.66-2.18 4.98.54 6.15-.33 1.74-1.2 3.96-2.4 5.2l.01-.01c-.1.1-.21.22-.32.33l-.1.1c-.24.25-.49.5-.76.73h-.02zM12.98 2.02c.79-1 2.16-1.52 3.37-1.38.3 1.51-.7 3.09-1.97 4.09-.8 1-2.25 1.55-3.3 1.4-.2-1.72 1.01-3.21 1.9-4.11z" />
              </svg>
              Apple
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            New to PayThm? {' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
