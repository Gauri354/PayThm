

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/data';
import { Button } from './ui/button';
import { LogOut, Sun, Moon, Menu, User, Settings, HelpCircle, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from 'js-cookie';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from './sidebar-nav';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";

export function TopNav() {
    const pathname = usePathname();
    const [user, setUser] = React.useState<any>(null);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.user && typeof parsed.user === 'object') {
                    setUser(parsed.user);
                } else {
                    setUser(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load user", e);
        }

        if (document.documentElement.classList.contains('dark')) {
            setTheme('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = () => {
        Cookies.remove("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const displayName = user?.fullName || user?.name || "Unknown";
    const displayEmail = user?.email || "No Email";
    const displayPhone = user?.phone || "No Phone";
    const displayId = user?.id || "N/A";
    const displayInitials = displayName[0]?.toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto">

                {/* Left: Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Mobile Hamburger */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[280px]">
                            <SidebarNav />
                        </SheetContent>
                    </Sheet>

                    <Link href="/dashboard" className="cursor-pointer">
                        <Logo />
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 mx-6">
                    {navLinks.slice(0, 8).map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-full gap-2 transition-all ${isActive ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                        {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    </Button>

                    {!user && (
                        <Link href="/login"><Button className="rounded-full px-6">Sign In</Button></Link>
                    )}
                </div>
            </div>
        </header>
    );
}
