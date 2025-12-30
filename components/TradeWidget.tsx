// components/TradeWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { buyTokens, sellTokens, formatNumber } from '@/lib/api';
import { AgentStock } from '@/types';

// For MVP testing - generate a random mock wallet address
function getMockWallet(): string {
  // Check if we already have a mock wallet in localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tzurix_mock_wallet');
    if (stored) return stored;
    
    // Generate a new one
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let wallet = '';
    for (let i = 0; i < 44; i++) {
      wallet += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem('tzurix_mock_wallet', wallet);
    return wallet;
  }
  return 'MockWallet' + Math.random().toString(36).substring(7);
}

interface TradeWidgetProps {
  agent: AgentStock;
  onTradeComplete?: () => void;
}

type TradeStatus = 'idle' | 'loading' | 'success' | 'error';

export default function TradeWidget({ agent, onTradeComplete }: TradeWidgetProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TradeStatus>('idle');
  const [message, setMessage] = useState('');
  const [mockWallet, setMockWallet] = useState<string>('');
  
  // Price calculation
  const price = agent.current_score * 0.01; // Price per 1K tokens in USD
  const tokenAmount = parseFloat(amount || '0');
  const total = tokenAmount * price / 1000; // Actual cost (since price is per 1K)
  
  // For sell - estimate SOL received (simplified)
  const solEstimate = tradeType === 'sell' ? tokenAmount * (price / 150 / 1000) : 0; // Rough USD to SOL conversion
  
  useEffect(() => {
    setMockWallet(getMockWallet());
  }, []);
  
  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus('error');
      setMessage('Please enter a valid amount');
      return;
    }
    
    setStatus('loading');
    setMessage('');
    
    try {
      let result;
      
      if (tradeType === 'buy') {
        // For buy, we pass SOL amount - let's convert USD to SOL (assuming ~$150/SOL)
        const solAmount = total / 150;
        
        result = await buyTokens({
          agentId: agent.id,
          traderWallet: mockWallet,
          solAmount: solAmount,
        });
      } else {
        // For sell, we pass token amount
        result = await sellTokens({
          agentId: agent.id,
          traderWallet: mockWallet,
          tokenAmount: parseInt(amount),
        });
      }
      
      if (result.success) {
        setStatus('success');
        setMessage(
          tradeType === 'buy'
            ? `Successfully bought ${formatNumber(result.trade?.token_amount || 0)} tokens!`
            : `Successfully sold ${formatNumber(result.trade?.token_amount || 0)} tokens!`
        );
        setAmount('');
        
        // Callback to refresh agent data
        if (onTradeComplete) {
          setTimeout(onTradeComplete, 1500);
        }
      } else {
        setStatus('error');
        setMessage(result.error || 'Trade failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      console.error('Trade error:', error);
    }
  };
  
  const resetStatus = () => {
    if (status !== 'loading') {
      setStatus('idle');
      setMessage('');
    }
  };
  
  return (
    <div className="glass-panel p-6">
      <h3 className="font-semibold mb-4">Trade</h3>
      
      {/* Buy/Sell Toggle */}
      <div className="flex bg-white/5 rounded-xl p-1 mb-4">
        <button
          onClick={() => { setTradeType('buy'); resetStatus(); }}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            tradeType === 'buy' 
              ? 'bg-emerald-500 text-black' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp size={16} />
          Buy
        </button>
        <button
          onClick={() => { setTradeType('sell'); resetStatus(); }}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            tradeType === 'sell' 
              ? 'bg-red-500 text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingDown size={16} />
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
          <span>per 1,000 tokens</span>
          <span>Score {agent.current_score} × $0.01</span>
        </div>
      </div>
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">
          {tradeType === 'buy' ? 'Tokens to Buy' : 'Tokens to Sell'}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); resetStatus(); }}
          placeholder="0"
          min="0"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-lg font-mono focus:outline-none focus:border-cyan-500/50"
        />
        
        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-2">
          {[1000, 5000, 10000, 50000].map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className="flex-1 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {formatNumber(preset)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Total Display */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">
            {tradeType === 'buy' ? 'Total Cost' : 'You Receive'}
          </span>
          <div className="text-right">
            <span className="font-mono text-xl font-bold">
              ${total.toFixed(2)}
            </span>
            {tradeType === 'sell' && tokenAmount > 0 && (
              <p className="text-xs text-slate-500">≈ {solEstimate.toFixed(4)} SOL</p>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
          <span>Fee (1%)</span>
          <span>${(total * 0.01).toFixed(2)}</span>
        </div>
      </div>
      
      {/* Status Messages */}
      {status === 'success' && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400">
          <Check size={18} />
          <span className="text-sm">{message}</span>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{message}</span>
        </div>
      )}
      
      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={status === 'loading' || !amount || parseFloat(amount) <= 0}
        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          tradeType === 'buy' 
            ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
            : 'bg-red-500 hover:bg-red-400 text-white'
        }`}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {agent.name}
          </>
        )}
      </button>
      
      {/* Mock Wallet Info */}
      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
        <p className="text-xs text-cyan-400 font-medium mb-1">🧪 Testnet Mode</p>
        <p className="text-xs text-slate-400">
          Using mock wallet for testing. No real funds needed.
        </p>
        <p className="text-xs text-slate-500 font-mono mt-1 truncate">
          {mockWallet.slice(0, 8)}...{mockWallet.slice(-8)}
        </p>
      </div>
    </div>
  );
    }
