'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ExternalLink, Copy, Check, RefreshCw, PieChart, Activity,
  Bot, User, ChevronRight, Clock, DollarSign,
  Plus, ArrowRight
} from 'lucide-react';
import { TypeBadge, Avatar, LoadingSpinner } from '@/components/ui';
import { AgentType, IndividualType } from '@/types';
import { formatPrice, shortenAddress, formatNumber, formatPercent } from '@/lib/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Holding {
  id: number;
  name: string;
  category: 'agent' | 'individual';
  type: AgentType | IndividualType;
  tokens: number;
  avgBuyPrice: number;
  currentScore: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  stockName: string;
  stockCategory: 'agent' | 'individual';
  tokens: number;
  price: number;
  total: number;
  timestamp: string;
  txHash: string;
}

// ============================================================================
// CONNECT WALLET PROMPT
// ============================================================================

function ConnectWalletPrompt() {
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = async () => {
    setConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };
  
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Wallet className="text-cyan-400" size={48} />
      </div>
      
      <h1 className="text-2xl font-bold mb-3">Connect Your Wallet</h1>
      <p className="text-slate-400 mb-8">
        Connect your Solana wallet to view your portfolio, track your holdings, 
        and see your trading history.
      </p>
      
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="btn-primary inline-flex items-center gap-2"
      >
        {connecting ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet size={18} />
            Connect Phantom Wallet
          </>
        )}
      </button>
      
      <p className="text-xs text-slate-500 mt-4">
        We support Phantom, Solflare, and other Solana wallets
      </p>
    </div>
  );
}

// ============================================================================
// PORTFOLIO SUMMARY CARDS
// ============================================================================

function PortfolioSummary({ 
  totalValue, 
  totalPnl, 
  totalPnlPercent,
  holdingsCount 
}: { 
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  holdingsCount: number;
}) {
  const isPositive = totalPnl >= 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-slate-500" />
          <span className="text-sm text-slate-400">Portfolio Value</span>
        </div>
        <p className="text-2xl font-bold font-mono">${formatNumber(totalValue)}</p>
      </div>
      
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          {isPositive ? (
            <TrendingUp size={16} className="text-emerald-500" />
          ) : (
            <TrendingDown size={16} className="text-red-500" />
          )}
          <span className="text-sm text-slate-400">Total P&amp;L</span>
        </div>
        <p className={`text-2xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{formatPercent(totalPnlPercent)}
        </p>
        <p className={`text-sm ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          {isPositive ? '+' : ''}${formatNumber(Math.abs(totalPnl))}
        </p>
      </div>
      
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <PieChart size={16} className="text-slate-500" />
          <span className="text-sm text-slate-400">Holdings</span>
        </div>
        <p className="text-2xl font-bold font-mono">{holdingsCount}</p>
        <p className="text-sm text-slate-500">stocks owned</p>
      </div>
      
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-slate-500" />
          <span className="text-sm text-slate-400">24h Change</span>
        </div>
        <p className="text-2xl font-bold font-mono text-emerald-400">+2.4%</p>
        <p className="text-sm text-emerald-400/70">+$48.20</p>
      </div>
    </div>
  );
}

