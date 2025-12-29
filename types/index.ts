// Stock Types
export type AgentType = 'trading' | 'social' | 'defi' | 'utility';
export type IndividualType = 'trader' | 'influencer' | 'developer' | 'analyst';
export type StockCategory = 'agent' | 'individual';

export interface BaseStock {
  id: number;
  name: string;
  description?: string;
  current_score: number;
  previous_score: number;
  raw_score?: number;
  was_capped?: boolean;
  holders?: number;
  volume_24h?: number;
  total_volume?: number;
  market_cap_usd?: number;
  created_at?: string;
  creator_wallet?: string;
}

export interface AgentStock extends BaseStock {
  category: 'agent';
  type: AgentType;
  wallet_address: string;
  agent_wallets?: string[];
  metrics?: AgentMetrics;
}

export interface IndividualStock extends BaseStock {
  category: 'individual';
  type: IndividualType;
  twitter_handle?: string;
  metrics?: IndividualMetrics;
}

export type Stock = AgentStock | IndividualStock;

export interface AgentMetrics {
  pnl_24h?: number;
  pnl_7d?: number;
  pnl_30d?: number;
  win_rate?: number;
  total_trades?: number;
  max_drawdown?: number;
  followers?: number;
  engagement_rate?: number;
  posts_24h?: number;
  avg_likes?: number;
  tvl?: number;
  current_apy?: number;
  protocols_used?: number;
  total_yield?: number;
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

export interface DailyScore {
  date: string;
  raw_score: number;
  final_score: number;
  change_percent: number;
  was_capped: boolean;
  cap_direction?: 'up' | 'down' | null;
  }
