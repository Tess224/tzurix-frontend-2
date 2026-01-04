// =============================================================================
// TZURIX FRONTEND TYPES
// Updated to match backend v2 with agent types, categories, and new fields
// =============================================================================

// Agent types (from backend VALID_AGENT_TYPES)
export type AgentType = 'trading' | 'social' | 'defi' | 'utility';

// Individual types (for future use)
export type IndividualType = 'creator' | 'developer' | 'influencer' | 'trader';

// Category distinguishes agents from individuals
export type StockCategory = 'agent' | 'individual';

// =============================================================================
// AGENT STOCK (matches backend Agent.to_dict())
// =============================================================================

export interface AgentStock {
  id: number;
  wallet_address: string;
  name: string;
  description: string | null;
  creator_wallet: string;
  
  // Score data
  current_score: number;
  previous_score: number;
  raw_score: number;        // Score before daily cap applied
  was_capped: boolean;      // Whether the cap was applied
  
  // Classification
  type: AgentType;          // trading/social/defi/utility
  category: StockCategory;  // agent or individual
  
  // Stats
  holders: number;
  volume_24h: number;
  total_volume: number;
  last_score_update: string | null;
  
  // Pricing (calculated from score)
  price_lamports: number;
  price_sol: number;
  price_usd: number;
  display_price: number;    // Score × $0.01
  market_cap_sol: number;
  market_cap_usd: number;
  
  // Token data
  token_mint: string | null;
  total_supply: number;
  reserve_lamports: number;
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

// =============================================================================
// INDIVIDUAL STOCK (same structure, different category)
// =============================================================================

export interface IndividualStock {
  id: number;
  wallet_address: string;
  name: string;
  description: string | null;
  creator_wallet: string;
  
  current_score: number;
  previous_score: number;
  raw_score: number;
  was_capped: boolean;
  
  type: IndividualType;
  category: 'individual';
  
  holders: number;
  volume_24h: number;
  total_volume: number;
  last_score_update: string | null;
  
  price_lamports: number;
  price_sol: number;
  price_usd: number;
  display_price: number;
  market_cap_sol: number;
  market_cap_usd: number;
  
  token_mint: string | null;
  total_supply: number;
  reserve_lamports: number;
  
  is_active: boolean;
  
  created_at: string | null;
  updated_at: string | null;
}

// =============================================================================
// SCORE HISTORY (for charts)
// =============================================================================

export interface ScoreHistoryEntry {
  id: number;
  agent_id: number;
  score: number;
  raw_score: number | null;
  price_usd: number | null;
  price_sol: number | null;
  calculated_at: string;
}

export interface DailyScore {
  date: string;
  score: number;
  raw_score?: number;
  price?: number;
}

// =============================================================================
// TRADING TYPES
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

export interface Trade {
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

// =============================================================================
// USER & PORTFOLIO TYPES
// =============================================================================

export interface UserHolding {
  id: number;
  agent_id: number;
  agent_name: string | null;
  token_amount: number;
  avg_buy_price_sol: number;
  current_price_sol: number;
  current_price_usd: number;
  current_value_sol: number;
  current_value_usd: number;
  pnl_percent: number;
}

export interface User {
  id: number;
  wallet_address: string;
  created_at: string;
}

// =============================================================================
// LEADERBOARD TYPES
// =============================================================================

export type LeaderboardMetric = 'score' | 'gainers' | 'volume' | 'holders';

export interface LeaderboardResponse {
  success: boolean;
  metric: LeaderboardMetric;
  count: number;
  agents: AgentStock[];
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// =============================================================================
// WALLET SCORE / METRICS (from scoring engine)
// =============================================================================

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

export interface WalletScoreResult {
  wallet_address: string;
  raw_score: number;
  final_score: number;
  previous_score: number;
  capped: boolean;
  calculated_at: string;
  using_real_data: boolean;
  metrics: WalletMetrics;
}

// =============================================================================
// UI HELPER TYPES
// =============================================================================

export interface FilterOptions {
  type?: AgentType;
  category?: StockCategory;
  sort?: 'score' | 'newest' | 'volume' | 'holders' | 'name';
  limit?: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}