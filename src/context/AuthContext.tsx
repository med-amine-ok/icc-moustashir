'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'Director' | 'Marketing' | 'Commercial' | 'Finance' | 'Admin';

export interface User {
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role?: Role, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<string, User> = {
  'director@moustachir.dz': {
    name: 'Amine Belkacem',
    email: 'director@moustachir.dz',
    role: 'Director',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Amine%20Belkacem'
  },
  'marketing@moustachir.dz': {
    name: 'Yasmine Hamdi',
    email: 'marketing@moustachir.dz',
    role: 'Marketing',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Yasmine%20Hamdi'
  },
  'commercial@moustachir.dz': {
    name: 'Karim Cherif',
    email: 'commercial@moustachir.dz',
    role: 'Commercial',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Karim%20Cherif'
  },
  'finance@moustachir.dz': {
    name: 'Meriem Slimani',
    email: 'finance@moustachir.dz',
    role: 'Finance',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Meriem%20Slimani'
  },
  'admin@moustachir.dz': {
    name: 'Sofiane Dahmani',
    email: 'admin@moustachir.dz',
    role: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sofiane%20Dahmani'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('moustachir_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('moustachir_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, overrideRole?: Role, password?: string): Promise<boolean> => {
    // If overrideRole is supplied, use that to log in (for quick tester buttons)
    if (overrideRole) {
      // Find matching demo account or build one
      const found = Object.values(DEMO_ACCOUNTS).find(acc => acc.role === overrideRole);
      if (found) {
        setUser(found);
        localStorage.setItem('moustachir_user', JSON.stringify(found));
        router.push('/app/cockpit');
        return true;
      }
    }

    const matchedUser = DEMO_ACCOUNTS[email.toLowerCase().trim()];
    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('moustachir_user', JSON.stringify(matchedUser));
      router.push('/app/cockpit');
      return true;
    }

    // Check custom registered users from localStorage
    const storedCustomUsers = localStorage.getItem('moustachir_registered_users');
    if (storedCustomUsers) {
      try {
        const customUsers = JSON.parse(storedCustomUsers) as (User & { password?: string })[];
        const foundCustom = customUsers.find(
          u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
        );
        // If password matches or is not set on stored user, log in
        if (foundCustom && (!foundCustom.password || foundCustom.password === password)) {
          const userSession: User = {
            name: foundCustom.name,
            email: foundCustom.email,
            role: foundCustom.role,
            avatar: foundCustom.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundCustom.name)}`
          };
          setUser(userSession);
          localStorage.setItem('moustachir_user', JSON.stringify(userSession));
          router.push('/app/cockpit');
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moustachir_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
