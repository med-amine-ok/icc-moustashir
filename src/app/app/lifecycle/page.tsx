'use client';

import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button } from '@/components/ui';
import { 
  Clock, 
  Hourglass, 
  RefreshCw, 
  Sparkles, 
  ArrowUpRight, 
  Calendar, 
  Download,
  Flame,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { formatDate } from '@/lib/utils';

export default function LifecyclePage() {
  const { filters } = useFilters();
  const kpis = DataService.getKPIs(filters);
  const customers = DataService.getFilteredCustomers(filters);
  const opportunities = DataService.getFilteredOpportunities(filters);
  const projects = DataService.getFilteredProjects(filters);

  // Simulated metrics matching visual requirements
  const lifecycleKPIs = [
    {
      title: 'Temps de Premier Contact',
      value: '1,2 h',
      icon: Clock,
      color: 'text-[#4DA3FF] bg-[#4DA3FF]/10',
      change: '-15% vs mois préc.',
      isPositive: true
    },
    {
      title: 'Délai de Signature',
      value: '14 jours',
      icon: Hourglass,
      color: 'text-[#17345C] bg-[#17345C]/10',
      change: '-2 jours vs mois préc.',
      isPositive: true
    },
    {
      title: 'Taux de Rétention',
      value: `${(94.2 + (kpis.grossMarginPercent / 100)).toFixed(1)}%`,
      icon: RefreshCw,
      color: 'text-emerald-600 bg-emerald-500/10',
      change: '+1.1% vs mois préc.',
      isPositive: true
    },
    {
      title: 'Taux de Cross-sell',
      value: '22,5%',
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-500/10',
      change: '+3.4% vs mois préc.',
      isPositive: true
    },
    {
      title: 'Taux d\'Upsell',
      value: '18,1%',
      icon: ArrowUpRight,
      color: 'text-violet-600 bg-violet-500/10',
      change: '+0.8% vs mois préc.',
      isPositive: true
    },
    {
      title: 'Âge Moyen Client',
      value: '3,4 ans',
      icon: Calendar,
      color: 'text-[#6B7C93] bg-[#EEF4F8]',
      change: 'Stable',
      isPositive: null
    }
  ];

  // Cohort analysis mock data (Algerian localized)
  const cohorts = [
    { name: 'Cohorte Q1 2025', count: 42, m0: '100%', m1: '95%', m2: '92%', m3: '90%', m4: '88%', m5: '88%' },
    { name: 'Cohorte Q2 2025', count: 56, m0: '100%', m1: '96%', m2: '94%', m3: '91%', m4: '89%', m5: '-' },
    { name: 'Cohorte Q3 2025', count: 68, m0: '100%', m1: '94%', m2: '91%', m3: '88%', m4: '-', m5: '-' },
    { name: 'Cohorte Q4 2025', count: 75, m0: '100%', m1: '97%', m2: '95%', m3: '-', m4: '-', m5: '-' },
    { name: 'Cohorte Q1 2026', count: 84, m0: '100%', m1: '96%', m2: '-', m3: '-', m4: '-', m5: '-' },
  ];

  // Conversion funnel data
  const conversionFunnel = [
    { stage: 'Prospects (Leads)', count: Math.round(opportunities.length * 1.5), percent: '100%' },
    { stage: 'Contactés', count: Math.round(opportunities.length * 1.2), percent: '80%' },
    { stage: 'Qualifiés', count: opportunities.filter(o => o.stage !== 'Lead' && o.stage !== 'Perdu').length + 80, percent: '56%' },
    { stage: 'Négociation', count: opportunities.filter(o => o.stage === 'Proposition' || o.stage === 'Réunion').length + 30, percent: '32%' },
    { stage: 'Clients Signés', count: customers.length, percent: '22%' },
    { stage: 'Clients Fidèles', count: customers.filter(c => c.healthScore > 85).length, percent: '14%' },
  ];

  // Live entity tracking (Recent customer lifecycle movements)
  const recentActivities = customers.slice(0, 5).map((c, i) => {
    const statusChange = [
      'est devenu Client Actif après signature du contrat.',
      'a renouvelé son abonnement annuel de maintenance.',
      'est passé en statut À Risque en raison d\'un projet en retard.',
      'a validé une commande additionnelle (cross-sell).',
      'a terminé sa phase d\'onboarding avec succès.'
    ][i % 5];

    return {
      id: c.id,
      customerName: c.name,
      segment: c.segment,
      changeText: statusChange,
      date: c.dateAcquired,
      health: c.healthScore
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17345C]">Parcours & Cycle de Vie Client</h2>
          <p className="text-xs text-[#6B7C93] mt-1">
            Analyse de la vélocité commerciale, de l'onboarding et des cohortes de fidélisation.
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download size={14} />
          <span>Exporter Rapport</span>
        </Button>
      </div>

      {/* Lifecycle KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {lifecycleKPIs.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:border-[#4DA3FF]/20 transition-colors">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block truncate">
                    {kpi.title}
                  </span>
                  <div className={`p-1.5 rounded ${kpi.color}`}>
                    <Icon size={14} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#17345C]">{kpi.value}</h4>
                  <p className={`text-[9px] font-bold mt-0.5 ${
                    kpi.isPositive === true ? 'text-emerald-600' :
                    kpi.isPositive === false ? 'text-rose-600' : 'text-[#6B7C93]'
                  }`}>
                    {kpi.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Entonnoir de Conversion du Cycle de Vie</CardTitle>
            <CardDescription>Visualisation du volume et du taux de passage d'une étape à l'autre.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={conversionFunnel} layout="vertical" margin={{ left: 20, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DCE5EE" />
                <XAxis type="number" stroke="#6B7C93" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke="#6B7C93" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #DCE5EE', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar name="Volume" dataKey="count" fill="#4DA3FF" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-[#6B7C93] text-center font-medium">
              Taux de conversion global Lead → Client Actif : <span className="text-[#4DA3FF] font-bold">14.2%</span>
            </div>
          </CardContent>
        </Card>

        {/* Cohort Retention Heatmap (Graphical representation) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rétention Standardisée des Cohortes</CardTitle>
            <CardDescription>Suivi de la fidélisation des nouveaux clients par trimestre d'acquisition.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Cohorte</TableHead>
                  <TableHead className="font-bold text-center">Clients</TableHead>
                  <TableHead className="font-bold text-center">M0</TableHead>
                  <TableHead className="font-bold text-center">M3</TableHead>
                  <TableHead className="font-bold text-center">M6</TableHead>
                  <TableHead className="font-bold text-center">M9</TableHead>
                  <TableHead className="font-bold text-center">M12</TableHead>
                  <TableHead className="font-bold text-center">M18</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohorts.map((cohort, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-[#17345C] text-xs">{cohort.name}</TableCell>
                    <TableCell className="text-center font-bold text-[#6B7C93] text-xs">{cohort.count}</TableCell>
                    <TableCell className="text-center text-xs bg-emerald-500/10 text-emerald-800 font-semibold">{cohort.m0}</TableCell>
                    <TableCell className="text-center text-xs bg-emerald-500/20 text-emerald-800 font-semibold">{cohort.m1}</TableCell>
                    <TableCell className="text-center text-xs bg-emerald-500/15 text-emerald-800 font-semibold">{cohort.m2}</TableCell>
                    <TableCell className="text-center text-xs bg-emerald-500/10 text-emerald-800 font-semibold">{cohort.m3}</TableCell>
                    <TableCell className={`text-center text-xs ${cohort.m4 !== '-' ? 'bg-emerald-500/5 text-emerald-800 font-semibold' : 'text-slate-300'}`}>{cohort.m4}</TableCell>
                    <TableCell className={`text-center text-xs ${cohort.m5 !== '-' ? 'bg-emerald-500/5 text-emerald-800 font-semibold' : 'text-slate-300'}`}>{cohort.m5}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 text-[10px] text-[#6B7C93] font-medium border-t border-[#DCE5EE] flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-emerald-500/20"></span>
              <span>Une couleur plus sombre indique un meilleur taux de rétention client. Rétention moyenne à M12 : <span className="text-[#17345C] font-bold">88.7%</span></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Entity Tracking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Suivi en Temps Réel du Cycle de Vie</CardTitle>
            <CardDescription>Flux opérationnels récents et transitions de statut dans le portefeuille.</CardDescription>
          </div>
          <Badge variant="info">Mise à jour en direct</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Événement Parcours</TableHead>
                <TableHead>Santé Client</TableHead>
                <TableHead>Date d'activité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((act) => (
                <TableRow key={act.id}>
                  <TableCell className="font-bold text-[#17345C]">{act.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{act.segment}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#6B7C93] flex items-center gap-2 py-4">
                    <UserCheck size={14} className="text-[#4DA3FF]" />
                    <span>{act.changeText}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        act.health > 80 ? 'bg-emerald-500' :
                        act.health > 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs font-semibold">{act.health} / 100</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[#6B7C93] font-medium">
                    {formatDate(act.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
