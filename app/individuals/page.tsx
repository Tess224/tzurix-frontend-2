'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Filter, TrendingUp, TrendingDown, Users, BarChart3,
  ChevronDown, User, ArrowRight
} from 'lucide-react';
import { TypeBadge, Avatar, LoadingSpinner } from '@/components/ui';
import { getIndividuals, formatPrice, formatNumber } from '@/lib/api';
import { INDIVIDUAL_TYPES, SORT_OPTIONS } from '@/lib/constants';
import { IndividualStock } from '@/types';

// INDIVIDUAL CARD COMPONENT
function IndividualCard({ individual }: { individual: IndividualStock }) {
  const typeConfig = INDIVIDUAL_TYPES[individual.type as keyof typeof INDIVIDUAL_TYPES];
  const priceChange = individual.previous_score > 0
    ? ((individual.current_score - individual.previous_score) / individual.previous_score) * 100
    : 0;
  const isPositive = priceChange >= 0;

  return (
    <Link
      href={`/individual/${individual.id}`}
      className="glass-panel p-5 hover:border-cyan-500/30 transition-all group block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar category="individual" size="md" />
          <div>
            <h3 className="font-semibold group-hover:text-cyan-400 transition-colors">{individual.name}</h3>
            <TypeBadge type={individual.type} category="individual" />
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
          <p className="text-xl font-bold">{formatPrice(individual.current_score)}</p>
          <p className="text-xs text-slate-500">per 1,000 tokens</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Score</p>
          <ScoreDisplay score={individual.current_score} previousScore={individual.previous_score} size="md" />
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-slate-500">Holders</p>
          <p className="font-mono text-sm">{formatNumber(individual.holders || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">24h Vol</p>
          <p className="font-mono text-sm">${formatNumber(individual.volume_24h || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">MC</p>
          <p className="font-mono text-sm">${formatNumber(individual.market_cap_usd || 0)}</p>
        </div>
      </div>
    </Link>
  );
}

// INDIVIDUAL ROW COMPONENT (for table view)
function IndividualRow({ individual, rank }: { individual: IndividualStock; rank: number }) {
  const priceChange = individual.previous_score > 0
    ? ((individual.current_score - individual.previous_score) / individual.previous_score) * 100
    : 0;
  const isPositive = priceChange >= 0;

  return (
    <Link
      href={`/individual/${individual.id}`}
      className="flex items-center justify-between py-4 px-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
    >
      <div className="flex items-center gap-4">
        <span className={`w-8 text-center font-bold ${rank <= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
          {rank}
        </span>
        <Avatar category="individual" size="sm" />
        <div>
          <h3 className="font-medium hover:text-cyan-400 transition-colors">{individual.name}</h3>
          <TypeBadge type={individual.type} category="individual" />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right w-24">
          <p className="font-mono">{formatPrice(individual.current_score)}</p>
          <p className="text-xs text-slate-500">/1K</p>
        </div>
        <div className={`w-20 text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
        </div>
        <div className="w-16 text-right">
          <ScoreDisplay score={individual.current_score} size="sm" />
        </div>
        <div className="w-20 text-right font-mono text-sm text-slate-400">
          {formatNumber(individual.holders || 0)}
        </div>
        <div className="w-24 text-right font-mono text-sm text-slate-400">
          ${formatNumber(individual.volume_24h || 0)}
        </div>
      </div>
    </Link>
  );
}

// MAIN PAGE
export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<IndividualStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchIndividuals();
  }, []);

  const fetchIndividuals = async () => {
    try {
      setLoading(true);
      const data = await getIndividuals();
      if (data && data.length > 0) {
        setIndividuals(data);
      } else {
        // Mock data
        setIndividuals([
          { id: 1, name: 'CryptoWhale', type: 'trader', category: 'individual', current_score: 91, previous_score: 88, wallet_address: '7jDV...7TG5', holders: 420, volume_24h: 35000, market_cap_usd: 91000, created_at: '2024-12-10', twitter_handle: '@cryptowhale' },
          { id: 2, name: 'DeFi_Sarah', type: 'influencer', category: 'individual', current_score: 78, previous_score: 72, wallet_address: '8kEW...9UH6', holders: 890, volume_24h: 18500, market_cap_usd: 78000, created_at: '2024-12-12', twitter_handle: '@defi_sarah' },
          { id: 3, name: '0xBuilder', type: 'developer', category: 'individual', current_score: 69, previous_score: 71, wallet_address: '9lFX...0VI7', holders: 156, volume_24h: 8200, market_cap_usd: 69000, created_at: '2024-12-15', twitter_handle: '@0xbuilder' },
          { id: 4, name: 'ChartMaster', type: 'analyst', category: 'individual', current_score: 63, previous_score: 60, wallet_address: '0mGY...1WJ8', holders: 234, volume_24h: 6800, market_cap_usd: 63000, created_at: '2024-12-18', twitter_handle: '@chartmaster' },
          { id: 5, name: 'AlphaSeeker', type: 'trader', category: 'individual', current_score: 85, previous_score: 80, wallet_address: '1nHZ...2XK9', holders: 567, volume_24h: 42000, market_cap_usd: 85000, created_at: '2024-12-08', twitter_handle: '@alphaseeker' },
          { id: 6, name: 'SolanaGuru', type: 'influencer', category: 'individual', current_score: 74, previous_score: 76, wallet_address: '2oIA...3YL0', holders: 1200, volume_24h: 22000, market_cap_usd: 74000, created_at: '2024-12-14', twitter_handle: '@solanaguru' },
        ] as IndividualStock[]);
      }
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter, search, and sort
  const filteredIndividuals = individuals
    .filter(individual => {
      const matchesSearch = individual.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || individual.type === filterType;
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
        <h1 className="text-3xl font-bold mb-2">Individuals</h1>
        <p className="text-slate-400">Trade performance stocks in traders, influencers, developers & analysts. Price = Score × $0.01 per 1,000 tokens.</p>
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
            placeholder="Search individuals..."
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
            {Object.entries(INDIVIDUAL_TYPES).map(([key, config]) => (
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
      <p className="text-sm text-slate-500 mb-4">{filteredIndividuals.length} individuals found</p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIndividuals.map((individual) => (
            <IndividualCard key={individual.id} individual={individual} />
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
          {filteredIndividuals.map((individual, index) => (
            <IndividualRow key={individual.id} individual={individual} rank={index + 1} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredIndividuals.length === 0 && (
        <div className="text-center py-16">
          <User size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No individuals found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
          <Link href="/create/individual" className="btn-primary inline-flex items-center gap-2">
            Register as Individual
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
            }
