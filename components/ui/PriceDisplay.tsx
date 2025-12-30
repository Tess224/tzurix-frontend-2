// components/ui/PriceDisplay.tsx
'use client';

import { Info } from 'lucide-react';

interface PriceDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Displays price based on score with "per 1K tokens" label
 * 
 * Price Formula: Score × $0.01 (per 1,000 tokens)
 * Example: Score 85 = $0.85 per 1K tokens
 */
export default function PriceDisplay({ 
  score, 
  size = 'md', 
  showLabel = true,
  showTooltip = false,
  className = ''
}: PriceDisplayProps) {
  // Calculate display price (per 1,000 tokens)
  const displayPrice = score * 0.01;
  
  // Size variants
  const sizeStyles = {
    sm: {
      price: 'text-sm font-semibold',
      label: 'text-[10px]',
    },
    md: {
      price: 'text-lg font-bold',
      label: 'text-xs',
    },
    lg: {
      price: 'text-2xl font-bold',
      label: 'text-xs',
    },
    xl: {
      price: 'text-3xl font-bold',
      label: 'text-sm',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1">
        <span className={`${styles.price} text-white`}>
          ${displayPrice.toFixed(2)}
        </span>
        {showLabel && (
          <span className={`${styles.label} text-slate-400`}>
            / 1K
          </span>
        )}
        {showTooltip && (
          <div className="group relative">
            <Info size={12} className="text-slate-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Price per 1,000 tokens
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        )}
      </div>
      {showLabel && size !== 'sm' && (
        <span className={`${styles.label} text-slate-500`}>
          per 1,000 tokens
        </span>
      )}
    </div>
  );
}

// =============================================================================
// INLINE PRICE COMPONENT (for use in text/tables)
// =============================================================================

interface InlinePriceProps {
  score: number;
  className?: string;
}

/**
 * Compact inline price display: "$0.85/1K"
 */
export function InlinePrice({ score, className = '' }: InlinePriceProps) {
  const displayPrice = score * 0.01;
  
  return (
    <span className={`font-medium ${className}`}>
      ${displayPrice.toFixed(2)}
      <span className="text-slate-400 text-xs ml-0.5">/1K</span>
    </span>
  );
}

// =============================================================================
// PRICE CHANGE COMPONENT
// =============================================================================

interface PriceChangeProps {
  currentScore: number;
  previousScore: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Shows price change with percentage and color
 */
export function PriceChange({ 
  currentScore, 
  previousScore, 
  size = 'md',
  className = '' 
}: PriceChangeProps) {
  if (previousScore === 0) return null;
  
  const changePercent = ((currentScore - previousScore) / previousScore) * 100;
  const isPositive = changePercent >= 0;
  
  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <span className={`
      ${sizeStyles[size]}
      ${isPositive ? 'text-emerald-400' : 'text-red-400'}
      ${className}
    `}>
      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
    </span>
  );
}

// =============================================================================
// MARKET CAP DISPLAY
// =============================================================================

interface MarketCapProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Displays market cap based on score
 * Formula: Score × $0.00001 × 100,000,000 tokens = Score × $1,000
 */
export function MarketCap({ score, size = 'md', className = '' }: MarketCapProps) {
  // Market cap = actual price per token × total supply
  // = (score × 0.00001) × 100,000,000
  // = score × 1,000
  const marketCap = score * 1000;
  
  const formatMarketCap = (value: number): string => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={`${sizeStyles[size]} text-slate-400 ${className}`}>
      MC: {formatMarketCap(marketCap)}
    </span>
  );
      }
