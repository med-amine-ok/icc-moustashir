'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Settings, 
  Sliders, 
  FileText, 
  AlertCircle, 
  Check, 
  X,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Select, Dialog } from '@/components/ui';

interface User {
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin: string;
}

interface AuditLog {
  action: string;
  user: string;
  resource: string;
  time: string;
  status: 'success' | 'failed' | 'warning';
}

const DEMO_USERS: User[] = [
  { name: 'Amine Belkacem', email: 'director@moustachir.dz', role: 'Director', department: 'Direction', status: 'Active', lastLogin: 'Il y a 5 min' },
  { name: 'Yasmine Hamdi', email: 'marketing@moustachir.dz', role: 'Marketing', department: 'Marketing', status: 'Active', lastLogin: 'Il y a 10 min' },
  { name: 'Karim Cherif', email: 'commercial@moustachir.dz', role: 'Commercial', department: 'Ventes', status: 'Active', lastLogin: 'Il y a 1 heure' },
  { name: 'Meriem Slimani', email: 'finance@moustachir.dz', role: 'Finance', department: 'Finance', status: 'Active', lastLogin: 'Il y a 3 heures' },
  { name: 'Sofiane Dahmani', email: 'admin@moustachir.dz', role: 'Admin', department: 'Administration', status: 'Active', lastLogin: 'En cours' },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { action: 'Rôle modifié', user: 'Amine Belkacem (Director)', resource: 'role:marketing_lead', time: '10:42', status: 'success' },
  { action: 'Échec de connexion', user: 'Système (Automatisé)', resource: 'ip:197.200.45.12', time: '09:15', status: 'failed' },
  { action: 'Importation en masse', user: 'Sofiane Dahmani (Admin)', resource: 'dataset:pipeline_leads_2026', time: 'Hier à 16:30', status: 'success' },
  { action: 'Règles de mapping modifiées', user: 'Sofiane Dahmani (Admin)', resource: 'config:deduplication_threshold', time: 'Hier à 14:15', status: 'success' },
  { action: 'Exportation de données sensible', user: 'Meriem Slimani (Finance)', resource: 'export:finance_report_q1', time: '18 Juin, 11:30', status: 'warning' },
];

