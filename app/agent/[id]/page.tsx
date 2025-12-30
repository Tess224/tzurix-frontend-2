'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Copy, Check, TrendingUp, TrendingDown,
  Users, BarChart3, Clock, Calendar, Wallet, Activity,
  Target, Percent, DollarSign, AlertTriangle, ChevronDown, ChevronUp, Info,
  RefreshCw, Zap
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TypeBadge, ScoreDisplay, Avatar, LoadingSpinner } from '@/components/ui';
import { getAgent, getWalletScore, formatPrice, shortenAddress, formatNumber, formatPercent, WalletMetrics } from '@/lib/api';
import TradeWidget from '@/components/TradeWidget';
import { AGENT_TYPES, TIME_RANGES, EXTERNAL_LINKS } from '@/lib/constants';
import { AgentStock, AgentMetrics, DailyScore } from '@/types';


// SCORE CHART
function ScoreChart({ history }: { history: DailyScore[] }) {
  const chartData = history.length > 0 ? history : [
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
        <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

// REAL METRICS DISPLAY (from Helius)
function RealMetricsDisplay({ 
  metrics, 
  loading, 
  usingRealData,
  onRefresh 
}: { 
  metrics: WalletMetrics | null; 
  loading: boolean;
  usingRealData: boolean;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-20 mb-2" />
            <div className="h-6 bg-white/10 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!metrics) {
    return (
      <div className="bg-white/5 rounded-xl p-6 text-center">
        <AlertTriangle className="mx-auto text-amber-400 mb-2" size={24} />
        <p className="text-slate-400 text-sm">Unable to load metrics</p>
        <button onClick={onRefresh} className="mt-2 text-cyan-400 text-sm hover:underline">
          Try again
        </button>
      </div>
    );
  }
  
  const pnlIsPositive = metrics.total_pnl_sol >= 0;
  
  const metricsData = [
    { 
      label: 'Total P&L', 
      value: `${pnlIsPositive ? '+' : ''}${metrics.total_pnl_sol.toFixed(2)} SOL`, 
      icon: DollarSign,
      color: pnlIsPositive ? 'text-emerald-400' : 'text-red-400'
    },
    { 
      label: 'Win Rate', 
      value: `${metrics.win_rate.toFixed(1)}%`, 
      icon: Target,
      color: metrics.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'
    },
    { 
      label: 'Total Trades', 
      value: metrics.total_trades.toString(), 
      icon: Activity,
      color: 'text-white'
    },
    { 
      label: 'Volume', 
      value: `${metrics.total_volume_sol.toFixed(1)} SOL`, 
      icon: BarChart3,
      color: 'text-white'
    },
    { 
      label: 'Avg Trade P&L', 
      value: `${metrics.avg_trade_pnl >= 0 ? '+' : ''}${metrics.avg_trade_pnl.toFixed(3)} SOL`, 
      icon: TrendingUp,
      color: metrics.avg_trade_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
    },
    { 
      label: 'Avg Hold Time', 
      value: `${metrics.avg_hold_time_hours.toFixed(1)}h`, 
      icon: Clock,
      color: 'text-white'
    },
    { 
      label: 'Trades/Day', 
      value: metrics.trades_per_day.toFixed(1), 
      icon: Zap,
      color: 'text-white'
    },
    { 
      label: 'Tokens Traded', 
      value: metrics.unique_tokens_traded.toString(), 
      icon: Activity,
      color: 'text-white'
    },
  ];
  
  return (
    <div>
      {/* Data Source Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          usingRealData 
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
            : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${usingRealData ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          {usingRealData ? 'Live On-Chain Data' : 'Simulated Data'}
        </div>
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Refresh metrics"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsData.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">{metric.label}</span>
              </div>
              <p className={`font-mono text-lg font-semibold ${metric.color}`}>{metric.value}</p>
            </div>
          );
        })}
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Largest Win</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="font-mono text-lg font-semibold text-emerald-400">
            +{metrics.largest_win_sol.toFixed(2)} SOL
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Largest Loss</span>
            <TrendingDown size={14} className="text-red-400" />
          </div>
          <p className="font-mono text-lg font-semibold text-red-400">
            {metrics.largest_loss_sol.toFixed(2)} SOL
          </p>
        </div>
      </div>
      
      {/* Win/Loss Bar */}
      <div className="mt-4 bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-emerald-400">{metrics.winning_trades} Wins</span>
          <span className="text-slate-500">
            {metrics.total_trades > 0 
              ? `${((metrics.winning_trades / metrics.total_trades) * 100).toFixed(0)}%` 
              : '0%'}
          </span>
          <span className="text-red-400">{metrics.losing_trades} Losses</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
          <div 
            className="bg-emerald-500 transition-all" 
            style={{ width: metrics.total_trades > 0 ? `${(metrics.winning_trades / metrics.total_trades) * 100}%` : '0%' }} 
          />
          <div 
            className="bg-red-500 transition-all" 
            style={{ width: metrics.total_trades > 0 ? `${(metrics.losing_trades / metrics.total_trades) * 100}%` : '0%' }} 
          />
        </div>
      </div>
    </div>
  );
}

// SCORE BREAKDOWN
function ScoreBreakdown({ metrics }: { metrics: WalletMetrics | null }) {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate breakdown from real metrics if available
  const performanceValue = metrics ? Math.min(100, Math.max(0, 50 + metrics.total_pnl_sol * 2 + metrics.win_rate * 0.3)) : 85;
  const reliabilityValue = metrics ? Math.min(100, Math.max(0, metrics.total_trades > 10 ? 70 + (metrics.win_rate - 50) * 0.4 : 50)) : 72;
  const reputationValue = 60; // This would come from holder data
  
  const breakdown = [
    { 
      name: 'Performance', 
      weight: '50%', 
      value: Math.round(performanceValue), 
      points: (performanceValue / 100) * 5, 
      description: 'Based on P&L, win rate, and trading consistency' 
    },
    { 
      name: 'Reliability', 
      weight: '30%', 
      value: Math.round(reliabilityValue), 
      points: (reliabilityValue / 100) * 3, 
      description: 'Based on trade count, consistency, and activity' 
    },
    { 
      name: 'Reputation', 
      weight: '20%', 
      value: reputationValue, 
      points: (reputationValue / 100) * 2, 
      description: 'Based on holder count, creator credibility' 
    },
  ];
  
  const totalPoints = breakdown.reduce((sum, b) => sum + b.points, 0);
  
  return (
    <div className="glass-panel p-6">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Score Breakdown</h3>
          <span className="text-sm text-cyan-400 font-mono">{totalPoints.toFixed(1)} / 10</span>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-4">
          {breakdown.map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-cyan-400 font-mono">{item.points.toFixed(2)} pts</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                <span>Weight: {item.weight}</span>
                <span>Value: {item.value}/100</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${item.value}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">{item.description}</p>
            </div>
          ))}
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-medium">Daily Score Cap</p>
                <p className="text-xs text-slate-400 mt-1">Scores can only change by ±10% per day to prevent manipulation.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// TRACKED WALLETS
function TrackedWallets({ wallets, mainWallet }: { wallets?: string[]; mainWallet: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const allWallets = wallets?.length ? wallets : [mainWallet];
  
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="glass-panel p-6">
      <h3 className="font-semibold mb-4">Tracked Wallets</h3>
      <div className="space-y-3">
        {allWallets.map((wallet, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Wallet size={16} className="text-slate-500" />
              <span className="font-mono text-sm">{shortenAddress(wallet, 8)}</span>
              {i === 0 && <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">Primary</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => copyAddress(wallet)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                {copied === wallet ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <a href={EXTERNAL_LINKS.solscan(wallet)} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// MAIN PAGE
export default function AgentPage() {
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<AgentStock | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [scoreHistory] = useState<DailyScore[]>([]);
  
  // Real metrics state
  const [walletMetrics, setWalletMetrics] = useState<WalletMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  
  useEffect(() => {
    fetchAgent();
  }, [agentId]);
  
  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await getAgent(agentId);
      if (data) {
        setAgent(data);
        // Fetch real metrics after getting agent
        fetchMetrics(data.wallet_address);
      } else {
        // Mock data for development
        const mockAgent: AgentStock = {
          id: parseInt(agentId),
          name: 'Alpha Trading Bot',
          type: 'trading',
          category: 'agent',
          current_score: 11,
          previous_score: 10,
          raw_score: 14,
          was_capped: true,
          wallet_address: '7jDVmS8HBdDNdtGXSxepjcktvG6FzbPurZvYUVgY7TG5',
          holders: 24,
          volume_24h: 1250,
          total_volume: 45000,
          market_cap_usd: 11000,
          created_at: '2024-12-20',
          creator_wallet: 'DCAKxn5PFNN1mBREPWGdk1RXg5aVH9rPErLfBFEi2Cj6',
          description: 'High-frequency trading bot specializing in Solana memecoins with advanced momentum detection.',
        };
        setAgent(mockAgent);
        fetchMetrics(mockAgent.wallet_address);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMetrics = async (walletAddress: string) => {
    try {
      setMetricsLoading(true);
      const scoreData = await getWalletScore(walletAddress);
      if (scoreData && scoreData.metrics) {
        setWalletMetrics(scoreData.metrics);
        setUsingRealData(scoreData.using_real_data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };
  
  const handleRefreshMetrics = () => {
    if (agent) {
      fetchMetrics(agent.wallet_address);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  if (!agent) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
        <Link href="/" className="text-cyan-400 hover:underline">← Back to Home</Link>
      </div>
    );
  }
  
  const typeConfig = AGENT_TYPES[agent.type as keyof typeof AGENT_TYPES];
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back to Discovery
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar category="agent" size="lg" />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{agent.name}</h1>
                    <TypeBadge type={agent.type} category="agent" />
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{agent.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Created {agent.created_at}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <ScoreDisplay score={agent.current_score} previousScore={agent.previous_score} wasCapped={agent.was_capped} size="lg" />
                <p className="text-slate-400 text-sm mt-1">{formatPrice(agent.current_score)}</p>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">Holders</span>
              </div>
              <p className="font-mono text-xl font-semibold">{formatNumber(agent.holders || 0)}</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">24h Volume</span>
              </div>
              <p className="font-mono text-xl font-semibold">${formatNumber(agent.volume_24h || 0)}</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">Total Volume</span>
              </div>
              <p className="font-mono text-xl font-semibold">${formatNumber(agent.total_volume || 0)}</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">Market Cap</span>
              </div>
              <p className="font-mono text-xl font-semibold">${formatNumber(agent.market_cap_usd || 0)}</p>
            </div>
          </div>
          
          {/* Score Chart */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Score History</h3>
              <div className="flex bg-white/5 rounded-lg p-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-1 rounded text-sm transition-all ${timeRange === range.value ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            
            <ScoreChart history={scoreHistory} />
            
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
          
          {/* Real Metrics from Helius */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4">On-Chain Trading Metrics</h3>
            <RealMetricsDisplay 
              metrics={walletMetrics} 
              loading={metricsLoading}
              usingRealData={usingRealData}
              onRefresh={handleRefreshMetrics}
            />
          </div>
          
          {/* Tracked Wallets */}
          <TrackedWallets wallets={agent.agent_wallets} mainWallet={agent.wallet_address} />
          
          {/* Score Breakdown */}
          <ScoreBreakdown metrics={walletMetrics} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <TradeWidget agent={agent} onTradeComplete={fetchAgent} />
          
          {/* Prediction Markets Placeholder */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4">Prediction Markets</h3>
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No active markets</p>
              <button className="mt-3 text-cyan-400 text-sm hover:underline">Create Prediction</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}