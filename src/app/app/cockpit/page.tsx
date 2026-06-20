'use client';

import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge } from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  UserPlus, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Activity,
  Briefcase
} from 'lucide-react';
import { formatDA } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import Link from 'next/link';

export default function CockpitPage() {
  const { filters } = useFilters();
  const kpis = DataService.getKPIs(filters);
  const revenueData = DataService.getMonthlyRevenueChart(filters);
  const funnelData = DataService.getLeadFunnelData(filters);

  // Computed 4-axis KPIs matching the Image framework
  const growthRate = (() => {
    if (revenueData.length < 2) return '+12.5%';
    const last = revenueData[revenueData.length - 1].revenu;
    const prev = revenueData[revenueData.length - 2].revenu;
    if (prev === 0) return '+12.5%';
    const pct = ((last - prev) / prev) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  })();

  const meetingsCount = funnelData.find(f => f.stage === 'Réunion')?.count || 0;

  const totalProjects = DataService.getFilteredProjects(filters).length;

  const successRate = (() => {
    const projects = DataService.getFilteredProjects(filters);
    if (projects.length === 0) return 85.0;
    return ((projects.length - kpis.delayedProjects) / projects.length) * 100;
  })();

  // Simulated alerts matching screen requirements
  const alerts = [
    {
      id: 1,
      type: 'lead',
      title: 'Opportunité Chaude',
      desc: 'Clinique Dr. Selma a demandé une proposition de contrat finale.',
      time: 'Il y a 10 min',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      link: '/app/pipeline'
    },
    {
      id: 2,
      type: 'followup',
      title: 'Relance en retard',
      desc: '3 prospects qualifiés n\'ont pas été contactés depuis 48h.',
      time: 'Il y a 1h',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      link: '/app/employees'
    },
    {
      id: 3,
      type: 'project',
      title: 'Projet en retard',
      desc: 'E-commerce Sarl Dahmani (Oran) affiche 5 jours de décalage.',
      time: 'Il y a 3h',
      icon: AlertTriangle,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      link: '/app/customers'
    },
    {
      id: 4,
      type: 'quality',
      title: 'Qualité des Données',
      desc: 'Score en baisse. 12 fiches clients n\'ont pas de wilaya associée.',
      time: 'Il y a 5h',
      icon: AlertTriangle,
      color: 'text-[#4DA3FF] bg-[#4DA3FF]/10 border-[#4DA3FF]/20',
      link: '/app/data-health'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tableau de Bord Principal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Indicateurs de performance consolidés en temps réel. Devise : Dinar Algérien (DA).
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Chiffre d'Affaires Réalisé */}
        <Card className="hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CA Réalisé (Payé)
              </span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {formatDA(kpis.caRealise)}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} />
                <span>+12.5% vs mois préc.</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#EEF4F8] text-[#17345C]">
              <Wallet size={20} />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Pipeline Commercial Pondéré */}
        <Card className="hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CA Potentiel Pondéré
              </span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {formatDA(kpis.caPotentielPondere)}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} />
                <span>+8.2% vs mois préc.</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Marge Brute Est. */}
        <Card className="hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Marge Brute Estimée
              </span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {kpis.grossMarginPercent.toFixed(1)}%
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                <TrendingDown size={12} />
                <span>-1.5% vs mois préc.</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Percent size={20} />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: CAC Moyen */}
        <Card className="hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CAC Moyen par Client
              </span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {formatDA(kpis.avgCac)}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingDown size={12} />
                <span>-5.0% d'optimisation</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <UserPlus size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Les 4 Axes Stratégiques (Vision 33) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4DA3FF]"></span>
            Les 4 Axes Stratégiques (Vision 33)
          </h3>
          <Badge className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-transparent hover:bg-transparent">
            Cadre de Performance Officiel
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* AXE 1: Performance Financière */}
          <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-[#4DA3FF]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>AXE 1 — Performance Financière</span>
                <span className="p-1 rounded bg-[#4DA3FF]/10 text-[#4DA3FF]"><Wallet size={14} /></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">CA Réalisé</div>
                  <div className="font-bold text-slate-700 mt-0.5 truncate">{formatDA(kpis.caRealise)}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Taux Croissance</div>
                  <div className="font-bold text-emerald-600 mt-0.5">{growthRate}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">CAC Moyen</div>
                  <div className="font-bold text-slate-700 mt-0.5 truncate">{formatDA(kpis.avgCac)}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Marge Service</div>
                  <div className="font-bold text-slate-700 mt-0.5">{kpis.grossMarginPercent.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AXE 2: Performance Commerciale */}
          <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>AXE 2 — Performance Commerciale</span>
                <span className="p-1 rounded bg-indigo-50 text-indigo-500"><TrendingUp size={14} /></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Leads</div>
                  <div className="font-bold text-slate-700 mt-0.5">{kpis.oppCount}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Meetings</div>
                  <div className="font-bold text-slate-700 mt-0.5">{meetingsCount}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Taux Conversion</div>
                  <div className="font-bold text-slate-700 mt-0.5">{kpis.conversionRate.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Cycle de Vente</div>
                  <div className="font-bold text-slate-700 mt-0.5">42 jours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AXE 3: Connaissance Client */}
          <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>AXE 3 — Connaissance Client</span>
                <span className="p-1 rounded bg-emerald-50 text-emerald-500"><Users size={14} /></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Segmentation</div>
                  <div className="font-bold text-slate-700 mt-0.5">6 Secteurs</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Acquisition</div>
                  <div className="font-bold text-slate-700 mt-0.5">{kpis.clientCount} Clients</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Rétention</div>
                  <div className="font-bold text-slate-700 mt-0.5">94.2%</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Lifetime Value</div>
                  <div className="font-bold text-slate-700 mt-0.5 truncate">{formatDA(kpis.avgLtv)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AXE 4: Performance Opérationnelle */}
          <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>AXE 4 — Performance Opérationnelle</span>
                <span className="p-1 rounded bg-amber-50 text-amber-500"><Activity size={14} /></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Missions Traitées</div>
                  <div className="font-bold text-slate-700 mt-0.5">{totalProjects}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Temps Traitement</div>
                  <div className="font-bold text-slate-700 mt-0.5">34 jours</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-400 font-medium">Taux Réussite</div>
                  <div className="font-bold text-slate-700 mt-0.5">{successRate.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-50 p-2 rounded bg-[#EEF4F8]/40">
                  <div className="text-[10px] text-slate-400 font-medium">Statut Glob.</div>
                  <div className="font-bold text-emerald-600 mt-0.5">Maîtrisé</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Evolution du CA Réalisé vs Dépenses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historique Financier & Évolution Mensuelle</CardTitle>
            <CardDescription>
              Comparatif des revenus encaissés (CA Réalisé), coûts opérationnels et marge générée.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4DA3FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4DA3FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatDA(val), '']} 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Area name="CA Réalisé" type="monotone" dataKey="revenu" stroke="#4DA3FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenu)" />
                <Area name="Marge Brute" type="monotone" dataKey="marge" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorMarge)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Pipeline de conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Entonnoir Commercial</CardTitle>
            <CardDescription>
              Volume et répartition de la valeur des opportunités par étape de conversion.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="stage" type="category" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val: any) => [formatDA(val), 'Valeur']}
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar name="Valeur Totale" dataKey="value" fill="#17345C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Action Alerts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Critical Follow-ups */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle>Alertes & Actions Recommandées</CardTitle>
              <CardDescription>Événements critiques nécessitant votre attention ou arbitrage.</CardDescription>
            </div>
            <Badge variant="warning">{alerts.length} Alertes</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {alerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-lg border ${alert.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800">{alert.title}</h4>
                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">{alert.desc}</p>
                    </div>
                    <Link 
                      href={alert.link}
                      className="p-1 text-slate-400 hover:text-[#4DA3FF] hover:bg-slate-100 rounded transition-colors self-center cursor-pointer"
                      title="Inspecter"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Customer health status widget */}
        <Card>
          <CardHeader>
            <CardTitle>Santé du Portefeuille</CardTitle>
            <CardDescription>État général de satisfaction des clients actifs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Excellent (&gt;80)</span>
                <span className="font-bold text-[#22C55E]">72%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Modéré (50-80)</span>
                <span className="font-bold text-[#F59E0B]">22%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>À risque (&lt;50)</span>
                <span className="font-bold text-[#EF4444]">6%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#EF4444] h-full rounded-full" style={{ width: '6%' }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Clients sous surveillance</span>
              <Link href="/app/customers" className="font-bold text-[#4DA3FF] hover:underline cursor-pointer">
                Consulter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
