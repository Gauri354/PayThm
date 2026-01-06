'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';

import { navLinks, adminNavLinks } from '@/lib/data';

import { Button } from './ui/button';
import { LogOut, Sun, Moon } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Logo } from "@/components/logo";

export function SidebarNav() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    // Load user
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

    // Load theme
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

  const displayName = user?.fullName || user?.name || "Unknown User";
  const displayEmail = user?.email || "";
  const displayInitials = displayName !== "Unknown User" ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800">
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <Logo />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu className="gap-2">
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={{ children: link.label }}
                  className="rounded-xl data-[active=true]:bg-black data-[active=true]:text-white dark:data-[active=true]:bg-white dark:data-[active=true]:text-black transition-all hover:translate-x-1"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4 mx-2 opacity-50" />

        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Admin Tools
        </div>

        <SidebarMenu>
          {adminNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={{ children: link.label }}
                  className="rounded-xl hover:translate-x-1 transition-transform"
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-between gap-3 shadow-sm border border-zinc-200 dark:border-zinc-800">
          {user ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-black">
                  <AvatarImage src={user?.avatarUrl || ""} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-medium text-xs">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="overflow-hidden text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-none mb-1">
                    {displayName.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">ID: {user?.id}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="shrink-0 h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <div className="w-full">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full justify-between rounded-xl">
                  <span>Sign In</span>
                  <LogOut className="size-3 rotate-180" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SidebarFooter>
    </div>
  );
}
