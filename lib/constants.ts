// lib/constants.ts
// Tzurix Core Constants

import { 
  LineChart, MessageCircle, Landmark, Wrench,
  Code, BarChart3, User, Bot
} from 'lucide-react';

// =============================================================================
// NAVIGATION
// =============================================================================

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/create', label: 'Create' },
];

// =============================================================================
// SCORING & PRICING
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
  trading: {
    label: 'Trading',
    icon: LineChart,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  social: {
    label: 'Social',
    icon: MessageCircle,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  defi: {
    label: 'DeFi',
    icon: Landmark,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  utility: {
    label: 'Utility',
    icon: Wrench,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
};

export const INDIVIDUAL_TYPES = {
  trader: {
    label: 'Trader',
    icon: LineChart,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  influencer: {
    label: 'Influencer',
    icon: MessageCircle,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
  },
  developer: {
    label: 'Developer',
    icon: Code,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  analyst: {
    label: 'Analyst',
    icon: BarChart3,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
};

// =============================================================================
// HELPER FUNCTIONS
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