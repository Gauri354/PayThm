'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell } from './app-shell';
import { Skeleton } from './ui/skeleton';

const publicPaths = ['/login', '/signup'];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      const isPublicPath = publicPaths.includes(pathname);
      if (user && isPublicPath) {
        router.push('/');
      } else if (!user && !isPublicPath) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }
  
  if (!user) {
    return null; // or a loading spinner
  }

  return <AppShell>{children}</AppShell>;
}
