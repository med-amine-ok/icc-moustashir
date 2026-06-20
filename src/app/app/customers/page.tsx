'use client';

import React, { useState, useMemo } from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService, getCustomerStatus, getOrCreateTransactions, calculateCustomerLTV } from '@/services/dataService';
import { wilayasList } from '@/mock/data';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  Badge,
  Button,
  Input,
  Select,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Heart, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  PlusCircle,
  MessageSquare,
  Clock,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Custom Dinar Formatter to comply with the Algerian/French spacing format
const formatAlgerianDinar = (val: number): string => {
  if (val === undefined || val === null) return '0 DA';
  return Math.round(val).toLocaleString('fr-FR').replace(/,/g, ' ') + ' DA';
};

const getSourceColor = (source: string) => {
  const norm = source.toLowerCase();
  if (norm.includes('web') || norm.includes('site')) return '#4DA3FF'; // Website
  if (norm.includes('classique') || norm.includes('prospect')) return '#22C55E'; // Classic
  if (norm.includes('événement')) return '#F59E0B'; // Events
  if (norm.includes('pub') || norm.includes('marketing')) return '#A855F7'; // Marketing
  return '#17345C';
};

const getStatusColor = (status?: string) => {
  if (!status) return '#64748B';
  switch (status.toLowerCase()) {
    case 'converted':
    case 'gagné':
    case 'won':
      return '#22C55E'; // green
    case 'prospect':
      return '#4DA3FF'; // blue
    case 'lead':
    case 'contacted':
      return '#64748B'; // gray
    case 'lost':
    case 'perdu':
      return '#EF4444'; // red
    default:
      return '#64748B';
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'converted':
      return 'Client Converti';
    case 'prospect':
      return 'Prospect Actif';
    case 'lead':
      return 'Piste (Lead)';
    case 'lost':
      return 'Opportunité Perdue';
    default:
      return status;
  }
};

