'use client';

import { TrendingUp, TrendingDown, Users, Bot, User } from 'lucide-react';
import { AGENT_TYPES, INDIVIDUAL_TYPES } from '@/lib/constants';
import { AgentType, IndividualType, StockCategory } from '@/types';

// TYPE BADGE
export function TypeBadge({ type, category = 'agent' }: { type: AgentType | IndividualType; category?: StockCategory }) {
  const types = category === 'agent' ? AGENT_TYPES : INDIVIDUAL_TYPES;
  const config = types[type as keyof typeof types] || Object.values(types)[0];
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border ${config.bg} ${config.border} ${config.color} font-medium uppercase tracking-wide`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// SCORE DISPLAY
export function ScoreDisplay({ score, previousScore, wasCapped = false, size = 'md' }: { 
  score: number; 
  previousScore?: number; 
  wasCapped?: boolean; 
  size?: 'sm' | 'md' | 'lg' 
}) {
  const change = previousScore ? ((score - previousScore) / previousScore) * 100 : 0;
  const isPositive = change >= 0;
  const sizeClasses = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  
  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono ${sizeClasses[size]} font-bold text-white`}>{score}</span>
      {previousScore !== undefined && change !== 0 && (
        <div className={`flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span className="text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
          {wasCapped && (
            <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">CAP</span>
          )}
        </div>
      )}
    </div>
  );
}

// STAT CARD
export function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) {
  return (
    <div className="glass-panel p-5 flex items-center gap-4 hover:border-cyan-500/30 transition-all">
      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// AVATAR
export function Avatar({ category, size = 'md' }: { category: StockCategory; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const iconSizes = { sm: 16, md: 24, lg: 32 };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-white/10`}>
      {category === 'agent' ? <Bot className="text-cyan-400" size={iconSizes[size]} /> : <User className="text-cyan-400" size={iconSizes[size]} />}
    </div>
  );
}

// MINI CHART
export function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="h-20 flex items-end gap-1 p-2">
      {data.map((value, i) => (
        <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400/10 rounded-t" style={{ height: `${(value / max) * 100}%` }} />
      ))}
    </div>
  );
}

// LOADING SPINNER
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500" />
    </div>
  );
}

// EMPTY STATE
export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  actionLabel?: string; 
  actionHref?: string 
}) {
  return (
    <div className="glass-panel p-12 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="text-slate-500" size={32} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 mb-4">{description}</p>
      {actionLabel && actionHref && (
        <a href={actionHref} className="inline-block px-6 py-2.5 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
          {actionLabel}
        </a>
      )}
    </div>
  );
}
