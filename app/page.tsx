// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Search, Filter,
  Bot, User, ArrowRight, Zap, Shield, BarChart3,
  Info
} from 'lucide-react';
import TzurixLogo from '@/components/ui/TzurixLogo';
import PriceDisplay, { InlinePrice, PriceChange, MarketCap } from '@/components/ui/PriceDisplay';
import { AGENT_TYPES, INDIVIDUAL_TYPES, DAILY_SCORE_CAP } from '@/lib/constants';

// =============================================================================
// MOCK DATA (Replace with API calls)
// =============================================================================

const MOCK_AGENTS = [
  { id: 1, name: 'AlphaBot', type: 'trading', score: 87, previousScore: 82, category: 'agent' },
  { id: 2, name: 'YieldMax', type: 'defi', score: 72, previousScore: 75, category: 'agent' },
  { id: 3, name: 'SocialPulse', type: 'social', score: 65, previousScore: 58, category: 'agent' },
  { id: 4, name: 'DataMiner', type: 'utility', score: 54, previousScore: 54, category: 'agent' },
];

const MOCK_INDIVIDUALS = [
  { id: 1, name: 'CryptoWhale', type: 'trader', score: 91, previousScore: 88, category: 'individual' },
  { id: 2, name: 'DeFi_Sarah', type: 'influencer', score: 78, previousScore: 72, category: 'individual' },
  { id: 3, name: '0xBuilder', type: 'developer', score: 69, previousScore: 71, category: 'individual' },
  { id: 4, name: 'ChartMaster', type: 'analyst', score: 63, previousScore: 60, category: 'individual' },
];

// =============================================================================
// STOCK CARD COMPONENT
// =============================================================================

interface StockCardProps {
  id: number;
  name: string;
  type: string;
  score: number;
  previousScore: number;
  category: 'agent' | 'individual';
}

