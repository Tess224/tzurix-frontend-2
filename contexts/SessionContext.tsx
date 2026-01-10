// contexts/SessionContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Session, 
  getSession, 
  createSession, 
  clearSession 
} from '@/lib/session';

interface SessionContextType {
  session: Session | null;
  isConnected: boolean;
  walletAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const existingSession = getSession();
    setSession(existingSession);
    setIsLoading(false);
  }, []);

  const connect = async () => {
    setIsLoading(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newSession = createSession();
    setSession(newSession);
    setIsLoading(false);
  };

  const disconnect = () => {
    clearSession();
    setSession(null);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isConnected: session?.isConnected || false,
        walletAddress: session?.walletAddress || null,
        connect,
        disconnect,
        isLoading,
      }}
    >
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
