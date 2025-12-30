'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Copy, Check, TrendingUp, TrendingDown,
  Users, BarChart3, Clock, Calendar, Wallet, Activity,
  Target, Percent, DollarSign, AlertTriangle, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TypeBadge, ScoreDisplay, Avatar, LoadingSpinner } from '@/components/ui';
import { getAgent, formatPrice, shortenAddress, formatNumber, formatPercent } from '@/lib/api';
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

// AGENT METRICS
function AgentMetricsDisplay({ type, metrics }: { type: string; metrics?: AgentMetrics }) {
  const defaultMetrics: Record<string, { label: string; value: string; icon: React.ElementType }[]> = {
    trading: [
      { label: 'P&L (24h)', value: metrics?.pnl_24h ? `${formatPercent(metrics.pnl_24h)}` : '+4.69 SOL', icon: DollarSign },
      { label: 'Win Rate', value: metrics?.win_rate ? `${metrics.win_rate.toFixed(1)}%` : '71.4%', icon: Target },
      { label: 'Total Trades', value: metrics?.total_trades?.toString() || '80', icon: Activity },
      { label: 'Max Drawdown', value: metrics?.max_drawdown ? `${metrics.max_drawdown.toFixed(1)}%` : '-12.3%', icon: AlertTriangle },
    ],
    social: [
      { label: 'Followers', value: metrics?.followers ? formatNumber(metrics.followers) : '12.5K', icon: Users },
      { label: 'Engagement', value: metrics?.engagement_rate ? `${metrics.engagement_rate.toFixed(1)}%` : '4.2%', icon: Target },
      { label: 'Posts (24h)', value: metrics?.posts_24h?.toString() || '8', icon: Activity },
      { label: 'Avg Likes', value: metrics?.avg_likes ? formatNumber(metrics.avg_likes) : '342', icon: TrendingUp },
    ],
    defi: [
      { label: 'TVL', value: metrics?.tvl ? `$${formatNumber(metrics.tvl)}` : '$125K', icon: DollarSign },
      { label: 'Current APY', value: metrics?.current_apy ? `${metrics.current_apy.toFixed(1)}%` : '24.5%', icon: Percent },
      { label: 'Protocols', value: metrics?.protocols_used?.toString() || '5', icon: Activity },
      { label: 'Total Yield', value: metrics?.total_yield ? `$${formatNumber(metrics.total_yield)}` : '$8.2K', icon: TrendingUp },
    ],
    utility: [
      { label: 'Tasks Done', value: metrics?.tasks_completed ? formatNumber(metrics.tasks_completed) : '1,234', icon: Target },
      { label: 'Avg Response', value: metrics?.avg_response_time ? `${metrics.avg_response_time}s` : '0.8s', icon: Clock },
      { label: 'User Rating', value: metrics?.user_rating ? `${metrics.user_rating.toFixed(1)}/5` : '4.7/5', icon: Activity },
      { label: 'Active Users', value: metrics?.active_users ? formatNumber(metrics.active_users) : '89', icon: Users },
    ],
  };
  
  const metricsToShow = defaultMetrics[type] || defaultMetrics.trading;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricsToShow.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <div key={i} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500">{metric.label}</span>
            </div>
            <p className="font-mono text-lg font-semibold">{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}

// SCORE BREAKDOWN
function ScoreBreakdown() {
  const [expanded, setExpanded] = useState(false);
  
  const breakdown = [
    { name: 'Performance', weight: '50%', value: 85, points: 4.25, description: 'Based on P&L, win rate, and trading consistency' },
    { name: 'Reliability', weight: '30%', value: 72, points: 2.16, description: 'Based on uptime, transaction success rate' },
    { name: 'Reputation', weight: '20%', value: 60, points: 1.2, description: 'Based on holder count, creator credibility' },
  ];
  
  return (
    <div className="glass-panel p-6">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <h3 className="font-semibold">Score Breakdown</h3>
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
  
  useEffect(() => {
    fetchAgent();
  }, [agentId]);
  
  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await getAgent(agentId);
      if (data) {
        setAgent(data);
      } else {
        // Mock data
        setAgent({
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
          metrics: { pnl_24h: 4.69, win_rate: 71.4, total_trades: 80, max_drawdown: -12.3 }
        } as AgentStock);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
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
          
          {/* Agent Metrics */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4">{typeConfig?.label || 'Trading'} Metrics</h3>
            <AgentMetricsDisplay type={agent.type} metrics={agent.metrics} />
          </div>
          
          {/* Tracked Wallets */}
          <TrackedWallets wallets={agent.agent_wallets} mainWallet={agent.wallet_address} />
          
          {/* Score Breakdown */}
          <ScoreBreakdown />
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
