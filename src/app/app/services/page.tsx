'use client';

import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge } from '@/components/ui';
import { PieChart, TrendingUp, DollarSign, Award, Percent, Layers, ShieldCheck } from 'lucide-react';
import { formatDA } from '@/lib/utils';

export default function ServicesPage() {
  const { filters } = useFilters();
  const servicePerf = DataService.getServicePerformance(filters);
  const segmentMetrics = DataService.getSegmentMetrics(filters);

  // Define segments and services for the heatmap matrix
  const segments = ['Startup', 'PME', 'Clinique', 'Éducation', 'Marketplace', 'Grande Entreprise'];
  const services = [
    'Branding',
    'Stratégie Marketing',
    'Landing Page',
    'Site Vitrine',
    'Site Institutionnel',
    'E-commerce',
    'Système Médical',
    'Marketplace',
    'Application Mobile',
    'Hébergement',
    'Maintenance',
    'Conseil'
  ];

  // Helper to generate a semi-deterministic margin based on service & segment
  const getMatrixMargin = (service: string, segment: string): number => {
    // Basic hash function based on characters to keep it stable
    const hash = service.charCodeAt(0) + segment.charCodeAt(0);
    // Margins between 15% and 85%
    const baseMargin = 15 + (hash % 71);
    
    // Adjust based on segment/service characteristics
    if (segment === 'Startup' && service.includes('Médical')) return 78;
    if (segment === 'Grande Entreprise' && service.includes('Conseil')) return 85;
    if (segment === 'PME' && service.includes('Landing')) return 45;
    if (segment === 'Clinique' && service.includes('Médical')) return 72;
    if (segment === 'Éducation' && service.includes('Vitrine')) return 55;
    if (segment === 'Marketplace' && service.includes('Marketplace')) return 65;

    return baseMargin;
  };

  // Heatmap styling helper based on margin value
  const getHeatmapBg = (margin: number) => {
    if (margin >= 80) return 'bg-[#17345C] text-white';
    if (margin >= 70) return 'bg-[#1f4270] text-white';
    if (margin >= 60) return 'bg-[#275084] text-white';
    if (margin >= 55) return 'bg-[#31619b] text-white';
    if (margin >= 45) return 'bg-[#3c74b5] text-white';
    if (margin >= 35) return 'bg-[#4DA3FF] text-white';
    if (margin >= 25) return 'bg-[#78b9ff] text-[#17345C]';
    if (margin >= 15) return 'bg-[#a3cfff] text-[#17345C]';
    return 'bg-[#cee5ff] text-[#17345C]';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Rentabilité Offres & Secteurs</h2>
        <p className="text-xs text-slate-500 mt-1">
          Analyse croisée de la marge brute et des performances financières par ligne de service et segment client.
        </p>
      </div>

      {/* KPI Highlight row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Secteur</span>
              <h4 className="text-base font-extrabold text-slate-800">Startup</h4>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} />
                <span>+12.4% de Marge YoY</span>
              </div>
            </div>
            <div className="p-3 rounded bg-[#EEF4F8] text-[#4DA3FF]">
              <Layers size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Service</span>
              <h4 className="text-base font-extrabold text-slate-800">Système Médical</h4>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#4DA3FF]">
                <Percent size={12} />
                <span>68% de marge moy.</span>
              </div>
            </div>
            <div className="p-3 rounded bg-emerald-50 text-emerald-600">
              <Award size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CAC le plus bas</span>
              <h4 className="text-base font-extrabold text-slate-800">Vitrine x PME</h4>
              <div className="text-[10px] font-bold text-slate-500">
                <span>{formatDA(32000)} d'Acquisition</span>
              </div>
            </div>
            <div className="p-3 rounded bg-amber-50 text-amber-600">
              <DollarSign size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LTV la plus haute</span>
              <h4 className="text-base font-extrabold text-slate-800">Conseil x Corp</h4>
              <div className="text-[10px] font-bold text-slate-500">
                <span>{formatDA(20000000)} de valeur</span>
              </div>
            </div>
            <div className="p-3 rounded bg-purple-50 text-purple-600">
              <ShieldCheck size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Matrice de Marge de Rentabilité (%)</CardTitle>
            <CardDescription>
              Rentabilité croisée. Les cellules plus foncées indiquent des marges plus élevées.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Marge faible</span>
            <div className="w-24 h-3 bg-gradient-to-r from-[#cee5ff] to-[#17345C] rounded"></div>
            <span className="text-slate-700 font-semibold">Marge élevée</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    Service / Offre
                  </th>
                  {segments.map((seg) => (
                    <th key={seg} className="px-4 py-3 text-xs font-bold text-slate-700 bg-slate-50/50">
                      {seg}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr key={service} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 truncate max-w-[180px]">
                      {service}
                    </td>
                    {segments.map((seg) => {
                      const margin = getMatrixMargin(service, seg);
                      return (
                        <td key={seg} className="p-1">
                          <div className={`py-3 rounded font-bold text-xs ${getHeatmapBg(margin)}`}>
                            {margin}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Services performance listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of performance by service */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Volumes Financiers par Service (Payé)</CardTitle>
            <CardDescription>
              Volume total du chiffre d'affaires encaissé par type de prestation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Service</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase text-center">Contrats réglés</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase text-right">CA Encaissé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {servicePerf.map((perf, index) => (
                    <tr key={perf.service} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        {perf.service}
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600 font-bold">
                        {perf.count}
                      </td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">
                        {formatDA(perf.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* LTV & CAC ratio by customer segment */}
        <Card>
          <CardHeader>
            <CardTitle>Efficience par Segment Client</CardTitle>
            <CardDescription>
              Comparatif du coût d'acquisition client (CAC) et de la valeur de vie (LTV).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {segmentMetrics.map((seg) => (
              <div key={seg.segment} className="p-3 border border-slate-100 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">{seg.segment}</span>
                  <Badge variant={seg.ratio >= 15 ? 'success' : seg.ratio >= 5 ? 'info' : 'warning'}>
                    Ratio: {seg.ratio}x
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div>
                    <p className="uppercase font-semibold tracking-wider">CAC Moyen</p>
                    <p className="text-xs font-bold text-slate-700">{formatDA(seg.cac)}</p>
                  </div>
                  <div>
                    <p className="uppercase font-semibold tracking-wider">LTV Moyenne</p>
                    <p className="text-xs font-bold text-slate-700">{formatDA(seg.ltv)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
