
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { RolUsuario } from '@/types';

interface SessionUser {
  id: number;
  email: string;
  rol: RolUsuario;
  nombre_completo: string;
}

interface SessionContextType {
  user: SessionUser | null;
  isLoading: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decodedToken: { sub: number; email: string; rol: RolUsuario; nombre_completo: string } = jwtDecode(token);
        setUser({
          id: decodedToken.sub,
          email: decodedToken.email,
          rol: decodedToken.rol,
          nombre_completo: decodedToken.nombre_completo,
        });
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
