import { 
  AgentStock, 
  IndividualStock, 
  ScoreHistoryEntry,
  Trade,
  UserHolding,
  WalletScoreResult,
  LeaderboardMetric,
  LeaderboardResponse,
  AgentType,
  FilterOptions
} from '@/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

// ⚠️ CHANGE THIS TO YOUR RAILWAY BACKEND URL
export const API_BASE = 'https://tzurix.up.railway.app';

// =============================================================================
// FETCH WRAPPER
// =============================================================================

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

// =============================================================================
// AGENT APIs
// =============================================================================

interface GetAgentsOptions {
  sort?: 'score' | 'newest' | 'name' | 'volume' | 'holders';
  type?: AgentType;
  category?: 'agent' | 'individual';
  limit?: number;
}

/**
 * Get list of agents with optional filtering and sorting
 */
export async function getAgents(options?: GetAgentsOptions): Promise<AgentStock[]> {
  const params = new URLSearchParams();
  if (options?.sort) params.append('sort', options.sort);
  if (options?.type) params.append('type', options.type);
  if (options?.category) params.append('category', options.category);
  if (options?.limit) params.append('limit', options.limit.toString());
  
  const queryString = params.toString();
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
  type?: AgentType;
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

// =============================================================================
// INDIVIDUAL APIs (uses same agent endpoints with category filter)
// =============================================================================

/**
 * Get list of individuals
 */
export async function getIndividuals(): Promise<IndividualStock[]> {
  const response = await fetchApi<{ agents: IndividualStock[] }>('/api/agents?category=individual');
  return response.data?.agents || [];
}

/**
 * Get single individual by ID
 */
export async function getIndividual(id: string | number): Promise<IndividualStock | null> {
  const response = await fetchApi<{ agent: IndividualStock }>(`/api/agents/${id}`);
  const agent = response.data?.agent;
  if (agent && agent.category === 'individual') {
    return agent;
  }
  return null;
}

// =============================================================================
// LEADERBOARD API (NEW!)
// =============================================================================

interface GetLeaderboardOptions {
  metric?: LeaderboardMetric;
  type?: AgentType;
  limit?: number;
}

/**
 * Get leaderboard - top agents by various metrics
 */
export async function getLeaderboard(options?: GetLeaderboardOptions): Promise<AgentStock[]> {
  const params = new URLSearchParams();
  if (options?.metric) params.append('metric', options.metric);
  if (options?.type) params.append('type', options.type);
  if (options?.limit) params.append('limit', options.limit.toString());
  
  const queryString = params.toString();
  const endpoint = `/api/leaderboard${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchApi<LeaderboardResponse>(endpoint);
  return response.data?.agents || [];
}

// =============================================================================
// SCORE HISTORY API (NEW!)
// =============================================================================

interface GetScoreHistoryOptions {
  days?: number;
}

/**
 * Get score history for an agent (for charts)
 */
export async function getAgentScoreHistory(
  agentId: string | number,
  options?: GetScoreHistoryOptions
): Promise<ScoreHistoryEntry[]> {
  const params = new URLSearchParams();
  if (options?.days) params.append('days', options.days.toString());
  
  const queryString = params.toString();
  const endpoint = `/api/agents/${agentId}/history${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchApi<{ history: ScoreHistoryEntry[] }>(endpoint);
  return response.data?.history || [];
}

// =============================================================================
// SCORING APIs
// =============================================================================

/**
 * Get detailed score and metrics for a wallet address
 */
export async function getWalletScore(walletAddress: string): Promise<WalletScoreResult | null> {
  const response = await fetchApi<{ success: boolean } & WalletScoreResult>(`/api/score/${walletAddress}`);
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

/**
 * Refresh an agent's score from on-chain data
 */
export async function refreshAgentScore(agentId: number): Promise<{ 
  success: boolean; 
  agent?: AgentStock; 
  scoring_details?: {
    raw_score: number;
    final_score: number;
    capped: boolean;
    metrics: {
      total_trades: number;
      win_rate: number;
      total_pnl_sol: number;
    };
  };
  error?: string 
}> {
  const response = await fetchApi<any>(`/api/agent/${agentId}/refresh-score`, { 
    method: 'POST' 
  });
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error || 'Failed to refresh score' };
  }
  
  return response.data;
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
  trade?: Trade;
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

export interface UserTransaction {
  id: number;
  agent_id: number;
  agent_name: string | null;
  trader_wallet: string;
  side: 'buy' | 'sell';
  token_amount: number;
  sol_amount: number;
  sol_amount_display: number;
  price_at_trade: number;
  score_at_trade: number | null;
  tx_signature: string | null;
  created_at: string;
}

export interface UserTransactionsResponse {
  success: boolean;
  wallet_address: string;
  transactions: UserTransaction[];
  total: number;
  limit: number;
  offset: number;
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

// =============================================================================
// FORMAT HELPERS
// =============================================================================

/**
 * Format score to price (Score × $0.01)
 */
export function formatPrice(score: number): string {
  return `$${(score * 0.01).toFixed(2)}`;
}

/**
 * Format large numbers (1K, 1M, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Shorten wallet address
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format lamports to SOL
 */
export function formatSOL(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  return `${sol.toFixed(4)} SOL`;
}

/**
 * Format date to relative time
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
 * Calculate score change percentage
 */
export function calculateScoreChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get agent type display name
 */
export function getAgentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    trading: 'Trading Bot',
    social: 'Social Agent',
    defi: 'DeFi Agent',
    utility: 'Utility Agent',
  };
  return labels[type] || type;
}

/**
 * Get agent type color class
 */
export function getAgentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    trading: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    social: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    defi: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    utility: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  };
  return colors[type] || 'text-slate-400 bg-slate-500/10 border-slate-500/30';
}