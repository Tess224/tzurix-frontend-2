'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Users, BarChart3, ExternalLink } from 'lucide-react';
import { AgentStock } from '@/types';
import { Avatar, TypeBadge, ScoreBadge, StatsRow } from '@/components/ui';
import { formatNumber, formatPercent, shortenAddress } from '@/lib/api';

// =============================================================================
// AGENT CARD (Grid View)
// =============================================================================

interface AgentCardProps {
  agent: AgentStock;
  showStats?: boolean;
}

export function AgentCard({ agent, showStats = true }: AgentCardProps) {
  const scoreChange = agent.previous_score 
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100 
    : 0;
  const isPositive = scoreChange >= 0;
  
  const profileUrl = agent.category === 'agent' 
    ? `/agent/${agent.id}` 
    : `/individual/${agent.id}`;
  
  return (
    <Link href={profileUrl} className="glass-panel p-5 block hover:bg-white/5 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar category={agent.category} size="md" />
          <div>
            <h3 className="font-semibold group-hover:text-cyan-400 transition-colors">
              {agent.name}
            </h3>
            <TypeBadge type={agent.type} category={agent.category} />
          </div>
        </div>
        
        {/* Score */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">{agent.current_score}</span>
            {agent.was_capped && (
              <span className="text-[9px] px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                CAP
              </span>
            )}
          </div>
          {scoreChange !== 0 && (
            <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{formatPercent(scoreChange)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Description */}
      {agent.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {agent.description}
        </p>
      )}
      
      {/* Price */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-slate-500">Price (1K tokens)</span>
          <p className="text-lg font-mono font-bold text-cyan-400">
            ${agent.display_price.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Market Cap</span>
          <p className="font-mono">${formatNumber(agent.market_cap_usd)}</p>
        </div>
      </div>
      
      {/* Stats */}
      {showStats && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {agent.holders} holders
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 size={14} />
            ${formatNumber(agent.volume_24h)} 24h
          </span>
        </div>
      )}
    </Link>
  );
}

// =============================================================================
// AGENT ROW (List View)
// =============================================================================

interface AgentRowProps {
  agent: AgentStock;
  rank?: number;
}

export function AgentRow({ agent, rank }: AgentRowProps) {
  const scoreChange = agent.previous_score 
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100 
    : 0;
  const isPositive = scoreChange >= 0;
  
  const profileUrl = agent.category === 'agent' 
    ? `/agent/${agent.id}` 
    : `/individual/${agent.id}`;
  
  return (
    <Link 
      href={profileUrl} 
      className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
    >
      {/* Rank & Name */}
      <div className="col-span-4 flex items-center gap-3">
        {rank !== undefined && (
          <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-sm font-mono text-slate-500">
            {rank}
          </span>
        )}
        <Avatar category={agent.category} size="sm" />
        <div>
          <p className="font-medium">{agent.name}</p>
          <TypeBadge type={agent.type} category={agent.category} size="sm" />
        </div>
      </div>
      
      {/* Score */}
      <div className="col-span-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-lg font-bold font-mono">{agent.current_score}</span>
          {agent.was_capped && (
            <span className="text-[8px] px-1 bg-yellow-500/20 text-yellow-400 rounded">C</span>
          )}
        </div>
        {scoreChange !== 0 && (
          <span className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(scoreChange)}
          </span>
        )}
      </div>
      
      {/* Price */}
      <div className="col-span-2 text-right">
        <p className="font-mono text-cyan-400">${agent.display_price.toFixed(2)}</p>
        <p className="text-xs text-slate-500">per 1K</p>
      </div>
      
      {/* Holders */}
      <div className="col-span-2 text-right">
        <p className="font-mono">{formatNumber(agent.holders)}</p>
        <p className="text-xs text-slate-500">holders</p>
      </div>
      
      {/* Volume */}
      <div className="col-span-2 text-right">
        <p className="font-mono">${formatNumber(agent.volume_24h)}</p>
        <p className="text-xs text-slate-500">24h vol</p>
      </div>
    </Link>
  );
}

// =============================================================================
// AGENT MINI CARD (Compact for sidebar/widgets)
// =============================================================================

interface AgentMiniCardProps {
  agent: AgentStock;
}

export function AgentMiniCard({ agent }: AgentMiniCardProps) {
  const scoreChange = agent.previous_score 
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100 
    : 0;
  const isPositive = scoreChange >= 0;
  
  const profileUrl = agent.category === 'agent' 
    ? `/agent/${agent.id}` 
    : `/individual/${agent.id}`;
  
  return (
    <Link 
      href={profileUrl}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Avatar category={agent.category} size="sm" />
        <div>
          <p className="font-medium text-sm">{agent.name}</p>
          <p className="text-xs text-slate-500">{agent.type}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-mono font-bold">{agent.current_score}</p>
        <p className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPercent(scoreChange)}
        </p>
      </div>
    </Link>
  );
}

// =============================================================================
// LEADERBOARD CARD
// =============================================================================

interface LeaderboardCardProps {
  agent: AgentStock;
  rank: number;
  metric: 'score' | 'gainers' | 'volume' | 'holders';
}

export function LeaderboardCard({ agent, rank, metric }: LeaderboardCardProps) {
  const scoreChange = agent.previous_score 
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100 
    : 0;
  const isPositive = scoreChange >= 0;
  
  const profileUrl = agent.category === 'agent' 
    ? `/agent/${agent.id}` 
    : `/individual/${agent.id}`;
  
  // Determine which value to highlight based on metric
  const getMetricValue = () => {
    switch (metric) {
      case 'score':
        return { label: 'Score', value: agent.current_score.toString() };
      case 'gainers':
        return { label: 'Change', value: formatPercent(scoreChange) };
      case 'volume':
        return { label: '24h Vol', value: `$${formatNumber(agent.volume_24h)}` };
      case 'holders':
        return { label: 'Holders', value: formatNumber(agent.holders) };
      default:
        return { label: 'Score', value: agent.current_score.toString() };
    }
  };
  
  const metricDisplay = getMetricValue();
  
  // Rank badge styling
  const rankColors = {
    1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    2: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
    3: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  
  const rankClass = rankColors[rank as keyof typeof rankColors] || 'bg-white/5 text-slate-400 border-white/10';
  
  return (
    <Link 
      href={profileUrl}
      className="glass-panel p-4 flex items-center gap-4 hover:bg-white/5 transition-all"
    >
      {/* Rank */}
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold ${rankClass}`}>
        {rank}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar category={agent.category} size="sm" />
          <div className="min-w-0">
            <p className="font-medium truncate">{agent.name}</p>
            <TypeBadge type={agent.type} category={agent.category} size="sm" />
          </div>
        </div>
      </div>
      
      {/* Metric Value */}
      <div className="text-right">
        <p className="text-xs text-slate-500">{metricDisplay.label}</p>
        <p className={`font-mono font-bold ${
          metric === 'gainers' 
            ? isPositive ? 'text-emerald-400' : 'text-red-400'
            : 'text-white'
        }`}>
          {metricDisplay.value}
        </p>
      </div>
    </Link>
  );
}