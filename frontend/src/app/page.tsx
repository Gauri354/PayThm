'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing window/localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Retrieve token safely (using localStorage as fallback)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router, mounted]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen items-center justify-center relative overflow-hidden">
      <div className="text-center relative z-10">
        <div className="relative inline-block">
          {/* Outer rotating ring */}
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 absolute inset-0" />
          {/* Spinning gradient ring */}
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary border-r-purple-600 animate-spin" />
        </div>
        <p className="mt-6 text-lg font-medium gradient-text">Loading your experience...</p>
      </div>
    </div>
  );
}
