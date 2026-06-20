'use client';

import React, { useState } from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button } from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  Users, 
  HelpCircle,
  RotateCcw,
  Save,
  LineChart as LineIcon,
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
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ForecastPage() {
  const { filters } = useFilters();
  const kpis = DataService.getKPIs(filters);
  const monthlyBaseData = DataService.getMonthlyRevenueChart(filters);

  // Levers state (deltas relative to baseline)
  const [marketingBudgetDelta, setMarketingBudgetDelta] = useState(250000); // in DA / month
  const [conversionRateDelta, setConversionRateDelta] = useState(0.5); // percentage points
  const [retentionRateDelta, setRetentionRateDelta] = useState(2.0); // percentage points
  const [upsellRateDelta, setUpsellRateDelta] = useState(0.0); // percentage points

  // Base values from filters & services
  const baseRevenueQ4 = kpis.caRealise * 0.9 || 24500000;
  const baseMarginPercent = kpis.grossMarginPercent || 44.0;
  const baseLtv = kpis.avgLtv || 850000;
  const baseConversionRate = kpis.conversionRate || 35.0;

  // Calculs de simulation (Q4 Projections)
  // ROI marketing estime a 2.5x les dépenses incrémentales
  const marketingSpentQ4 = marketingBudgetDelta * 3;
  const simulatedRevenueGain = (marketingSpentQ4 * 2.5) +
    (baseRevenueQ4 * (conversionRateDelta / 100) * 1.2) +
    (baseRevenueQ4 * (retentionRateDelta / 100) * 1.5) +
    (baseRevenueQ4 * (upsellRateDelta / 100) * 1.0);

  const projectedRevenue = Math.max(0, baseRevenueQ4 + simulatedRevenueGain);
  
  // La marge brute baisse légèrement avec des dépenses marketing agressives, mais augmente avec les conversions/upsells
  const rawMarginGain = (simulatedRevenueGain * (baseMarginPercent / 100)) - (marketingSpentQ4 * 0.3);
  const projectedMarginValue = Math.max(0, (baseRevenueQ4 * (baseMarginPercent / 100)) + rawMarginGain);
  const projectedMarginPercent = projectedRevenue > 0 
    ? Math.min(100, Math.max(10, (projectedMarginValue / projectedRevenue) * 100)) 
    : baseMarginPercent;

  // LTV augmente avec la rétention et l'upsell
  const projectedLtv = Math.max(10000, baseLtv * (1 + (retentionRateDelta * 2 + upsellRateDelta) / 100));

  // ROI Marketing du scénario (CA additionnel / Budget additionnel)
  const projectedRoi = marketingSpentQ4 > 0 
    ? Math.round((simulatedRevenueGain / marketingSpentQ4) * 10) / 10 
    : 3.2;

  // Dynamic Chart Projection Data (12 Months)
  const chartData = monthlyBaseData.map((item, index) => {
    // Progressively scale the projection multipliers throughout the 12-month period
    const monthIndex = index + 1;
    const monthlyBudgetDelta = marketingBudgetDelta;
    const monthlyRevenueGain = (monthlyBudgetDelta * 2.5 * (monthIndex / 12)) +
      (item.revenu * (conversionRateDelta / 100) * 1.2 * (monthIndex / 12)) +
      (item.revenu * (retentionRateDelta / 100) * 1.5 * (monthIndex / 12)) +
      (item.revenu * (upsellRateDelta / 100) * 1.0 * (monthIndex / 12));

    const projRev = Math.max(0, item.revenu + monthlyRevenueGain);
    const projMarg = Math.max(0, item.marge + (monthlyRevenueGain * (projectedMarginPercent / 100)));

    return {
      name: item.name,
      'Tendance Actuelle': item.revenu,
      'Scénario Projeté': Math.round(projRev),
      'Marge Actuelle': item.marge,
      'Marge Projetée': Math.round(projMarg),
    };
  });

  const handleReset = () => {
    setMarketingBudgetDelta(0);
    setConversionRateDelta(0);
    setRetentionRateDelta(0);
    setUpsellRateDelta(0);
  };

  const revenueDeltaAmount = projectedRevenue - baseRevenueQ4;
  const marginDeltaPercent = projectedMarginPercent - baseMarginPercent;
  const ltvDeltaAmount = projectedLtv - baseLtv;
  const roiDelta = projectedRoi - 3.2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Modélisateur de Scénarios Stratégiques</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ajustez les leviers opérationnels pour simuler l'impact sur vos indicateurs financiers clés (Devise : DA).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1.5">
            <RotateCcw size={14} />
            <span>Réinitialiser</span>
          </Button>
          <Button variant="secondary" size="sm" className="flex items-center gap-1.5 bg-moustachir-primary hover:bg-moustachir-primary/90 text-white">
            <Save size={14} />
            <span>Sauvegarder le Scénario</span>
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenu Projeté */}
        <Card className="relative overflow-hidden hover:border-moustachir-secondary/30 transition-all duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-moustachir-secondary"></div>
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Revenu Projeté (T4)
              </span>
              <Wallet size={16} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black text-slate-800">{formatDA(projectedRevenue)}</span>
              <span className={`text-[10px] font-bold flex items-center ${revenueDeltaAmount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {revenueDeltaAmount >= 0 ? '▲' : '▼'} {formatDA(Math.abs(revenueDeltaAmount))}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              vs. Tendance Actuelle ({formatDA(baseRevenueQ4)})
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Marge Brute */}
        <Card className="relative overflow-hidden hover:border-moustachir-secondary/30 transition-all duration-200">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Marge Brute Projetée
              </span>
              <Percent size={16} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black text-slate-800">{projectedMarginPercent.toFixed(1)}%</span>
              <span className={`text-[10px] font-bold flex items-center ${marginDeltaPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {marginDeltaPercent >= 0 ? '▲' : '▼'} {Math.abs(marginDeltaPercent).toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              vs. Tendance Actuelle ({baseMarginPercent.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        {/* Card 3: LTV Client */}
        <Card className="relative overflow-hidden hover:border-moustachir-secondary/30 transition-all duration-200">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                LTV Client Projetée
              </span>
              <Users size={16} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black text-slate-800">{formatDA(projectedLtv)}</span>
              <span className={`text-[10px] font-bold flex items-center ${ltvDeltaAmount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {ltvDeltaAmount >= 0 ? '▲' : '▼'} {formatDA(Math.abs(ltvDeltaAmount))}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              vs. Tendance Actuelle ({formatDA(baseLtv)})
            </p>
          </CardContent>
        </Card>

        {/* Card 4: ROI Marketing */}
        <Card className="relative overflow-hidden hover:border-moustachir-secondary/30 transition-all duration-200">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ROI Marketing Estimé
              </span>
              <TrendingUp size={16} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black text-slate-800">{projectedRoi.toFixed(1)}x</span>
              <span className={`text-[10px] font-bold flex items-center ${roiDelta >= 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {roiDelta > 0 ? `▲ +${roiDelta.toFixed(1)}x` : roiDelta < 0 ? `▼ ${roiDelta.toFixed(1)}x` : '─ stable'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              vs. Tendance Actuelle (3.2x)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Levers Panel */}
        <div className="bg-white border border-moustachir-border rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-moustachir-border bg-moustachir-light/50 flex items-center gap-2">
            <Sparkles size={16} className="text-moustachir-secondary" />
            <h3 className="text-sm font-bold text-slate-800">Leviers Opérationnels</h3>
          </div>
          <div className="p-5 space-y-6 flex-1">
            {/* Lever 1: Budget Marketing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Budget Marketing Additionnel</label>
                <span className="text-[10px] font-bold text-moustachir-primary bg-moustachir-light px-2 py-0.5 rounded border border-moustachir-border">
                  {marketingBudgetDelta >= 0 ? '+' : ''}{formatDA(marketingBudgetDelta)} / mois
                </span>
              </div>
              <input 
                type="range" 
                min="-500000" 
                max="1000000" 
                step="50000"
                value={marketingBudgetDelta}
                onChange={(e) => setMarketingBudgetDelta(Number(e.target.value))}
                className="w-full accent-moustachir-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                <span>-500 k DA</span>
                <span>Actuel (0 DA)</span>
                <span>+1.0 M DA</span>
              </div>
            </div>

            {/* Lever 2: Taux de conversion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Variation Taux de Conversion</label>
                <span className="text-[10px] font-bold text-moustachir-primary bg-moustachir-light px-2 py-0.5 rounded border border-moustachir-border">
                  {conversionRateDelta >= 0 ? '+' : ''}{conversionRateDelta.toFixed(1)}%
                </span>
              </div>
              <input 
                type="range" 
                min="-2" 
                max="5" 
                step="0.1"
                value={conversionRateDelta}
                onChange={(e) => setConversionRateDelta(Number(e.target.value))}
                className="w-full accent-moustachir-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                <span>-2.0%</span>
                <span>Taux Base ({baseConversionRate.toFixed(1)}%)</span>
                <span>+5.0%</span>
              </div>
            </div>

            {/* Lever 3: Taux de rétention */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Variation Taux de Rétention</label>
                <span className="text-[10px] font-bold text-moustachir-primary bg-moustachir-light px-2 py-0.5 rounded border border-moustachir-border">
                  {retentionRateDelta >= 0 ? '+' : ''}{retentionRateDelta.toFixed(1)}%
                </span>
              </div>
              <input 
                type="range" 
                min="-5" 
                max="10" 
                step="0.5"
                value={retentionRateDelta}
                onChange={(e) => setRetentionRateDelta(Number(e.target.value))}
                className="w-full accent-moustachir-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                <span>-5.0%</span>
                <span>Taux Base (92.0%)</span>
                <span>+10.0%</span>
              </div>
            </div>

            {/* Lever 4: Taux d'Upsell */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Variation Ventes Additionnelles</label>
                <span className="text-[10px] font-bold text-moustachir-primary bg-moustachir-light px-2 py-0.5 rounded border border-moustachir-border">
                  {upsellRateDelta >= 0 ? '+' : ''}{upsellRateDelta.toFixed(1)}%
                </span>
              </div>
              <input 
                type="range" 
                min="-5" 
                max="15" 
                step="0.5"
                value={upsellRateDelta}
                onChange={(e) => setUpsellRateDelta(Number(e.target.value))}
                className="w-full accent-moustachir-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                <span>-5.0%</span>
                <span>Taux Base (18.0%)</span>
                <span>+15.0%</span>
              </div>
            </div>

            <div className="p-3 bg-moustachir-light/30 border border-moustachir-border rounded text-[10px] text-slate-500 leading-relaxed mt-4">
              <h4 className="font-bold text-slate-700 mb-1">Règle de Simulation</h4>
              Le modèle calcule le chiffre d'affaires projeté à partir de la dépense incrémentale sur les canaux marketing (ROI 2,5x), couplé à l'effet de levier des ventes d'upsell et du taux de conversion des opportunités.
            </div>
          </div>
        </div>

        {/* Right: Forecast Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="flex flex-row justify-between items-center border-b border-moustachir-border bg-moustachir-light/30">
            <div>
              <CardTitle>Projection du Chiffre d'Affaires (12 Mois)</CardTitle>
              <CardDescription>Comparatif graphique entre la tendance actuelle et le scénario simulé.</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="text-slate-500">Tendance Actuelle</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-moustachir-secondary"></span>
                <span className="text-slate-800">Scénario Projeté</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-96 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4DA3FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4DA3FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE5EE" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any, name: any) => [formatDA(value as number), name]}
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #DCE5EE', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area name="Scénario Projeté" type="monotone" dataKey="Scénario Projeté" stroke="#4DA3FF" strokeWidth={3} fillOpacity={1} fill="url(#projGradient)" />
                <Area name="Tendance Actuelle" type="monotone" dataKey="Tendance Actuelle" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