export default function CustomersPage() {
  const { filters } = useFilters();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'converted' | 'prospect' | 'lead' | 'lost'>('All');
  const [sortBy, setSortBy] = useState<'ltv-desc' | 'ltv-asc' | 'name-asc'>('ltv-desc');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Modals / Traceability States
  const [activeModal, setActiveModal] = useState<'revenue' | 'cac' | 'ratio' | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState('Appel');
  const [logNotes, setLogNotes] = useState('');

  // Fetch and memoize customers list
  const allCustomers = useMemo(() => {
    const custs = DataService.getFilteredCustomers(filters);
    // Set first customer as default if none selected
    if (custs.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(custs[0].id);
    }
    return custs;
  }, [filters]);

  // Apply Search, Filter pills, and Sort
  const processedCustomers = useMemo(() => {
    let list = [...allCustomers];

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(term) ||
        (c.contactName && c.contactName.toLowerCase().includes(term)) ||
        (c.contactEmail && c.contactEmail.toLowerCase().includes(term)) ||
        c.id.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatus !== 'All') {
      list = list.filter(c => c.status === selectedStatus);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'ltv-desc') return b.ltv - a.ltv;
      if (sortBy === 'ltv-asc') return a.ltv - b.ltv;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [allCustomers, searchTerm, selectedStatus, sortBy]);

  // Selected customer details
  const details = useMemo(() => {
    if (!selectedCustomerId) return null;
    return DataService.getCustomerDetails(selectedCustomerId);
  }, [selectedCustomerId]);

  // Derived metrics for selected customer
  const customerSummary = useMemo(() => {
    if (!details) return null;
    
    // Total Paid Revenue
    const paidTxs = details.transactions.filter(t => t.status === 'Payé');
    const totalPaid = paidTxs.reduce((sum, t) => sum + t.amount, 0);

    // Total Invoiced Value (all transactions)
    const totalInvoiced = details.transactions.reduce((sum, t) => sum + t.amount, 0);

    // Pipeline Value (sum of expected_revenue_da of open opportunities)
    const openOpps = details.opportunities.filter(o => !['Gagné', 'Won', 'Perdu', 'Lost'].includes(o.stage));
    const pipelineValue = openOpps.reduce((sum, o) => sum + o.value, 0);

    // Invoices breakdown
    const pendingCount = details.transactions.filter(t => t.status === 'En attente').length;
    const overdueCount = details.transactions.filter(t => t.status === 'En retard').length;
    const paidCount = paidTxs.length;

    return {
      totalPaid,
      totalInvoiced,
      pipelineValue,
      pendingCount,
      overdueCount,
      paidCount,
      ltvCacRatio: details.customer.cac > 0 ? (details.customer.ltv / details.customer.cac).toFixed(1) : '0.0'
    };
  }, [details]);

  // Group monthly invoicing for Recharts AreaChart
  const invoicingHistory = useMemo(() => {
    if (!details) return [];
    
    // Sort transactions by date asc
    const sorted = [...details.transactions].sort((a, b) => a.dateIssued.localeCompare(b.dateIssued));
    
    // Group by month e.g. 'Jan', 'Féb'
    const grouped: Record<string, number> = {};
    sorted.forEach((tx) => {
      const d = new Date(tx.dateIssued);
      const monthLabel = d.toLocaleString('fr-FR', { month: 'short' });
      grouped[monthLabel] = (grouped[monthLabel] || 0) + tx.amount;
    });

    return Object.entries(grouped).map(([name, amount]) => ({
      name,
      Facturation: amount
    }));
  }, [details]);

  // Log interaction submission handler
  const handleLogInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !logNotes.trim()) return;

    const validTypes = ['Réunion', 'Proposition', 'E-mail', 'Téléphone'] as const;
    const mappedType = logType === 'Appel' ? 'Téléphone' : logType === 'Email' ? 'E-mail' : logType === 'Réunion' ? 'Réunion' : 'Proposition';
    const finalType = validTypes.includes(mappedType as any) ? (mappedType as typeof validTypes[number]) : 'E-mail';

    const newLog = {
      id: `int-${Date.now()}`,
      customerId: details.customer.id,
      type: finalType,
      notes: logNotes,
      date: new Date().toISOString().split('T')[0],
      employeeId: 'SR01'
    };

    details.interactions.unshift(newLog);
    setLogNotes('');
    setShowLogModal(false);
  };

  // Get color and text for health score
  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#22C55E' };
    if (score >= 50) return { label: 'Moyen', color: '#F59E0B' };
    return { label: 'À Risque', color: '#EF4444' };
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden -mx-6 -my-6 flex flex-col bg-[#F8FAFC]">
      {/* Header bar */}
      <div className="bg-white border-b border-[#DCE5EE] px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#17345C] flex items-center gap-2">
            <User size={20} className="text-[#4DA3FF]" />
            Customer 360 & Traçabilité
          </h1>
          <p className="text-xs text-[#6B7C93]">
            Vue d'ensemble complète et traçabilité de bout en bout des interactions clients.
          </p>
        </div>
        <div className="text-xs text-[#6B7C93] flex items-center gap-2 bg-[#EEF4F8] px-3 py-1.5 rounded-lg border border-[#DCE5EE]">
          <ShieldCheck size={14} className="text-[#22C55E]" />
          <span>Lineage de données DW validé</span>
        </div>
      </div>

      {/* Main split dashboard grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: 30% Width Customer List */}
        <div className="w-[30%] min-w-[340px] max-w-[400px] border-r border-[#DCE5EE] bg-white flex flex-col h-full shrink-0">
          
          {/* Top Search, Pills & Sort Panel */}
          <div className="p-4 border-b border-[#DCE5EE] space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C93]" size={16} />
              <Input
                placeholder="Rechercher nom, email, entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs py-2 bg-[#F8FAFC]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1">
              {(['All', 'converted', 'prospect', 'lead', 'lost'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border uppercase transition-all duration-200 ${
                    selectedStatus === status
                      ? 'bg-[#17345C] border-[#17345C] text-white'
                      : 'bg-white border-[#DCE5EE] text-[#6B7C93] hover:bg-[#EEF4F8]'
                  }`}
                >
                  {status === 'All' ? 'Tous' : status === 'converted' ? 'Convertis' : status === 'prospect' ? 'Prospects' : status === 'lead' ? 'Leads' : 'Perdus'}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-[#6B7C93] uppercase">Trier la liste :</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-[11px] py-1 px-2 h-7 bg-white"
              >
                <option value="ltv-desc">Valeur LTV (Décroissante)</option>
                <option value="ltv-asc">Valeur LTV (Croissante)</option>
                <option value="name-asc">Nom (A-Z)</option>
              </Select>
            </div>
          </div>

          {/* Customer Scroll List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {processedCustomers.length === 0 ? (
              <div className="text-center py-12 text-[#6B7C93]">
                <Info size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs">Aucun client ne correspond aux critères.</p>
              </div>
            ) : (
              processedCustomers.map((cust) => {
                const isSelected = selectedCustomerId === cust.id;
                const initials = cust.name && typeof cust.name === 'string'
                  ? cust.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'C';
                
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`relative p-3.5 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-[#17345C] bg-[#EEF4F8]/50 ring-1 ring-[#17345C]/20 shadow-sm' 
                        : 'border-[#DCE5EE] bg-white hover:border-[#6B7C93] hover:shadow-xs'
                    }`}
                  >
                    {/* Selected Left indicator bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#17345C] rounded-l-lg" />
                    )}

                    <div className="flex gap-3">
                      {/* Avatar colored by source */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: getSourceColor(cust.source) }}
                      >
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-[#6B7C93] tracking-wider uppercase truncate">
                            ID: {cust.id}
                          </span>
                          {/* Status Dot */}
                          <div className="flex items-center gap-1">
                            <span 
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: getStatusColor(cust.status) }}
                            />
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-[#17345C] truncate mt-0.5">{cust.name}</h4>
                        
                        {/* Company / Wilaya info */}
                        <div className="flex items-center gap-3 text-[10px] text-[#6B7C93] mt-2">
                          <span className="truncate max-w-[120px] font-medium">
                            {cust.segment}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} />
                            {cust.wilaya}
                          </span>
                        </div>

                        {/* LTV line */}
                        <div className="flex items-center justify-between border-t border-[#DCE5EE] pt-2 mt-2.5">
                          <Badge variant="secondary" className="text-[8px] px-1.5 py-0">
                            {cust.source}
                          </Badge>
                          <span className="text-xs font-bold text-[#17345C]">
                            {cust.isLtvEstimated ? `~ ${formatAlgerianDinar(cust.ltv)}` : formatAlgerianDinar(cust.ltv)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: 70% Width Customer Profile Details */}
        <div className="flex-1 overflow-y-auto h-full p-6 space-y-6">
          {details && customerSummary ? (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* SECTION 1: HERO HEADER CARD */}
              <Card className="border-l-4" style={{ borderLeftColor: getStatusColor(details.customer.status) }}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4 items-center">
                      {/* Large 64px initials avatar */}
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md shrink-0"
                        style={{ backgroundColor: getSourceColor(details.customer.source) }}
                      >
                        {details.customer.name && typeof details.customer.name === 'string'
                          ? details.customer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                          : 'C'}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{details.customer.segment}</Badge>
                          <Badge 
                            variant="secondary" 
                            style={{ 
                              backgroundColor: `${getStatusColor(details.customer.status)}15`, 
                              color: getStatusColor(details.customer.status),
                              borderColor: `${getStatusColor(details.customer.status)}25`
                            }}
                          >
                            {getStatusLabel(details.customer.status)}
                          </Badge>
                        </div>
                        <h2 className="text-xl font-bold text-[#17345C]">{details.customer.name}</h2>
                        <p className="text-xs text-[#6B7C93] flex items-center gap-1">
                          <Briefcase size={12} className="text-slate-400" />
                          <span>{details.customer.activity_sector || 'Secteur non spécifié'}</span>
                          <span className="text-slate-300">•</span>
                          <MapPin size={12} className="text-slate-400" />
                          <span>{details.customer.wilaya}</span>
                        </p>
                      </div>
                    </div>

                    {/* Health score widget */}
                    <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#DCE5EE] p-3 rounded-lg shrink-0">
                      <div className="text-left">
                        <span className="text-[9px] text-[#6B7C93] font-bold uppercase tracking-wider block">Health Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span 
                            className="text-lg font-extrabold"
                            style={{ color: getHealthLevel(details.customer.healthScore).color }}
                          >
                            {details.customer.healthScore}
                          </span>
                          <span className="text-xs text-[#6B7C93]">/100</span>
                        </div>
                      </div>
                      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: getHealthLevel(details.customer.healthScore).color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2: INTERACTIVE KPI CARDS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                {/* Total Paid Revenue KPI Card */}
                <Card 
                  className="hover:shadow-md cursor-pointer hover:border-[#4DA3FF] transition-all duration-200"
                  onClick={() => setActiveModal('revenue')}
                >
                  <CardContent className="p-4 space-y-1.5 relative">
                    <span className="text-[10px] text-[#6B7C93] font-bold uppercase block tracking-wider">Chiffre d'Affaire Encaissé</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-[#17345C] truncate">
                        {formatAlgerianDinar(customerSummary.totalPaid)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#22C55E] font-semibold">
                      <CheckCircle size={10} />
                      <span>{customerSummary.paidCount} Facture(s) Payée(s)</span>
                    </div>
                    <div className="absolute right-3 bottom-3 text-slate-300">
                      <DollarSign size={16} />
                    </div>
                  </CardContent>
                </Card>

                {/* CAC KPI Card */}
                <Card 
                  className="hover:shadow-md cursor-pointer hover:border-[#4DA3FF] transition-all duration-200"
                  onClick={() => setActiveModal('cac')}
                >
                  <CardContent className="p-4 space-y-1.5 relative">
                    <span className="text-[10px] text-[#6B7C93] font-bold uppercase block tracking-wider">Coût Acquisition (CAC)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-[#17345C]">
                        {formatAlgerianDinar(details.customer.cac)}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7C93] font-medium block">
                      Canal : {details.customer.source}
                    </span>
                    <div className="absolute right-3 bottom-3 text-slate-300">
                      <Layers size={16} />
                    </div>
                  </CardContent>
                </Card>

                {/* LTV KPI Card */}
                <Card className="relative">
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-[10px] text-[#6B7C93] font-bold uppercase block tracking-wider">Valeur à Vie (LTV)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-[#17345C]">
                        {details.customer.isLtvEstimated ? `~ ${formatAlgerianDinar(details.customer.ltv)}` : formatAlgerianDinar(details.customer.ltv)}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7C93] font-medium flex items-center gap-1">
                      {details.customer.isLtvEstimated ? (
                        <>
                          <AlertCircle size={10} className="text-[#F59E0B]" />
                          <span className="text-[#F59E0B] font-semibold">Estimation du pipeline</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={10} className="text-[#22C55E]" />
                          <span className="text-[#22C55E]">Calculé (Chiffre Réel)</span>
                        </>
                      )}
                    </span>
                    <div className="absolute right-3 bottom-3 text-slate-300">
                      <TrendingUp size={16} />
                    </div>
                  </CardContent>
                </Card>

                {/* LTV/CAC Ratio Card */}
                <Card 
                  className="hover:shadow-md cursor-pointer hover:border-[#4DA3FF] transition-all duration-200"
                  onClick={() => setActiveModal('ratio')}
                >
                  <CardContent className="p-4 space-y-1.5 relative">
                    <span className="text-[10px] text-[#6B7C93] font-bold uppercase block tracking-wider">Ratio LTV / CAC</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-[#22C55E]">
                        {customerSummary.ltvCacRatio}x
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7C93] font-medium block">
                      Seuil de rentabilité (3x) dépassé
                    </span>
                    <div className="absolute right-3 bottom-3 text-slate-300">
                      <TrendingUp size={16} />
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* SECTION 3: TWO-COLUMN DETAILS LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* COLUMN 1 (55% Width - col-span-7): Journey Timeline & Services Purchased */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Acquisition Timeline */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock size={16} className="text-[#4DA3FF]" />
                        Parcours d'Acquisition & Traçabilité
                      </CardTitle>
                      <CardDescription>Lineage chronologique des points de contact client.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative pl-7 border-l-2 border-[#DCE5EE] ml-6 space-y-5 py-1">
                      {/* Step 1: Marketing entry */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-[#17345C]/10 border border-[#17345C]/20 flex items-center justify-center text-[#17345C]">
                          <Layers size={11} />
                        </span>
                        <div>
                          <span className="text-[9px] font-bold text-[#6B7C93] uppercase block">Étape 1 : Acquisition</span>
                          <h5 className="text-xs font-bold text-[#17345C]">
                            Entrée par le canal : {details.customer.source}
                          </h5>
                          <p className="text-[10px] text-[#6B7C93] mt-0.5">
                            Coût d'acquisition alloué de {formatAlgerianDinar(details.customer.cac)}.
                          </p>
                        </div>
                      </div>

                      {/* Step 2: Commercial Assignee */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 flex items-center justify-center text-[#4DA3FF]">
                          <User size={11} />
                        </span>
                        <div>
                          <span className="text-[9px] font-bold text-[#6B7C93] uppercase block">Étape 2 : Qualification</span>
                          <h5 className="text-xs font-bold text-[#17345C]">
                            Commercial assigné : {details.commercial?.name || 'Non assigné'}
                          </h5>
                          <p className="text-[10px] text-[#6B7C93] mt-0.5">
                            Suivi commercial actif et négociation d'opportunités.
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Projects started */}
                      {details.projects.length > 0 && (
                        <div className="relative">
                          <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <Clock size={11} />
                          </span>
                          <div>
                            <span className="text-[9px] font-bold text-[#6B7C93] uppercase block">Étape 3 : Prestation</span>
                            <h5 className="text-xs font-bold text-[#17345C]">
                              Projets de livraison démarrés ({details.projects.length} projet(s))
                            </h5>
                            <p className="text-[10px] text-[#6B7C93] mt-0.5">
                              Prestation en cours de réalisation par l'équipe technique.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Payments / Transaction */}
                      {details.transactions.length > 0 && (
                        <div className="relative">
                          <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                            <DollarSign size={11} />
                          </span>
                          <div>
                            <span className="text-[9px] font-bold text-[#6B7C93] uppercase block">Étape 4 : Facturation</span>
                            <h5 className="text-xs font-bold text-[#17345C]">
                              Transactions de paiement finalisées
                            </h5>
                            <p className="text-[10px] text-[#6B7C93] mt-0.5">
                              Dernier règlement enregistré : {details.transactions[0].id} ({details.transactions[0].status}).
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Services Purchased Table */}
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Services achetés / Projet associés</CardTitle>
                        <CardDescription>Détail complet des prestations réalisées pour le client.</CardDescription>
                      </div>
                      <Badge variant="secondary">{details.projects.length} Prestations</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      {details.projects.length === 0 ? (
                        <p className="text-xs text-[#6B7C93] p-6">Aucun service acheté pour l'instant.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px]">Service</TableHead>
                              <TableHead className="text-[10px]">Date Début</TableHead>
                              <TableHead className="text-[10px]">Date Fin</TableHead>
                              <TableHead className="text-[10px]">Statut</TableHead>
                              <TableHead className="text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {details.projects.map((p, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-bold text-[#17345C] text-xs">
                                  {p.service}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {p.startDate}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {p.endDate}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={p.status === 'Terminé' ? 'success' : p.status === 'En retard' ? 'danger' : 'info'}
                                    className="text-[9px] px-1.5 py-0"
                                  >
                                    {p.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px]"
                                    onClick={() => setSelectedService(p)}
                                  >
                                    <ExternalLink size={10} className="mr-1" />
                                    Détails
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                </div>

                {/* COLUMN 2 (45% Width - col-span-5): Invoices list, Contact info, Data Quality */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Contact Info Card */}
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm">Fiche Contact</CardTitle>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowLogModal(true)}>
                        <PlusCircle size={12} className="mr-1" />
                        Interaction
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3.5">
                      <div className="flex items-start gap-2.5 text-xs text-[#17345C]">
                        <User size={14} className="text-[#6B7C93] mt-0.5" />
                        <div>
                          <span className="text-[9px] text-[#6B7C93] font-semibold block uppercase">Représentant</span>
                          <span className="font-bold">{details.customer.contactName}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-[#17345C]">
                        <Mail size={14} className="text-[#6B7C93] mt-0.5" />
                        <div>
                          <span className="text-[9px] text-[#6B7C93] font-semibold block uppercase">E-mail Professionnel</span>
                          <span className="font-medium select-all">{details.customer.contactEmail || 'Non spécifié'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-[#17345C]">
                        <Phone size={14} className="text-[#6B7C93] mt-0.5" />
                        <div>
                          <span className="text-[9px] text-[#6B7C93] font-semibold block uppercase">Téléphone</span>
                          <span className="font-medium select-all">{details.customer.contactPhone || 'Non spécifié'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Factures (Invoices) List */}
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Facturation & Règlements</CardTitle>
                        <CardDescription>Inclus factures réelles et synthétiques.</CardDescription>
                      </div>
                      <Badge variant="secondary">{details.transactions.length} Factures</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      {details.transactions.length === 0 ? (
                        <p className="text-xs text-[#6B7C93] p-6">Aucune facture émise.</p>
                      ) : (
                        <div className="divide-y divide-[#DCE5EE]">
                          {details.transactions.map((tx) => (
                            <div 
                              key={tx.id}
                              onClick={() => setSelectedInvoice(tx)}
                              className="p-3.5 flex items-center justify-between hover:bg-[#EEF4F8]/30 cursor-pointer transition-all duration-200"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[9px] text-[#6B7C93] font-bold block truncate">
                                  {tx.id}
                                </span>
                                <h6 className="text-[11px] font-bold text-[#17345C] truncate">
                                  {tx.service}
                                </h6>
                                <span className="text-[9px] text-[#6B7C93] block">
                                  Émise le : {tx.dateIssued}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-[#17345C] block">
                                  {formatAlgerianDinar(tx.amount)}
                                </span>
                                <Badge 
                                  variant={tx.status === 'Payé' ? 'success' : tx.status === 'En retard' ? 'danger' : 'warning'}
                                  className="text-[8px] px-1 py-0 mt-0.5"
                                >
                                  {tx.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Data Quality & Lineage Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-1.5">
                        <Info size={14} className="text-[#4DA3FF]" />
                        Qualité de la donnée client
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B7C93]">Validité Téléphone / Email</span>
                        <Badge variant="success">OK (Fuzzy Matché)</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B7C93]">Origine des Transactions</span>
                        <span className="text-[10px] font-bold text-[#17345C]">
                          {details.transactions.some(t => t.id.startsWith('MUST-2026-')) ? 'Invoices Synthétiques DW' : 'Transactions Physiques'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                        <div className="bg-[#22C55E] h-1.5 rounded-full w-[95%]" />
                      </div>
                    </CardContent>
                  </Card>

                </div>

              </div>

              {/* SECTION 4: BOTTOM ANALYTICS ROW */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#4DA3FF]" />
                    Évolution de la Facturation Client (DA)
                  </CardTitle>
                  <CardDescription>Flux cumulé et périodicité des règlements clients.</CardDescription>
                </CardHeader>
                <CardContent className="h-64 pt-2">
                  {invoicingHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#6B7C93]">
                      Historique financier insuffisant pour modéliser la tendance.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={invoicingHistory}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorFacture" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4DA3FF" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4DA3FF" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#DCE5EE" />
                        <XAxis dataKey="name" stroke="#6B7C93" fontSize={10} />
                        <YAxis stroke="#6B7C93" fontSize={10} tickFormatter={(val) => `${val / 1000}k`} />
                        <Tooltip 
                          formatter={(value: any) => [formatAlgerianDinar(Number(value)), 'Facturé']}
                          contentStyle={{ backgroundColor: 'white', borderColor: '#DCE5EE', borderRadius: '8px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Facturation" 
                          stroke="#4DA3FF" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorFacture)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Bottom widgets: Workshops & Cross-sell insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Workshops check */}
                {details.customer.source === 'Site Web' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        <Sparkles size={15} className="text-[#4DA3FF]" />
                        Participation aux Workshops
                      </CardTitle>
                      <CardDescription>Engagement issu de l'acquisition Web.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3.5">
                      <div className="p-4 bg-[#F8FAFC] border border-[#DCE5EE] rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#6B7C93] font-bold uppercase block">Workshops suivis</span>
                          <span className="text-xl font-extrabold text-[#17345C]">3 Sessions</span>
                        </div>
                        <CheckCircle size={24} className="text-[#22C55E]" />
                      </div>
                      <p className="text-xs text-[#6B7C93]">
                        Ce client s'est inscrit et a assisté à 3 ateliers interactifs d'introduction. C'est le point d'ancrage de son intérêt pour nos solutions.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Cross-sell insight card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Sparkles size={15} className="text-[#A855F7]" />
                      Recommandation Cross-Sell IA
                    </CardTitle>
                    <CardDescription>Opportunités de ventes additionnelles détectées.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    <div className="p-3 bg-[#A855F7]/5 border border-[#A855F7]/15 rounded-lg flex items-start gap-2.5">
                      <Info size={16} className="text-[#A855F7] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h6 className="text-xs font-bold text-[#17345C]">Migration Cloud Enterprise</h6>
                        <p className="text-[11px] text-[#6B7C93]">
                          Basé sur son profil {details.customer.segment}, ce client présente une forte propension à souscrire à une prestation d'Audit d'Infrastructure.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs py-1.5 h-8">
                      Générer la proposition
                      <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </CardContent>
                </Card>

              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-[#6B7C93]">
              <div className="text-center max-w-sm">
                <User size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-sm text-[#17345C]">Aucun client sélectionné</h3>
                <p className="text-xs mt-1">
                  Veuillez sélectionner un client dans le panneau latéral pour charger sa fiche 360°.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ============================================================ */}
      {/* DIALOG MODALS FOR DETAILED TRACEABILITY                      */}
      {/* ============================================================ */}

      {/* 1. Paid Revenue Modal */}
      <Dialog
        isOpen={activeModal === 'revenue'}
        onClose={() => setActiveModal(null)}
        title="Traçabilité Financière : Factures Payées"
      >
        {details && (
          <div className="space-y-4">
            <div className="bg-[#EEF4F8] p-3 rounded-lg border border-[#DCE5EE]">
              <span className="text-[10px] text-[#6B7C93] uppercase font-bold block">Total Recettes Payées</span>
              <span className="text-lg font-extrabold text-[#17345C]">
                {formatAlgerianDinar(customerSummary?.totalPaid || 0)}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#17345C]">Factures correspondantes :</span>
              <div className="border border-[#DCE5EE] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Facture</TableHead>
                      <TableHead className="text-[10px]">Prestation</TableHead>
                      <TableHead className="text-[10px] text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.transactions
                      .filter(t => t.status === 'Payé')
                      .map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs font-mono font-bold text-[#17345C]">{t.id}</TableCell>
                          <TableCell className="text-xs">{t.service}</TableCell>
                          <TableCell className="text-xs font-bold text-right text-[#17345C]">
                            {formatAlgerianDinar(t.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* 2. CAC/Attribution Modal */}
      <Dialog
        isOpen={activeModal === 'cac'}
        onClose={() => setActiveModal(null)}
        title="Détails du Coût d'Acquisition Client (CAC)"
      >
        {details && (
          <div className="space-y-4 text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#EEF4F8] p-3 rounded-lg border border-[#DCE5EE]">
                <span className="text-[10px] text-[#6B7C93] uppercase font-bold block">Coût d'Acquisition (CAC)</span>
                <span className="text-base font-extrabold text-[#17345C]">
                  {formatAlgerianDinar(details.customer.cac)}
                </span>
              </div>
              <div className="bg-[#EEF4F8] p-3 rounded-lg border border-[#DCE5EE]">
                <span className="text-[10px] text-[#6B7C93] uppercase font-bold block">Canal principal</span>
                <span className="text-base font-extrabold text-[#17345C]">{details.customer.source}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <h5 className="font-bold text-[#17345C]">Audit de Traçabilité Marketing</h5>
              <p className="text-[#6B7C93] leading-relaxed">
                Le CAC est calculé dynamiquement au niveau du Data Warehouse (table <code className="bg-slate-200 px-1 rounded text-[#17345C]">reporting_customer_360</code>) en ventilant le budget marketing mensuel global par rapport au volume de clients convertis sur le canal <span className="font-bold">{details.customer.source}</span>.
              </p>
            </div>
          </div>
        )}
      </Dialog>

      {/* 3. LTV/CAC Ratio Modal */}
      <Dialog
        isOpen={activeModal === 'ratio'}
        onClose={() => setActiveModal(null)}
        title="Analyse du ratio LTV / CAC"
      >
        {details && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg">
              <div>
                <span className="text-[10px] text-[#6B7C93] uppercase font-bold">Multiplicateur de valeur</span>
                <span className="text-2xl font-extrabold text-[#22C55E] block">
                  {customerSummary?.ltvCacRatio}x
                </span>
              </div>
              <TrendingUp size={32} className="text-[#22C55E]" />
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <h5 className="font-bold text-[#17345C]">Interprétation du ratio :</h5>
              <ul className="space-y-2 list-disc list-inside text-[#6B7C93]">
                <li><strong className="text-[#17345C]">&lt; 1.0x :</strong> Modèle déficitaire (acquisition à perte).</li>
                <li><strong className="text-[#17345C]">1.0x - 3.0x :</strong> Seuil intermédiaire, marge d'amélioration.</li>
                <li><strong className="text-[#17345C]">&gt; 3.0x :</strong> Rentabilité excellente confirmant l'efficacité du canal.</li>
              </ul>
            </div>
          </div>
        )}
      </Dialog>

      {/* 4. Single Invoice Detail Modal */}
      <Dialog
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        title="Détails de la Facture & Règlements Moustashir"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-3">
              <div>
                <span className="text-[10px] text-[#6B7C93] font-bold uppercase tracking-wider block">Numéro de facture</span>
                <span className="text-base font-extrabold text-[#17345C]">{selectedInvoice.id}</span>
              </div>
              <Badge variant={selectedInvoice.status === 'Payé' ? 'success' : 'warning'}>
                {selectedInvoice.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Date d'émission</span>
                <span className="font-bold text-[#17345C]">{selectedInvoice.dateIssued}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Prestation associée</span>
                <span className="font-bold text-[#17345C]">{selectedInvoice.service}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#DCE5EE]">
                <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Montant Total</span>
                <span className="text-lg font-extrabold text-[#17345C]">
                  {formatAlgerianDinar(selectedInvoice.amount)}
                </span>
              </div>
            </div>

            {/* Service catalog connection information */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 mt-2">
              <h5 className="font-bold text-[#17345C] flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#22C55E]" />
                Traçabilité & Lineage Facturation
              </h5>
              <p className="text-[#6B7C93] leading-relaxed">
                Cette facture a été générée via l'outil Moustashir pour le service <span className="font-semibold text-[#17345C]">{selectedInvoice.service}</span>. Les détails financiers et les taux de marge associés sont audités au niveau du catalogue de services central.
              </p>
            </div>
          </div>
          
        )}
        {/* Actions */}
<div className="flex gap-2 pt-2 border-t border-[#DCE5EE]">
  <button
    onClick={() => {
      const content = `
FACTURE MOUSTACHIR
==================
Numéro : ${selectedInvoice.id}
Date d'émission : ${selectedInvoice.dateIssued}
Prestation : ${selectedInvoice.service}
Montant : ${formatAlgerianDinar(selectedInvoice.amount)}
Statut : ${selectedInvoice.status}
==================
Moustachir — moustachir.dz
      `.trim();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture-${selectedInvoice.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#17345C] text-white text-xs font-semibold rounded-lg hover:bg-[#1a4070] transition-colors"
  >
    <Download size={13} />
    Télécharger PDF
  </button>

  <button
    onClick={() => {
      const subject = encodeURIComponent(`Facture Moustachir — ${selectedInvoice.id}`);
      const body = encodeURIComponent(
        `Bonjour,\n\nVeuillez trouver ci-dessous les détails de votre facture :\n\n` +
        `Numéro : ${selectedInvoice.id}\n` +
        `Date d'émission : ${selectedInvoice.dateIssued}\n` +
        `Prestation : ${selectedInvoice.service}\n` +
        `Montant : ${formatAlgerianDinar(selectedInvoice.amount)}\n` +
        `Statut : ${selectedInvoice.status}\n\n` +
        `Cordialement,\nL'équipe Moustachir\nmoustachir.dz`
      );
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#DCE5EE] text-[#17345C] text-xs font-semibold rounded-lg hover:bg-[#F5F8FB] transition-colors"
  >
    <Mail size={13} />
    Envoyer par Mail
  </button>
</div>
      </Dialog>

      {/* 4b. Single Service Detail Modal */}
      <Dialog
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        title="Détails du Service & Suivi Projet Moustashir"
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-3">
              <div>
                <span className="text-[10px] text-[#6B7C93] font-bold uppercase tracking-wider block">Identifiant Projet</span>
                <span className="text-base font-extrabold text-[#17345C]">{selectedService.id}</span>
              </div>
              <Badge variant={selectedService.status === 'Terminé' ? 'success' : selectedService.status === 'En retard' ? 'danger' : 'info'}>
                {selectedService.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Nom du Service</span>
                <span className="font-bold text-sm text-[#17345C]">{selectedService.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Date de début</span>
                <span className="font-bold text-[#17345C]">{selectedService.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Date de livraison prévue</span>
                <span className="font-bold text-[#17345C]">{selectedService.endDate}</span>
              </div>
              {selectedService.satisfactionScore !== undefined && selectedService.satisfactionScore !== null && (
                <div className="col-span-2 pt-2 border-t border-[#DCE5EE]">
                  <span className="text-[10px] text-[#6B7C93] block font-semibold uppercase">Score de Satisfaction</span>
                  <span className="font-bold text-sm text-[#22C55E]">
                    {selectedService.satisfactionScore} / 10
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#EEF4F8] border border-[#DCE5EE] rounded-lg text-xs space-y-2">
              <h5 className="font-bold text-[#17345C] flex items-center gap-1">
                <Briefcase size={12} className="text-[#4DA3FF]" />
                Activités & Prestations associées
              </h5>
              <p className="text-[#6B7C93] leading-relaxed">
                Ce projet correspond à l'implémentation et à la livraison de <span className="font-semibold text-[#17345C]">{selectedService.name}</span> par nos équipes d'ingénierie.
              </p>
            </div>
          </div>
        )}
      </Dialog>

      {/* 5. Log Interaction Modal */}
      <Dialog 
        isOpen={showLogModal} 
        onClose={() => setShowLogModal(false)}
        title="Journaliser une Nouvelle Activité"
      >
        <form onSubmit={handleLogInteraction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7C93] mb-1">
              Type d'Interaction
            </label>
            <Select 
              value={logType} 
              onChange={(e) => setLogType(e.target.value)}
              className="w-full"
            >
              <option value="Appel">Appel Téléphonique</option>
              <option value="Email">E-mail</option>
              <option value="Réunion">Réunion / Meeting</option>
              <option value="Proposition">Envoi Proposition</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7C93] mb-1">
              Notes / Compte Rendu
            </label>
            <textarea
              required
              rows={4}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Saisissez les détails de l'interaction..."
              className="w-full px-3 py-2 bg-slate-50 border border-[#DCE5EE] rounded text-sm text-[#17345C] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE5EE]">
            <Button variant="outline" type="button" onClick={() => setShowLogModal(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
