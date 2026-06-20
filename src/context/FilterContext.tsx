'use client';

import React, { createContext, useContext, useState } from 'react';
import { GlobalFilters } from '@/services/dataService';

interface FilterContextType {
  filters: GlobalFilters;
  setWilaya: (wilaya: string) => void;
  setSegment: (segment: string) => void;
  setDateRange: (range: GlobalFilters['dateRange']) => void;
  setChannel: (channel: string) => void;
  setSalesRep: (salesRep: string) => void;
  setService: (service: string) => void;
  setStatus: (status: string) => void;
  setCustomDateRange: (start: string, end: string) => void;
  resetFilters: () => void;
}

const defaultFilters: GlobalFilters = {
  dateRange: 'all',
  startDate: '',
  endDate: '',
  channel: 'All',
  salesRep: 'All',
  service: 'All',
  status: 'All',
  wilaya: 'All',
  segment: 'All'
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);

  const setWilaya = (wilaya: string) => {
    setFilters(prev => ({ ...prev, wilaya }));
  };

  const setSegment = (segment: string) => {
    setFilters(prev => ({ ...prev, segment }));
  };

  const setDateRange = (dateRange: GlobalFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange }));
  };

  const setChannel = (channel: string) => {
    setFilters(prev => ({ ...prev, channel }));
  };

  const setSalesRep = (salesRep: string) => {
    setFilters(prev => ({ ...prev, salesRep }));
  };

  const setService = (service: string) => {
    setFilters(prev => ({ ...prev, service }));
  };

  const setStatus = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const setCustomDateRange = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, dateRange: 'custom', startDate, endDate }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      setWilaya, 
      setSegment, 
      setDateRange, 
      setChannel,
      setSalesRep,
      setService,
      setStatus,
      setCustomDateRange,
      resetFilters 
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