const PAGES_MATRIX = [
  { name: 'Executive Cockpit', path: '/app/cockpit', roles: { Director: true, Marketing: true, Commercial: true, Finance: true, Admin: true } },
  { name: 'Vue Clients 360', path: '/app/customers', roles: { Director: true, Marketing: true, Commercial: true, Finance: true, Admin: false } },
  { name: 'Parcours Client', path: '/app/lifecycle', roles: { Director: true, Marketing: true, Commercial: false, Finance: false, Admin: false } },
  { name: 'Pipeline Commercial', path: '/app/pipeline', roles: { Director: true, Marketing: false, Commercial: true, Finance: false, Admin: false } },
  { name: 'Attribution Marketing', path: '/app/marketing', roles: { Director: true, Marketing: true, Commercial: false, Finance: false, Admin: false } },
  { name: 'Finance & Factures', path: '/app/finance', roles: { Director: true, Marketing: false, Commercial: false, Finance: true, Admin: false } },
  { name: 'Rentabilité Offres', path: '/app/services', roles: { Director: true, Marketing: false, Commercial: false, Finance: true, Admin: false } },
  { name: 'Performance Équipe', path: '/app/employees', roles: { Director: true, Marketing: false, Commercial: true, Finance: false, Admin: false } },
  { name: 'Qualité des Données', path: '/app/data-health', roles: { Director: true, Marketing: false, Commercial: false, Finance: false, Admin: true } },
  { name: 'Centre d\'Import', path: '/app/imports', roles: { Director: true, Marketing: false, Commercial: false, Finance: false, Admin: true } },
  { name: 'Prévisions & Scénarios', path: '/app/forecast', roles: { Director: true, Marketing: true, Commercial: true, Finance: true, Admin: false } },
  { name: 'Gouvernance & Admin', path: '/app/admin', roles: { Director: true, Marketing: false, Commercial: false, Finance: false, Admin: true } },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'mapping' | 'dedup'>('users');
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // Policy States
  const [policy2FA, setPolicy2FA] = useState(true);
  const [policySessionTimeout, setPolicySessionTimeout] = useState('30');
  const [policyDataExport, setPolicyDataExport] = useState('Restreint');
  const [policyAlgeriaOnly, setPolicyAlgeriaOnly] = useState(false);
  
  // Mapping Config States
  const [mappingRequired, setMappingRequired] = useState({
    name: true,
    email: true,
    phone: false,
    wilaya: true,
    segment: true,
    value: false
  });
  
  // Deduplication States
  const [similarityThreshold, setSimilarityThreshold] = useState(85);
  const [dedupStrategy, setDedupStrategy] = useState('manual');
  
  // Notifications dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');

  useEffect(() => {
    // Load custom users from localStorage
    const stored = localStorage.getItem('moustachir_registered_users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        const formattedCustom = parsed.map(u => ({
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.role === 'Director' ? 'Direction' 
                     : u.role === 'Marketing' ? 'Marketing'
                     : u.role === 'Commercial' ? 'Ventes'
                     : u.role === 'Finance' ? 'Finance' : 'Administration',
          status: 'Active' as const,
          lastLogin: 'Jamais connecté'
        }));
        setUsers([...DEMO_USERS, ...formattedCustom]);
      } catch (e) {
        console.error('Failed to parse custom users', e);
      }
    }
  }, []);

  const handleCreatePolicy = () => {
    setDialogTitle('Nouvelle Stratégie de Sécurité');
    setDialogContent('Entrez les détails de la nouvelle règle de gouvernance de la plateforme.');
    setIsDialogOpen(true);
    
    // Add log
    const newLog: AuditLog = {
      action: 'Création de politique',
      user: 'Sofiane Dahmani (Admin)',
      resource: 'policy:security_draft',
      time: 'À l\'instant',
      status: 'success'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleTogglePolicy = (policyName: string, value: boolean) => {
    const logAction = `Politique modifiée: ${policyName} -> ${value ? 'Activé' : 'Désactivé'}`;
    const newLog: AuditLog = {
      action: logAction,
      user: 'Sofiane Dahmani (Admin)',
      resource: `config:${policyName}`,
      time: 'À l\'instant',
      status: 'success'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-moustachir-primary tracking-tight">Administration & Gouvernance</h1>
          <p className="text-sm text-slate-500">Gérez les profils, les autorisations d'accès et les règles d'intégration de données.</p>
        </div>
        <Button onClick={handleCreatePolicy} className="bg-moustachir-primary hover:bg-moustachir-primary/90 text-white flex items-center gap-2">
          <Plus size={16} />
          Nouvelle Règle
        </Button>
      </div>

      {/* Overview Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status Card */}
        <Card className="hover:shadow-md transition-all flex flex-col justify-between border-moustachir-border">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-moustachir-secondary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Statut du Système</CardTitle>
              </div>
              <Badge variant="success">Actif & Sécurisé</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex justify-between text-xs border-b border-moustachir-border pb-2">
              <span className="text-slate-500">Dernier audit de sécurité</span>
              <span className="text-slate-800 font-medium">Il y a 2 heures</span>
            </div>
            <div className="flex justify-between text-xs border-b border-moustachir-border pb-2">
              <span className="text-slate-500">Utilisateurs actifs aujourd'hui</span>
              <span className="text-slate-800 font-semibold">{users.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Flux d'importation de Wilayas</span>
              <span className="text-moustachir-secondary font-semibold">48 Wilayas configurées</span>
            </div>
          </CardContent>
        </Card>

        {/* Global Security Policies */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Activité de Gouvernance Récente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 text-[10px]">Action</TableHead>
                  <TableHead className="py-2 text-[10px]">Utilisateur</TableHead>
                  <TableHead className="py-2 text-[10px]">Ressource</TableHead>
                  <TableHead className="py-2 text-[10px] text-right">Heure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.slice(0, 3).map((log, index) => (
                  <TableRow key={index} className="text-xs">
                    <TableCell className="py-2.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-[#22C55E]' :
                          log.status === 'failed' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                        }`} />
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-slate-600">{log.user}</TableCell>
                    <TableCell className="py-2.5 font-mono text-slate-400 text-[10px]">{log.resource}</TableCell>
                    <TableCell className="py-2.5 text-slate-500 text-right">{log.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Main Governance Content (Tabs) */}
      <Card className="shadow-sm border-moustachir-border">
        {/* Tab Headers */}
        <div className="flex border-b border-moustachir-border bg-moustachir-light/30">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'border-moustachir-primary text-moustachir-primary' : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Users size={16} />
            Utilisateurs ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('roles')} 
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles' ? 'border-moustachir-primary text-moustachir-primary' : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Lock size={16} />
            Rôles & Autorisations
          </button>
          <button 
            onClick={() => setActiveTab('mapping')} 
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mapping' ? 'border-moustachir-primary text-moustachir-primary' : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Settings size={16} />
            Règles d'Import & Mapping
          </button>
          <button 
            onClick={() => setActiveTab('dedup')} 
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dedup' ? 'border-moustachir-primary text-moustachir-primary' : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Sliders size={16} />
            Algorithme de Déduplication
          </button>
        </div>

        <CardContent className="p-6">
          {/* Tab 1: Users */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Rechercher par nom, e-mail ou rôle..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2 text-xs">
                    <Filter size={14} />
                    Filtrer
                  </Button>
                  <Link href="/app/admin/register">
                    <Button className="bg-moustachir-light hover:bg-moustachir-light/80 text-moustachir-primary border border-moustachir-border flex items-center gap-2 text-xs">
                      <UserPlus size={14} />
                      Créer Personnel
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="border border-moustachir-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Adresse E-mail</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Dernière Connexion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-semibold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-moustachir-primary/5 text-moustachir-primary flex items-center justify-center font-bold text-xs uppercase">
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            {u.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'Admin' || u.role === 'Director' ? 'secondary' : 'default'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{u.department}</TableCell>
                        <TableCell>
                          <Badge variant={u.status === 'Active' ? 'success' : 'warning'}>
                            {u.status === 'Active' ? 'Actif' : 'Suspendu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-400 text-xs">{u.lastLogin}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tab 2: Roles & Permissions Matrix */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Matrice d'Accès aux Pages de la Plateforme</h4>
                <p className="text-xs text-slate-500">Visualisation des autorisations d'accès par rôle métier. Ces droits sont appliqués dynamiquement au niveau des routes applicatives.</p>
              </div>

              <div className="border border-slate-100 rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module / Page</TableHead>
                      <TableHead className="text-center">Director (D.G.)</TableHead>
                      <TableHead className="text-center">Admin</TableHead>
                      <TableHead className="text-center">Marketing</TableHead>
                      <TableHead className="text-center">Commercial</TableHead>
                      <TableHead className="text-center">Finance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PAGES_MATRIX.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-semibold text-slate-700 text-xs py-3">{page.name}</TableCell>
                        <TableCell className="text-center py-3">
                          {page.roles.Director ? (
                            <CheckCircle2 size={16} className="text-[#22C55E] mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {page.roles.Admin ? (
                            <CheckCircle2 size={16} className="text-[#22C55E] mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {page.roles.Marketing ? (
                            <CheckCircle2 size={16} className="text-[#22C55E] mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {page.roles.Commercial ? (
                            <CheckCircle2 size={16} className="text-[#22C55E] mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {page.roles.Finance ? (
                            <CheckCircle2 size={16} className="text-[#22C55E] mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Policy Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Stratégies de Sécurité Globale</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-moustachir-light/40 border border-moustachir-border rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Double Facteur (2FA) Obligatoire</p>
                      <p className="text-[10px] text-slate-400">Force l'authentification 2FA pour les comptes Directeur et Admin.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={policy2FA} 
                      onChange={(e) => {
                        setPolicy2FA(e.target.checked);
                        handleTogglePolicy('force_2fa', e.target.checked);
                      }} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-moustachir-light/40 border border-moustachir-border rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Restriction Géographique</p>
                      <p className="text-[10px] text-slate-400">Autorise les connexions uniquement depuis les blocs IP algériens.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={policyAlgeriaOnly} 
                      onChange={(e) => {
                        setPolicyAlgeriaOnly(e.target.checked);
                        handleTogglePolicy('restrict_algeria_ip', e.target.checked);
                      }} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Contrôle des Sessions & Exports</h4>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Expiration de session (minutes)</label>
                    <Select 
                      value={policySessionTimeout} 
                      onChange={(e) => {
                        setPolicySessionTimeout(e.target.value);
                        handleTogglePolicy('session_timeout_minutes', true);
                      }}
                      className="w-full"
                    >
                      <option value="15">15 minutes (Haute Sécurité)</option>
                      <option value="30">30 minutes (Recommandé)</option>
                      <option value="60">60 minutes</option>
                      <option value="120">120 minutes</option>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Exportation de Données Financières (DZD / DA)</label>
                    <Select 
                      value={policyDataExport} 
                      onChange={(e) => {
                        setPolicyDataExport(e.target.value);
                        handleTogglePolicy('data_export_security', true);
                      }}
                      className="w-full"
                    >
                      <option value="Libre">Libre pour tous les rôles autorisés</option>
                      <option value="Restreint">Restreint (Nécessite approbation du Directeur)</option>
                      <option value="Désactivé">Bloqué pour tout le personnel</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Mapping Rules */}
          {activeTab === 'mapping' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Champs Obligatoires lors de l'Importation de Clients</h4>
                <p className="text-xs text-slate-500">Configurez les colonnes obligatoires que les fichiers CSV / Excel importés doivent contenir sous peine de rejet immédiat du fichier.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-moustachir-border rounded-lg space-y-3">
                  <h5 className="text-xs font-bold text-moustachir-primary uppercase">Informations Primaires</h5>
                  
                  <div className="flex items-center justify-between py-2 border-b border-moustachir-border/40">
                    <span className="text-xs font-medium text-slate-700">Nom de l'Entreprise (Raison Sociale)</span>
                    <input 
                      type="checkbox" 
                      checked={mappingRequired.name} 
                      onChange={(e) => setMappingRequired({ ...mappingRequired, name: e.target.checked })} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-moustachir-border/40">
                    <span className="text-xs font-medium text-slate-700">Adresse E-mail</span>
                    <input 
                      type="checkbox" 
                      checked={mappingRequired.email} 
                      onChange={(e) => setMappingRequired({ ...mappingRequired, email: e.target.checked })} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-slate-700">Numéro de Téléphone</span>
                    <input 
                      type="checkbox" 
                      checked={mappingRequired.phone} 
                      onChange={(e) => setMappingRequired({ ...mappingRequired, phone: e.target.checked })} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="p-4 border border-moustachir-border rounded-lg space-y-3">
                  <h5 className="text-xs font-bold text-moustachir-primary uppercase">Informations de Segmentation & Valeur</h5>
                  
                  <div className="flex items-center justify-between py-2 border-b border-moustachir-border/40">
                    <span className="text-xs font-medium text-slate-700">Wilaya Algérienne d'Origine</span>
                    <input 
                      type="checkbox" 
                      checked={mappingRequired.wilaya} 
                      onChange={(e) => setMappingRequired({ ...mappingRequired, wilaya: e.target.checked })} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-moustachir-border/40">
                    <span className="text-xs font-medium text-slate-700">Segment d'Activité (SME, Startup, etc.)</span>
                    <input 
                      type="checkbox" 
                      checked={mappingRequired.segment} 
                      onChange={(e) => setMappingRequired({ ...mappingRequired, segment: e.target.checked })} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-slate-700">Valeur Estimée de l'Opportunité (DA / DZD)</span>
                    <input 
                      type="checkbox" 
                      checked={mappingRequired.value} 
                      onChange={(e) => setMappingRequired({ ...mappingRequired, value: e.target.checked })} 
                      className="rounded border-slate-300 text-moustachir-secondary focus:ring-moustachir-secondary h-4 w-4 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-moustachir-border">
                <Button 
                  onClick={() => {
                    setDialogTitle('Configuration Enregistrée');
                    setDialogContent('Les nouvelles règles obligatoires pour les imports de fichiers clients ont été enregistrées avec succès.');
                    setIsDialogOpen(true);
                  }}
                  className="bg-moustachir-primary hover:bg-moustachir-primary/90 text-white"
                >
                  Sauvegarder les règles de mapping
                </Button>
              </div>
            </div>
          )}

          {/* Tab 4: Deduplication */}
          {activeTab === 'dedup' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Algorithme de Fusion & Déduplication Client</h4>
                <p className="text-xs text-slate-500">Ajustez le comportement de la plateforme lors de la détection d'enregistrements similaires lors des imports ou de la création de fiches clients.</p>
              </div>

              <div className="p-5 bg-moustachir-light/30 border border-moustachir-border rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Seuil de Similarité (Score de Levenshtein)</label>
                  <span className="text-xs font-bold text-moustachir-primary">{similarityThreshold}%</span>
                </div>
                
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-moustachir-light rounded-lg appearance-none cursor-pointer accent-moustachir-primary"
                />
                
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50% (Tolérance Élevée - Risque de fausses fusions)</span>
                  <span>99% (Strict - Doit correspondre presque parfaitement)</span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase">Stratégie en Cas de Doublon Confirmé</h5>
                
                <div 
                  onClick={() => setDedupStrategy('manual')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                    dedupStrategy === 'manual' 
                      ? 'border-moustachir-primary bg-moustachir-light/30' 
                      : 'border-moustachir-border hover:border-slate-300 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="strategy" 
                    checked={dedupStrategy === 'manual'}
                    onChange={() => {}}
                    className="mt-1 text-moustachir-primary focus:ring-moustachir-primary" 
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Arbitrage manuel (Recommandé)</p>
                    <p className="text-[10px] text-slate-400 mt-1">Les doublons détectés sont envoyés au module de validation pour traitement manuel par un administrateur.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setDedupStrategy('auto_recent')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                    dedupStrategy === 'auto_recent' 
                      ? 'border-moustachir-primary bg-moustachir-light/30' 
                      : 'border-moustachir-border hover:border-slate-300 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="strategy" 
                    checked={dedupStrategy === 'auto_recent'}
                    onChange={() => {}}
                    className="mt-1 text-moustachir-primary focus:ring-moustachir-primary" 
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Écrasement automatique par l'enregistrement le plus récent</p>
                    <p className="text-[10px] text-slate-400 mt-1">Fusionne les informations en priorisant l'enregistrement importé le plus récent.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setDedupStrategy('auto_keep')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                    dedupStrategy === 'auto_keep' 
                      ? 'border-moustachir-primary bg-moustachir-light/30' 
                      : 'border-moustachir-border hover:border-slate-300 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="strategy" 
                    checked={dedupStrategy === 'auto_keep'}
                    onChange={() => {}}
                    className="mt-1 text-moustachir-primary focus:ring-moustachir-primary" 
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Conserver l'original et ignorer les nouveaux imports</p>
                    <p className="text-[10px] text-slate-400 mt-1">Aucune mise à jour automatique. Conserve l'état déjà existant dans la base locale.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-moustachir-border">
                <Button 
                  onClick={() => {
                    setDialogTitle('Configuration d\'Algorithme Enregistrée');
                    setDialogContent(`Le seuil de déduplication a été fixé à ${similarityThreshold}% avec la stratégie de type "${
                      dedupStrategy === 'manual' ? 'Arbitrage manuel' :
                      dedupStrategy === 'auto_recent' ? 'Écrasement le plus récent' : 'Conserver l\'original'
                    }".`);
                    setIsDialogOpen(true);
                  }}
                  className="bg-moustachir-primary hover:bg-moustachir-primary/90 text-white"
                >
                  Appliquer les règles de déduplication
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={dialogTitle}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{dialogContent}</p>
          <div className="flex justify-end">
            <Button onClick={() => setIsDialogOpen(false)} className="bg-moustachir-primary hover:bg-moustachir-primary/90 text-white">
              D'accord
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
