'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Copy, Check, RefreshCw,
  TrendingUp, TrendingDown, Users, BarChart3, Clock,
  Zap, AlertCircle, Share2
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { AgentStock, ScoreHistoryEntry } from '@/types';
import { 
  getAgent, 
  getAgentScoreHistory,
  refreshAgentScore,
  shortenAddress, 
  formatNumber, 
  formatPercent,
  formatTimeAgo
} from '@/lib/api';
import { 
  Avatar, 
  TypeBadge, 
  ScoreBadge, 
  LoadingSpinner, 
  ErrorMessage 
} from '@/components/ui';
import TradeWidget from '@/components/TradeWidget';


// SCORE CHART COMPONENT - Add this before AgentDetailPage
function ScoreChart({ history }: { history: ScoreHistoryEntry[] }) {
  // Transform ScoreHistoryEntry[] to chart format
  const chartData = history.map(entry => ({
    date: new Date(entry.calculated_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    final_score: entry.score,
    raw_score: entry.raw_score || entry.score,
    was_capped: entry.raw_score ? entry.raw_score !== entry.score : false
  }));

  // Use mock data if no history
  const displayData = chartData.length > 0 ? chartData : [
    { date: '12/22', final_score: 10, raw_score: 10, was_capped: false },
    { date: '12/23', final_score: 10, raw_score: 11, was_capped: false },
    { date: '12/24', final_score: 11, raw_score: 12, was_capped: false },
    { date: '12/25', final_score: 11, raw_score: 11, was_capped: false },
    { date: '12/26', final_score: 11, raw_score: 14, was_capped: true },
    { date: '12/27', final_score: 11, raw_score: 11, was_capped: false },
    { date: '12/28', final_score: 11, raw_score: 11, was_capped: false },
  ];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line type="monotone" dataKey="raw_score" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" dot={false} />
          <Line 
            type="monotone" 
            dataKey="final_score" 
            stroke="#4CC9F0" 
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.was_capped) {
                return <circle cx={cx} cy={cy} r={4} fill="#FF9F1C" stroke="#FF9F1C" />;
              }
              return <circle cx={cx} cy={cy} r={3} fill="#4CC9F0" />;
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}


export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<AgentStock | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (agentId) {
      loadAgent();
      loadScoreHistory();
    }
  }, [agentId]);
  
  const loadAgent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAgent(agentId);
      if (data) {
        setAgent(data);
      } else {
        setError('Agent not found');
      }
    } catch (err) {
      console.error('Error loading agent:', err);
      setError('Failed to load agent');
    } finally {
      setLoading(false);
    }
  };
  
  const loadScoreHistory = async () => {
    try {
      const history = await getAgentScoreHistory(agentId, { days: 30 });
      setScoreHistory(history);
    } catch (err) {
      console.error('Error loading score history:', err);
    }
  };
  
  const handleRefreshScore = async () => {
    if (!agent) return;
    
    setRefreshing(true);
    try {
      const result = await refreshAgentScore(agent.id);
      if (result.success && result.agent) {
        setAgent(result.agent);
        loadScoreHistory(); // Reload history after refresh
      }
    } catch (err) {
      console.error('Error refreshing score:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) return <LoadingSpinner />;
  
  if (error || !agent) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ErrorMessage message={error || 'Agent not found'} onRetry={loadAgent} />
        <Link href="/agents" className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:underline">
          <ArrowLeft size={18} />
          Back to Agents
        </Link>
      </div>
    );
  }
  
  const scoreChange = agent.previous_score 
    ? ((agent.current_score - agent.previous_score) / agent.previous_score) * 100 
    : 0;
  const isPositive = scoreChange >= 0;
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back Link */}
      <Link href="/agents" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back to Agents
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar category={agent.category} size="lg" />
                <div>
                  <h1 className="text-2xl font-bold mb-1">{agent.name}</h1>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={agent.type} category={agent.category} size="md" />
                    {agent.was_capped && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                        Score Capped
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-4xl font-bold font-mono">{agent.current_score}</span>
                  <button
                    onClick={handleRefreshScore}
                    disabled={refreshing}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Refresh score from on-chain data"
                  >
                    <RefreshCw size={18} className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {scoreChange !== 0 && (
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="font-mono">{formatPercent(scoreChange)}</span>
                  </div>
                )}
                {agent.raw_score !== agent.current_score && (
                  <p className="text-xs text-slate-500 mt-1">Raw: {agent.raw_score}</p>
                )}
              </div>
            </div>
            
            {/* Description */}
            {agent.description && (
              <p className="text-slate-400 mb-6">{agent.description}</p>
            )}
            
            {/* Wallet Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 mb-1">Agent Wallet</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{shortenAddress(agent.wallet_address, 6)}</span>
                  <button
                    onClick={() => copyAddress(agent.wallet_address)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-500" />}
                  </button>
                  <a
                    href={`https://solscan.io/account/${agent.wallet_address}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <ExternalLink size={14} className="text-slate-500" />
                  </a>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">Creator Wallet</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{shortenAddress(agent.creator_wallet, 6)}</span>
                  <a
                    href={`https://solscan.io/account/${agent.creator_wallet}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <ExternalLink size={14} className="text-slate-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users size={16} />
                <span className="text-xs">Holders</span>
              </div>
              <p className="text-xl font-mono font-bold">{formatNumber(agent.holders)}</p>
            </div>
            
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <BarChart3 size={16} />
                <span className="text-xs">24h Volume</span>
              </div>
              <p className="text-xl font-mono font-bold">${formatNumber(agent.volume_24h)}</p>
            </div>
            
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Zap size={16} />
                <span className="text-xs">Total Volume</span>
              </div>
              <p className="text-xl font-mono font-bold">${formatNumber(agent.total_volume)}</p>
            </div>
            
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Clock size={16} />
                <span className="text-xs">Last Update</span>
              </div>
              <p className="text-sm font-mono">
                {agent.last_score_update ? formatTimeAgo(agent.last_score_update) : 'Never'}
              </p>
            </div>
          </div>
          
          {/* Price Info */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Price (per 1K tokens)</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">
                  ${agent.display_price.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">Price (per token)</p>
                <p className="text-lg font-mono">${agent.price_usd.toFixed(6)}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">Market Cap</p>
                <p className="text-lg font-mono">${formatNumber(agent.market_cap_usd)}</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-sm text-cyan-400">
                💡 Price Formula: Score × $0.01 per 1,000 tokens
              </p>
            </div>
          </div>
          
          {/* Score History Chart */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Score History</h2>
              <span className="text-xs text-slate-500">{scoreHistory.length} data points</span>
            </div>

            <ScoreChart history={scoreHistory} />

            {/* Chart Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-cyan-500" />
                <span>Final Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-slate-500" style={{ borderStyle: 'dashed' }} />
                <span>Raw Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Capped Day</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Trade Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TradeWidget agent={agent} />
            
            {/* Share */}
            <div className="glass-panel p-4 mt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Share2 size={16} />
                Share
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }}
                className="w-full btn-secondary text-sm"
              >
                Copy Link
              </button>
            </div>
            
            {/* Created Info */}
            <div className="glass-panel p-4 mt-4">
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm">
                {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
