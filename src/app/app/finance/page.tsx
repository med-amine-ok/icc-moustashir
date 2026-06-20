'use client';

import React, { useState } from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { customers } from '@/mock/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button } from '@/components/ui';
import { 
  Coins, 
  TrendingUp, 
  Percent, 
  Receipt, 
  Download,
  ArrowRight,
  User,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
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
import { formatDA, formatDate } from '@/lib/utils';

export default function FinancePage() {
  const { filters } = useFilters();
  const kpis = DataService.getKPIs(filters);
  const filteredTransactions = DataService.getFilteredTransactions(filters);
  const monthlyRevenue = DataService.getMonthlyRevenueChart(filters);

  // Compute transaction summary
  const totalInvoiced = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = filteredTransactions.filter(t => t.status === 'Payé').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = filteredTransactions.filter(t => t.status === 'En attente').reduce((sum, t) => sum + t.amount, 0);
  const totalOverdue = filteredTransactions.filter(t => t.status === 'En retard').reduce((sum, t) => sum + t.amount, 0);

  const paidPercent = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 85;
  const pendingPercent = totalInvoiced > 0 ? Math.round((totalPending / totalInvoiced) * 100) : 10;
  const overduePercent = totalInvoiced > 0 ? Math.round((totalOverdue / totalInvoiced) * 100) : 5;

  // Compute client performance under filtered scope
  const clientRevenueMap: Record<string, { name: string, segment: string, wilaya: string, invoiced: number, paid: number, pendingCount: number }> = {};
  filteredTransactions.forEach(t => {
    const cust = customers.find(c => c.id === t.customerId);
    if (!cust) return;
    if (!clientRevenueMap[t.customerId]) {
      clientRevenueMap[t.customerId] = {
        name: cust.name,
        segment: cust.segment,
        wilaya: cust.wilaya,
        invoiced: 0,
        paid: 0,
        pendingCount: 0
      };
    }
    clientRevenueMap[t.customerId].invoiced += t.amount;
    if (t.status === 'Payé') {
      clientRevenueMap[t.customerId].paid += t.amount;
    } else {
      clientRevenueMap[t.customerId].pendingCount += 1;
    }
  });

  const clientRevenueList = Object.values(clientRevenueMap)
    .sort((a, b) => b.paid - a.paid)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Finance & Rentabilité</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visibilité financière en temps réel, suivi des encaissements et rentabilité globale en Dinar Algérien (DA).
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download size={14} />
          <span>Générer Rapport Financier</span>
        </Button>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenu Global Réalisé</span>
              <h3 className="text-2xl font-black text-slate-800">{formatDA(totalPaid)}</h3>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={12} />
                <span>+18.4% vs Trimestre préc.</span>
              </p>
            </div>
            <div className="p-3 rounded bg-[#EEF4F8] text-[#4DA3FF]">
              <Coins size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marge Opérationnelle Est.</span>
              <h3 className="text-2xl font-black text-slate-800">{kpis.grossMarginPercent.toFixed(1)}%</h3>
              <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                <span className="text-xs">↓</span>
                <span>-1.5% vs Prévisions</span>
              </p>
            </div>
            <div className="p-3 rounded bg-indigo-50 text-indigo-500">
              <Percent size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facturation Globale</span>
              <h3 className="text-2xl font-black text-slate-800">{formatDA(totalInvoiced)}</h3>
              <p className="text-[10px] text-slate-400 block font-semibold">Total factures émises sur la période</p>
            </div>
            <div className="p-3 rounded bg-purple-50 text-purple-500">
              <Receipt size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/20 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taux de Recouvrement</span>
              <h3 className="text-2xl font-black text-slate-800">{paidPercent}%</h3>
              <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-1.5" style={{ width: `${paidPercent}%` }}></div>
              </div>
            </div>
            <div className="p-3 rounded bg-emerald-50 text-emerald-500">
              <CheckCircle size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Traceability Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Flux de Traçabilité Financière (Moustachir Flow)</CardTitle>
          <CardDescription>Du premier contact à l'encaissement bancaire final.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-white border border-[#DCE5EE] rounded p-4 flex flex-col justify-between space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4DA3FF]">1. Lead</span>
                <Badge variant="info">MQL</Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium">Acquisition & Qualification initiale du besoin.</p>
              <div className="text-[10px] font-semibold text-slate-400">CAC engagé moyen</div>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white border border-[#DCE5EE] rounded p-4 flex flex-col justify-between space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#17345C]">2. Opportunité</span>
                <Badge variant="warning">Pipeline</Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium">Réunion technique et chiffrage du projet.</p>
              <div className="text-[10px] font-semibold text-slate-400">Valeur pondérée estimée</div>
            </div>
 
            {/* Step 3 */}
            <div className="bg-white border border-[#DCE5EE] rounded p-4 flex flex-col justify-between space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#17345C]">3. Contrat</span>
                <Badge variant="secondary">Signé</Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium">Signature légale de l'offre technique.</p>
              <div className="text-[10px] font-semibold text-slate-400">Engagement de service</div>
            </div>
 
            {/* Step 4 */}
            <div className="bg-white border border-[#DCE5EE] rounded p-4 flex flex-col justify-between space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">4. Facture</span>
                <Badge variant="default">Émise</Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium">Émission du devis et échéancier projet.</p>
              <div className="text-[10px] font-semibold text-slate-400">Créance Moustachir</div>
            </div>
 
            {/* Step 5 */}
            <div className="bg-white border border-[#DCE5EE] rounded p-4 flex flex-col justify-between space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">5. Paiement</span>
                <Badge variant="success">Encaissé</Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium">Paiement reçu en Dinar Algérien (DA).</p>
              <div className="text-[10px] font-semibold text-slate-400">Chiffre d'Affaires Réalisé</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Revenue by Month */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution Mensuelle du Chiffre d'Affaires</CardTitle>
            <CardDescription>Revenus (CA Réalisé), Marges opérationnelles et dépenses associées en DA.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => [formatDA(value as number), '']}
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" fontSize={11} />
                <Area name="Chiffre d'Affaires" type="monotone" dataKey="revenu" stroke="#4DA3FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenu)" />
                <Area name="Marge Nette" type="monotone" dataKey="marge" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorMarge)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facturation status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Répartition des Créances</CardTitle>
            <CardDescription>État des factures et taux de recouvrement sur la période.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col justify-between h-72">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Factures Payées</span>
                  <span>{paidPercent}% ({formatDA(totalPaid)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2" style={{ width: `${paidPercent}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>En Attente</span>
                  <span>{pendingPercent}% ({formatDA(totalPending)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2" style={{ width: `${pendingPercent}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>En Retard</span>
                  <span>{overduePercent}% ({formatDA(totalOverdue)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-2" style={{ width: `${overduePercent}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                <strong>Attention relance :</strong> {filteredTransactions.filter(t => t.status === 'En retard').length} factures en retard nécessitent une relance commerciale immédiate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table: Revenue by Client */}
        <Card>
          <CardHeader>
            <CardTitle>Classement des Revenus par Client</CardTitle>
            <CardDescription>Top 5 des comptes clients générant le plus de chiffre d'affaires payé.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Wilaya</TableHead>
                  <TableHead className="text-right">Montant Facturé</TableHead>
                  <TableHead className="text-right">Encaissé (LTV)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientRevenueList.map((client, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-slate-800">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.segment}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">{client.wilaya}</TableCell>
                    <TableCell className="text-right font-bold text-slate-700 text-xs">{formatDA(client.invoiced)}</TableCell>
                    <TableCell className="text-right font-black text-emerald-600 text-xs">{formatDA(client.paid)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Table: Recent Financial Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions Récentes & Factures</CardTitle>
            <CardDescription>Derniers mouvements de facturation générés sur le périmètre.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture ID</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 5).map((trans) => (
                  <TableRow key={trans.id}>
                    <TableCell className="font-bold text-slate-800 text-xs">{trans.id}</TableCell>
                    <TableCell className="text-xs text-slate-400 font-semibold">{formatDate(trans.dateIssued)}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-600">{trans.service}</TableCell>
                    <TableCell>
                      <Badge variant={
                        trans.status === 'Payé' ? 'success' :
                        trans.status === 'En retard' ? 'danger' : 'warning'
                      }>
                        {trans.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-800 text-xs">{formatDA(trans.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
