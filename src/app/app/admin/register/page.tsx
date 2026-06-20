'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserPlus, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Badge } from '@/components/ui';

type Role = 'Director' | 'Marketing' | 'Commercial' | 'Finance' | 'Admin';

const DEMO_EMAILS = [
  'director@moustachir.dz',
  'marketing@moustachir.dz',
  'commercial@moustachir.dz',
  'finance@moustachir.dz',
  'admin@moustachir.dz'
];

export default function RegisterPage() {
  const router = useRouter();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Commercial');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'Vide', color: 'bg-slate-200', score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Faible', color: 'bg-red-500', score };
    if (score === 2) return { label: 'Moyen', color: 'bg-amber-500', score };
    if (score === 3) return { label: 'Fort', color: 'bg-blue-500', score };
    return { label: 'Très Fort', color: 'bg-emerald-500', score };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if duplicate of demo accounts
    if (DEMO_EMAILS.includes(normalizedEmail)) {
      setError('Cette adresse e-mail appartient à un compte de démonstration prédéfini.');
      return;
    }

    // Retrieve existing custom users
    let customUsers: any[] = [];
    const storedUsers = localStorage.getItem('moustachir_registered_users');
    if (storedUsers) {
      try {
        customUsers = JSON.parse(storedUsers);
        if (!Array.isArray(customUsers)) {
          customUsers = [];
        }
      } catch (e) {
        customUsers = [];
      }
    }

    // Check if duplicate in custom users
    const duplicate = customUsers.find(
      (u: any) => u.email.toLowerCase().trim() === normalizedEmail
    );

    if (duplicate) {
      setError('Un utilisateur avec cette adresse e-mail est déjà inscrit.');
      return;
    }

    // Build the new user object
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      role: role,
      password: password,
      avatar: avatarUrl,
      status: 'Active',
      lastLogin: 'Jamais connecté',
      createdAt: new Date().toISOString()
    };

    // Add to registered users list
    customUsers.push(newUser);
    localStorage.setItem('moustachir_registered_users', JSON.stringify(customUsers));

    // Optional: Log in audit activity logs
    // Write new log to audit activity if we want, or it's handled on dashboard reload
    
    setSuccess(true);
    
    // Redirect to admin users list after short delay
    setTimeout(() => {
      router.push('/app/admin');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link href="/app/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-moustachir-primary transition-colors">
          <ArrowLeft size={14} />
          Retour au Centre de Gouvernance
        </Link>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-md border border-moustachir-border">
        <CardHeader className="bg-moustachir-light/30 border-b border-moustachir-border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-moustachir-secondary/10 rounded-lg text-moustachir-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Inscrire un Collaborateur</CardTitle>
              <CardDescription>Ajoutez un nouveau membre d'équipe avec un rôle et des droits d'accès définis.</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-lg">Inscription Réussie</h3>
                <p className="text-sm text-slate-500 max-w-sm">Le collaborateur <strong>{name}</strong> a été enregistré et peut maintenant se connecter à la plateforme.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-ping"></span>
                Redirection en cours...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error block */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3 text-sm animate-fade-in">
                  <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Erreur d'inscription</span>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Legal Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    Nom Complet <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="ex. Mohamed Amine Belkacem" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400" />
                    Adresse Email Professionnelle <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="email" 
                    placeholder="nom.prenom@moustachir.dz" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-slate-400">L'email servira d'identifiant unique de connexion.</p>
                </div>

                {/* Role selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={12} className="text-slate-400" />
                    Rôle & Droits d'Accès <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full"
                  >
                    <option value="Director">Directeur Général (Director)</option>
                    <option value="Admin">Administrateur Système (Admin)</option>
                    <option value="Marketing">Responsable Marketing (Marketing)</option>
                    <option value="Commercial">Responsable Commercial (Commercial)</option>
                    <option value="Finance">Responsable Financier (Finance)</option>
                  </Select>
                </div>

                {/* Role badge hint */}
                <div className="flex flex-col justify-end">
                  <div className="p-3 bg-moustachir-light/50 rounded-lg border border-moustachir-border">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ressources Autorisées</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role === 'Director' && (
                        <>
                          <Badge variant="success">Tous les Modules</Badge>
                          <Badge variant="info">Lecture & Écriture</Badge>
                        </>
                      )}
                      {role === 'Admin' && (
                        <>
                          <Badge variant="secondary">Gouvernance</Badge>
                          <Badge variant="secondary">Qualité de Données</Badge>
                          <Badge variant="secondary">Importation</Badge>
                        </>
                      )}
                      {role === 'Marketing' && (
                        <>
                          <Badge variant="info">Cockpit</Badge>
                          <Badge variant="info">Lifecycle</Badge>
                          <Badge variant="info">Attribution</Badge>
                        </>
                      )}
                      {role === 'Commercial' && (
                        <>
                          <Badge variant="info">Cockpit</Badge>
                          <Badge variant="info">Pipeline Leads</Badge>
                          <Badge variant="info">Perf. Équipes</Badge>
                        </>
                      )}
                      {role === 'Finance' && (
                        <>
                          <Badge variant="info">Cockpit</Badge>
                          <Badge variant="info">Factures & Offres</Badge>
                          <Badge variant="info">Prévisions</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} className="text-slate-400" />
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {/* Strength Bar */}
                  {password && (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-medium">Sécurité : {strength.label}</span>
                        <span className="font-bold text-slate-700">{strength.score * 25}%</span>
                      </div>
                      <div className="h-1 w-full bg-moustachir-light rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strength.color} transition-all duration-300`} 
                          style={{ width: `${(strength.score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} className="text-slate-400" />
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-moustachir-border">
                <Link href="/app/admin">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" className="bg-moustachir-primary hover:bg-moustachir-primary/90 text-white">
                  Créer le collaborateur
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
