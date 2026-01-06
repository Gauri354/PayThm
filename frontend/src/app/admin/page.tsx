'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Loader2, Users, Receipt, ShieldCheck, Activity, Search,
  ArrowUpRight, ArrowDownRight, MoreVertical, Filter, RefreshCw,
  Server,
  ShieldAlert,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// --- Mock Chart Data ---
const revenueData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 1800 },
  { name: 'Thu', total: 3200 },
  { name: 'Fri', total: 2800 },
  { name: 'Sat', total: 4500 },
  { name: 'Sun', total: 3800 },
];

const trafficData = [
  { name: '00h', visitors: 240 },
  { name: '04h', visitors: 130 },
  { name: '08h', visitors: 890 },
  { name: '12h', visitors: 1560 },
  { name: '16h', visitors: 1420 },
  { name: '20h', visitors: 1100 },
];

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-xl ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
  <GlassCard className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-zinc-500 font-medium text-sm">{title}</h3>
      <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{value}</h2>
      <p className="text-xs text-zinc-400">{subtext}</p>
    </div>
  </GlassCard>
);

export default function AdminPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, txRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/all-transactions`)
      ]);
      setUsers(usersRes.data);
      setTransactions(txRes.data);
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycAction = async (userId: number, status: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/kyc/${userId}/${status}`);
      toast({ title: "Success", description: `User KYC status updated to ${status}.` });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("KYC Update Error", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update KYC status." });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`);
      toast({ title: "User Deleted", description: "User has been removed from the system." });
      fetchData();
    } catch (error) {
      console.error("Delete User Error", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    }
  };

  const handleGenerateReport = () => {
    if (transactions.length === 0) {
      toast({ description: "No transactions to generate report from." });
      return;
    }

    // Updated headers to include detailed user info
    const headers = ["User Name", "User ID", "Transaction ID", "Amount", "Type", "Status", "Date", "Message"];

    const csvContent = [
      headers.join(","),
      ...transactions.map(tx => {
        // Safe access to nested user properties
        // Assuming the backend returns wallet -> user structure
        const userName = tx.wallet?.user?.fullName || "Unknown User";
        const userId = tx.wallet?.user?.id || "N/A";
        const date = new Date(tx.timestamp).toLocaleString();

        return [
          `"${userName}"`,
          userId,
          tx.id,
          tx.amount,
          tx.type || "N/A",
          tx.status || "Completed",
          `"${date}"`,
          `"${tx.message}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `paythm_detailed_report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Report Generated", description: "Downloading detailed transaction report..." });
  };

  if (!mounted) return null;

  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0) * 0.01; // Mock 1% fee
  const pendingKyc = users.filter(u => u.kycStatus === 'PENDING' || u.kycStatus === 'Pending');

  return (
    <div className="min-h-screen bg-[#F2F4F7] dark:bg-black p-6 lg:p-10 font-sans text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Admin Command Center</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              System Operational &bull; {format(new Date(), 'EEEE, d MMMM HH:mm')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" onClick={fetchData}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleGenerateReport} className="h-12 rounded-xl px-6 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 font-bold">
              <Filter className="w-4 h-4 mr-2" /> Generate Report
            </Button>
          </div>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={users.length}
            subtext="Across all platforms"
            icon={Users}
            trend={12}
            color="bg-blue-500"
          />
          <StatCard
            title="Revenue (Est.)"
            value={`₹${totalRevenue.toFixed(2)}`}
            subtext="1% Transaction Fee"
            icon={Receipt}
            trend={8.5}
            color="bg-indigo-500"
          />
          <StatCard
            title="Transactions"
            value={transactions.length}
            subtext="Total volume processed"
            icon={Activity}
            trend={-2.4}
            color="bg-orange-500"
          />
          <StatCard
            title="Pending KYC"
            value={pendingKyc.length}
            subtext="Requires attention"
            icon={ShieldCheck}
            color="bg-rose-500"
          />
        </div>

        {/* 3. Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* Charts Section */}
          <div className="lg:col-span-8 space-y-6">
            <GlassCard className="p-8 min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold">Revenue Trends</h3>
                  <p className="text-sm text-zinc-500">Daily transaction volume & fees</p>
                </div>
                <Tabs defaultValue="wk" className="w-[120px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="wk">Week</TabsTrigger>
                    <TabsTrigger value="mo">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} stroke="#94a3b8" />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* System Status */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 h-full bg-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-700">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" /> System Status
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Database Load</span>
                    <span className="text-emerald-400 font-mono">24%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[24%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Memory Usage</span>
                    <span className="text-yellow-400 font-mono">62%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[62%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">API Latency</span>
                    <span className="text-blue-400 font-mono">45ms</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[15%]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Live Logs</h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex gap-2 text-emerald-400 truncate">
                    <span className="opacity-50">10:42:21</span>
                    <span>User #412 login success</span>
                  </div>
                  <div className="flex gap-2 text-zinc-300 truncate">
                    <span className="opacity-50">10:41:55</span>
                    <span>TX #9402 created (₹500)</span>
                  </div>
                  <div className="flex gap-2 text-orange-400 truncate">
                    <span className="opacity-50">10:40:12</span>
                    <span>Warning: High latency detected</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* 4. Data Management Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-zinc-900 p-1 rounded-xl h-12 border border-zinc-200 dark:border-zinc-800">
              <TabsTrigger value="users" className="rounded-lg px-6 h-10 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">Users</TabsTrigger>
              <TabsTrigger value="kyc" className="rounded-lg px-6 h-10 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">KYC Requests <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">{pendingKyc.length}</Badge></TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg px-6 h-10 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">Global Transactions</TabsTrigger>
            </TabsList>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input placeholder="Search..." className="pl-10 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
          </div>

          {/* Users Tab */}
          <TabsContent value="users">
            <GlassCard className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="p-4 px-6 font-medium text-zinc-500">User</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Contact</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Joined</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Status</th>
                    <th className="p-4 px-6 font-medium text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-zinc-200">
                            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}`} />
                            <AvatarFallback>{user.fullName ? user.fullName[0] : 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white">{user.fullName}</div>
                            <div className="text-xs text-zinc-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <div className="text-zinc-600 dark:text-zinc-400">{user.email}</div>
                        <div className="text-xs text-zinc-400">{user.phone}</div>
                      </td>
                      <td className="p-4 px-6 text-zinc-600 dark:text-zinc-400">
                        {new Date(user.createdAt || user.joinDate || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="p-4 px-6">
                        <Badge variant="outline" className={`
                                                    ${user.kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            user.kycStatus === 'PENDING' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'}
                                                 `}>
                          {user.kycStatus || 'UNKNOWN'}
                        </Badge>
                      </td>
                      <td className="p-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id.toString())}>Copy User ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>Delete User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <GlassCard className="p-0">
              {pendingKyc.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-20" />
                  <p className="font-medium">All Caught Up!</p>
                  <p className="text-sm">No pending KYC requests found.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                      <th className="p-4 px-6 font-medium text-zinc-500">Applicant</th>
                      <th className="p-4 px-6 font-medium text-zinc-500">Applied On</th>
                      <th className="p-4 px-6 font-medium text-zinc-500 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingKyc.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-50 dark:border-zinc-800">
                        <td className="p-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {user.fullName?.[0]}
                            </div>
                            <div>
                              <div className="font-bold">{user.fullName}</div>
                              <div className="text-xs text-zinc-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 px-6 text-zinc-600">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="p-4 px-6 text-right space-x-2">
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleKycAction(user.id, 'REJECTED')}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleKycAction(user.id, 'VERIFIED')}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </GlassCard>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <GlassCard className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="p-4 px-6 font-medium text-zinc-500">TX ID</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Message</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Amount</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Time</th>
                    <th className="p-4 px-6 font-medium text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice().reverse().map((tx) => (
                    <tr key={tx.id} className="border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4 px-6 font-mono text-xs text-zinc-500">#{tx.id}</td>
                      <td className="p-4 px-6 font-medium text-zinc-700 dark:text-zinc-300">{tx.message}</td>
                      <td className="p-4 px-6 font-bold">₹{tx.amount.toLocaleString()}</td>
                      <td className="p-4 px-6 text-zinc-500 text-xs">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600">Completed</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
