'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <div className="p-4 flex items-center justify-between bg-card border-b">
          <div className="flex items-center gap-2">
            <svg
              className="size-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4v-6h2v6h-2z"
                fill="currentColor"
              />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">PayThm</h1>
          </div>

          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft />
            </Button>
          </SheetTrigger>
        </div>

        <SheetContent side="left" className="w-[280px] p-0 pt-10 bg-sidebar">
          <SidebarNav />
        </SheetContent>

        <main className="p-4 md:p-6">{children}</main>
      </Sheet>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="p-6">{children}</SidebarInset>
    </SidebarProvider>
  );
}
