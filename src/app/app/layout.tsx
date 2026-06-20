'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

const PAGE_TITLES: Record<string, string> = {
  '/app/cockpit': 'Executive Cockpit',
  '/app/customers': 'Vue Clients 360',
  '/app/lifecycle': 'Parcours Client',
  '/app/pipeline': 'Pipeline Commercial',
  '/app/marketing': 'Attribution Marketing',
  '/app/finance': 'Finance & Factures',
  '/app/services': 'Rentabilité Offres',
  '/app/employees': 'Performance Équipe',
  '/app/data-health': 'Qualité des Données',
  '/app/imports': 'Centre d\'Import',
  '/app/forecast': 'Prévisions & Scénarios',
  '/app/admin': 'Gouvernance & Admin',
  '/app/admin/register': 'Inscrire Nouveau Personnel',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  '/app/cockpit': ['Director', 'Marketing', 'Commercial', 'Finance', 'Admin'],
  '/app/customers': ['Director', 'Marketing', 'Commercial', 'Finance'],
  '/app/lifecycle': ['Director', 'Marketing'],
  '/app/pipeline': ['Director', 'Commercial'],
  '/app/marketing': ['Director', 'Marketing'],
  '/app/finance': ['Director', 'Finance'],
  '/app/services': ['Director', 'Finance'],
  '/app/employees': ['Director', 'Commercial'],
  '/app/data-health': ['Director', 'Admin'],
  '/app/imports': ['Director', 'Admin', 'Commercial'],
  '/app/forecast': ['Director', 'Marketing', 'Commercial', 'Finance'],
  '/app/admin': ['Director', 'Admin'],
  '/app/admin/register': ['Director', 'Admin'],
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && pathname) {
      const allowedRoles = ROLE_PERMISSIONS[pathname];
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Rediriger vers la première page disponible pour le rôle
        if (user.role === 'Marketing') router.replace('/app/lifecycle');
        else if (user.role === 'Commercial') router.replace('/app/pipeline');
        else if (user.role === 'Finance') router.replace('/app/finance');
        else if (user.role === 'Admin') router.replace('/app/admin');
        else router.replace('/app/cockpit');
      }
    }
  }, [user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#4DA3FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#6B7C93] font-semibold text-xs uppercase tracking-wider">Chargement de votre espace sécurisé...</p>
      </div>
    );
  }

  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'pl-20' : 'pl-72'}`}>
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full animate-fade-in">
          <div className="mb-6">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Pages</span>
              <span>/</span>
              <span className="text-slate-600">{pageTitle}</span>
            </div>
            <h1 className="text-xl font-extrabold text-[#17345C] mt-1">{pageTitle}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
