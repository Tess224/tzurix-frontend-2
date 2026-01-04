'use client';

import { Bot, User, TrendingUp, TrendingDown, Users, BarChart3, Clock, Zap } from 'lucide-react';
import { AgentType, IndividualType, StockCategory } from '@/types';
import { getAgentTypeColor, getAgentTypeLabel, formatNumber, formatPercent } from '@/lib/api';

// =============================================================================
// LOADING SPINNER
// =============================================================================

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className={`${sizeClasses[size]} border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin`} />
    </div>
  );
}

// =============================================================================
// AVATAR
// =============================================================================

interface AvatarProps {
  category: StockCategory;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
  name?: string;
}

export function Avatar({ category, size = 'md', imageUrl, name }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };
  
  const bgClass = category === 'agent'
    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20'
    : 'bg-gradient-to-br from-purple-500/20 to-pink-600/20';
  
  const Icon = category === 'agent' ? Bot : User;
  const iconColor = category === 'agent' ? 'text-cyan-400' : 'text-purple-400';
  
  if (imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden`}>
        <img src={imageUrl} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} ${bgClass} rounded-xl flex items-center justify-center`}>
      <Icon size={iconSizes[size]} className={iconColor} />
    </div>
  );
}

// =============================================================================
// TYPE BADGE (Updated with agent types)
// =============================================================================

interface TypeBadgeProps {
  type: AgentType | IndividualType;
  category: StockCategory;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, category, size = 'sm' }: TypeBadgeProps) {
  const colorClass = getAgentTypeColor(type);
  const label = getAgentTypeLabel(type);
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };
  
  return (
    <span className={`${sizeClasses[size]} ${colorClass} border rounded-full font-medium inline-flex items-center gap-1`}>
      {category === 'agent' ? <Bot size={10} /> : <User size={10} />}
      {label}
    </span>
  );
}

// =============================================================================
// SCORE BADGE (Shows if capped)
// =============================================================================

interface ScoreBadgeProps {
  score: number;
  previousScore?: number;
  rawScore?: number;
  wasCapped?: boolean;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ 
  score, 
  previousScore, 
  rawScore,
  wasCapped,
  showChange = true,
  size = 'md' 
}: ScoreBadgeProps) {
  const change = previousScore ? ((score - previousScore) / previousScore) * 100 : 0;
  const isPositive = change >= 0;
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };
  
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2">
        <span className={`${sizeClasses[size]} font-bold font-mono`}>{score}</span>
        {wasCapped && (
          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
            CAPPED
          </span>
        )}
      </div>
      
      {showChange && previousScore !== undefined && change !== 0 && (
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{formatPercent(change)}</span>
        </div>
      )}
      
      {rawScore !== undefined && rawScore !== score && (
        <span className="text-xs text-slate-500">
          Raw: {rawScore}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// STATS ROW (Holders, Volume, etc.)
// =============================================================================

interface StatsRowProps {
  holders?: number;
  volume24h?: number;
  totalVolume?: number;
  lastUpdate?: string | null;
  compact?: boolean;
}

export function StatsRow({ holders, volume24h, totalVolume, lastUpdate, compact = false }: StatsRowProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs text-slate-500">
        {holders !== undefined && (
          <span className="flex items-center gap-1">
            <Users size={12} />
            {formatNumber(holders)}
          </span>
        )}
        {volume24h !== undefined && (
          <span className="flex items-center gap-1">
            <BarChart3 size={12} />
            ${formatNumber(volume24h)}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {holders !== undefined && (
        <div className="glass-panel p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users size={14} />
            <span className="text-xs">Holders</span>
          </div>
          <p className="font-mono font-semibold">{formatNumber(holders)}</p>
        </div>
      )}
      
      {volume24h !== undefined && (
        <div className="glass-panel p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <BarChart3 size={14} />
            <span className="text-xs">24h Volume</span>
          </div>
          <p className="font-mono font-semibold">${formatNumber(volume24h)}</p>
        </div>
      )}
      
      {totalVolume !== undefined && (
        <div className="glass-panel p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Zap size={14} />
            <span className="text-xs">Total Volume</span>
          </div>
          <p className="font-mono font-semibold">${formatNumber(totalVolume)}</p>
        </div>
      )}
      
      {lastUpdate && (
        <div className="glass-panel p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock size={14} />
            <span className="text-xs">Last Update</span>
          </div>
          <p className="font-mono text-sm">{new Date(lastUpdate).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PRICE DISPLAY
// =============================================================================

interface PriceDisplayProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ score, showLabel = true, size = 'md' }: PriceDisplayProps) {
  const price = score * 0.01;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };
  
  return (
    <div className="flex flex-col">
      {showLabel && <span className="text-xs text-slate-500">Price per 1K tokens</span>}
      <span className={`${sizeClasses[size]} font-mono font-bold text-cyan-400`}>
        ${price.toFixed(2)}
      </span>
    </div>
  );
}

// =============================================================================
// CATEGORY TABS
// =============================================================================

interface CategoryTabsProps {
  selected: 'all' | 'agent' | 'individual';
  onChange: (category: 'all' | 'agent' | 'individual') => void;
}

export function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  const tabs = [
    { id: 'all' as const, label: 'All', icon: null },
    { id: 'agent' as const, label: 'Agents', icon: Bot },
    { id: 'individual' as const, label: 'Individuals', icon: User },
  ];
  
  return (
    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${selected === tab.id 
              ? 'bg-cyan-500/20 text-cyan-400' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }
          `}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// AGENT TYPE FILTER
// =============================================================================

interface AgentTypeFilterProps {
  selected: AgentType | 'all';
  onChange: (type: AgentType | 'all') => void;
}

export function AgentTypeFilter({ selected, onChange }: AgentTypeFilterProps) {
  const types: { id: AgentType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Types' },
    { id: 'trading', label: 'Trading' },
    { id: 'social', label: 'Social' },
    { id: 'defi', label: 'DeFi' },
    { id: 'utility', label: 'Utility' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange(type.id)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
            ${selected === type.id 
              ? getAgentTypeColor(type.id === 'all' ? 'trading' : type.id)
              : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }
          `}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// SORT DROPDOWN
// =============================================================================

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
}

export function SortDropdown({ value, onChange, options }: SortDropdownProps) {
  const defaultOptions = [
    { value: 'score', label: 'Highest Score' },
    { value: 'volume', label: 'Most Volume' },
    { value: 'holders', label: 'Most Holders' },
    { value: 'newest', label: 'Newest' },
    { value: 'name', label: 'Name A-Z' },
  ];
  
  const sortOptions = options || defaultOptions;
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-900">
          {option.label}
        </option>
      ))}
    </select>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-panel p-8 text-center">
      {icon && (
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// =============================================================================
// ERROR MESSAGE
// =============================================================================

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
      <span>{message}</span>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="ml-auto text-sm underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}