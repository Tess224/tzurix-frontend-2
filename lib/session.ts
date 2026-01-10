// lib/session.ts
// =============================================================================
// SESSION MANAGEMENT
// Simple UUID-based session for MVP (no real wallet auth)
// =============================================================================

export interface Session {
  sessionId: string;
  walletAddress: string;
  createdAt: number;
  isConnected: boolean;
}

const SESSION_KEY = 'tzurix_session';
const SESSION_EXPIRY_DAYS = 7;

/**
 * Generate a mock Solana-like wallet address
 */
function generateMockWallet(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let wallet = '';
  for (let i = 0; i < 44; i++) {
    wallet += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return wallet;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current session from localStorage
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const session: Session = JSON.parse(stored);
    
    // Check expiry
    const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > expiryMs) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Create a new session (simulates wallet connection)
 */
export function createSession(): Session {
  const session: Session = {
    sessionId: generateUUID(),
    walletAddress: generateMockWallet(),
    createdAt: Date.now(),
    isConnected: true,
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return session;
}

/**
 * Clear current session (simulates wallet disconnect)
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Get wallet address from session, or null if not connected
 */
export function getWalletAddress(): string | null {
  const session = getSession();
  return session?.walletAddress || null;
}

/**
 * Check if user is connected
 */
export function isConnected(): boolean {
  const session = getSession();
  return session?.isConnected || false;
}

/**
 * Get session ID for API calls (for tracking without real auth)
 */
export function getSessionId(): string | null {
  const session = getSession();
  return session?.sessionId || null;
}