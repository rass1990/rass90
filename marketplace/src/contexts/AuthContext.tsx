import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  demoLogin: (userType: 'customer' | 'provider' | 'admin') => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, Profile> = {
  customer: {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'customer@demo.com',
    full_name: 'Demo Customer',
    phone: '+97333001234',
    avatar_url: null,
    user_type: 'customer',
    preferred_language: 'en',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  provider: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'ahmad@example.com',
    full_name: 'Ahmad Al-Khalifa',
    phone: '+97333001111',
    avatar_url: null,
    user_type: 'provider',
    preferred_language: 'ar',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'admin@servicehub.bh',
    full_name: 'Admin User',
    phone: '+97317000000',
    avatar_url: null,
    user_type: 'admin',
    preferred_language: 'en',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('demo_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const demoLogin = (userType: 'customer' | 'provider' | 'admin') => {
    const demoUser = DEMO_USERS[userType];
    setUser(demoUser);
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profile) {
          setUser(profile);
          localStorage.setItem('demo_user', JSON.stringify(profile));
        }
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('demo_user');
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
