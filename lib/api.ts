// ============================================================================
// TZURIX FRONTEND API
// Synced with Backend v2 (January 2026)
// ============================================================================

import { 
  AgentStock, 
  IndividualStock, 
  DailyScore,
  TradeQuote,
  TradeResult,
  UserHolding,
  UserTransaction,
  UserHoldingsResponse,
  UserTransactionsResponse,
  WalletScoreResponse,
  LeaderboardResponse
} from '@/types';

// ⚠️ CHANGE THIS TO YOUR RAILWAY BACKEND URL
export const API_BASE = 'https://tzurix.up.railway.app';

// ============================================================================
// FETCH WRAPPER
// ============================================================================

async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const data = await response.json();
    return { success: data.success !== false, data };
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    return { success: false, error: 'Failed to fetch data' };
  }
}

// ============================================================================
// AGENT APIs
// ============================================================================

export interface GetAgentsParams {
  sort?: 'score' | 'newest' | 'name' | 'volume' | 'holders';
  type?: 'trading' | 'social' | 'defi' | 'utility';
  category?: 'agent' | 'individual';
  limit?: number;
}

/**
 * Get list of agents with optional filtering and sorting
 */
export async function getAgents(params?: GetAgentsParams): Promise<AgentStock[]> {
  const searchParams = new URLSearchParams();
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  const endpoint = `/api/agents${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchApi<{ agents: AgentStock[] }>(endpoint);
  return response.data?.agents || [];
}

/**
 * Get single agent by ID
 */
export async function getAgent(id: string | number): Promise<AgentStock | null> {
  const response = await fetchApi<{ agent: AgentStock }>(`/api/agents/${id}`);
  return response.data?.agent || null;
}

/**
 * Get agent by wallet address
 */
export async function getAgentByWallet(walletAddress: string): Promise<AgentStock | null> {
  const response = await fetchApi<{ agent: AgentStock }>(`/api/agents/wallet/${walletAddress}`);
  return response.data?.agent || null;
}

export interface CreateAgentParams {
  wallet_address: string;
  name: string;
  description?: string;
  creator_wallet: string;
  type?: 'trading' | 'social' | 'defi' | 'utility';
  category?: 'agent' | 'individual';
}

export interface CreateAgentResult {
  success: boolean;
  message?: string;
  error?: string;
  agent?: AgentStock;
}

/**
 * Register a new AI trading agent
 */
export async function createAgent(params: CreateAgentParams): Promise<CreateAgentResult> {
  const response = await fetchApi<CreateAgentResult>('/api/agents', {
    method: 'POST',
    body: JSON.stringify({
      wallet_address: params.wallet_address,
      name: params.name,
      description: params.description || '',
      creator_wallet: params.creator_wallet,
      type: params.type || 'trading',
      category: params.category || 'agent',
    }),
  });
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error || 'Failed to create agent' };
  }
  
  return response.data;
}

/**
 * Get agent score history
 */
export async function getAgentHistory(agentId: number, days: number = 30): Promise<DailyScore[]> {
  const response = await fetchApi<{ history: DailyScore[] }>(
    `/api/agents/${agentId}/history?days=${days}`
  );
  return response.data?.history || [];
}

/**
 * Refresh agent score from on-chain data
 */
export async function refreshAgentScore(agentId: number): Promise<{ 
  success: boolean; 
  agent?: AgentStock; 
  error?: string 
}> {
  const response = await fetchApi<{ success: boolean; agent: AgentStock; error?: string }>(
    `/api/agent/${agentId}/refresh-score`,
    { method: 'POST' }
  );
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error || 'Failed to refresh score' };
  }
  
  return response.data;
}

// ============================================================================
// INDIVIDUAL APIs (when backend supports)
// ============================================================================

export async function getIndividuals(): Promise<IndividualStock[]> {
  const response = await fetchApi<{ individuals: IndividualStock[] }>('/api/individuals');
  return response.data?.individuals || [];
}

export async function getIndividual(id: string | number): Promise<IndividualStock | null> {
  const response = await fetchApi<{ individual: IndividualStock }>(`/api/individuals/${id}`);
  return response.data?.individual || null;
}

// ============================================================================
// LEADERBOARD API
// ============================================================================

export interface GetLeaderboardParams {
  metric?: 'score' | 'gainers' | 'volume' | 'holders';
  type?: 'trading' | 'social' | 'defi' | 'utility';
  limit?: number;
}

/**
 * Get leaderboard by various metrics
 */
export async function getLeaderboard(params?: GetLeaderboardParams): Promise<AgentStock[]> {
  const searchParams = new URLSearchParams();
  if (params?.metric) searchParams.append('metric', params.metric);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  const endpoint = `/api/leaderboard${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchApi<LeaderboardResponse>(endpoint);
  return response.data?.agents || [];
}

// ============================================================================
// SCORING APIs
// ============================================================================

/**
 * Get detailed score and metrics for a wallet address
 */
export async function getWalletScore(walletAddress: string): Promise<WalletScoreResponse | null> {
  const response = await fetchApi<WalletScoreResponse>(`/api/score/${walletAddress}`);
  return response.success ? response.data || null : null;
}

// ============================================================================
// TRADING APIs
// ============================================================================

/**
 * Get a price quote for buying or selling
 */
export async function getTradeQuote(params: {
  agentId: number;
  side: 'buy' | 'sell';
  amount: number;
}): Promise<TradeQuote | null> {
  const { agentId, side, amount } = params;
  const response = await fetchApi<TradeQuote>(
    `/api/trade/quote?agent_id=${agentId}&side=${side}&amount=${amount}`
  );
  return response.success ? response.data || null : null;
}

/**
 * Execute a buy trade
 */
export async function buyTokens(params: {
  agentId: number;
  traderWallet: string;
  solAmount: number;
  txSignature?: string;
}): Promise<TradeResult> {
  const response = await fetchApi<TradeResult>('/api/trade/buy', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: params.agentId,
      trader_wallet: params.traderWallet,
      sol_amount: params.solAmount,
      tx_signature: params.txSignature,
    }),
  });
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error || 'Trade failed' };
  }
  
  return response.data;
}

