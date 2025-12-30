import { AgentStock, IndividualStock, DailyScore } from '@/types';

// ⚠️ CHANGE THIS TO YOUR RAILWAY BACKEND URL
export const API_BASE = 'https://tzurix.up.railway.app';

// Fetch wrapper
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
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

// =============================================================================
// AGENT APIs
// =============================================================================

export async function getAgents(): Promise<AgentStock[]> {
  const response = await fetchApi<{ agents: AgentStock[] }>('/api/agents');
  return response.data?.agents || [];
}

export async function getAgent(id: string): Promise<AgentStock | null> {
  const response = await fetchApi<{ agent: AgentStock }>(`/api/agents/${id}`);
  return response.data?.agent || null;
}

// =============================================================================
// INDIVIDUAL APIs
// =============================================================================

export async function getIndividuals(): Promise<IndividualStock[]> {
  const response = await fetchApi<{ individuals: IndividualStock[] }>('/api/individuals');
  return response.data?.individuals || [];
}

export async function getIndividual(id: string): Promise<IndividualStock | null> {
  const response = await fetchApi<{ individual: IndividualStock }>(`/api/individuals/${id}`);
  return response.data?.individual || null;
}

// =============================================================================
// TRADING APIs
// =============================================================================

export interface TradeQuote {
  success: boolean;
  side: 'buy' | 'sell';
  agent_id: number;
  agent_name: string;
  sol_amount?: number;
  token_amount?: number;
  tokens_received?: number;
  sol_received?: number;
  fee_sol: number;
  price_per_token_sol: number;
  price_per_token_usd: number;
  current_score: number;
}

export interface TradeResult {
  success: boolean;
  message?: string;
  error?: string;
  trade?: {
    id: number;
    agent_id: number;
    trader_wallet: string;
    side: 'buy' | 'sell';
    token_amount: number;
    sol_amount: number;
    price_at_trade: number;
    created_at: string;
  };
  holding?: {
    token_amount: number;
    avg_buy_price_sol: number;
    current_value_usd: number;
    pnl_percent: number;
  };
  sol_spent?: number;
  sol_received?: number;
  fee_sol?: number;
}

/**
 * Get a price quote for buying or selling
 */
export async function getTradeQuote(params: {
  agentId: number;
  side: 'buy' | 'sell';
  amount: number; // SOL for buy, tokens for sell
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
}): Promise<TradeResult> {
  const response = await fetchApi<TradeResult>('/api/trade/buy', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: params.agentId,
      trader_wallet: params.traderWallet,
      sol_amount: params.solAmount,
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
}): Promise<TradeResult> {
  const response = await fetchApi<TradeResult>('/api/trade/sell', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: params.agentId,
      trader_wallet: params.traderWallet,
      token_amount: params.tokenAmount,
    }),
  });
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error || 'Trade failed' };
  }
  
  return response.data;
}

// =============================================================================
// USER APIs
// =============================================================================

export interface UserHolding {
  id: number;
  agent_id: number;
  stock_name: string;
  token_amount: number;
  avg_buy_price_sol: number;
  current_price_sol: number;
  current_price_usd: number;
  current_value_sol: number;
  current_value_usd: number;
  pnl_percent: number;
}

export interface UserHoldingsResponse {
  success: boolean;
  wallet_address: string;
  holdings: UserHolding[];
  total_value_sol: number;
  total_value_usd: number;
}

/**
 * Get user's token holdings
 */
export async function getUserHoldings(walletAddress: string): Promise<UserHoldingsResponse | null> {
  const response = await fetchApi<UserHoldingsResponse>(`/api/user/${walletAddress}/holdings`);
  return response.success ? response.data || null : null;
}

// =============================================================================
// FORMAT HELPERS
// =============================================================================

export function formatPrice(score: number): string {
  return `$${(score * 0.01).toFixed(2)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatSOL(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  return `${sol.toFixed(4)} SOL`;
}