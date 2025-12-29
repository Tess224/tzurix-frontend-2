'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Bot, User, ArrowUpRight, BarChart3, Coins, RefreshCw } from 'lucide-react';
import TzurixLogo from '@/components/ui/TzurixLogo';
import { StatCard, MiniChart, EmptyState } from '@/components/ui';
import StockCard from '@/components/stock/StockCard';
import { AGENT_TYPES, INDIVIDUAL_TYPES, SORT_OPTIONS } from '@/lib/constants';
import { getAgents, formatNumber } from '@/lib/api';
import { AgentStock, IndividualStock } from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'individuals'>('agents');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<AgentStock[]>([]);
  const [individuals, setIndividuals] = useState<IndividualStock[]>([]);
  const [loading, setLoading] = useState(true);

  const agentFilters = Object.entries(AGENT_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
  }));

  const individualFilters = Object.entries(INDIVIDUAL_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
  }));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const agentData = await getAgents();
      if (agentData.length > 0) {
        setAgents(agentData);
      } else {
        // Mock data for demo
        setAgents([
          { id: 1, name: 'Alpha Trading Bot', type: 'trading', current_score: 11, previous_score: 10, holders: 24, volume_24h: 1250, category: 'agent', wallet_address: '7jDV...' },
          { id: 2, name: 'Momentum Hunter', type: 'trading', current_score: 14, previous_score: 12, holders: 18, volume_24h: 890, category: 'agent', wallet_address: 'DCAk...' },
          { id: 3, name: 'DeFi Yield Max', type: 'defi', current_score: 8, previous_score: 10, holders: 31, volume_24h: 2100, category: 'agent', wallet_address: '9WzD...' },
          { id: 4, name: 'Social Signal AI', type: 'social', current_score: 12, previous_score: 11, holders: 15, volume_24h: 560, category: 'agent', wallet_address: 'Abc1...' },
          { id: 5, name: 'Task Automator', type: 'utility', current_score: 9, previous_score: 9, holders: 8, volume_24h: 320, category: 'agent', wallet_address: 'Xyz2...' },
          { id: 6, name: 'Sniper Bot Pro', type: 'trading', current_score: 16, previous_score: 14, holders: 42, volume_24h: 3400, category: 'agent', wallet_address: 'Qwe3...' },
        ] as AgentStock[]);
      }
      
      setIndividuals([
        { id: 1, name: 'CryptoWhale', type: 'trader', current_score: 85, previous_score: 80, holders: 156, volume_24h: 12500, category: 'individual' },
        { id: 2, name: 'DeFi_Master', type: 'analyst', current_score: 72, previous_score: 70, holders: 89, volume_24h: 5600, category: 'individual' },
        { id: 3, name: 'SolanaKing', type: 'influencer', current_score: 64, previous_score: 68, holders: 234, volume_24h: 8900, category: 'individual' },
      ] as IndividualStock[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentData = activeTab === 'agents' ? agents : individuals;
  const currentFilters = activeTab === 'agents' ? agentFilters : individualFilters;

  const filteredData = currentData
    .filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.current_score - a.current_score;
        case 'volume': return (b.volume_24h || 0) - (a.volume_24h || 0);
        case 'holders': return (b.holders || 0) - (a.holders || 0);
        case 'newest': return b.id - a.id;
        default: return 0;
      }
    });

  const totalStocks = agents.length + individuals.length;
  const totalVolume = [...agents, ...individuals].reduce((sum, s) => sum + (s.volume_24h || 0), 0);
  const avgScore = currentData.length > 0
    ? Math.round(currentData.reduce((sum, s) => sum + (s.current_score || 0), 0) / currentData.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      
      {/* HERO SECTION */}
      <section className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] pointer-events-none" />
        
        <div className="relative">
          <div className="flex justify-center mb-6">
            <TzurixLogo size={100} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
            Trade reputation,<br />
            <span className="text-gradient">not promises</span>
          </h1>
          
          <p className="text-slate-400 max-w-lg mx-auto mb-8 text-lg">
            Buy and sell stocks in AI agents and individuals based on real, verified performance scores.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button className="btn-primary flex items-center justify-center gap-2">
              Get Early Access
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2">
              Explore Stocks
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard icon={Coins} value={totalStocks.toLocaleString()} label="Total Stocks Listed" />
        <StatCard icon={BarChart3} value={`$${formatNumber(totalVolume)}`} label="24h Volume" />
        <StatCard icon={TrendingUp} value={avgScore} label={`Avg ${activeTab === 'agents' ? 'Agent' : 'Individual'} Score`} />
      </div>

      {/* MAIN TABS & FILTERS */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Main Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => { setActiveTab('agents'); setActiveFilter('all'); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'agents' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot size={18} />
              AI Agents
            </button>
            <button
              onClick={() => { setActiveTab('individuals'); setActiveFilter('all'); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'individuals' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={18} />
              Individuals
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="input-field pl-10"
              placeholder={`Search ${activeTab === 'agents' ? 'agents' : 'individuals'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === 'all' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All
          </button>
          {currentFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFilter === filter.value ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* STOCK GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-cyan-400" size={32} />
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={activeTab === 'agents' ? Bot : User}
          title={`No ${activeTab} found`}
          description={searchQuery ? `No results for "${searchQuery}"` : `Be the first to list a ${activeFilter !== 'all' ? activeFilter : ''} ${activeTab === 'agents' ? 'AI agent' : 'individual'}`}
          actionLabel="Create Stock"
          actionHref={`/create/${activeTab === 'agents' ? 'agent' : 'individual'}`}
        />
      )}

      {/* BOTTOM WIDGETS */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Performers</h3>
            <TrendingUp className="text-emerald-400" size={18} />
          </div>
          <div className="space-y-3">
            {[...agents, ...individuals]
              .sort((a, b) => b.current_score - a.current_score)
              .slice(0, 5)
              .map((stock, i) => (
                <div key={`${stock.id}-${stock.name}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                    <span className="text-sm font-medium truncate">{stock.name}</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-sm">{stock.current_score}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Live Activity */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Live Activity</h3>
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs">LIVE</span>
            </div>
          </div>
          <div className="mb-4 bg-gradient-to-t from-cyan-500/5 to-transparent rounded-xl border border-white/5 overflow-hidden">
            <MiniChart data={[40, 65, 45, 80, 55, 90, 70, 85, 60, 95]} />
          </div>
          <p className="text-xs text-slate-500 text-center">Score changes (24h)</p>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-5">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/create/agent" className="w-full py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all flex items-center justify-center gap-2">
              <Bot size={18} />
              List AI Agent
            </a>
            <a href="/create/individual" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <User size={18} />
              List Individual
            </a>
          </div>
        </div>
      </div>
    </div>
  );
           }