/**
 * Execute a sell trade
 */
export async function sellTokens(params: {
  agentId: number;
  traderWallet: string;
  tokenAmount: number;
  txSignature?: string;
}): Promise<TradeResult> {
  const response = await fetchApi<TradeResult>('/api/trade/sell', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: params.agentId,
      trader_wallet: params.traderWallet,
      token_amount: params.tokenAmount,
      tx_signature: params.txSignature,
    }),
  });
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error || 'Trade failed' };
  }
  
  return response.data;
}

// ============================================================================
// USER APIs
// ============================================================================

/**
 * Get user's token holdings
 */
export async function getUserHoldings(walletAddress: string): Promise<UserHoldingsResponse | null> {
  const response = await fetchApi<UserHoldingsResponse>(`/api/user/${walletAddress}/holdings`);
  return response.success ? response.data || null : null;
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  walletAddress: string,
  options?: {
    limit?: number;
    offset?: number;
    agentId?: number;
  }
): Promise<UserTransactionsResponse | null> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.agentId) params.append('agent_id', options.agentId.toString());
  
  const queryString = params.toString();
  const endpoint = `/api/user/${walletAddress}/transactions${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchApi<UserTransactionsResponse>(endpoint);
  return response.success ? response.data || null : null;
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

/**
 * Format score to price: Score × $0.01
 */
export function formatPrice(score: number): string {
  return `$${(score * 0.01).toFixed(2)}`;
}

/**
 * Format display price (already calculated by backend)
 */
export function formatDisplayPrice(displayPrice: number): string {
  return `$${displayPrice.toFixed(2)}`;
}

/**
 * Format large numbers: 1000 → 1K, 1000000 → 1M
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Format percentage with sign: 5.5 → +5.5%
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Shorten wallet address: ABC...XYZ
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format SOL from lamports
 */
export function formatSOL(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  return `${sol.toFixed(4)} SOL`;
}

/**
 * Format SOL value directly
 */
export function formatSOLValue(sol: number): string {
  return `${sol.toFixed(4)} SOL`;
}

/**
 * Format relative time: "2 hours ago", "Just now"
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format date: Jan 3, 2026
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculate score change percentage
 */
export function calculateScoreChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get color class based on value (positive/negative)
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-slate-400';
}

/**
 * Get background color class based on value
 */
export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-emerald-500/20';
  if (value < 0) return 'bg-red-500/20';
  return 'bg-slate-500/20';
}