// ============================================================================
// HOLDINGS TABLE (Desktop)
// ============================================================================

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PieChart className="text-slate-600" size={32} />
        </div>
        <h3 className="font-semibold mb-2">No Holdings Yet</h3>
        <p className="text-slate-400 text-sm mb-6">
          Start building your portfolio by investing in AI agents and individuals.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} />
          Explore Stocks
        </Link>
      </div>
    );
  }
  
  return (
    <div className="glass-panel overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm text-slate-400">
        <div className="col-span-4">Stock</div>
        <div className="col-span-2 text-right">Tokens</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-right">Value</div>
        <div className="col-span-2 text-right">P&amp;L</div>
      </div>
      
      {holdings.map((holding) => {
        const isPositive = holding.pnl >= 0;
        const profileUrl = holding.category === 'agent' 
          ? `/agent/${holding.id}` 
          : `/individual/${holding.id}`;
        
        return (
          <Link
            key={`${holding.category}-${holding.id}`}
            href={profileUrl}
            className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
          >
            <div className="col-span-4 flex items-center gap-3">
              <Avatar category={holding.category} size="sm" />
              <div>
                <p className="font-medium">{holding.name}</p>
                <TypeBadge type={holding.type} category={holding.category} />
              </div>
            </div>
            
            <div className="col-span-2 text-right font-mono">
              {formatNumber(holding.tokens)}
            </div>
            
            <div className="col-span-2 text-right">
              <p className="font-mono">${holding.currentPrice.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Score: {holding.currentScore}</p>
            </div>
            
            <div className="col-span-2 text-right font-mono font-semibold">
              ${formatNumber(holding.value)}
            </div>
            
            <div className="col-span-2 text-right">
              <p className={`font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{formatPercent(holding.pnlPercent)}
              </p>
              <p className={`text-xs ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                {isPositive ? '+' : ''}${formatNumber(Math.abs(holding.pnl))}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ============================================================================
// HOLDINGS CARDS (Mobile)
// ============================================================================

function HoldingsCards({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PieChart className="text-slate-600" size={32} />
        </div>
        <h3 className="font-semibold mb-2">No Holdings Yet</h3>
        <p className="text-slate-400 text-sm mb-6">
          Start building your portfolio by investing in AI agents and individuals.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} />
          Explore Stocks
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {holdings.map((holding) => {
        const isPositive = holding.pnl >= 0;
        const profileUrl = holding.category === 'agent' 
          ? `/agent/${holding.id}` 
          : `/individual/${holding.id}`;
        
        return (
          <Link
            key={`${holding.category}-${holding.id}`}
            href={profileUrl}
            className="glass-panel p-4 block hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar category={holding.category} size="sm" />
                <div>
                  <p className="font-medium">{holding.name}</p>
                  <TypeBadge type={holding.type} category={holding.category} />
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Tokens</p>
                <p className="font-mono">{formatNumber(holding.tokens)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Value</p>
                <p className="font-mono font-semibold">${formatNumber(holding.value)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-xs mb-1">P&amp;L</p>
                <p className={`font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{formatPercent(holding.pnlPercent)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 2000);
  };
  
  if (transactions.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="text-slate-600" size={32} />
        </div>
        <h3 className="font-semibold mb-2">No Transactions Yet</h3>
        <p className="text-slate-400 text-sm">
          Your trading history will appear here after your first trade.
        </p>
      </div>
    );
  }
  
  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold">Recent Transactions</h3>
      </div>
      
      <div className="divide-y divide-white/5">
        {transactions.map((tx) => {
          const isBuy = tx.type === 'buy';
          
          return (
            <div key={tx.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isBuy ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {isBuy ? (
                    <ArrowDownRight className="text-emerald-400" size={20} />
                  ) : (
                    <ArrowUpRight className="text-red-400" size={20} />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                    <span className="font-medium">{tx.stockName}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {tx.tokens} tokens @ ${tx.price.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-mono font-semibold ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isBuy ? '-' : '+'}${formatNumber(tx.total)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{tx.timestamp}</span>
                  <button
                    onClick={() => copyTxHash(tx.txHash)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Copy transaction hash"
                  >
                    {copied === tx.txHash ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} className="text-slate-500" />
                    )}
                  </button>
                  <a
                    href={`https://solscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="View on Solscan"
                  >
                    <ExternalLink size={12} className="text-slate-500" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10 text-center">
        <button className="text-cyan-400 text-sm hover:underline inline-flex items-center gap-1">
          View All Transactions
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// WALLET INFO BAR
// ============================================================================

function WalletInfoBar({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const [copied, setCopied] = useState(false);
  
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-white/10">
          <Wallet className="text-cyan-400" size={20} />
        </div>
        <div>
          <p className="text-sm text-slate-400">Connected Wallet</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm">{shortenAddress(address, 6)}</p>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} className="text-slate-500" />
              )}
            </button>
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ExternalLink size={14} className="text-slate-500" />
            </a>
          </div>
        </div>
      </div>
      
      <button
        onClick={onDisconnect}
        className="text-sm text-slate-400 hover:text-white transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PortfolioPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [walletAddress] = useState('7jDVmS8HBdDNdtGXSxepjcktvG6FzbPurZvYUVgY7TG5');
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.avgBuyPrice * h.tokens), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  
  useEffect(() => {
    if (isConnected) {
      loadPortfolioData();
    }
  }, [isConnected]);
  
  const loadPortfolioData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setHoldings([
      {
        id: 1,
        name: 'AlphaBot',
        category: 'agent',
        type: 'trading',
        tokens: 150,
        avgBuyPrice: 0.72,
        currentScore: 85,
        currentPrice: 0.85,
        value: 127.50,
        pnl: 19.50,
        pnlPercent: 18.06
      },
      {
        id: 2,
        name: 'YieldMax',
        category: 'agent',
        type: 'defi',
        tokens: 200,
        avgBuyPrice: 0.45,
        currentScore: 62,
        currentPrice: 0.62,
        value: 124.00,
        pnl: 34.00,
        pnlPercent: 37.78
      },
      {
        id: 3,
        name: 'CryptoWhale',
        category: 'individual',
        type: 'trader',
        tokens: 75,
        avgBuyPrice: 0.90,
        currentScore: 85,
        currentPrice: 0.85,
        value: 63.75,
        pnl: -3.75,
        pnlPercent: -5.56
      },
      {
        id: 4,
        name: 'SolanaShark',
        category: 'agent',
        type: 'trading',
        tokens: 500,
        avgBuyPrice: 0.28,
        currentScore: 34,
        currentPrice: 0.34,
        value: 170.00,
        pnl: 30.00,
        pnlPercent: 21.43
      },
      {
        id: 5,
        name: 'DeFiDev',
        category: 'individual',
        type: 'developer',
        tokens: 100,
        avgBuyPrice: 0.55,
        currentScore: 58,
        currentPrice: 0.58,
        value: 58.00,
        pnl: 3.00,
        pnlPercent: 5.45
      }
    ]);
    
    setTransactions([
      {
        id: '1',
        type: 'buy',
        stockName: 'AlphaBot',
        stockCategory: 'agent',
        tokens: 50,
        price: 0.82,
        total: 41.00,
        timestamp: '2 hours ago',
        txHash: '5KtP9x8Qm'
      },
      {
        id: '2',
        type: 'sell',
        stockName: 'MemeBot',
        stockCategory: 'agent',
        tokens: 100,
        price: 0.15,
        total: 15.00,
        timestamp: '5 hours ago',
        txHash: '3mNp7k2Wv'
      },
      {
        id: '3',
        type: 'buy',
        stockName: 'CryptoWhale',
        stockCategory: 'individual',
        tokens: 75,
        price: 0.90,
        total: 67.50,
        timestamp: '1 day ago',
        txHash: '8xRt2p5Lm'
      },
      {
        id: '4',
        type: 'buy',
        stockName: 'YieldMax',
        stockCategory: 'agent',
        tokens: 200,
        price: 0.45,
        total: 90.00,
        timestamp: '2 days ago',
        txHash: '1qWe3n9Bv'
      },
      {
        id: '5',
        type: 'buy',
        stockName: 'SolanaShark',
        stockCategory: 'agent',
        tokens: 500,
        price: 0.28,
        total: 140.00,
        timestamp: '3 days ago',
        txHash: '7yUi4m3Cx'
      }
    ]);
    
    setLoading(false);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setHoldings([]);
    setTransactions([]);
  };
  
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <ConnectWalletPrompt />
      </div>
    );
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
        <p className="text-slate-400">Track your holdings and trading performance</p>
      </div>
      
      <WalletInfoBar address={walletAddress} onDisconnect={handleDisconnect} />
      
      <PortfolioSummary
        totalValue={totalValue}
        totalPnl={totalPnl}
        totalPnlPercent={totalPnlPercent}
        holdingsCount={holdings.length}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Holdings</h2>
            <button 
              onClick={loadPortfolioData}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="hidden md:block">
            <HoldingsTable holdings={holdings} />
          </div>
          
          <div className="md:hidden">
            <HoldingsCards holdings={holdings} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Activity</h2>
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
      
      <div className="mt-8 glass-panel p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <Plus size={18} />
            Buy More Stocks
          </Link>
          <Link href="/create/agent" className="btn-secondary inline-flex items-center gap-2">
            <Bot size={18} />
            List an Agent
          </Link>
          <Link href="/create/individual" className="btn-secondary inline-flex items-center gap-2">
            <User size={18} />
            List Yourself
          </Link>
        </div>
      </div>
    </div>
  );
}
