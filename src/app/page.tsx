'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/app/cockpit');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#F5F8FB] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#4DA3FF] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold text-sm">Redirection en cours...</p>
    </div>
  );
}
