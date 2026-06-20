'use client';

import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button } from '@/components/ui';
import { 
  Users, 
  Target, 
  TrendingUp, 
  ArrowUpRight, 
  Coins, 
  Download,
  Filter
} from 'lucide-react';
import { formatDA } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#17345C', '#4DA3FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function MarketingPage() {
  const { filters } = useFilters();
  const kpis = DataService.getKPIs(filters);
  const channelsData = DataService.getAttributionChart(filters);

  const [leads, setLeads] = React.useState<any[]>([]);
  const [exitingLeads, setExitingLeads] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setLeads(DataService.getLeads());
  }, []);

  const handleQualify = (id: string) => {
    const updated = DataService.updateLeadStatus(id, 'potential_client');
    setLeads(updated);
  };

  const handleSendToCommercial = (id: string) => {
    setExitingLeads(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      const updated = DataService.updateLeadStatus(id, 'handed_over');
      setLeads(updated);
      setExitingLeads(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 500);
  };

  // Consolidated statistics
  const totalLeads = channelsData.reduce((sum, c) => sum + c.leads, 0) * 10; // scaled for total visits context
  const qualifiedLeads = Math.round(totalLeads * 0.25);
  const blendedCac = kpis.avgCac;
  const overallRoi = kpis.avgCac > 0 ? Math.round((kpis.avgLtv / kpis.avgCac) * 100) : 342;

  // Funnel representation
  const funnelData = [
    { name: 'Visiteurs', value: totalLeads * 10, percent: '100%' },
    { name: 'Leads Générés', value: totalLeads, percent: '10%' },
    { name: 'Qualifiés (MQL)', value: qualifiedLeads, percent: '2.5%' },
    { name: 'Gagnés (Clients)', value: kpis.clientCount, percent: '0.4%' }
  ];

  // Pie chart data for Revenue by Channel
  const pieData = channelsData.map(c => ({
    name: c.name,
    value: c.revenue
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Attribution Marketing & Acquisition</h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyse de la rentabilité des canaux d'acquisition, du CAC opérationnel et de la valeur client (LTV).
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download size={14} />
          <span>Exporter Rapport</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Leads Générés
              </span>
              <h3 className="text-lg font-black text-slate-800">
                {totalLeads.toLocaleString('fr-FR')}
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <TrendingUp size={10} />
                <span>+14.2% vs trim. préc.</span>
              </div>
            </div>
            <div className="p-2 rounded bg-[#EEF4F8] text-[#4DA3FF]">
              <Users size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Leads Qualifiés (MQL)
              </span>
              <h3 className="text-lg font-black text-slate-800">
                {qualifiedLeads.toLocaleString('fr-FR')}
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <TrendingUp size={10} />
                <span>+8.5% vs trim. préc.</span>
              </div>
            </div>
            <div className="p-2 rounded bg-indigo-50 text-indigo-600">
              <Target size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CAC Moyen Consolidé
              </span>
              <h3 className="text-lg font-black text-slate-800">
                {formatDA(blendedCac)}
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <TrendingUp size={10} />
                <span>-2.1% d'optimisation</span>
              </div>
            </div>
            <div className="p-2 rounded bg-amber-50 text-amber-600">
              <Coins size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ROI Moyen du Pipeline
              </span>
              <h3 className="text-lg font-black text-slate-800">
                {overallRoi}%
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <TrendingUp size={10} />
                <span>+12.4% vs trim. préc.</span>
              </div>
            </div>
            <div className="p-2 rounded bg-emerald-50 text-emerald-600">
              <ArrowUpRight size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel of Acquisition */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Entonnoir d'Acquisition</CardTitle>
            <CardDescription>Flux d'acquisition du trafic jusqu'à la signature finale.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar name="Volume" dataKey="value" fill="#17345C" radius={[0, 4, 4, 0]} barSize={16}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#17345C' : '#4DA3FF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Channel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Chiffre d'Affaires par Canal</CardTitle>
            <CardDescription>Répartition du chiffre d'affaires cumulé par source d'origine.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatDA(val)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Color Legend */}
            <div className="grid grid-cols-3 gap-2 w-full text-[9px] font-bold text-slate-500 pt-2 border-t border-slate-100">
              {pieData.map((d, index) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CAC vs LTV by Channel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Rapport LTV : CAC</CardTitle>
            <CardDescription>Comparatif de l'efficacité d'acquisition par canal (LTV vs CAC).</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelsData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => formatDA(val)} />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="LTV Moyenne" dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar name="CAC Moyen" dataKey="cac" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Channel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytique des Canaux d'Acquisition</CardTitle>
          <CardDescription>Rapport comptable consolidé par origine de trafic.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal d'acquisition</TableHead>
                <TableHead className="text-center">Leads Générés</TableHead>
                <TableHead className="text-center">Clients Signés</TableHead>
                <TableHead className="text-right">Coût Moyen d'Acquisition (CAC)</TableHead>
                <TableHead className="text-right">Chiffre d'Affaires Généré (LTV)</TableHead>
                <TableHead className="text-right">Multiplicateur ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelsData.map((channel, index) => (
                <TableRow key={channel.name}>
                  <TableCell className="font-bold text-slate-800 flex items-center gap-2 py-4">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span>{channel.name}</span>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-slate-600">{channel.leads}</TableCell>
                  <TableCell className="text-center font-semibold text-slate-600">{channel.clients}</TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">{formatDA(channel.cac)}</TableCell>
                  <TableCell className="text-right font-black text-emerald-600">{formatDA(channel.revenue)}</TableCell>
                  <TableCell className="text-right font-extrabold text-blue-600">
                    <Badge variant={channel.roi > 400 ? 'success' : 'info'}>{(channel.roi / 100).toFixed(1)}x</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leads Acquisition & Qualification Queue */}
      <Card className="mt-8 border-[#4DA3FF]/20">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-[#17345C] flex items-center gap-2">
                <Users size={20} className="text-[#4DA3FF]" />
                <span>File d'Attente des Leads Brut (raw_leads)</span>
              </CardTitle>
              <CardDescription>
                Qualifiez les prospects entrants ou transférez-les directement au service Commercial.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" className="px-2.5 py-1 text-xs">
                {leads.filter(l => l.status === 'raw_lead' || l.status === 'potential_client').length} En attente
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Prospect / Entreprise</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Services Demandés</TableHead>
                  <TableHead className="text-right">Valeur Estimée</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.filter(l => l.status === 'raw_lead' || l.status === 'potential_client').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      Aucun lead brut dans la file d'attente actuelle.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads
                    .filter(l => l.status === 'raw_lead' || l.status === 'potential_client')
                    .map((lead) => {
                      const isExiting = exitingLeads[lead.id];
                      return (
                        <TableRow 
                          key={lead.id} 
                          className={`transition-all duration-500 transform origin-center ${
                            isExiting 
                              ? 'opacity-0 scale-95 bg-rose-50/20 translate-x-12' 
                              : 'hover:bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="py-4">
                            <div className="font-extrabold text-slate-800">{lead.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{lead.companyName}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-xs text-slate-700 font-semibold">{lead.email}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{lead.phone}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {lead.requestedServices.map((service: string) => (
                                <Badge key={service} variant="secondary" className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-700 font-bold border-none">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-[#17345C] py-4">
                            {formatDA(lead.value)}
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <Badge 
                              variant={lead.status === 'potential_client' ? 'info' : 'default'}
                              className="px-2 py-0.5 text-[10px] font-bold"
                            >
                              {lead.status === 'potential_client' ? 'Client Potentiel' : 'Lead Brut'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {lead.status === 'raw_lead' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleQualify(lead.id)}
                                  className="h-8 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                                >
                                  Qualifier
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                onClick={() => handleSendToCommercial(lead.id)}
                                className="h-8 text-xs font-black bg-[#4DA3FF] hover:bg-[#3b8fd9] text-white flex items-center gap-1 shadow-sm"
                              >
                                Envoyer au Commercial
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
               </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
