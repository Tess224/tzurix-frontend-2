'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ExternalLink, Copy, Check, RefreshCw, PieChart, Activity,
  Bot, User, ChevronRight, Clock, DollarSign,
  Plus, AlertCircle
} from 'lucide-react';
import { TypeBadge, Avatar, LoadingSpinner } from '@/components/ui';
import { AgentType, IndividualType } from '@/types';
import { 
  getUserHoldings, 
  getUserTransactions,
  shortenAddress, 
  formatNumber, 
  formatPercent,
  formatTimeAgo,
  UserTransaction
} from '@/lib/api';

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
  id: number;
  type: 'buy' | 'sell';
  agentId: number;
  stockName: string;
  stockCategory: 'agent' | 'individual';
  tokens: number;
  solAmount: number;
  price: number;
  score: number | null;
  timestamp: string;
  txHash: string | null;
}

// ============================================================================
// GET MOCK WALLET (same as TradeWidget)
// ============================================================================

function getMockWallet(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tzurix_mock_wallet');
    if (stored) return stored;
    
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let wallet = '';
    for (let i = 0; i < 44; i++) {
      wallet += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem('tzurix_mock_wallet', wallet);
    return wallet;
  }
  return '';
}

// ============================================================================
// CONNECT WALLET PROMPT
// ============================================================================

function ConnectWalletPrompt({ onConnect }: { onConnect: () => void }) {
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = async () => {
    setConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onConnect();
    setConnecting(false);
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
        <p className="text-2xl font-bold font-mono text-slate-400">--</p>
        <p className="text-sm text-slate-500">Coming soon</p>
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
            className="glass-panel p-4 block"
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
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Tokens</p>
                <p className="font-mono">{formatNumber(holding.tokens)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Value</p>
                <p className="font-mono">${formatNumber(holding.value)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-xs">P&L</p>
                <p className={`font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
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
// TRANSACTION HISTORY (FIXED!)
// ============================================================================

function TransactionHistory({ 
  transactions, 
  loading 
}: { 
  transactions: Transaction[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="glass-panel p-6 text-center">
        <RefreshCw className="mx-auto text-cyan-400 mb-2 animate-spin" size={24} />
        <p className="text-slate-500 text-sm">Loading transactions...</p>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="glass-panel p-6 text-center">
        <Clock className="mx-auto text-slate-600 mb-2" size={24} />
        <p className="text-slate-500 text-sm">No transactions yet</p>
        <p className="text-slate-600 text-xs mt-1">Your buy/sell activity will appear here</p>
      </div>
    );
  }
  
  return (
    <div className="glass-panel divide-y divide-white/5">
      {transactions.map((tx) => (
        <div key={tx.id} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {tx.type === 'buy' ? (
                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <ArrowDownRight size={14} className="text-emerald-400" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <ArrowUpRight size={14} className="text-red-400" />
                </div>
              )}
              <span className={`text-sm font-medium ${tx.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.type === 'buy' ? 'Bought' : 'Sold'}
              </span>
            </div>
            <span className="text-xs text-slate-500">{tx.timestamp}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href={`/agent/${tx.agentId}`}
                className="font-medium hover:text-cyan-400 transition-colors"
              >
                {tx.stockName}
              </Link>
              <p className="text-xs text-slate-500">
                {formatNumber(tx.tokens)} tokens @ ${tx.price.toFixed(4)}
                {tx.score && <span className="ml-2">(Score: {tx.score})</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono font-medium">{tx.solAmount.toFixed(4)} SOL</p>
              {tx.txHash ? (
                <a
                  href={`https://solscan.io/tx/${tx.txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  {tx.txHash.slice(0, 8)}...
                  <ExternalLink size={10} />
                </a>
              ) : (
                <span className="text-xs text-slate-500">Testnet</span>
              )}
            </div>
          </div>
        </div>
      ))}
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
          <Wallet className="text-cyan-400" size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500">Connected Wallet</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{shortenAddress(address, 6)}</span>
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
              href={`https://solscan.io/account/${address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ExternalLink size={14} className="text-slate-500" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Testnet Badge */}
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <span className="text-xs text-cyan-400">🧪 Testnet Mode</span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PortfolioPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.avgBuyPrice * h.tokens), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  
  // Check for existing mock wallet on mount
  useEffect(() => {
    const mockWallet = getMockWallet();
    if (mockWallet) {
      setWalletAddress(mockWallet);
      setIsConnected(true);
    } else {
      setLoading(false);
    }
  }, []);
  
  // Load portfolio data when connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadPortfolioData();
      loadTransactions();
    }
  }, [isConnected, walletAddress]);
  
  const loadPortfolioData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real holdings from backend
      const holdingsResponse = await getUserHoldings(walletAddress);
      
      if (holdingsResponse && holdingsResponse.holdings && holdingsResponse.holdings.length > 0) {
        // Transform backend data to frontend format
        const transformedHoldings: Holding[] = holdingsResponse.holdings.map((h) => ({
          id: h.agent_id,
          name: h.agent_name || `Agent #${h.agent_id}`,
          category: 'agent' as const,
          type: 'trading' as AgentType,
          tokens: h.token_amount,
          avgBuyPrice: h.avg_buy_price_sol * 150,
          currentScore: Math.round(h.current_price_usd / 0.01),
          currentPrice: h.current_price_usd,
          value: h.current_value_usd,
          pnl: h.current_value_usd - (h.avg_buy_price_sol * 150 * h.token_amount),
          pnlPercent: h.pnl_percent,
        }));
        
        setHoldings(transformedHoldings);
      } else {
        setHoldings([]);
      }
      
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Failed to load portfolio data. Please try again.');
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadTransactions = async () => {
    setTxLoading(true);
    
    try {
      // Fetch transactions from backend
      const txResponse = await getUserTransactions(walletAddress, { limit: 20 });
      
      if (txResponse && txResponse.transactions && txResponse.transactions.length > 0) {
        // Transform backend data to frontend format
        const transformedTx: Transaction[] = txResponse.transactions.map((tx) => ({
          id: tx.id,
          type: tx.side,
          agentId: tx.agent_id,
          stockName: tx.agent_name || `Agent #${tx.agent_id}`,
          stockCategory: 'agent' as const,
          tokens: tx.token_amount,
          solAmount: tx.sol_amount_display,
          price: tx.price_at_trade,
          score: tx.score_at_trade,
          timestamp: formatTimeAgo(tx.created_at),
          txHash: tx.tx_signature,
        }));
        
        setTransactions(transformedTx);
      } else {
        setTransactions([]);
      }
      
    } catch (err) {
      console.error('Error loading transactions:', err);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };
  
  const handleConnect = () => {
    const wallet = getMockWallet();
    setWalletAddress(wallet);
    setIsConnected(true);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setHoldings([]);
    setTransactions([]);
  };
  
  const handleRefresh = () => {
    loadPortfolioData();
    loadTransactions();
  };
  
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <ConnectWalletPrompt onConnect={handleConnect} />
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
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={handleRefresh}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      
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
              onClick={handleRefresh}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Activity</h2>
            <span className="text-xs text-slate-500">{transactions.length} trades</span>
          </div>
          <TransactionHistory transactions={transactions} loading={txLoading} />
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