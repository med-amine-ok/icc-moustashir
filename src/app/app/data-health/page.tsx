'use client';

import React, { useState } from 'react';
import { useFilters } from '@/context/FilterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Button } from '@/components/ui';
import { ShieldCheck, ShieldAlert, Sparkles, RefreshCw, Download, Layers, Users, Database, AlertCircle, FileText } from 'lucide-react';

export default function DataHealthPage() {
  const { filters } = useFilters();
  const [scanning, setScanning] = useState(false);

  // Simulated metrics that dynamically adapt based on active filters
  let scale = 1.0;
  if (filters.wilaya !== 'All') {
    scale = filters.wilaya.charCodeAt(0) % 2 === 0 ? 0.35 : 0.22;
  }
  if (filters.segment !== 'All') {
    scale *= 0.16;
  }

  const duplicateCount = Math.round(1248 * scale);
  const missingContactCount = Math.round(8402 * scale);
  const unknownSourceCount = Math.round(512 * scale);
  const unassignedCount = Math.round(340 * scale);
  
  // Dynamic scores
  const trustScore = filters.wilaya === 'All' ? 94.2 : 94.2 + (scale * 2.5) > 100 ? 98.7 : 94.2 + (scale * 2.5);
  const lineageScore = filters.wilaya === 'All' ? 88.7 : 88.7 - (scale * 1.5) < 70 ? 73.5 : 88.7 - (scale * 1.5);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 1500);
  };

  // Recent data alerts
  const dataAlerts = [
    {
      id: 1,
      entity: 'Prospect #8921',
      issue: 'Numéro de téléphone invalide (format incorrect)',
      wilaya: 'Oran',
      priority: 'warning'
    },
    {
      id: 2,
      entity: 'Client SPA Belkacem',
      issue: 'Aucun commercial assigné mais transaction active',
      wilaya: 'Alger',
      priority: 'danger'
    },
    {
      id: 3,
      entity: 'Lead E-commerce Dahmani',
      issue: 'Source d\'acquisition inconnue',
      wilaya: 'Constantine',
      priority: 'warning'
    },
    {
      id: 4,
      entity: 'Contact Sarl Mekhloufi',
      issue: 'Email entreprise manquant',
      wilaya: 'Alger',
      priority: 'info'
    }
  ].filter(alert => filters.wilaya === 'All' || alert.wilaya === filters.wilaya);

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Qualité & Traçabilité des Données</h2>
          <p className="text-xs text-slate-500 mt-1">
            Indicateurs d'intégrité, lignage des flux de données et rapports d'anomalies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} />
            Exporter Logs d'Audit
          </Button>
          <Button variant="primary" size="sm" className="gap-2" onClick={handleScan} disabled={scanning}>
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Analyse...' : 'Lancer Analyse'}
          </Button>
        </div>
      </div>

      {/* Trust Scores Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-white border border-[#DCE5EE]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA3FF]/5 rounded-full blur-2xl"></div>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-[#17345C]">Score de Confiance des Données (Data Trust)</h4>
                <p className="text-[10px] text-[#6B7C93] mt-0.5">Qualité agrégée à l'échelle de l'entreprise</p>
              </div>
              <ShieldCheck size={28} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-extrabold text-[#17345C]">{trustScore.toFixed(1)}</span>
              <span className="text-xs font-bold text-emerald-600">+1.2% vs 30j préc.</span>
            </div>
            <div className="w-full bg-[#EEF4F8] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${trustScore}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white border border-[#DCE5EE]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA3FF]/5 rounded-full blur-2xl"></div>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-[#17345C]">Complétude du Lignage Client (Lineage Score)</h4>
                <p className="text-[10px] text-[#6B7C93] mt-0.5">Pourcentage de fiches clients tracées de bout en bout</p>
              </div>
              <ShieldAlert size={28} className="text-[#4DA3FF]" />
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-extrabold text-[#17345C]">{lineageScore.toFixed(1)}</span>
              <span className="text-xs font-bold text-red-500">-0.4% vs 30j préc.</span>
            </div>
            <div className="w-full bg-[#EEF4F8] h-2 rounded-full overflow-hidden">
              <div className="bg-[#4DA3FF] h-full rounded-full" style={{ width: `${lineageScore}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrity Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-amber-50 text-amber-600">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Doublons suspectés</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">{duplicateCount}</h4>
            <p className="text-[9px] text-slate-500">Fusion nécessaire</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-red-50 text-red-600">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Infos manquantes</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">{missingContactCount}</h4>
            <p className="text-[9px] text-slate-500">4.2% de la base de données</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-indigo-50 text-indigo-600">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sources inconnues</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">{unknownSourceCount}</h4>
            <p className="text-[9px] text-slate-500">Orphelins identifiés</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-purple-50 text-purple-600">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Fiches non-assignées</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">{unassignedCount}</h4>
            <p className="text-[9px] text-red-500 font-bold">Priorité Haute</p>
          </div>
        </Card>
      </div>

      {/* Lineage & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lineage Mapping */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Explorateur de Lignage des Données</CardTitle>
            <CardDescription>
              Flux de transmission de l'information entre les systèmes marketing, commercial et financier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-slate-100 rounded-lg">
              <div className="text-center p-3 bg-slate-50 rounded w-full md:w-32 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Étape 1 : Marketing</span>
                <p className="text-xs font-bold text-[#4DA3FF] mt-1">Formulaire Web</p>
                <Badge variant="success" className="mt-1">Intègre</Badge>
              </div>
              <div className="text-slate-400 font-bold text-lg">➔</div>
              <div className="text-center p-3 bg-slate-50 rounded w-full md:w-32 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Étape 2 : Commercial</span>
                <p className="text-xs font-bold text-[#17345C] mt-1">Pipe Opportunités</p>
                <Badge variant="success" className="mt-1">Lié</Badge>
              </div>
              <div className="text-slate-400 font-bold text-lg">➔</div>
              <div className="text-center p-3 bg-slate-50 rounded w-full md:w-32 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Étape 3 : Projets</span>
                <p className="text-xs font-bold text-slate-700 mt-1">Suivi Livraison</p>
                <Badge variant="warning" className="mt-1">5 en attente</Badge>
              </div>
              <div className="text-slate-400 font-bold text-lg">➔</div>
              <div className="text-center p-3 bg-slate-50 rounded w-full md:w-32 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Étape 4 : Finance</span>
                <p className="text-xs font-bold text-slate-700 mt-1">Invoices & Encaissements</p>
                <Badge variant="danger" className="mt-1">Erreurs Rapprochement</Badge>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center italic">
              Note: Un audit automatique s'exécute chaque nuit à 02:00 pour assurer l'intégrité de la traçabilité des données.
            </p>
          </CardContent>
        </Card>

        {/* Quality Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes de Qualité</CardTitle>
            <CardDescription>Anomalies à corriger immédiatement.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {dataAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Aucune alerte de qualité pour la Wilaya sélectionnée.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dataAlerts.map(alert => (
                  <div key={alert.id} className="p-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">{alert.entity}</span>
                      <Badge variant={alert.priority === 'danger' ? 'danger' : alert.priority === 'warning' ? 'warning' : 'info'}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{alert.issue}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Wilaya : {alert.wilaya}</span>
                      <button className="text-[#4DA3FF] hover:underline font-semibold cursor-pointer">Corriger</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
