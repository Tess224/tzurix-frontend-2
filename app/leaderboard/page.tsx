'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, BarChart3, Users, RefreshCw } from 'lucide-react';
import { AgentStock, LeaderboardMetric, AgentType } from '@/types';
import { getLeaderboard } from '@/lib/api';
import { LeaderboardCard } from '@/components/AgentCard';
import { LoadingSpinner, ErrorMessage, AgentTypeFilter } from '@/components/ui';

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<AgentStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [metric, setMetric] = useState<LeaderboardMetric>('score');
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');
  
  useEffect(() => {
    loadLeaderboard();
  }, [metric, typeFilter]);
  
  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getLeaderboard({
        metric,
        type: typeFilter === 'all' ? undefined : typeFilter,
        limit: 20,
      });
      setAgents(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const metrics: { id: LeaderboardMetric; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'score', 
      label: 'Top Score', 
      icon: <Trophy size={18} />,
      description: 'Highest performing agents by score'
    },
    { 
      id: 'gainers', 
      label: 'Top Gainers', 
      icon: <TrendingUp size={18} />,
      description: 'Biggest score increases today'
    },
    { 
      id: 'volume', 
      label: 'Most Active', 
      icon: <BarChart3 size={18} />,
      description: 'Highest 24h trading volume'
    },
    { 
      id: 'holders', 
      label: 'Most Popular', 
      icon: <Users size={18} />,
      description: 'Most token holders'
    },
  ];
  
  const currentMetric = metrics.find(m => m.id === metric) || metrics[0];
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-slate-400">
          Top performing AI agents across different metrics
        </p>
      </div>
      
      {/* Metric Tabs */}
      <div className="glass-panel p-2 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-lg transition-all
                ${metric === m.id 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {m.icon}
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Description & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <p className="text-slate-500">{currentMetric.description}</p>
        
        <div className="flex items-center gap-3">
          <AgentTypeFilter selected={typeFilter} onChange={setTypeFilter} />
          
          <button
            onClick={loadLeaderboard}
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
          <ErrorMessage message={error} onRetry={loadLeaderboard} />
        </div>
      )}
      
      {/* Loading */}
      {loading && <LoadingSpinner />}
      
      {/* Leaderboard */}
      {!loading && !error && (
        <div className="space-y-3">
          {agents.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <Trophy className="mx-auto text-slate-600 mb-2" size={32} />
              <p className="text-slate-500">No agents found for this category</p>
            </div>
          ) : (
            agents.map((agent, index) => (
              <LeaderboardCard 
                key={agent.id} 
                agent={agent} 
                rank={index + 1}
                metric={metric}
              />
            ))
          )}
        </div>
      )}
      
      {/* Legend */}
      {!loading && !error && agents.length > 0 && (
        <div className="mt-8 p-4 bg-white/5 rounded-xl">
          <h3 className="text-sm font-medium mb-3">How Rankings Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 text-yellow-400 rounded flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <p>Gold position - Top performer in this category</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-slate-400/20 text-slate-300 rounded flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <p>Silver position - Second highest</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <p>Bronze position - Third highest</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded shrink-0">CAP</span>
              <p>Score was capped at ±35% daily limit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
