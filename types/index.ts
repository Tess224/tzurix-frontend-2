// ============================================================================
// TZURIX FRONTEND TYPES
// Synced with Backend v2 (January 2026)
// ============================================================================

// Stock Types
export type AgentType = 'trading' | 'social' | 'defi' | 'utility';
export type IndividualType = 'trader' | 'influencer' | 'developer' | 'analyst';
export type StockCategory = 'agent' | 'individual';

// ============================================================================
// BASE STOCK INTERFACE
// ============================================================================

export interface BaseStock {
  id: number;
  name: string;
  description?: string;
  
  // Score data
  current_score: number;
  previous_score: number;
  raw_score?: number;
  was_capped?: boolean;
  
  // Price data (from backend)
  price_lamports?: number;
  price_sol?: number;
  price_usd?: number;
  display_price?: number;  // Score × $0.01
  market_cap_sol?: number;
  market_cap_usd?: number;
  
  // Stats
  holders?: number;
  volume_24h?: number;
  total_volume?: number;
  
  // Token data
  token_mint?: string;
  total_supply?: number;
  reserve_lamports?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  last_score_update?: string;
  
  // Creator
  creator_wallet?: string;
  
  // Status
  is_active?: boolean;
}

// ============================================================================
// AGENT STOCK
// ============================================================================

export interface AgentStock extends BaseStock {
  category: 'agent';
  type: AgentType;
  wallet_address: string;
  agent_wallets?: string[];
  metrics?: AgentMetrics;
}

// ============================================================================
// INDIVIDUAL STOCK
// ============================================================================

export interface IndividualStock extends BaseStock {
  category: 'individual';
  type: IndividualType;
  twitter_handle?: string;
  wallet_address?: string;
  metrics?: IndividualMetrics;
}

// Union type for any stock
export type Stock = AgentStock | IndividualStock;

// ============================================================================
// METRICS
// ============================================================================

export interface AgentMetrics {
  // Trading metrics
  pnl_24h?: number;
  pnl_7d?: number;
  pnl_30d?: number;
  win_rate?: number;
  total_trades?: number;
  max_drawdown?: number;
  risk_adjusted_return?: number;
  
  // Social metrics
  followers?: number;
  engagement_rate?: number;
  posts_24h?: number;
  avg_likes?: number;
  
  // DeFi metrics
  tvl?: number;
  current_apy?: number;
  protocols_used?: number;
  total_yield?: number;
  
  // Utility metrics
  tasks_completed?: number;
  avg_response_time?: number;
  user_rating?: number;
  active_users?: number;
}

export interface IndividualMetrics {
  followers?: number;
  engagement_rate?: number;
  win_rate?: number;
  total_trades?: number;
  pnl_30d?: number;
}

// ============================================================================
// SCORE HISTORY
// ============================================================================

export interface DailyScore {
  id?: number;
  agent_id?: number;
  date: string;
  score: number;
  raw_score: number;
  final_score?: number;
  change_percent?: number;
  was_capped?: boolean;
  cap_direction?: 'up' | 'down' | null;
  price_usd?: number;
  price_sol?: number;
  calculated_at?: string;
}

// ============================================================================
// TRADING TYPES
// ============================================================================

export interface TradeQuote {
  success: boolean;
  side: 'buy' | 'sell';
  agent_id: number;
  agent_name: string;
  sol_amount?: number;
  token_amount?: number;
  tokens_received?: number;
  sol_received?: number;
  sol_before_fee?: number;
  fee_sol: number;
  price_per_token_lamports?: number;
  price_per_token_sol: number;
  price_per_token_usd: number;
  current_score: number;
}

export interface Trade {
  id: number;
  agent_id: number;
  agent_name?: string;
  trader_wallet: string;
  side: 'buy' | 'sell';
  token_amount: number;
  sol_amount: number;
  sol_amount_display?: number;
  price_at_trade: number;
  score_at_trade?: number;
  tx_signature?: string;
  created_at: string;
}

export interface TradeResult {
  success: boolean;
  message?: string;
  error?: string;
  trade?: Trade;
  holding?: UserHolding;
  sol_spent?: number;
  sol_received?: number;
  fee_sol?: number;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserHolding {
  id: number;
  user_id?: number;
  agent_id: number;
  agent_name?: string;
  token_amount: number;
  avg_buy_price_sol: number;
  current_price_sol: number;
  current_price_usd: number;
  current_value_sol: number;
  current_value_usd: number;
  pnl_percent: number;
  updated_at?: string;
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

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AgentsResponse {
  success: boolean;
  count: number;
  agents: AgentStock[];
}

export interface UserHoldingsResponse {
  success: boolean;
  wallet_address: string;
  holdings: UserHolding[];
  total_value_sol: number;
  total_value_usd: number;
}

export interface UserTransactionsResponse {
  success: boolean;
  wallet_address: string;
  transactions: UserTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface LeaderboardResponse {
  success: boolean;
  metric: string;
  count: number;
  agents: AgentStock[];
}

// ============================================================================
// WALLET SCORE TYPES
// ============================================================================

export interface WalletMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl_sol: number;
  total_volume_sol: number;
  avg_trade_pnl: number;
  avg_hold_time_hours: number;
  trades_per_day: number;
  unique_tokens_traded: number;
  largest_win_sol: number;
  largest_loss_sol: number;
  risk_adjusted_return: number;
}

export interface WalletScoreResponse {
  success: boolean;
  wallet_address: string;
  raw_score: number;
  final_score: number;
  previous_score: number;
  capped: boolean;
  calculated_at: string;
  using_real_data: boolean;
  metrics: WalletMetrics;
}