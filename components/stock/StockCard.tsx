'use client';

import Link from 'next/link';
import { Users, BarChart3 } from 'lucide-react';
import { Stock } from '@/types';
import { TypeBadge, Avatar } from '@/components/ui';
import { formatPrice, formatNumber } from '@/lib/api';

export default function StockCard({ stock }: { stock: Stock }) {
  const category = 'wallet_address' in stock ? 'agent' : 'individual';
  const href = category === 'agent' ? `/agent/${stock.id}` : `/individual/${stock.id}`;
  const change = stock.previous_score ? ((stock.current_score - stock.previous_score) / stock.previous_score) * 100 : 0;
  const wasCapped = Math.abs(change) >= 9.9;
  
  return (
    <Link href={href}>
      <div className="glass-panel p-5 hover:border-cyan-500/30 transition-all cursor-pointer group">
        <div className="flex items-start gap-3 mb-4">
          <Avatar category={category} />
          <div>
            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{stock.name}</h3>
            <TypeBadge type={stock.type} category={category} />
          </div>
        </div>
        
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase mb-1">Score</p>
            <ScoreDisplay score={stock.current_score} previousScore={stock.previous_score} wasCapped={wasCapped} />
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase mb-1">Price</p>
            <p className="font-mono text-lg text-white">{formatPrice(stock.current_score)}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-slate-400">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span className="text-xs">{formatNumber(stock.holders || 0)} holders</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 size={12} />
            <span className="text-xs">${formatNumber(stock.volume_24h || 0)} vol</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
