'use client';

import React, { useState, useEffect } from 'react';
import { useFilters } from '@/context/FilterContext';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Input, Select, Button, Dialog } from '@/components/ui';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Target, 
  Search, 
  Plus, 
  Briefcase,
  ArrowRight,
  Filter,
  User,
  Calendar,
  AlertCircle,
  Inbox,
  CheckCircle2,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { formatDA } from '@/lib/utils';
import { Opportunity, RawLead } from '@/mock/data';

// Stages definition
const STAGES: Opportunity['stage'][] = ['Lead', 'Qualifié', 'Réunion', 'Proposition', 'Gagné', 'Perdu'];

const STAGE_COLORS: Record<Opportunity['stage'], string> = {
  'Lead': 'border-l-slate-400 bg-slate-50',
  'Qualifié': 'border-l-blue-400 bg-blue-50/5',
  'Réunion': 'border-l-amber-400 bg-amber-50/5',
  'Proposition': 'border-l-purple-400 bg-purple-50/5',
  'Gagné': 'border-l-emerald-400 bg-emerald-50/5',
  'Perdu': 'border-l-rose-400 bg-rose-50/5'
};

const STAGE_BADGES: Record<Opportunity['stage'], 'default' | 'info' | 'warning' | 'secondary' | 'success' | 'danger'> = {
  'Lead': 'default',
  'Qualifié': 'info',
  'Réunion': 'warning',
  'Proposition': 'secondary',
  'Gagné': 'success',
  'Perdu': 'danger'
};

