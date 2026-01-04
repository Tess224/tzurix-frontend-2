'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Plus, Grid, List, Search, RefreshCw } from 'lucide-react';
import { AgentStock, AgentType } from '@/types';
import { getAgents } from '@/lib/api';
import { AgentCard, AgentRow } from '@/components/AgentCard';
import { 
  LoadingSpinner, 
  EmptyState, 
  ErrorMessage,
  AgentTypeFilter,
  SortDropdown 
} from '@/components/ui';

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');
  const [sortBy, setSortBy] = useState('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    loadAgents();
  }, [typeFilter, sortBy]);
  
  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAgents({
        type: typeFilter === 'all' ? undefined : typeFilter,
        sort: sortBy as any,
        category: 'agent', // Only show agents on this page
        limit: 50,
      });
      setAgents(data);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError('Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter by search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bot className="text-cyan-400" />
            AI Agents
          </h1>
          <p className="text-slate-400">
            Trade performance scores of AI trading bots, social agents, and more
          </p>
        </div>
        
        <Link href="/create/agent" className="btn-primary inline-flex items-center gap-2 shrink-0">
          <Plus size={18} />
          List an Agent
        </Link>
      </div>
      
      {/* Filters Bar */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          {/* Type Filter */}
          <AgentTypeFilter selected={typeFilter} onChange={setTypeFilter} />
          
          {/* Sort */}
          <SortDropdown value={sortBy} onChange={setSortBy} />
          
          {/* View Toggle */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
          
          {/* Refresh */}
          <button
            onClick={loadAgents}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={loadAgents} />
        </div>
      )}
      
      {/* Results Count */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
      
      {/* Loading */}
      {loading && <LoadingSpinner />}
      
      {/* Empty State */}
      {!loading && !error && filteredAgents.length === 0 && (
        <EmptyState
          icon={<Bot className="text-slate-600" size={32} />}
          title="No Agents Found"
          description={searchQuery ? "Try a different search term" : "Be the first to list an AI agent!"}
          action={
            <Link href="/create/agent" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              List an Agent
            </Link>
          }
        />
      )}
      
      {/* Grid View */}
      {!loading && !error && filteredAgents.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
      
      {/* List View */}
      {!loading && !error && filteredAgents.length > 0 && viewMode === 'list' && (
        <div className="glass-panel overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm text-slate-400">
            <div className="col-span-4">Agent</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Holders</div>
            <div className="col-span-2 text-right">Volume</div>
          </div>
          
          {/* Rows */}
          {filteredAgents.map((agent, index) => (
            <AgentRow key={agent.id} agent={agent} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}