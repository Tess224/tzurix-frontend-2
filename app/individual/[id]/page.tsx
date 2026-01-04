'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Copy, Check, TrendingUp, TrendingDown,
  Users, BarChart3, Calendar, Activity, Twitter,
  Target, DollarSign, ChevronDown, ChevronUp, Info, Wallet
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TypeBadge, Avatar, LoadingSpinner } from '@/components/ui';
import { getIndividual, formatPrice, shortenAddress, formatNumber, formatPercent } from '@/lib/api';
import { INDIVIDUAL_TYPES, TIME_RANGES, EXTERNAL_LINKS } from '@/lib/constants';
import { IndividualStock, IndividualMetrics, DailyScore } from '@/types';

// ============================================================================
// TRADE WIDGET - Allows buying/selling individual stocks
// ============================================================================
function TradeWidget({ individual }: { individual: IndividualStock }) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  
  // Price is calculated as score × $0.01
  const price = individual.current_score * 0.01;
  const total = parseFloat(amount || '0') * price;
  
  return (
    <div className="glass-panel p-6">
      <h3 className="font-semibold mb-4">Trade</h3>
      
      {/* Buy/Sell Toggle */}
      <div className="flex bg-white/5 rounded-xl p-1 mb-4">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            tradeType === 'buy' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            tradeType === 'sell' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>
      
      {/* Current Price Display */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Current Price</span>
          <span className="font-mono text-lg">${price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Score × $0.01</span>
          <span>{individual.current_score} × $0.01</span>
        </div>
      </div>
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Amount (tokens)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="input-field text-lg font-mono"
        />
      </div>
      
      {/* Total Calculation */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Total</span>
          <span className="font-mono text-xl font-bold">${total.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Trade Action Button */}
      <button 
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          tradeType === 'buy' 
            ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
            : 'bg-red-500 hover:bg-red-400 text-white'
        }`}
      >
        {tradeType === 'buy' ? 'Buy' : 'Sell'} {individual.name}
      </button>
      
      <p className="text-xs text-slate-500 text-center mt-3">Connect wallet to trade</p>
    </div>
  );
}

// ============================================================================
// SCORE CHART - Displays historical score data with capped days marked
// ============================================================================
function ScoreChart({ history }: { history: DailyScore[] }) {
  // Use mock data if no history is provided (for demo purposes)
  const chartData = history.length > 0 ? history : [
    { date: '12/22', final_score: 80, raw_score: 80, was_capped: false },
    { date: '12/23', final_score: 82, raw_score: 83, was_capped: false },
    { date: '12/24', final_score: 84, raw_score: 86, was_capped: false },
    { date: '12/25', final_score: 85, raw_score: 85, was_capped: false },
    { date: '12/26', final_score: 85, raw_score: 92, was_capped: true },
    { date: '12/27', final_score: 84, raw_score: 82, was_capped: false },
    { date: '12/28', final_score: 85, raw_score: 86, was_capped: false },
  ];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            domain={['dataMin - 5', 'dataMax + 5']} 
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#0B1220', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              padding: '12px' 
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          {/* Dashed line for raw score (before daily cap applied) */}
          <Line 
            type="monotone" 
            dataKey="raw_score" 
            stroke="#64748b" 
            strokeWidth={1} 
            strokeDasharray="5 5" 
            dot={false} 
          />
          {/* Solid line for final score with special markers for capped days */}
          <Line 
            type="monotone" 
            dataKey="final_score" 
            stroke="#4CC9F0" 
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              // Orange dot indicates a day where the ±10% cap was applied
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

// ============================================================================
// INDIVIDUAL METRICS - Displays type-specific performance metrics
// Each individual type (trader, influencer, developer, analyst) has different metrics
// ============================================================================
function IndividualMetricsDisplay({ type, metrics }: { type: string; metrics?: IndividualMetrics }) {
  // Define default/mock metrics for each individual type
  const defaultMetrics: Record<string, { label: string; value: string; icon: React.ElementType }[]> = {
    trader: [
      { label: 'P&L (30d)', value: metrics?.pnl_30d ? formatPercent(metrics.pnl_30d) : '+34.2%', icon: DollarSign },
      { label: 'Win Rate', value: metrics?.win_rate ? `${metrics.win_rate.toFixed(1)}%` : '68.5%', icon: Target },
      { label: 'Total Trades', value: metrics?.total_trades?.toString() || '1,247', icon: Activity },
      { label: 'Followers', value: metrics?.followers ? formatNumber(metrics.followers) : '12.5K', icon: Users },
    ],
    influencer: [
      { label: 'Followers', value: metrics?.followers ? formatNumber(metrics.followers) : '156K', icon: Users },
      { label: 'Engagement', value: metrics?.engagement_rate ? `${metrics.engagement_rate.toFixed(1)}%` : '5.8%', icon: Target },
      { label: 'Posts (24h)', value: '12', icon: Activity },
      { label: 'Avg Likes', value: '2.4K', icon: TrendingUp },
    ],
    developer: [
      { label: 'Repos', value: '47', icon: Activity },
      { label: 'Contributions', value: '2,341', icon: Target },
      { label: 'Stars', value: '8.9K', icon: TrendingUp },
      { label: 'Followers', value: metrics?.followers ? formatNumber(metrics.followers) : '3.2K', icon: Users },
    ],
    analyst: [
      { label: 'Accuracy', value: '76.4%', icon: Target },
      { label: 'Calls Made', value: '89', icon: Activity },
      { label: 'Followers', value: metrics?.followers ? formatNumber(metrics.followers) : '45K', icon: Users },
      { label: 'Avg Return', value: '+18.3%', icon: TrendingUp },
    ],
  };
  
  const metricsToShow = defaultMetrics[type] || defaultMetrics.trader;
  
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

// ============================================================================
// SCORE BREAKDOWN - Expandable section showing how the score is calculated
// Individuals are scored on different criteria than AI agents
// ============================================================================
function ScoreBreakdown() {
  const [expanded, setExpanded] = useState(false);
  
  // Score components for individuals differ from agents
  // Track Record (50%) - Historical performance and accuracy
  // Influence (30%) - Social reach and engagement
  // Credibility (20%) - Verification status and reputation
  const breakdown = [
    { 
      name: 'Track Record', 
      weight: '50%', 
      value: 78, 
      points: 3.9, 
      description: 'Based on historical predictions, trading performance, and accuracy' 
    },
    { 
      name: 'Influence', 
      weight: '30%', 
      value: 85, 
      points: 2.55, 
      description: 'Based on follower count, engagement rate, and reach' 
    },
    { 
      name: 'Credibility', 
      weight: '20%', 
      value: 70, 
      points: 1.4, 
      description: 'Based on verification status, holder count, and community trust' 
    },
  ];
  
  return (
    <div className="glass-panel p-6">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full flex items-center justify-between"
      >
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
              {/* Visual progress bar showing the component's value */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all" 
                  style={{ width: `${item.value}%` }} 
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{item.description}</p>
            </div>
          ))}
          
          {/* Info box explaining the daily cap mechanism */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-medium">Daily Score Cap</p>
                <p className="text-xs text-slate-400 mt-1">
                  Scores can only change by ±10% per day to prevent manipulation and ensure stability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SOCIAL LINKS - Display connected social accounts with external links
// ============================================================================
function SocialLinks({ twitter, wallet }: { twitter?: string; wallet?: string }) {
  const [copied, setCopied] = useState(false);
  
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="glass-panel p-6">
      <h3 className="font-semibold mb-4">Connected Accounts</h3>
      <div className="space-y-3">
        {/* Twitter Link */}
        {twitter && (
          <a 
            href={`https://twitter.com/${twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Twitter size={16} className="text-blue-400" />
              <span className="font-mono text-sm">@{twitter}</span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Verified</span>
            </div>
            <ExternalLink size={14} className="text-slate-500" />
          </a>
        )}
        
        {/* Wallet Address */}
        {wallet && (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Wallet size={16} className="text-slate-500" />
              <span className="font-mono text-sm">{shortenAddress(wallet, 8)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => copyAddress(wallet)} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <a 
                href={EXTERNAL_LINKS.solscan(wallet)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
        
        {/* Empty state if no accounts connected */}
        {!twitter && !wallet && (
          <p className="text-slate-500 text-sm text-center py-4">No accounts connected</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function IndividualPage() {
  const params = useParams();
  const individualId = params.id as string;
  
  const [individual, setIndividual] = useState<IndividualStock | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [scoreHistory] = useState<DailyScore[]>([]);
  
  // Fetch individual data when component mounts or ID changes
  useEffect(() => {
    fetchIndividual();
  }, [individualId]);
  
  const fetchIndividual = async () => {
    try {
      setLoading(true);
      const data = await getIndividual(individualId);
      
      if (data) {
        setIndividual(data);
      } else {
        // Use mock data for demo when API returns nothing
        setIndividual({
          id: parseInt(individualId),
          name: 'CryptoWhale',
          type: 'trader',
          category: 'individual',
          current_score: 85,
          previous_score: 80,
          holders: 156,
          volume_24h: 12500,
          total_volume: 890000,
          market_cap_usd: 85000,
          created_at: '2024-11-15',
          twitter_handle: 'cryptowhale',
          wallet_address: 'DCAKxn5PFNN1mBREPWGdk1RXg5aVH9rPErLfBFEi2Cj6',
          description: 'Full-time crypto trader specializing in Solana ecosystem. 5+ years experience. Sharing alpha and market insights.',
          metrics: {
            pnl_30d: 34.2,
            win_rate: 68.5,
            total_trades: 1247,
            followers: 12500,
          }
        } as IndividualStock);
      }
    } catch (error) {
      console.error('Error fetching individual:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading spinner while fetching
  if (loading) return <LoadingSpinner />;
  
  // Show error state if individual not found
  if (!individual) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Individual Not Found</h1>
        <Link href="/" className="text-cyan-400 hover:underline">← Back to Home</Link>
      </div>
    );
  }
  
  // Get the type configuration for styling
  const typeConfig = INDIVIDUAL_TYPES[individual.type as keyof typeof INDIVIDUAL_TYPES];
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back Navigation */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Discovery
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================================ */}
        {/* MAIN CONTENT (Left 2/3) */}
        {/* ============================================================ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Section - Name, type, score, description */}
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar category="individual" size="lg" />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{individual.name}</h1>
                    <TypeBadge type={individual.type} category="individual" />
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{individual.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Listed {individual.created_at}
                    </span>
                    {individual.twitter_handle && (
                      <a 
                        href={`https://twitter.com/${individual.twitter_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <Twitter size={14} />
                        @{individual.twitter_handle}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Score Display (top right) */}
              <div className="text-right">
                <ScoreDisplay 
                  score={individual.current_score} 
                  previousScore={individual.previous_score} 
                  size="lg" 
                />
                <p className="text-slate-400 text-sm mt-1">
                  {formatPrice(individual.current_score)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Stats Row - Key metrics at a glance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">Holders</span>
              </div>
              <p className="font-mono text-xl font-semibold">
                {formatNumber(individual.holders || 0)}
              </p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">24h Volume</span>
              </div>
              <p className="font-mono text-xl font-semibold">
                ${formatNumber(individual.volume_24h || 0)}
              </p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">Total Volume</span>
              </div>
              <p className="font-mono text-xl font-semibold">
                ${formatNumber(individual.total_volume || 0)}
              </p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">Market Cap</span>
              </div>
              <p className="font-mono text-xl font-semibold">
                ${formatNumber(individual.market_cap_usd || 0)}
              </p>
            </div>
          </div>
          
          {/* Score History Chart */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Score History</h3>
              {/* Time range selector */}
              <div className="flex bg-white/5 rounded-lg p-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      timeRange === range.value 
                        ? 'bg-cyan-500 text-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
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
          
          {/* Type-Specific Metrics */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4">
              {typeConfig?.label || 'Trader'} Metrics
            </h3>
            <IndividualMetricsDisplay type={individual.type} metrics={individual.metrics} />
          </div>
          
          {/* Connected Social Accounts */}
          <SocialLinks 
            twitter={individual.twitter_handle} 
            wallet={individual.wallet_address} 
          />
          
          {/* Score Breakdown (Expandable) */}
          <ScoreBreakdown />
        </div>
        
        {/* ============================================================ */}
        {/* SIDEBAR (Right 1/3) */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* Trade Widget */}
          <TradeWidget individual={individual} />
          
          {/* Prediction Markets Placeholder */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4">Prediction Markets</h3>
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No active markets</p>
              <button className="mt-3 text-cyan-400 text-sm hover:underline">
                Create Prediction
              </button>
            </div>
          </div>
          
          {/* Recent Holders (Placeholder for future feature) */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4">Recent Holders</h3>
            <div className="space-y-3">
              {/* Placeholder holder entries */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full" />
                    <span className="font-mono text-xs text-slate-400">
                      {shortenAddress(`${i}abc123def456ghi789jkl`, 4)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {i * 12} tokens
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
      }