export default function PipelinePage() {
  const { filters } = useFilters();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<RawLead[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [selectedLead, setSelectedLead] = useState<RawLead | null>(null);

  // Load opportunities and leads
  const fetchPipelineData = () => {
    setOpps(DataService.getFilteredOpportunities(filters));
    setLeads(DataService.getLeads());
  };

  useEffect(() => {
    fetchPipelineData();
  }, [filters]);

  const handleClaimLead = (leadId: string) => {
    const commercialId = user ? (user.name === 'Karim Cherif' ? 'SR01' : 'SR02') : 'SR01';
    DataService.claimLead(leadId, commercialId);
    fetchPipelineData();
    setSelectedLead(null);
  };

  // Filter opportunities by search term
  const filteredOpps = opps.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter incoming leads by search term
  const incomingLeads = leads.filter(l => 
    l.status === 'handed_over' &&
    (l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.requestedServices.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Group by stage
  const oppsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredOpps.filter(o => o.stage === stage);
    return acc;
  }, {} as Record<Opportunity['stage'], Opportunity[]>);

  // Pipeline summary metrics
  const totalValue = opps.reduce((sum, o) => sum + o.value, 0);
  const kpis = DataService.getKPIs(filters);
  const weightedValue = kpis.caPotentielPondere;
  const winRate = kpis.conversionRate;
  const avgCycleDays = 42; // standard baseline

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17345C]">Pipeline Commercial &amp; Opportunités</h2>
          <p className="text-xs text-[#6B7C93] mt-1">
            Suivi des négociations en cours, probabilités de signature et répartition de la valeur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6B7C93]" />
            <Input 
              placeholder="Rechercher une opportunité..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 h-9"
            />
          </div>
          <Button size="sm" className="flex items-center gap-1.5">
            <Plus size={14} />
            <span>Créer Deal</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-[#4DA3FF]/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider">
                Valeur Totale du Pipeline
              </span>
              <h3 className="text-lg font-black text-[#17345C]">
                {formatDA(totalValue)}
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <TrendingUp size={10} />
                <span>+12.4% vs trim. préc.</span>
              </div>
            </div>
            <div className="p-2 rounded bg-[#4DA3FF]/10 text-[#4DA3FF]">
              <DollarSign size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#4DA3FF]/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider">
                Valeur Potentielle Pondérée
              </span>
              <h3 className="text-lg font-black text-[#17345C]">
                {formatDA(weightedValue)}
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-[#6B7C93]">
                <span>Calculé par probabilité d'étape</span>
              </div>
            </div>
            <div className="p-2 rounded bg-[#17345C]/10 text-[#17345C]">
              <Target size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#4DA3FF]/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider">
                Cycle Moyen de Vente
              </span>
              <h3 className="text-lg font-black text-[#17345C]">
                {avgCycleDays} jours
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600">
                <AlertCircle size={10} />
                <span>Goulot d'étranglement en Proposition</span>
              </div>
            </div>
            <div className="p-2 rounded bg-[#F59E0B]/10 text-[#F59E0B]">
              <Clock size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#4DA3FF]/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider">
                Taux de Conversion (Win Rate)
              </span>
              <h3 className="text-lg font-black text-[#17345C]">
                {winRate.toFixed(1)}%
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <TrendingUp size={10} />
                <span>+2.1% d'amélioration</span>
              </div>
            </div>
            <div className="p-2 rounded bg-[#22C55E]/10 text-[#22C55E]">
              <TrendingUp size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {/* Incoming Column (handed_over Leads) */}
        <div className="flex flex-col min-w-[200px] bg-[#17345C]/5 border border-[#17345C]/15 rounded-lg p-3 space-y-3 h-[600px] ring-2 ring-[#4DA3FF]/10">
          <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#17345C] flex items-center gap-1">
                <Inbox size={12} className="text-[#4DA3FF] animate-pulse" />
                <span>Inbox Leads</span>
              </span>
              <Badge variant="info" className="px-1.5 py-0 bg-[#4DA3FF] text-white">
                {incomingLeads.length}
              </Badge>
            </div>
          </div>
          <div className="text-[10px] text-[#6B7C93] font-bold">
            Total: {formatDA(incomingLeads.reduce((sum, l) => sum + l.value, 0))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
            {incomingLeads.length === 0 ? (
              <div className="text-[10px] text-[#6B7C93] text-center py-8">
                Aucun lead en attente
              </div>
            ) : (
              incomingLeads.map((lead) => (
                <div 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="p-3 bg-white border-2 border-dashed border-[#4DA3FF]/30 hover:border-[#4DA3FF] rounded shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer space-y-2 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#4DA3FF]/10 rounded-bl-full flex items-center justify-center transition-colors group-hover:bg-[#4DA3FF]/20">
                    <span className="text-[9px] font-bold text-[#4DA3FF] -mt-1 -mr-1">Nouveau</span>
                  </div>

                  <h4 className="text-xs font-bold text-[#17345C] leading-snug pr-6">
                    {lead.companyName}
                  </h4>
                  <p className="text-[10px] text-[#6B7C93] font-medium">
                    Contact: {lead.name}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 pt-1">
                    {lead.requestedServices.map(service => (
                      <Badge key={service} variant="default" className="text-[8px] px-1 py-0 bg-slate-100 text-slate-700">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EEF4F8] text-[10px]">
                    <span className="font-black text-[#4DA3FF]">{formatDA(lead.value)}</span>
                    <Button 
                      size="sm" 
                      className="h-6 text-[9px] px-2 py-0 bg-[#4DA3FF] hover:bg-[#17345C] text-white font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimLead(lead.id);
                      }}
                    >
                      Accepter
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Standard Kanban Stages */}
        {STAGES.map((stage) => {
          const list = oppsByStage[stage] || [];
          const totalStageValue = list.reduce((sum, o) => sum + o.value, 0);
          
          return (
            <div key={stage} className="flex flex-col min-w-[200px] bg-[#EEF4F8]/50 border border-[#DCE5EE] rounded-lg p-3 space-y-3 h-[600px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#17345C]">{stage}</span>
                  <Badge variant={STAGE_BADGES[stage]} className="px-1.5 py-0">
                    {list.length}
                  </Badge>
                </div>
              </div>
              <div className="text-[10px] text-[#6B7C93] font-bold">
                Total: {formatDA(totalStageValue)}
              </div>

              {/* Stage Cards Scroll Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
                {list.length === 0 ? (
                  <div className="text-[10px] text-[#6B7C93] text-center py-8">
                    Aucun deal
                  </div>
                ) : (
                  list.map((opp) => (
                    <div 
                      key={opp.id}
                      onClick={() => setSelectedOpp(opp)}
                      className={`p-3 bg-white border border-[#DCE5EE] border-l-4 ${STAGE_COLORS[stage]} rounded shadow-sm hover:shadow transition-all duration-200 cursor-pointer space-y-2`}
                    >
                      <h4 className="text-xs font-bold text-[#17345C] line-clamp-2 leading-snug">
                        {opp.title.split(' - ')[0]}
                      </h4>
                      <p className="text-[10px] text-[#6B7C93] font-semibold truncate">
                        {opp.title.split(' - ')[1] || 'Prospect'}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#EEF4F8] text-[10px]">
                        <span className="font-extrabold text-[#17345C]">{formatDA(opp.value)}</span>
                        <div className="flex items-center text-[#6B7C93]" title={`ID Commercial: ${opp.commercialId}`}>
                          <User size={10} className="mr-0.5 text-[#6B7C93]" />
                          <span>{opp.commercialId.replace('emp-', '')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Opportunity Detail Modal Dialog */}
      <Dialog 
        isOpen={selectedOpp !== null} 
        onClose={() => setSelectedOpp(null)}
        title="Détails de l'Opportunité Commerciale"
      >
        {selectedOpp && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={STAGE_BADGES[selectedOpp.stage]}>{selectedOpp.stage}</Badge>
              <span className="text-xs text-[#6B7C93]">ID: {selectedOpp.id}</span>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">Titre de l'opportunité</label>
              <h3 className="text-base font-extrabold text-[#17345C]">{selectedOpp.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">Valeur estimée</label>
                <div className="text-lg font-black text-[#4DA3FF]">{formatDA(selectedOpp.value)}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">Date de création</label>
                <div className="text-xs text-[#17345C] font-semibold flex items-center gap-1.5 mt-1">
                  <Calendar size={14} className="text-[#6B7C93]" />
                  <span>{new Date(selectedOpp.dateCreated).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#EEF4F8] border border-[#DCE5EE] rounded-lg space-y-1.5">
              <h4 className="text-xs font-bold text-[#17345C] flex items-center gap-1">
                <Briefcase size={12} className="text-[#6B7C93]" />
                <span>Commercial Assigné</span>
              </h4>
              <p className="text-xs text-[#6B7C93]">
                Cette affaire est pilotée par le conseiller commercial référencé sous le matricule : <span className="font-bold text-[#17345C]">{selectedOpp.commercialId}</span>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedOpp(null)}>
                Fermer
              </Button>
              <Button size="sm" className="flex items-center gap-1">
                <span>Aller à la fiche client</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* RawLead Detail Modal Dialog */}
      <Dialog 
        isOpen={selectedLead !== null} 
        onClose={() => setSelectedLead(null)}
        title="Détails du Nouveau Lead Qualifié"
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="info" className="bg-[#4DA3FF] text-white">Nouveau Lead (Marketing)</Badge>
              <span className="text-xs text-[#6B7C93]">ID: {selectedLead.id}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building size={16} className="text-[#6B7C93] mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#17345C]">{selectedLead.companyName}</h4>
                  <p className="text-xs text-[#6B7C93] flex items-center gap-1 mt-0.5">
                    <User size={12} />
                    <span>{selectedLead.name}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EEF4F8]">
                <div className="flex items-center gap-2 text-xs text-[#6B7C93]">
                  <Mail size={14} />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7C93]">
                  <Phone size={14} />
                  <span>{selectedLead.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#EEF4F8]">
              <label className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">Offres / Services demandés</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedLead.requestedServices.map(service => (
                  <Badge key={service} variant="secondary" className="text-xs font-semibold">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#EEF4F8]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">Budget estimé</label>
                <div className="text-lg font-black text-[#4DA3FF]">{formatDA(selectedLead.value)}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">Transmis le</label>
                <div className="text-xs text-[#17345C] font-semibold flex items-center gap-1.5 mt-1">
                  <Calendar size={14} className="text-[#6B7C93]" />
                  <span>{new Date(selectedLead.dateCreated).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                Fermer
              </Button>
              <Button 
                size="sm" 
                className="flex items-center gap-1.5 bg-[#4DA3FF] hover:bg-[#17345C] text-white"
                onClick={() => handleClaimLead(selectedLead.id)}
              >
                <CheckCircle2 size={14} />
                <span>Accepter &amp; Intégrer au Pipeline</span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

