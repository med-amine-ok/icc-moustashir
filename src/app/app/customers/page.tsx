'use client';

import React, { useState, useMemo } from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
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
  Dialog
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
  Sparkles
} from 'lucide-react';
import { formatDA } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function CustomersPage() {
  const { filters } = useFilters();
  const allFilteredCustomers = useMemo(() => DataService.getFilteredCustomers(filters), [filters]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedWilaya, setSelectedWilaya] = useState('All');
  const [selectedHealth, setSelectedHealth] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(allFilteredCustomers[0]?.id || null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState('Call');
  const [logNotes, setLogNotes] = useState('');

  // Handle Search and Filter Table
  const filteredTableCustomers = useMemo(() => {
    return allFilteredCustomers.filter(c => {
      const nameStr = String(c.name || '');
      const contactStr = String(c.contactName || '');
      const idStr = String(c.id || '');
      const matchSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contactStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          idStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSeg = selectedSegment === 'All' || c.segment === selectedSegment;
      const matchWil = selectedWilaya === 'All' || c.wilaya === selectedWilaya;
      const matchH = selectedHealth === 'All' || 
                     (selectedHealth === 'good' && c.healthScore >= 80) ||
                     (selectedHealth === 'warning' && c.healthScore >= 50 && c.healthScore < 80) ||
                     (selectedHealth === 'danger' && c.healthScore < 50);
      return matchSearch && matchSeg && matchWil && matchH;
    });
  }, [allFilteredCustomers, searchTerm, selectedSegment, selectedWilaya, selectedHealth]);

  // Customer Details Lookup
  const details = useMemo(() => {
    if (!selectedCustomerId) return null;
    return DataService.getCustomerDetails(selectedCustomerId);
  }, [selectedCustomerId]);

  const handleLogInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details) return;
    
    // Add simulation message
    const newLog = {
      type: logType,
      date: new Date().toISOString().split('T')[0],
      notes: logNotes
    };
    details.interactions.unshift(newLog as any);
    
    // Clean states
    setLogNotes('');
    setShowLogModal(false);
  };

  // Get color for Health Score
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getHealthText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Moyen';
    return 'À Risque';
  };

  return (
    <div className="space-y-6">
      {/* Master Layout: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side: Master List */}
        <div className="xl:col-span-5 space-y-4">
          <Card>
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
              <div>
                <CardTitle>Annuaire Clients</CardTitle>
                <CardDescription>Liste filtrée des entreprises actives ({filteredTableCustomers.length})</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Search and Filters */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input
                  placeholder="Rechercher nom, contact, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs py-1.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="text-xs py-1"
                >
                  <option value="All">Secteur: Tout</option>
                  <option value="Startup">Startup</option>
                  <option value="PME">PME</option>
                  <option value="Clinique">Clinique</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Grande Entreprise">Grande Entreprise</option>
                </Select>

                <Select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="text-xs py-1 max-w-[120px]"
                >
                  <option value="All">Wilaya: Tout</option>
                  {wilayasList.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </Select>

                <Select
                  value={selectedHealth}
                  onChange={(e) => setSelectedHealth(e.target.value)}
                  className="text-xs py-1"
                >
                  <option value="All">Santé: Tout</option>
                  <option value="good">Excellent (&gt;80)</option>
                  <option value="warning">Moyen (50-80)</option>
                  <option value="danger">À Risque (&lt;50)</option>
                </Select>
              </div>

              {/* Customer Rows Scroll Area */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredTableCustomers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Aucun client trouvé avec ces critères.
                  </div>
                ) : (
                  filteredTableCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedCustomerId === cust.id 
                          ? 'border-[#4DA3FF] bg-[#EEF4F8]/50 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">ID: {cust.id}</span>
                        <Badge variant={getHealthColor(cust.healthScore)}>{cust.healthScore}/100</Badge>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{cust.name}</h4>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={10} />
                          <span>{cust.wilaya}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase size={10} />
                          <span>{cust.segment}</span>
                        </div>
                        <span className="font-semibold text-slate-700">{formatDA(cust.ltv)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Detail Customer 360 View */}
        <div className="xl:col-span-7">
          {details ? (
            <div className="space-y-6">
              {/* Main Client Profile Header Card */}
              <Card className="border-l-4 border-l-[#4DA3FF]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{details.customer.segment}</Badge>
                        <span className="text-xs font-semibold text-slate-400">ID: {details.customer.id}</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">{details.customer.name}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={14} className="text-slate-400" />
                        <span>Wilaya de {details.customer.wilaya}</span>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-4">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Health Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-base font-extrabold text-${getHealthColor(details.customer.healthScore) === 'success' ? 'emerald' : getHealthColor(details.customer.healthScore) === 'warning' ? 'amber' : 'red'}-600`}>
                            {details.customer.healthScore}
                          </span>
                          <Badge variant={getHealthColor(details.customer.healthScore)}>
                            {getHealthText(details.customer.healthScore)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial LTV & CAC Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valeur à Vie (LTV)</span>
                      <span className="text-sm font-bold text-slate-800">{formatDA(details.customer.ltv)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Coût d'Acquisition (CAC)</span>
                      <span className="text-sm font-bold text-slate-800">{formatDA(details.customer.cac)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ratio LTV / CAC</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {(details.customer.ltv / details.customer.cac).toFixed(1)}x
                      </span>
                    </div>
                  </div>

                  {/* Contact Info and Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Principal</span>
                      <div className="text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="font-bold flex items-center gap-1"><User size={12} className="text-slate-400" /> {details.customer.contactName}</span>
                        <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {details.customer.contactEmail}</span>
                        <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {details.customer.contactPhone}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowLogModal(true)}>
                        <MessageSquare size={14} className="mr-1.5" />
                        Journaliser
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traceability Pathway Timeline */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#4DA3FF]" />
                    Parcours d'Acquisition & Traçabilité
                  </CardTitle>
                  <CardDescription>Tracé chronologique du prospect jusqu'au paiement encaissé.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l border-slate-200 space-y-4 py-2">
                    {/* Step 1: Marketing Source */}
                    <div className="relative">
                      <span className="absolute -left-8 top-0.5 bg-[#EEF4F8] text-[#17345C] p-1 rounded-full border border-[#DCE5EE]">
                        <Layers size={10} />
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400">Canal d'Entrée Marketing</span>
                        <h5 className="text-xs font-bold text-slate-800">Source : {details.customer.source}</h5>
                      </div>
                    </div>

                    {/* Step 2: Commercial Assigned */}
                    <div className="relative">
                      <span className="absolute -left-8 top-0.5 bg-indigo-50 text-indigo-600 p-1 rounded-full border border-indigo-100">
                        <User size={10} />
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400">Prise en Charge Commerciale</span>
                        <h5 className="text-xs font-bold text-slate-800">Responsable : {details.commercial?.name || 'Non affecté'}</h5>
                      </div>
                    </div>

                    {/* Step 3: Project Delivered */}
                    {details.projects.length > 0 && (
                      <div className="relative">
                        <span className="absolute -left-8 top-0.5 bg-amber-50 text-amber-600 p-1 rounded-full border border-amber-100">
                          <Clock size={10} />
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400">Services & Livrables Actifs</span>
                          <h5 className="text-xs font-bold text-slate-800">
                            {details.projects.map(p => `${p.service} (${p.status})`).join(', ')}
                          </h5>
                        </div>
                      </div>
                    )}

                    {/* Step 4: First Transaction Payment */}
                    {details.transactions.length > 0 && (
                      <div className="relative">
                        <span className="absolute -left-8 top-0.5 bg-emerald-50 text-emerald-600 p-1 rounded-full border border-emerald-100">
                          <DollarSign size={10} />
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400">Statut de la Facturation Globale</span>
                          <h5 className="text-xs font-bold text-slate-800">
                            Dernière facture : {details.transactions[0].id} - {formatDA(details.transactions[0].amount)} ({details.transactions[0].status})
                          </h5>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions and Interactions tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Opportunities & Projects */}
                <div className="space-y-4">
                  {/* Active Services */}
                  <Card>
                    <CardHeader className="p-4 border-b border-slate-100">
                      <CardTitle className="text-sm">Prestations & Projets</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-52 overflow-y-auto">
                      {details.projects.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucun projet actif enregistré.</p>
                      ) : (
                        <div className="space-y-3">
                          {details.projects.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                              <div>
                                <p className="font-bold text-slate-700">{p.service}</p>
                                <span className="text-[10px] text-slate-400">Début : {p.startDate}</span>
                              </div>
                              <Badge variant={p.status === 'Terminé' ? 'success' : p.status === 'En cours' ? 'info' : p.status === 'En retard' ? 'danger' : 'warning'}>
                                {p.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Opportunities */}
                  <Card>
                    <CardHeader className="p-4 border-b border-slate-100">
                      <CardTitle className="text-sm">Opportunités Comm. ({details.opportunities.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-52 overflow-y-auto">
                      {details.opportunities.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucune opportunité enregistrée.</p>
                      ) : (
                        <div className="space-y-3">
                          {details.opportunities.map((opp, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                              <div>
                                <p className="font-bold text-slate-700">{opp.title}</p>
                                <span className="text-[10px] text-slate-400">Date : {opp.dateCreated}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-800">{formatDA(opp.value)}</p>
                                <Badge variant={opp.stage === 'Gagné' ? 'success' : opp.stage === 'Perdu' ? 'danger' : 'info'}>
                                  {opp.stage}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Interactions & History */}
                <div className="space-y-4">
                  {/* Interactions Log */}
                  <Card>
                    <CardHeader className="p-4 border-b border-slate-100">
                      <CardTitle className="text-sm">Activités & Comptes Rendus</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-[360px] overflow-y-auto">
                      {details.interactions.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucune interaction répertoriée.</p>
                      ) : (
                        <div className="space-y-4">
                          {details.interactions.map((int, idx) => (
                            <div key={idx} className="text-xs space-y-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{int.type}</Badge>
                                <span className="text-[10px] text-slate-400">{int.date}</span>
                              </div>
                              <p className="text-slate-600 italic font-medium">"{int.notes}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-12 text-slate-400 text-sm">
              Sélectionnez un client dans la liste pour voir sa vue 360°.
            </div>
          )}
        </div>
      </div>

      {/* Log Interaction Modal */}
      <Dialog 
        isOpen={showLogModal} 
        onClose={() => setShowLogModal(false)}
        title="Journaliser une Nouvelle Activité"
      >
        <form onSubmit={handleLogInteraction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Notes / Compte Rendu
            </label>
            <textarea
              required
              rows={4}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Saisissez les détails de l'interaction (ex: Appel pour qualifier le besoin, le client est intéressé par le système médical...)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
