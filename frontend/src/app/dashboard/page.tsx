'use client';

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import axios from "axios";
import { format } from 'date-fns';
import {
    LayoutGrid,
    Send,
    ScanQrCode,
    Plus,
    Landmark,
    Wallet,
    ArrowUpRight,
    CreditCard,
    TrendingUp,
    Bell,
    Search,
    ChevronRight,
    Loader2,
    Zap,
    Gift,
    ShieldCheck,
    LogOut,
    User,
    Settings,
    Copy,
    Check,
    Mail,
    Phone,
    HelpCircle,
    QrCode
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from 'next/navigation';

// Import existing widgets/components
import { SmartInsights } from "@/components/dashboard/smart-insights";
import { ServicesSection } from "@/components/dashboard/services-section";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QrModal } from "@/components/dashboard/qr-modal";
import { AVAILABLE_WIDGETS } from "@/components/dashboard/widgets";

// --- Components ---

// 1. Glass Card Helper
const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${className}`}
    >
        {children}
    </div>
);

// 2. Greeting Header
const GreetingHeader = ({ name, email, phone, userId, onLogout, onOpenQr, notifications, onMarkAllRead }: {
    name: string, email: string, phone: string, userId: string, onLogout: () => void, onOpenQr: () => void,
    notifications: any[], onMarkAllRead: () => void
}) => {
    const { toast } = useToast();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(email);
        toast({ title: "PayThm ID Copied", description: "You can now share this ID." });
    };

    return (
        <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                    {greeting}, {name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Financial Overview &bull; {format(new Date(), 'EEEE, d MMM')}
                </p>
            </div>
            <div className="flex items-center gap-4">
                {/* QR Code Scanner */}
                <div
                    onClick={onOpenQr}
                    className="p-3 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
                >
                    <QrCode className="w-5 h-5 text-zinc-600 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>

                {/* Notifications */}
                <Popover>
                    <PopoverTrigger>
                        <div className="relative cursor-pointer group">
                            <div className="p-3 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 transition-colors">
                                <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                            </div>
                            {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black transform translate-x-1 -translate-y-1" />}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800" align="end">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <h4 className="font-bold">Notifications</h4>
                            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">{unreadCount} New</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm ${!n.read ? 'font-bold text-indigo-900 dark:text-indigo-100' : 'font-medium'}`}>{n.title}</p>
                                        <span className="text-[10px] text-zinc-400">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{n.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                            <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-600" onClick={onMarkAllRead}>Mark all as read</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="w-12 h-12 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xl font-medium border-2 border-white dark:border-zinc-800 shadow-md cursor-pointer transition-transform hover:scale-105">
                            {name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden mt-2">

                        {/* Purple Header */}
                        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 p-6 text-white relative">
                            <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                            <div className="absolute bottom-0 left-0 p-8 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-3">{name || 'User'}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                            ID: {userId || '---'}
                                        </span>
                                        <span className="bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                                            <ShieldCheck className="w-3 h-3 fill-current" /> KYC Verified
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 w-10 backdrop-blur-md border border-white/10"
                                    onClick={(e) => { e.preventDefault(); onOpenQr(); }}
                                    title="Show QR Code"
                                >
                                    <QrCode className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 group relative">
                                <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium flex-1 truncate pr-6">{email}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={handleCopyId}
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700">
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium tracking-wide">{phone}</span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            {[
                                { icon: User, label: "Profile Settings", href: "/settings?tab=profile" },
                                { icon: Settings, label: "Account & Security", href: "/settings?tab=security" },
                                { icon: HelpCircle, label: "Help & Support", href: "/settings?tab=help" }
                            ].map((item, i) => (
                                <Link href={item.href} key={i} className="block outline-none">
                                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-zinc-50 dark:focus:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors">
                                        <item.icon className="w-4 h-4 text-zinc-400" />
                                        <span className="font-medium">{item.label}</span>
                                    </DropdownMenuItem>
                                </Link>
                            ))}

                            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

                            <DropdownMenuItem onClick={onLogout} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 focus:bg-red-50 dark:focus:bg-red-900/10 text-red-600 dark:text-red-400 mt-1 transition-colors group">
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">Log out</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// 3. Ultra-New Wealth Card
const WealthCard = ({ userId, onClick }: { userId: string | number, onClick?: () => void }) => {
    const [balance, setBalance] = React.useState<number | null>(null);
    const [bankBalance, setBankBalance] = React.useState<number>(142390);

    React.useEffect(() => {
        if (!userId) return;
        const fetchBalance = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/balance/${userId}`);
                setBalance(res.data);
            } catch (error) { console.error(error); }
        };

        // Bank Balance Simulation
        const storedBank = localStorage.getItem(`paythm_bank_balance_${userId}`);
        if (storedBank) {
            setBankBalance(parseFloat(storedBank));
        } else {
            localStorage.setItem(`paythm_bank_balance_${userId}`, "142390");
        }

        fetchBalance();
        const interval = setInterval(fetchBalance, 5000);
        return () => clearInterval(interval);
    }, [userId]);

    return (
        <div onClick={onClick} className="h-full min-h-[300px] relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl group flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.005]">
            <div className="absolute inset-0 bg-[#0a0a0b]" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-700/80 to-pink-600/90" />
            <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full bg-blue-500/30 blur-[100px] mix-blend-overlay animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-orange-500/20 blur-[80px] mix-blend-overlay" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]" />
                    <span className="text-xs font-bold tracking-wider uppercase">Main Wallet</span>
                </div>
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="relative z-10 my-8">
                <p className="text-indigo-100/80 font-medium mb-1">Total Balance</p>
                <div className="flex items-baseline gap-1">
                    {balance === null ? (
                        <span className="text-4xl font-bold animate-pulse">Loading...</span>
                    ) : (
                        <>
                            <span className="text-5xl md:text-6xl font-black tracking-tighter">
                                ₹{Math.floor(balance).toLocaleString('en-IN')}
                            </span>
                            <span className="text-2xl md:text-3xl font-medium opacity-60">
                                .{(balance % 1).toFixed(2).split('.')[1]}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 group-hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-2 text-indigo-100 mb-1">
                        <Landmark className="w-3 h-3" />
                        <span className="text-xs font-medium">Bank Balance</span>
                    </div>
                    <p className="text-lg font-bold">₹{bankBalance.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 group-hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-2 text-indigo-100 mb-1">
                        <Gift className="w-3 h-3" />
                        <span className="text-xs font-medium">Rewards</span>
                    </div>
                    <p className="text-lg font-bold">850 Pts</p>
                </div>
            </div>
        </div>
    );
};

// 4. Quick Actions Grid
const QuickActions = () => {
    const actions = [
        { label: "Send Money", icon: Send, href: "/send-money", color: "from-blue-600 to-indigo-600", shadow: "shadow-blue-500/25" },
        { label: "Add Money", icon: Plus, href: "/add-money", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/25" },
        { label: "Scan QR", icon: ScanQrCode, href: "/scan-qr", color: "from-orange-500 to-red-600", shadow: "shadow-orange-500/25" },
        { label: "To Bank", icon: Landmark, href: "/bank-transfer", color: "from-purple-600 to-pink-600", shadow: "shadow-purple-500/25" },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 h-full min-h-[300px]">
            {actions.map((action, i) => (
                <Link key={i} href={action.href} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-[2rem] blur-xl" />
                    <div className="h-full flex flex-col items-center justify-center gap-3 p-4 rounded-[2rem] bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg ${action.shadow} text-white group-hover:rotate-6 transition-transform duration-300`}>
                            <action.icon className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 tracking-tight">{action.label}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
};

// Animation Variants
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
    const [user, setUser] = React.useState<any>(null);
    const router = useRouter();

    // UI State
    const [isQrOpen, setIsQrOpen] = React.useState(false);
    const [isWidgetModalOpen, setIsWidgetModalOpen] = React.useState(false);

    // Widgets Logic
    const [activeWidgets, setActiveWidgets] = React.useState<string[]>(['market']);
    React.useEffect(() => {
        const saved = localStorage.getItem("dashboard_widgets");
        if (saved) setActiveWidgets(JSON.parse(saved));
    }, []);
    const toggleWidget = (id: string) => {
        let next;
        if (activeWidgets.includes(id)) next = activeWidgets.filter(w => w !== id);
        else next = [...activeWidgets, id];
        setActiveWidgets(next);
        localStorage.setItem("dashboard_widgets", JSON.stringify(next));
    };

    // Modal States
    const [isBillModalOpen, setIsBillModalOpen] = React.useState(false);
    const [isPayingBill, setIsPayingBill] = React.useState(false);
    const [showBillAlert, setShowBillAlert] = React.useState(false); // Default false, load from effect
    const [isCardDetailOpen, setIsCardDetailOpen] = React.useState(false);
    const [clickedOffer, setClickedOffer] = React.useState<{ title: string, code: string } | null>(null);

    React.useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try { setUser(JSON.parse(userStr)); }
            catch (e) {
                console.error(e);
                router.push("/login");
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    const userId = user?.id || user?.user?.id;
    const userName = user?.fullName || user?.user?.fullName || "User";
    const phone = user?.phone || user?.user?.phone || "";
    const bankName = user?.bankName || user?.user?.bankName || "State Bank of India";
    const paythmId = user?.paythmId || user?.user?.paythmId || `${phone}@paythm`;
    const { toast } = useToast();

    React.useEffect(() => {
        const status = localStorage.getItem('welcome_status');
        if (status && userName !== "User") {
            if (status === 'new') {
                toast({
                    title: `Welcome to PayThm, ${userName}! 🎉`,
                    description: "We're excited to have you on board. Start by adding money or setting a goal!",
                    duration: 6000,
                    className: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-lg"
                });
            } else if (status === 'back') {
                toast({
                    title: `Welcome back, ${userName}! 👋`,
                    description: "Good to see you again.",
                    duration: 4000,
                    className: "bg-white dark:bg-zinc-900 border-l-4 border-indigo-500 shadow-md"
                });
            }
            localStorage.removeItem('welcome_status');
        }
    }, [userName, toast]);

    React.useEffect(() => {
        const storedBillAlert = localStorage.getItem("hide_bill_alert");
        if (storedBillAlert !== "true") {
            setShowBillAlert(true);
        }
    }, []);

    const handleHideBillAlert = () => {
        setShowBillAlert(false);
        localStorage.setItem("hide_bill_alert", "true");
    }

    // Notifications State with Persistence
    const [notifications, setNotifications] = React.useState([
        { id: 1, title: "Money Received", desc: "You received ₹500 from Rahul", time: "2m ago", read: false },
        { id: 2, title: "Bill Due", desc: "Electricity bill of ₹2,450 is due soon", time: "1h ago", read: false },
        { id: 3, title: "Offer Unlocked", desc: "You unlocked a new scratch card!", time: "5h ago", read: true },
    ]);

    React.useEffect(() => {
        const stored = localStorage.getItem("notifications_state");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge read status
                setNotifications(prev => prev.map(n => {
                    const saved = parsed.find((p: any) => p.id === n.id);
                    return saved ? { ...n, read: saved.read } : n;
                }));
            } catch (e) { }
        }
    }, []);

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem("notifications_state", JSON.stringify(updated));
    };

    const handlePayBill = async () => {
        setIsPayingBill(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-upi`, {
                senderId: Number(userId),
                upiId: "Electricity Board",
                amount: 2450.00,
            });
            toast({ title: "Success", description: "Bill Paid Successfully!" });
            setShowBillAlert(false);
            localStorage.setItem("hide_bill_alert", "true"); // Also hide on pay if desired, or reset
            setIsBillModalOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed", description: "Payment Failed." });
        } finally {
            setIsPayingBill(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/login");
    };

    // ... (in return JSX)
    // Replace GreetingHeader props to use markAllRead
    // ...

    return (
        <div className="min-h-screen bg-[#F2F4F7] dark:bg-black dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] p-6 lg:p-10 font-sans selection:bg-indigo-500/30">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-[1400px] mx-auto space-y-8"
            >
                {/* 1. Greeting & Active Header */}
                <motion.div variants={item}>
                    {/* Inline Greeting Header Component Logic to pass props correctly */}
                    {/* We need to pass the state down or modify the component. Since GreetingHeader is defined IN THIS FILE above, we can just modify GreetingHeader definition or its usage.
                        Wait, GreetingHeader is defined as const above. It has its OWN state for notifications.
                        I need to Refactor GreetingHeader to accept notifications as props or move the logic inside it.
                        The GreetingHeader in the file (lines 75-234) has `useState` for notifications.
                        I should update GreetingHeader definition instead of this main component if I want to fix it properly.
                      */}
                    <GreetingHeader
                        name={userName}
                        email={paythmId}
                        phone={phone}
                        userId={userId}
                        onLogout={handleLogout}
                        onOpenQr={() => setIsQrOpen(true)}
                        notifications={notifications}
                        onMarkAllRead={markAllRead}
                    />
                </motion.div>

                {/* 2. Bill Alert (Floating) */}
                <AnimatePresence>
                    {showBillAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between mb-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-lg text-white">
                                    <Zap className="w-5 h-5 fill-current" />
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <p className="font-bold">Electricity Bill Due</p>
                                    <p className="text-xs opacity-80">₹2,450 Due in 2 days</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleHideBillAlert}>Later</Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-500/30" onClick={() => setIsBillModalOpen(true)}>Pay Now</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Main Balance Card (Left, Large) - Height Reduced */}
                    <motion.div variants={item} className="lg:col-span-8 lg:h-[320px]">
                        {/* Remove onClick to disable details popup */}
                        <WealthCard userId={userId} />
                    </motion.div>

                    {/* Quick Actions (Right, Grid) - Height Reduced */}
                    <motion.div variants={item} className="lg:col-span-4 lg:h-[320px]">
                        <QuickActions />
                    </motion.div>

                    {/* Services Grid (Recharge & Bills) */}
                    <motion.div variants={item} className="lg:col-span-12 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm">
                        <ServicesSection />
                    </motion.div>

                    {/* Active Widgets Display */}
                    {/* Active Widgets Display */}
                    {activeWidgets.length > 0 && (
                        <>
                            {activeWidgets.map(wId => {
                                const widget = AVAILABLE_WIDGETS.find(w => w.id === wId);
                                if (!widget) return null;
                                return (
                                    <motion.div
                                        key={wId}
                                        variants={item}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="col-span-1 lg:col-span-4 h-full"
                                    >
                                        <div className="h-full min-h-[250px]">{widget.component}</div>
                                    </motion.div>
                                );
                            })}
                        </>
                    )}

                    {/* Insights Strip (Full Width if no widgets, else fluid) */}
                    <motion.div variants={item} className="lg:col-span-12">
                        <SmartInsights />
                    </motion.div>

                    {/* Recent Activity (Left, Tall) */}
                    <motion.div variants={item} className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                History
                                <span className="bg-zinc-200 dark:bg-zinc-800 text-xs py-0.5 px-2 rounded-full text-zinc-500">Last 30 days</span>
                            </h2>
                            <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50">View All</Button>
                        </div>
                        <GlassCard className="min-h-[500px] p-2">
                            <RecentActivity />
                        </GlassCard>
                    </motion.div>

                    {/* Sidebar Widgets (Right, Stacked) */}
                    <motion.div variants={item} className="lg:col-span-4 space-y-6">

                        {/* Premium Card Teaser (Clickable) */}
                        <div onClick={() => setIsCardDetailOpen(true)} className="relative overflow-hidden rounded-[2rem] bg-black text-white p-8 group cursor-pointer transition-transform hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-[80px] opacity-50" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-12">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-600" />)}
                                    </div>
                                    <span className="font-mono text-xs text-zinc-500">VIRTUAL</span>
                                </div>
                                <h3 className="text-2xl font-mono tracking-widest mb-2">**** 4582</h3>
                                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                    <div>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Card Holder</p>
                                        <p className="font-bold">{userName}</p>
                                    </div>
                                    <CreditCard className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Offers / Rewards (Clickable) */}
                        <GlassCard className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-black">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">Your Offers</h3>
                                <div className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">2 NEW</div>
                            </div>
                            <div className="space-y-4">
                                <div
                                    onClick={() => setClickedOffer({ title: "Zomato Gold", code: "PAYTHM50" })}
                                    className="flex items-center gap-4 group cursor-pointer hover:bg-white/50 p-2 rounded-xl transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                        <Gift className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Zomato Gold</p>
                                        <p className="text-xs text-zinc-500">Get 50% OFF up to ₹150</p>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setClickedOffer({ title: "Free Flight Insurance", code: "FLYFREE" })}
                                    className="flex items-center gap-4 group cursor-pointer hover:bg-white/50 p-2 rounded-xl transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Travel Insurance</p>
                                        <p className="text-xs text-zinc-500">Free coverage on flights</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <Button onClick={() => setIsWidgetModalOpen(true)} variant="outline" className="w-full rounded-2xl h-12 border-dashed border-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300">
                            <LayoutGrid className="mr-2 w-4 h-4" /> Customize Widgets
                        </Button>
                    </motion.div>
                </div>

                {/* --- Modals & Overlays --- */}

                {/* 1. Account Details Modal (Triggered by Card Click) */}
                <Dialog open={isCardDetailOpen} onOpenChange={setIsCardDetailOpen}>
                    <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Account Details</DialogTitle>
                        </DialogHeader>
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 shadow-xl">
                                    <Landmark className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold">{bankName}</h2>
                                <p className="text-indigo-100 text-sm">Primary Savings Account</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase">Account Holder</label>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{userName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase">Account No.</label>
                                        <p className="font-mono text-base text-zinc-700 dark:text-zinc-300">**** **** 4582</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase">IFSC Code</label>
                                        <p className="font-mono text-base text-zinc-700 dark:text-zinc-300">SBIN0004321</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase">PayThm VPA</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm text-indigo-600 font-bold">{paythmId}</code>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(paythmId); toast({ title: "Copied!" }); }}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800" onClick={() => setIsCardDetailOpen(false)}>
                                Close details
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 2. Offer Detail Modal */}
                <Dialog open={!!clickedOffer} onOpenChange={() => setClickedOffer(null)}>
                    <DialogContent className="sm:max-w-sm rounded-[2rem] text-center">
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 animate-bounce">
                                <Gift className="w-8 h-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">{clickedOffer?.title}</DialogTitle>
                                <p className="text-zinc-500 text-sm mt-1">Use the code below to claim your reward.</p>
                            </div>
                            <div className="bg-zinc-100 dark:bg-zinc-800 px-6 py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center gap-3 cursor-pointer hover:bg-zinc-200 transition-colors"
                                onClick={() => { navigator.clipboard.writeText(clickedOffer?.code || ""); toast({ title: "Code Copied!" }); }}
                            >
                                <span className="font-mono text-xl font-bold tracking-widest text-indigo-600">{clickedOffer?.code}</span>
                                <Copy className="w-4 h-4 text-zinc-400" />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <QrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} userId={phone} bankName={bankName} />

                {/* Bill Payment Modal */}
                <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
                    <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Confirm Bill Payment</DialogTitle>
                            <DialogDescription>Power Grid Corp - Consumer ID: 88299102</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-6">
                            <span className="text-4xl font-bold">₹2,450.00</span>
                            <span className="text-sm text-zinc-500 mt-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">Due in 2 Days</span>
                        </div>
                        <DialogFooter className="sm:justify-between gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsBillModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={handlePayBill} disabled={isPayingBill}>
                                {isPayingBill ? <Loader2 className="animate-spin" /> : "Pay Securely"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Widget Customization Modal */}
                <Dialog open={isWidgetModalOpen} onOpenChange={setIsWidgetModalOpen}>
                    <DialogContent className="rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Customize Dashboard</DialogTitle>
                            <DialogDescription>Select what you want to see on your home screen.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            {AVAILABLE_WIDGETS.map((widget) => (
                                <div key={widget.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <widget.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{widget.title}</span>
                                    </div>
                                    <Switch
                                        checked={activeWidgets.includes(widget.id)}
                                        onCheckedChange={() => toggleWidget(widget.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

            </motion.div>
        </div>
    );
}
