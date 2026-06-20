'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Button, Input } from '@/components/ui';
import { 
  Database, 
  UploadCloud, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Link2, 
  Layers, 
  ArrowRight,
  Sparkles,
  Info,
  Check
} from 'lucide-react';

type ImportSource = 'notion' | 'excel' | 'csv' | 'meta';

export default function ImportsPage() {
  const [activeSource, setActiveSource] = useState<ImportSource>('csv');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Connection states
  const [isNotionConnected, setIsNotionConnected] = useState(false);
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [selectedNotionDb, setSelectedNotionDb] = useState('');
  const [selectedMetaCampaign, setSelectedMetaCampaign] = useState('');
  
  const [uploadedList, setUploadedList] = useState([
    { id: 1, name: 'crm_opportunities_q2.csv', source: 'csv', size: '2.4 MB', rows: 8400, status: 'Completed', date: '18 Juin 2026' },
    { id: 2, name: 'marketing_leads_alger.xlsx', source: 'excel', size: '1.8 MB', rows: 5120, status: 'Completed', date: '15 Juin 2026' },
    { id: 3, name: 'notion_leads_partners.db', source: 'notion', size: 'N/A', rows: 430, status: 'Completed', date: '10 Juin 2026' },
    { id: 4, name: 'meta_lead_ad_campaign_algiers.api', source: 'meta', size: 'N/A', rows: 1200, status: 'Completed', date: '08 Juin 2026' }
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploadedList(prev => [
        {
          id: prev.length + 1,
          name: file.name,
          source: activeSource,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          rows: Math.floor(Math.random() * 5000) + 500,
          status: 'Completed',
          date: 'Aujourd\'hui'
        },
        ...prev
      ]);
      setFile(null);
      setUploading(false);
    }, 1500);
  };

  const handleNotionSync = () => {
    if (!selectedNotionDb) return;
    setUploading(true);
    setTimeout(() => {
      setUploadedList(prev => [
        {
          id: prev.length + 1,
          name: `Notion DB: ${selectedNotionDb}`,
          source: 'notion',
          size: 'N/A',
          rows: Math.floor(Math.random() * 800) + 150,
          status: 'Completed',
          date: 'Aujourd\'hui'
        },
        ...prev
      ]);
      setUploading(false);
    }, 2000);
  };

  const handleMetaSync = () => {
    if (!selectedMetaCampaign) return;
    setUploading(true);
    setTimeout(() => {
      setUploadedList(prev => [
        {
          id: prev.length + 1,
          name: `Meta Ads: ${selectedMetaCampaign}`,
          source: 'meta',
          size: 'N/A',
          rows: Math.floor(Math.random() * 1500) + 300,
          status: 'Completed',
          date: 'Aujourd\'hui'
        },
        ...prev
      ]);
      setUploading(false);
    }, 2000);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'notion':
        return (
          <div className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded p-0.5">
            <svg viewBox="0 0 24 24" className="w-full h-full text-black" fill="currentColor">
              <path d="M4.46 2.083c.09-.13.25-.21.42-.21h12.56c.15 0 .29.06.39.17l3.96 4.4a.5.5 0 0 1 .11.31v12.98c0 .28-.22.5-.5.5H5.8c-.28 0-.5-.22-.5-.5V4.6c0-.18.06-.35.16-.49l-1-1.527zm3.17 4.145v11.5c0 .28.22.5.5.5h1.7c.28 0 .5-.22.5-.5v-6.9l5.1 7.2c.1.14.26.2.42.2h2.23c.28 0 .5-.22.5-.5V6.7c0-.28-.22-.5-.5-.5h-1.7c-.28 0-.5.22-.5.5v6.5l-4.85-6.85a.5.5 0 0 0-.41-.21H8.13c-.28 0-.5.22-.5.5z" />
            </svg>
          </div>
        );
      case 'excel':
        return (
          <div className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded p-0.5">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 2H7.5C6.4 2 5.5 2.9 5.5 4V20C5.5 21.1 6.4 22 7.5 22H16.5C17.6 22 18.5 21.1 18.5 20V4C18.5 2.9 17.6 2 16.5 2Z" fill="#107C41" />
              <path d="M12.5 12L15.5 16.5H13.5L11.5 13.5L9.5 16.5H7.5L10.5 12L7.5 7.5H9.5L11.5 10.5L13.5 7.5H15.5L12.5 12Z" fill="white" />
            </svg>
          </div>
        );
      case 'meta':
        return (
          <div className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded p-0.5">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 6C14.71 6 13.06 6.84 12 8.16C10.94 6.84 9.29 6 7.5 6C4.46 6 2 8.46 2 11.5C2 14.54 4.46 17 7.5 17C9.29 17 10.94 16.16 12 14.84C13.06 16.16 14.71 17 16.5 17C19.54 17 22 14.54 22 11.5C22 8.46 19.54 6 16.5 6ZM7.5 15C5.57 15 4 13.43 4 11.5C4 9.57 5.57 8 7.5 8C9.43 8 11 9.57 11 11.5C11 13.43 9.43 15 7.5 15ZM16.5 15C14.57 15 13 13.43 13 11.5C13 9.57 14.57 8 16.5 8C18.43 8 20 9.57 20 11.5C20 13.43 18.43 15 16.5 15Z" fill="#0064E0" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded p-0.5">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#3B82F6" />
              <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">CSV</text>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Centre d'Import & Intégration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez l'ingestion de vos fichiers de données d'activité commerciale, marketing et financière.
          </p>
        </div>
        <Badge variant="success" className="gap-1 px-3 py-1 self-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Pipelines Fonctionnels
        </Badge>
      </div>

      {/* Pipeline Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-moustachir-light text-moustachir-primary">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Données Importées</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">12.4 M</h4>
            <p className="text-[9px] text-slate-500">+8.2% vs 30j préc.</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-moustachir-light text-moustachir-primary">
            <RefreshCw size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Flux Actifs</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">24</h4>
            <p className="text-[9px] text-slate-500">Connexions stables</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-red-50 text-red-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Échecs Ingestion</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">0</h4>
            <p className="text-[9px] text-slate-500">Aucune action requise</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4">
          <div className="p-2 rounded bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Temps de Traitement</p>
            <h4 className="text-lg font-extrabold text-slate-800 mt-1">1.2s</h4>
            <p className="text-[9px] text-emerald-600 font-bold">-0.3s d'optimisation</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Integrations List & Active Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* left: Ingestion Source Selector */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sélectionner une Source</h3>
          
          {/* Notion Card */}
          <div 
            onClick={() => setActiveSource('notion')}
            className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between hover:shadow-sm ${
              activeSource === 'notion' 
                ? 'border-black bg-slate-50 ring-1 ring-black' 
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/notion/notion-original.svg" />
          
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Notion Database</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Importer depuis vos workspaces</p>
              </div>
            </div>
            {isNotionConnected ? (
              <Badge variant="success" className="text-[9px] py-0.5 px-1.5">Connecté</Badge>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Non lié</span>
            )}
          </div>

          {/* Google Sheets / Excel Card */}
          <div 
            onClick={() => setActiveSource('excel')}
            className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between hover:shadow-sm ${
              activeSource === 'excel' 
                ? 'border-[#107C41] bg-slate-50 ring-1 ring-[#107C41]' 
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 2H7.5C6.4 2 5.5 2.9 5.5 4V20C5.5 21.1 6.4 22 7.5 22H16.5C17.6 22 18.5 21.1 18.5 20V4C18.5 2.9 17.6 2 16.5 2Z" fill="#107C41" />
                  <path d="M12.5 12L15.5 16.5H13.5L11.5 13.5L9.5 16.5H7.5L10.5 12L7.5 7.5H9.5L11.5 10.5L13.5 7.5H15.5L12.5 12Z" fill="white" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Excel / Google Sheets</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Importer des fichiers .xlsx ou .ods</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Prêt</span>
          </div>

          {/* CSV File Card */}
          <div 
            onClick={() => setActiveSource('csv')}
            className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between hover:shadow-sm ${
              activeSource === 'csv' 
                ? 'border-moustachir-secondary bg-slate-50 ring-1 ring-moustachir-secondary' 
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" fill="#3B82F6" />
                  <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">CSV</text>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Fichier CSV</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Importation brute de leads</p>
              </div>
            </div>
            <span className="text-[10px] text-moustachir-secondary font-bold">Prêt</span>
          </div>

          {/* Meta Ads Card */}
          <div 
            onClick={() => setActiveSource('meta')}
            className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between hover:shadow-sm ${
              activeSource === 'meta' 
                ? 'border-blue-600 bg-slate-50 ring-1 ring-blue-600' 
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 6C14.71 6 13.06 6.84 12 8.16C10.94 6.84 9.29 6 7.5 6C4.46 6 2 8.46 2 11.5C2 14.54 4.46 17 7.5 17C9.29 17 10.94 16.16 12 14.84C13.06 16.16 14.71 17 16.5 17C19.54 17 22 14.54 22 11.5C22 8.46 19.54 6 16.5 6ZM7.5 15C5.57 15 4 13.43 4 11.5C4 9.57 5.57 8 7.5 8C9.43 8 11 9.57 11 11.5C11 13.43 9.43 15 7.5 15ZM16.5 15C14.57 15 13 13.43 13 11.5C13 9.57 14.57 8 16.5 8C18.43 8 20 9.57 20 11.5C20 13.43 18.43 15 16.5 15Z" fill="#0064E0" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Meta Ads (Facebook Leads)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Sychronisation en temps réel des leads</p>
              </div>
            </div>
            {isMetaConnected ? (
              <Badge variant="success" className="text-[9px] py-0.5 px-1.5">Connecté</Badge>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Non lié</span>
            )}
          </div>
        </div>

        {/* Right content: Selected Source Detail Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Tool View */}
          {activeSource === 'notion' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                    
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/notion/notion-original.svg" />
          
                  </div>
                  <div>
                    <CardTitle>Intégration Notion Database</CardTitle>
                    <CardDescription>Configurez la connexion et synchronisez vos bases de données clients Notion.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isNotionConnected ? (
                  <div className="border border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-full">
                      <Link2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Lier votre Workspace Notion</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Permettez à Moustachir de lire vos bases de données pour importer automatiquement vos prospects et contrats.
                      </p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="mt-2 bg-black hover:bg-slate-900 border-none text-xs font-bold gap-2"
                      onClick={() => setIsNotionConnected(true)}
                    >
                      <Sparkles size={14} className="text-[#4DA3FF]" />
                      Connecter Notion
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-600" />
                        <span>Notion connecté à <strong>Moustachir Workspace</strong></span>
                      </div>
                      <button 
                        onClick={() => { setIsNotionConnected(false); setSelectedNotionDb(''); }}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium underline"
                      >
                        Déconnecter
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Sélectionner la Base de Données
                      </label>
                      <select 
                        value={selectedNotionDb}
                        onChange={(e) => setSelectedNotionDb(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      >
                        <option value="">-- Choisir une table Notion --</option>
                        <option value="leads_algeria_active">Notion : Leads Active (Algeria)</option>
                        <option value="partenaires_2026">Notion : Partenaires 2026</option>
                        <option value="clients_vip">Notion : Comptes VIP</option>
                      </select>
                    </div>

                    {selectedNotionDb && (
                      <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Lignes détectées :</span>
                          <span className="font-bold text-slate-800">430 Leads</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Dernière modification Notion :</span>
                          <span className="text-slate-600">Aujourd'hui, 09:12</span>
                        </div>
                        <Button 
                          variant="primary" 
                          onClick={handleNotionSync}
                          disabled={uploading}
                          className="w-full py-2 bg-black hover:bg-slate-900 border-none font-bold text-xs"
                        >
                          {uploading ? 'Synchronisation...' : 'Lancer la Synchronisation'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSource === 'excel' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 2H7.5C6.4 2 5.5 2.9 5.5 4V20C5.5 21.1 6.4 22 7.5 22H16.5C17.6 22 18.5 21.1 18.5 20V4C18.5 2.9 17.6 2 16.5 2Z" fill="#107C41" />
                      <path d="M12.5 12L15.5 16.5H13.5L11.5 13.5L9.5 16.5H7.5L10.5 12L7.5 7.5H9.5L11.5 10.5L13.5 7.5H15.5L12.5 12Z" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle>Importation Excel / Google Sheets</CardTitle>
                    <CardDescription>Glissez ou téléchargez votre feuille de calcul Microsoft Excel ou OpenDocument.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
                    dragActive ? 'border-[#107C41] bg-[#107C41]/5' : 'border-slate-200 bg-white'
                  }`}
                >
                  <UploadCloud size={40} className={dragActive ? 'text-[#107C41]' : 'text-slate-400'} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {file ? file.name : "Sélectionner ou glisser une feuille de calcul"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Fichiers supportés : .xlsx, .xls, .ods jusqu'à 25 Mo"}
                    </p>
                  </div>
                  
                  {!file ? (
                    <label className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded shadow-sm hover:bg-slate-50 cursor-pointer">
                      Parcourir les fichiers
                      <input type="file" className="hidden" accept=".xlsx,.xls,.ods" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>Annuler</Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleUploadSubmit} 
                        disabled={uploading}
                        className="bg-[#107C41] hover:bg-[#0d6434] border-none text-white font-bold"
                      >
                        {uploading ? 'Analyse...' : 'Valider l\'importation'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSource === 'csv' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#3B82F6" />
                      <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">CSV</text>
                    </svg>
                  </div>
                  <div>
                    <CardTitle>Importation Fichier CSV</CardTitle>
                    <CardDescription>Glissez-déposez vos fichiers au format CSV brut encodés en UTF-8.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
                    dragActive ? 'border-moustachir-secondary bg-moustachir-light/50' : 'border-moustachir-border bg-white'
                  }`}
                >
                  <UploadCloud size={40} className={dragActive ? 'text-moustachir-secondary' : 'text-slate-400'} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {file ? file.name : "Sélectionner ou glisser un fichier CSV"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Fichiers supportés : .csv jusqu'à 25 Mo"}
                    </p>
                  </div>
                  
                  {!file ? (
                    <label className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded shadow-sm hover:bg-slate-50 cursor-pointer">
                      Parcourir les fichiers
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>Annuler</Button>
                      <Button variant="primary" size="sm" onClick={handleUploadSubmit} disabled={uploading}>
                        {uploading ? 'Traitement...' : 'Valider l\'importation'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSource === 'meta' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 6C14.71 6 13.06 6.84 12 8.16C10.94 6.84 9.29 6 7.5 6C4.46 6 2 8.46 2 11.5C2 14.54 4.46 17 7.5 17C9.29 17 10.94 16.16 12 14.84C13.06 16.16 14.71 17 16.5 17C19.54 17 22 14.54 22 11.5C22 8.46 19.54 6 16.5 6ZM7.5 15C5.57 15 4 13.43 4 11.5C4 9.57 5.57 8 7.5 8C9.43 8 11 9.57 11 11.5C11 13.43 9.43 15 7.5 15ZM16.5 15C14.57 15 13 13.43 13 11.5C13 9.57 14.57 8 16.5 8C18.43 8 20 9.57 20 11.5C20 13.43 18.43 15 16.5 15Z" fill="#0064E0" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle>Intégration Meta Lead Ads</CardTitle>
                    <CardDescription>Liez vos formulaires de publicités Facebook & Instagram pour importer les leads en direct.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isMetaConnected ? (
                  <div className="border border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-full">
                      <Link2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Lier vos Pages Facebook Commerciales</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Permet de récupérer les leads soumis directement sur vos formulaires publicitaires Meta Ads.
                      </p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="mt-2 bg-blue-600 hover:bg-blue-700 border-none text-xs font-bold gap-2"
                      onClick={() => setIsMetaConnected(true)}
                    >
                      <Sparkles size={14} className="text-white" />
                      Lier Meta Business Suite
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs text-blue-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        <span>Meta Business Suite lié à <strong>Moustachir Page</strong></span>
                      </div>
                      <button 
                        onClick={() => { setIsMetaConnected(false); setSelectedMetaCampaign(''); }}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium underline"
                      >
                        Déconnecter
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Sélectionner le Formulaire Actif
                      </label>
                      <select 
                        value={selectedMetaCampaign}
                        onChange={(e) => setSelectedMetaCampaign(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      >
                        <option value="">-- Choisir une campagne Meta --</option>
                        <option value="leads_campagne_pme_alger">FB Ads : Campagne PME & Startups (Alger)</option>
                        <option value="leads_evenement_juin">FB Ads : Inscriptions Événements Juin</option>
                        <option value="lead_form_newsletter">Instagram : Inscriptions Newsletter</option>
                      </select>
                    </div>

                    {selectedMetaCampaign && (
                      <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Leads disponibles :</span>
                          <span className="font-bold text-slate-800">1200 Prospects</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Statut Webhook :</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Écoute Active (Temps réel)
                          </span>
                        </div>
                        <Button 
                          variant="primary" 
                          onClick={handleMetaSync}
                          disabled={uploading}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 border-none font-bold text-xs"
                        >
                          {uploading ? 'Synchronisation...' : 'Importer les Leads existants'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingestion Rules Mapping Alert */}
          <div className="p-4 bg-white border border-slate-200 rounded-lg flex gap-3 text-xs text-slate-600">
            <Info size={16} className="text-moustachir-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#17345C]">Règle de dédoublonnement active :</p>
              <p className="mt-1">
                Les leads ayant un e-mail identique déjà présent dans la base de données seront mis à jour automatiquement au lieu de créer des fiches en doublons.
              </p>
            </div>
          </div>

          {/* Dynamic Import History Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Journal d'Inclusions Récentes</CardTitle>
              <CardDescription>Suivi des derniers chargements effectués.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {uploadedList.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getSourceIcon(log.source)}
                      <div>
                        <p className="text-xs font-bold text-slate-800 max-w-[250px] truncate">{log.name}</p>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{log.rows} lignes</span>
                          <span>•</span>
                          <span>Taille : {log.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-400 font-medium">{log.date}</span>
                      <Badge variant="success" className="text-[9px] py-0.5 px-2 font-bold gap-1">
                        <Check size={10} />
                        Succès
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
