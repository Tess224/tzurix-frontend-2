'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Filter, TrendingUp, TrendingDown, Users, BarChart3,
  ChevronDown, Bot, ArrowRight
} from 'lucide-react';
import { TypeBadge, ScoreDisplay, Avatar, LoadingSpinner } from '@/components/ui';
import { getAgents, formatPrice, formatNumber } from '@/lib/api';
import { AGENT_TYPES, SORT_OPTIONS } from '@/lib/constants';
import { AgentStock } from '@/types';

// AGENT CARD COMPONENT
function AgentCard({ agent }: { agent: AgentStock }) {
  const typeConfig = AGENT_TYPES[agent.type as keyof typeof AGENT_TYPES];
  const priceChange = agent.previous_score > 0
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100
    : 0;
  const isPositive = priceChange >= 0;

  return (
    <Link
      href={`/agent/${agent.id}`}
      className="glass-panel p-5 hover:border-cyan-500/30 transition-all group block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar category="agent" size="md" />
          <div>
            <h3 className="font-semibold group-hover:text-cyan-400 transition-colors">{agent.name}</h3>
            <TypeBadge type={agent.type} category="agent" />
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
        </div>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Price</p>
          <p className="text-xl font-bold">{formatPrice(agent.current_score)}</p>
          <p className="text-xs text-slate-500">per 1,000 tokens</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Score</p>
          <ScoreDisplay score={agent.current_score} previousScore={agent.previous_score} size="md" />
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-slate-500">Holders</p>
          <p className="font-mono text-sm">{formatNumber(agent.holders || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">24h Vol</p>
          <p className="font-mono text-sm">${formatNumber(agent.volume_24h || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">MC</p>
          <p className="font-mono text-sm">${formatNumber(agent.market_cap_usd || 0)}</p>
        </div>
      </div>
    </Link>
  );
}

// AGENT ROW COMPONENT (for table view)
function AgentRow({ agent, rank }: { agent: AgentStock; rank: number }) {
  const priceChange = agent.previous_score > 0
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100
    : 0;
  const isPositive = priceChange >= 0;

  return (
    <Link
      href={`/agent/${agent.id}`}
      className="flex items-center justify-between py-4 px-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
    >
      <div className="flex items-center gap-4">
        <span className={`w-8 text-center font-bold ${rank <= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
          {rank}
        </span>
        <Avatar category="agent" size="sm" />
        <div>
          <h3 className="font-medium hover:text-cyan-400 transition-colors">{agent.name}</h3>
          <TypeBadge type={agent.type} category="agent" />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right w-24">
          <p className="font-mono">{formatPrice(agent.current_score)}</p>
          <p className="text-xs text-slate-500">/1K</p>
        </div>
        <div className={`w-20 text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
        </div>
        <div className="w-16 text-right">
          <ScoreDisplay score={agent.current_score} size="sm" />
        </div>
        <div className="w-20 text-right font-mono text-sm text-slate-400">
          {formatNumber(agent.holders || 0)}
        </div>
        <div className="w-24 text-right font-mono text-sm text-slate-400">
          ${formatNumber(agent.volume_24h || 0)}
        </div>
      </div>
    </Link>
  );
}

// MAIN PAGE
export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await getAgents();
      if (data && data.length > 0) {
        setAgents(data);
      } else {
        // Mock data
        setAgents([
          { id: 1, name: 'Alpha Trading Bot', type: 'trading', category: 'agent', current_score: 87, previous_score: 82, wallet_address: '7jDV...7TG5', holders: 156, volume_24h: 12500, market_cap_usd: 87000, created_at: '2024-12-15' },
          { id: 2, name: 'YieldMax DeFi', type: 'defi', category: 'agent', current_score: 72, previous_score: 75, wallet_address: '8kEW...9UH6', holders: 89, volume_24h: 8200, market_cap_usd: 72000, created_at: '2024-12-18' },
          { id: 3, name: 'SocialPulse AI', type: 'social', category: 'agent', current_score: 65, previous_score: 58, wallet_address: '9lFX...0VI7', holders: 234, volume_24h: 5600, market_cap_usd: 65000, created_at: '2024-12-20' },
          { id: 4, name: 'DataMiner Pro', type: 'utility', category: 'agent', current_score: 54, previous_score: 54, wallet_address: '0mGY...1WJ8', holders: 45, volume_24h: 2100, market_cap_usd: 54000, created_at: '2024-12-22' },
          { id: 5, name: 'Momentum Hunter', type: 'trading', category: 'agent', current_score: 91, previous_score: 88, wallet_address: '1nHZ...2XK9', holders: 312, volume_24h: 28000, market_cap_usd: 91000, created_at: '2024-12-10' },
          { id: 6, name: 'Liquidity Farmer', type: 'defi', category: 'agent', current_score: 68, previous_score: 70, wallet_address: '2oIA...3YL0', holders: 78, volume_24h: 6800, market_cap_usd: 68000, created_at: '2024-12-19' },
        ] as AgentStock[]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter, search, and sort
  const filteredAgents = agents
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || agent.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.current_score - a.current_score;
        case 'volume':
          return (b.volume_24h || 0) - (a.volume_24h || 0);
        case 'holders':
          return (b.holders || 0) - (a.holders || 0);
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Agents</h1>
        <p className="text-slate-400">Trade performance stocks in autonomous AI agents. Price = Score × $0.01 per 1,000 tokens.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="appearance-none px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="">All Types</option>
            {Object.entries(AGENT_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${viewMode === 'table' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500 mb-4">{filteredAgents.length} agents found</p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-panel overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between py-3 px-4 border-b border-white/10 text-xs text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-4">
              <span className="w-8 text-center">#</span>
              <span className="w-10"></span>
              <span>Name</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-24 text-right">Price</span>
              <span className="w-20 text-right">24h</span>
              <span className="w-16 text-right">Score</span>
              <span className="w-20 text-right">Holders</span>
              <span className="w-24 text-right">Volume</span>
            </div>
          </div>

          {/* Table Rows */}
          {filteredAgents.map((agent, index) => (
            <AgentRow key={agent.id} agent={agent} rank={index + 1} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-16">
          <Bot size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No agents found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
          <Link href="/create/agent" className="btn-primary inline-flex items-center gap-2">
            Create an Agent
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
            }
