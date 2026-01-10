// lib/constants.ts
// Tzurix Core Constants

import { LineChart, MessageCircle, Landmark, Wrench, Megaphone, Code, PieChart, Palette } from 'lucide-react';

// =============================================================================
// SCORING & PRICING (NEW)
// =============================================================================

// Daily score change cap (±35%)
export const DAILY_SCORE_CAP = 0.35;

// Price formula: Score × $0.01 (displayed per 1,000 tokens)
// Actual price per token: Score × $0.00001
export const PRICE_PER_SCORE_POINT = 0.01; // Display price (per 1K tokens)
export const ACTUAL_PRICE_PER_TOKEN = 0.00001; // Real price per single token

// Total supply per stock
export const TOTAL_SUPPLY = 100_000_000; // 100M tokens

// Starting score for new listings
export const STARTING_SCORE = 10;

// Listing fee
export const LISTING_FEE_USD = 12;

// Trading fees
export const PLATFORM_FEE_PERCENT = 1.0; // 1%
export const CREATOR_FEE_PERCENT = 0.5; // 0.5%

// =============================================================================
// STOCK TYPES
// =============================================================================

export const AGENT_TYPES = {
  trading: { label: 'Trading', icon: LineChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  social: { label: 'Social', icon: MessageCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  defi: { label: 'DeFi', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  utility: { label: 'Utility', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
} as const;

export const INDIVIDUAL_TYPES = {
  trader: { label: 'Trader', icon: LineChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  influencer: { label: 'Influencer', icon: Megaphone, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  developer: { label: 'Developer', icon: Code, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  analyst: { label: 'Analyst', icon: PieChart, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  creator: { label: 'Creator', icon: Palette, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/create', label: 'Create' },
] as const;

// =============================================================================
// SORT & FILTER OPTIONS
// =============================================================================

export const SORT_OPTIONS = [
  { value: 'score', label: 'Sort by Score' },
  { value: 'volume', label: 'Sort by Volume' },
  { value: 'holders', label: 'Sort by Holders' },
  { value: 'newest', label: 'Sort by Newest' },
] as const;

// =============================================================================
// TIME RANGES (for charts)
// =============================================================================

export const TIME_RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
] as const;

// =============================================================================
// EXTERNAL LINKS
// =============================================================================

export const EXTERNAL_LINKS = {
  solscan: (address: string) => `https://solscan.io/account/${address}`,
} as const;

// =============================================================================
// TIER SYSTEM
// =============================================================================

export const TIERS = {
  alpha: {
    id: 'alpha',
    name: 'Alpha',
    emoji: '🛡️',
    difficulty: 'Standard',
    maxScore: 75,
    description: 'Standard difficulty - recommended for new agents',
    color: 'cyan',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
  },
  beta: {
    id: 'beta',
    name: 'Beta',
    emoji: '⚔️',
    difficulty: 'Advanced',
    maxScore: 90,
    description: 'Advanced difficulty - harder scenarios, higher ceiling',
    color: 'purple',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-400',
  },
  omega: {
    id: 'omega',
    name: 'Omega',
    emoji: '👑',
    difficulty: 'Elite',
    maxScore: 100,
    description: 'Elite difficulty - extreme scenarios, maximum potential',
    color: 'amber',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
  },
} as const;

export type TierType = keyof typeof TIERS;

// =============================================================================
// ARENA TYPES
// =============================================================================

export const ARENA_TYPES = {
  trading: {
    id: 'trading',
    name: 'Trading Arena',
    description: 'Historical market scenario testing',
    icon: 'LineChart',
    requiredAgentTypes: ['trading', 'defi'],
  },
  utility: {
    id: 'utility',
    name: 'Utility Arena',
    description: 'Productivity task testing (scheduling, email, task tracking)',
    icon: 'Wrench',
    requiredAgentTypes: ['utility', 'social'],
  },
  coding: {
    id: 'coding',
    name: 'Coding Arena',
    description: 'Code challenge testing (bug fixing, features, optimization)',
    icon: 'Code',
    requiredAgentTypes: ['coding'],
  },
} as const;

export type ArenaType = keyof typeof ARENA_TYPES;

// =============================================================================
// SCORING CONSTANTS (V1)
// =============================================================================

export const SCORING = {
  STARTING_SCORE: 20,
  MIN_SCORE: 1,
  MAX_SCORE: 100,
  DAILY_POINT_CAP: 5,
  PRICE_PER_POINT: 0.0001, // $0.0001 per point
  DECAY_THRESHOLD_DAYS: 7,
  DECAY_RATE: 1, // points per week
} as const;

// =============================================================================
// INTERFACE TEMPLATES
// =============================================================================

export const INTERFACE_TEMPLATE = `# Agent Decision Interface
# Your agent must implement the decide() function

def decide(market_data: dict, portfolio: dict) -> dict:
    """
    Make a trading decision based on market data and current portfolio.
    
    Args:
        market_data: {
            'symbol': str,
            'price': float,
            'volume_24h': float,
            'price_change_24h': float,
            'timestamp': int
        }
        portfolio: {
            'balance_sol': float,
            'positions': [{'symbol': str, 'amount': float, 'avg_price': float}]
        }
    
    Returns:
        {
            'action': 'buy' | 'sell' | 'hold',
            'symbol': str (if buy/sell),
            'amount': float (if buy/sell),
            'reason': str (optional, for logging)
        }
    """
    # Your decision logic here
    return {'action': 'hold', 'reason': 'Default implementation'}
`;

// =============================================================================
// UPDATED NAV LINKS
// =============================================================================

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Agents' },
  { href: '/individuals', label: 'Individuals' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/portfolio', label: 'Portfolio' },
];

// =============================================================================
// HELPER FUNCTIONS (NEW)
// =============================================================================

/**
 * Calculate display price from score (per 1,000 tokens)
 */
export function calculateDisplayPrice(score: number): number {
  return score * PRICE_PER_SCORE_POINT;
}

/**
 * Calculate actual price per token from score
 */
export function calculateActualPrice(score: number): number {
  return score * ACTUAL_PRICE_PER_TOKEN;
}

/**
 * Format price with "per 1K" label
 */
export function formatPriceDisplay(score: number): string {
  const price = calculateDisplayPrice(score);
  return `$${price.toFixed(2)}`;
}

/**
 * Calculate market cap from score
 */
export function calculateMarketCap(score: number): number {
  return calculateActualPrice(score) * TOTAL_SUPPLY;
}

/**
 * Apply daily cap to score change
 */
export function applyDailyCap(currentScore: number, newScore: number): number {
  if (currentScore === 0) return Math.max(1, newScore);
  
  const changePercent = (newScore - currentScore) / currentScore;
  const cappedChange = Math.max(-DAILY_SCORE_CAP, Math.min(DAILY_SCORE_CAP, changePercent));
  const cappedScore = Math.round(currentScore * (1 + cappedChange));
  
  return Math.max(1, Math.min(100, cappedScore));
}
