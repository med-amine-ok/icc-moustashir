'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFilters } from '@/context/FilterContext';
import { wilayasList } from '@/mock/data';
import { 
  Bell, 
  Search, 
  HelpCircle, 
  Calendar,
  MapPin,
  Briefcase,
  User,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { dimSalesReps } from '@/lib/data/data-loader';

interface NavbarProps {
  pageTitle?: string;
  onSearch?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle = 'Dashboard', onSearch }) => {
  const { user, logout } = useAuth();
  const { filters, setWilaya, setSegment, setDateRange, setChannel, setSalesRep, resetFilters } = useFilters();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  if (!user) return null;

  const salesRepsCleaned = dimSalesReps.filter(r => r.sales_rep_name !== 'Non Assigne' && r.sales_rep_name !== 'Non assigne');

  // Algerian mock notifications
  const notifications = [
    { id: 1, title: 'Projet en retard', desc: 'Le projet E-commerce Sarl Dahmani is delayed.', time: 'Il y a 10 min' },
    { id: 2, title: 'Opportunité chaude', desc: 'Clinique Dr. Selma has requested a proposal.', time: 'Il y a 1h' },
    { id: 3, title: 'Qualité des données', desc: '3 contacts missing phone numbers.', time: 'Il y a 3h' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="bg-transparent h-20 px-8 flex items-center justify-between sticky top-0 z-30 gap-4">
      {/* Global Filter Bar */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-[#E5E9F0] px-3 py-1.5 rounded-xl shadow-sm max-w-[70%] overflow-x-auto scrollbar-none">
        <SlidersHorizontal className="text-[#17345C] shrink-0" size={13} />
        <span className="text-[10px] font-bold text-[#8A99AD] uppercase tracking-wider border-r border-[#E5E9F0] pr-2 mr-1 shrink-0">Filtres</span>
        
        {/* Période Select */}
        <select
          value={filters.dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="text-xs bg-transparent border-0 text-[#17345C] font-semibold focus:outline-none cursor-pointer hover:text-[#4DA3FF] transition-colors pr-1"
        >
          <option value="all">Période: Tout</option>
          <option value="1m">Dernier Mois</option>
          <option value="3m">3 Mois</option>
          <option value="6m">6 Mois</option>
          <option value="12m">12 Mois</option>
        </select>

        {/* Segment Select */}
        <select
          value={filters.segment}
          onChange={(e) => setSegment(e.target.value)}
          className="text-xs bg-transparent border-0 text-[#17345C] font-semibold focus:outline-none cursor-pointer hover:text-[#4DA3FF] transition-colors pr-1 ml-2 border-l border-[#E5E9F0] pl-2"
        >
          <option value="All">Secteur: Tous</option>
          <option value="startup">Startup</option>
          <option value="sme">PME</option>
          <option value="healthcare">Clinique</option>
          <option value="education">Éducation</option>
          <option value="marketplace">Marketplace</option>
          <option value="enterprise">Grande Entreprise</option>
        </select>

        {/* Wilaya Select */}
        <select
          value={filters.wilaya}
          onChange={(e) => setWilaya(e.target.value)}
          className="text-xs bg-transparent border-0 text-[#17345C] font-semibold focus:outline-none cursor-pointer hover:text-[#4DA3FF] transition-colors pr-1 ml-2 border-l border-[#E5E9F0] pl-2 max-w-[120px]"
        >
          <option value="All">Wilaya: Toutes</option>
          {wilayasList.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        {/* Acquisition Channel Select */}
        <select
          value={filters.channel}
          onChange={(e) => setChannel(e.target.value)}
          className="text-xs bg-transparent border-0 text-[#17345C] font-semibold focus:outline-none cursor-pointer hover:text-[#4DA3FF] transition-colors pr-1 ml-2 border-l border-[#E5E9F0] pl-2"
        >
          <option value="All">Canal: Tous</option>
          <option value="website">Site Web</option>
          <option value="marketing">Publicités</option>
          <option value="event">Événements</option>
          <option value="outbound">Prospection</option>
        </select>

        {/* SalesRep Select */}
        <select
          value={filters.salesRep}
          onChange={(e) => setSalesRep(e.target.value)}
          className="text-xs bg-transparent border-0 text-[#17345C] font-semibold focus:outline-none cursor-pointer hover:text-[#4DA3FF] transition-colors pr-1 ml-2 border-l border-[#E5E9F0] pl-2"
        >
          <option value="All">Commercial: Tous</option>
          {salesRepsCleaned.map(r => (
            <option key={r.sales_rep_key} value={r.sales_rep_name}>{r.sales_rep_name}</option>
          ))}
        </select>
        
        {/* Reset Filters button */}
        {(filters.dateRange !== 'all' || filters.wilaya !== 'All' || filters.segment !== 'All' || filters.channel !== 'All' || filters.salesRep !== 'All') && (
          <button 
            onClick={resetFilters}
            className="text-[10px] font-bold text-[#EF4444] hover:text-red-700 ml-2 pl-2 border-l border-[#E5E9F0] uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Right Actions Block */}
      <div className="flex items-center gap-6">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A99AD]" size={14} />
          <input
            type="text"
            placeholder="Search"
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-12 py-1.5 bg-white border border-[#E5E9F0] rounded-xl text-xs text-[#17345C] placeholder-[#8A99AD] focus:outline-none focus:ring-1 focus:ring-slate-200 focus:border-slate-200 transition-all shadow-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#8A99AD] bg-slate-50 border border-[#E5E9F0] px-1 py-0.5 rounded leading-none">
            ⌘K
          </span>
        </div>

        {/* Language Code Indicator */}
        <span className="text-xs font-bold text-[#8A99AD] uppercase tracking-wider cursor-pointer hover:text-[#17345C] transition-colors">
          us
        </span>

        {/* Theme Toggle Sun Icon */}
        <button className="text-[#8A99AD] hover:text-[#17345C] p-1 rounded-full transition-colors cursor-pointer" title="Toggle theme">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        {/* User initials avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="w-8 h-8 rounded-full bg-[#17345C] text-white flex items-center justify-center text-xs font-extrabold tracking-wider hover:opacity-90 transition-opacity cursor-pointer border border-[#E5E9F0] shadow-sm"
          >
            {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CC'}
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-[#E5E9F0] rounded-xl shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-bold text-sm text-[#17345C]">{user.name}</p>
                <p className="text-xs text-[#6B7C93] truncate">{user.email}</p>
                <span className="inline-block text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-[#17345C] border border-slate-200 mt-1 leading-none">
                  Rôle: {user.role}
                </span>
              </div>
              
              <Link 
                href="/app/admin" 
                onClick={() => setShowProfile(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#17345C] hover:bg-slate-50 transition-colors"
              >
                <User size={14} />
                <span>Mon profil & Paramètres</span>
              </Link>
              
              <button
                onClick={() => {
                  setShowProfile(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 border-t border-slate-100 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
