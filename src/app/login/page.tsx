"use client";

import React, { useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import {
  Sliders,
  Shield,
  Award,
  Landmark,
  Building,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await login(email, undefined, password);
      if (!success) {
        setError(
          "Adresse email ou mot de passe incorrect. Veuillez utiliser un des comptes de démonstration ou cliquer sur Connexion Rapide.",
        );
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setError("");
    setIsSubmitting(true);
    try {
      await login("", role);
    } catch (err) {
      setError("Échec de la connexion rapide.");
      setIsSubmitting(false);
    }
  };

  const quickRoles: {
    role: Role;
    label: string;
    icon: React.ComponentType<any>;
    email: string;
  }[] = [
    {
      role: "Director",
      label: "Directeur Général",
      icon: Award,
      email: "director@moustachir.dz",
    },
    {
      role: "Marketing",
      label: "Resp. Marketing",
      icon: Sliders,
      email: "marketing@moustachir.dz",
    },
    {
      role: "Commercial",
      label: "Directeur Commercial",
      icon: Building,
      email: "commercial@moustachir.dz",
    },
    {
      role: "Finance",
      label: "Resp. Finance",
      icon: Landmark,
      email: "finance@moustachir.dz",
    },
    // {
    //   role: 'Admin',
    //   label: 'Administrateur',
    //   icon: Shield,
    //   email: 'admin@moustachir.dz'
    // },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F8FB] text-[#17345C] font-sans antialiased">
      {/* Left Banner Side */}
      <div className="md:w-5/12 bg-[#17345C] text-[#EEF4F8] p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#DCE5EE]/20 relative overflow-hidden geometric-pattern">
  {/* Logo Container */}
  <div className="flex items-center mb-8 relative z-10">
    <img
      src="/logo.svg"
      alt="Moustachir Logo"
      className="w-[150px] h-auto flex-shrink-0 object-contain" 
    />
  </div>

  {/* Middle Content */}
  <div className="my-auto max-w-sm relative z-10 flex flex-col gap-3">
    <h1 className="text-3xl font-extrabold leading-tight text-white">
      Prenez des décisions éclairées grâce aux données.
    </h1>
    <p className="text-sm text-[#EEF4F8]/80 leading-relaxed">
      Moustachir Decision Intelligence Platform agrège vos indicateurs
      clés, analyse l'attribution marketing, suit le pipeline de vente et
      simule vos revenus prévisionnels.
    </p>
  </div>

  {/* Footer Support */}
  <div className="flex items-center gap-2 text-xs text-[#EEF4F8]/60 relative z-10 pt-6">
    <HelpCircle size={14} className="text-[#4DA3FF]" />
    <span>Support Technique : support@moustachir.dz</span>
  </div>

  {/* Background Watermark Decorative elements */}
  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
    <svg
      width="400"
      height="400"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path d="M25 70V30L50 52L75 30V70" />
    </svg>
  </div>
</div>

      {/* Right Login Form & Quick Buttons */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 relative">
        {/* Subtle geometric lines watermark on the right */}
        <div className="absolute inset-0 bg-[radial-gradient(#4da3ff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="bg-white border border-[#DCE5EE] p-8 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#17345C]">
                Connexion à la Plateforme
              </h2>
              <p className="text-xs text-[#6B7C93] mt-1.5">
                Entrez vos identifiants ou utilisez la connexion rapide pour
                tester les différents profils.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7C93] mb-1.5">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: director@moustachir.dz"
                  className="w-full px-3 py-2 bg-[#F5F8FB] border border-[#DCE5EE] rounded text-sm text-[#17345C] placeholder-[#6B7C93]/50 focus:outline-none focus:ring-1 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7C93] mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#F5F8FB] border border-[#DCE5EE] rounded text-sm text-[#17345C] placeholder-[#6B7C93]/50 focus:outline-none focus:ring-1 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 font-bold transition-all text-xs uppercase tracking-wider"
              >
                {isSubmitting ? "Connexion en cours..." : "Se Connecter"}
              </Button>
            </form>
          </div>

          {/* Quick Login Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-[#DCE5EE] w-full"></div>
            <span className="absolute bg-[#F5F8FB] px-3 text-[9px] font-bold uppercase tracking-widest text-[#6B7C93]">
              Connexion Rapide (Démo)
            </span>
          </div>

          {/* Quick Login Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {quickRoles.map((qr) => {
              const Icon = qr.icon;
              return (
                <button
                  key={qr.role}
                  onClick={() => handleQuickLogin(qr.role)}
                  disabled={isSubmitting}
                  className="flex flex-col items-start p-3 bg-white border border-[#DCE5EE] hover:border-[#4DA3FF] rounded text-left transition-all hover:bg-[#EEF4F8]/30 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-[#F5F8FB] group-hover:bg-[#4DA3FF]/15 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-[#17345C] group-hover:text-[#4DA3FF]" />
                    </div>
                    <span className="text-xs font-bold text-[#17345C]">
                      {qr.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B7C93] mt-1.5 font-medium truncate w-full">
                    {qr.label}
                  </span>
                  <span className="text-[9px] text-[#6B7C93]/60 mt-0.5 truncate w-full">
                    {qr.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