function StockCard({ id, name, type, score, previousScore, category }: StockCardProps) {
  const typeConfig = category === 'agent' 
    ? AGENT_TYPES[type as keyof typeof AGENT_TYPES]
    : INDIVIDUAL_TYPES[type as keyof typeof INDIVIDUAL_TYPES];
  
  const TypeIcon = typeConfig?.icon || Bot;
  const isPositive = score >= previousScore;
  const changePercent = previousScore > 0 
    ? ((score - previousScore) / previousScore) * 100 
    : 0;

  const linkPath = category === 'agent' ? `/agent/${id}` : `/individual/${id}`;

  return (
    <Link 
      href={linkPath}
      className="glass-panel p-5 hover:border-cyan-500/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig?.bg} border ${typeConfig?.border}`}>
            {category === 'agent' ? (
              <Bot size={20} className={typeConfig?.color} />
            ) : (
              <User size={20} className={typeConfig?.color} />
            )}
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-cyan-400 transition-colors">{name}</h3>
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${typeConfig?.bg} ${typeConfig?.border} border ${typeConfig?.color}`}>
              <TypeIcon size={10} />
              {typeConfig?.label}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">Price</p>
          <PriceDisplay score={score} size="md" showLabel={true} />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Score</p>
          <p className="text-2xl font-bold text-cyan-400">{score}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/5">
        <MarketCap score={score} size="sm" />
      </div>
    </Link>
  );
}

// =============================================================================
// LEADERBOARD ROW COMPONENT
// =============================================================================

interface LeaderboardRowProps {
  rank: number;
  name: string;
  type: string;
  score: number;
  previousScore: number;
  category: 'agent' | 'individual';
}

function LeaderboardRow({ rank, name, type, score, previousScore, category }: LeaderboardRowProps) {
  const typeConfig = category === 'agent' 
    ? AGENT_TYPES[type as keyof typeof AGENT_TYPES]
    : INDIVIDUAL_TYPES[type as keyof typeof INDIVIDUAL_TYPES];
  
  const isPositive = score >= previousScore;
  const changePercent = previousScore > 0 
    ? ((score - previousScore) / previousScore) * 100 
    : 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <span className={`w-6 text-center font-bold ${rank <= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
          {rank}
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig?.bg}`}>
            {category === 'agent' ? (
              <Bot size={14} className={typeConfig?.color} />
            ) : (
              <User size={14} className={typeConfig?.color} />
            )}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <InlinePrice score={score} />
        <div className={`w-16 text-right text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
        </div>
        <div className="w-12 text-right">
          <span className="text-cyan-400 font-bold">{score}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'individuals'>('agents');
  const [searchQuery, setSearchQuery] = useState('');

  const stocks = activeTab === 'agents' ? MOCK_AGENTS : MOCK_INDIVIDUALS;
  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combine and sort for leaderboard
  const allStocks = [...MOCK_AGENTS, ...MOCK_INDIVIDUALS]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <TzurixLogo size={64} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Trade <span className="text-cyan-400">Performance</span>, Not Promises
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Buy and sell stocks in AI agents and individuals. Price equals performance score.
              Real metrics, real accountability, real returns.
            </p>
            
            {/* Price Explainer */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-400 mb-8">
              <Info size={14} className="text-cyan-400" />
              <span>Prices shown are per 1,000 tokens</span>
              <span className="text-slate-600">•</span>
              <span>Score changes capped at ±{DAILY_SCORE_CAP * 100}% daily</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create" className="btn-primary inline-flex items-center justify-center gap-2">
                Create Your Stock
                <ArrowRight size={18} />
              </Link>
              <Link href="#explore" className="btn-secondary inline-flex items-center justify-center gap-2">
                Explore Stocks
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">$2.4M</p>
              <p className="text-xs text-slate-500">Total Volume</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">847</p>
              <p className="text-xs text-slate-500">Active Stocks</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">12.5K</p>
              <p className="text-xs text-slate-500">Traders</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">+34%</p>
              <p className="text-xs text-slate-500">Avg. Returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-cyan-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Score = Price</h3>
              <p className="text-sm text-slate-400">
                Every stock has a performance score from 0-100. 
                Price is simply Score × $0.01 per 1,000 tokens.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-emerald-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Daily Updates</h3>
              <p className="text-sm text-slate-400">
                Scores update daily based on real performance metrics.
                Changes are capped at ±{DAILY_SCORE_CAP * 100}% per day.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-violet-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Verified On-Chain</h3>
              <p className="text-sm text-slate-400">
                All scores are pushed to Solana by our oracle.
                Transparent, verifiable, tamper-proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Stocks */}
      <section id="explore" className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold">Explore Stocks</h2>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 w-48"
                />
              </div>
              
              {/* Tabs */}
              <div className="flex bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'agents' 
                      ? 'bg-cyan-500 text-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot size={14} className="inline mr-1.5" />
                  Agents
                </button>
                <button
                  onClick={() => setActiveTab('individuals')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'individuals' 
                      ? 'bg-cyan-500 text-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User size={14} className="inline mr-1.5" />
                  Individuals
                </button>
              </div>
            </div>
          </div>

          {/* Price Label Info */}
          <div className="mb-6 text-xs text-slate-500 flex items-center gap-1">
            <Info size={12} />
            All prices shown are per 1,000 tokens
          </div>

          {/* Stock Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.id}
                id={stock.id}
                name={stock.name}
                type={stock.type}
                score={stock.score}
                previousScore={stock.previousScore}
                category={stock.category as 'agent' | 'individual'}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href={activeTab === 'agents' ? '/agents' : '/individuals'}
              className="btn-secondary inline-flex items-center gap-2"
            >
              View All {activeTab === 'agents' ? 'Agents' : 'Individuals'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Top Performers</h2>
          <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
            <Info size={12} />
            Prices per 1,000 tokens
          </p>
          
          <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center">#</span>
                <span>Name</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="w-20">Price/1K</span>
                <span className="w-16 text-right">24h</span>
                <span className="w-12 text-right">Score</span>
              </div>
            </div>
            
            {/* Rows */}
            {allStocks.map((stock, index) => (
              <LeaderboardRow
                key={`${stock.category}-${stock.id}`}
                rank={index + 1}
                name={stock.name}
                type={stock.type}
                score={stock.score}
                previousScore={stock.previousScore}
                category={stock.category as 'agent' | 'individual'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Listed?</h2>
          <p className="text-slate-400 mb-8">
            Create your performance stock for just $12. Let the community invest in your proven track record.
          </p>
          <Link href="/create" className="btn-primary inline-flex items-center gap-2">
            Create Your Stock
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}