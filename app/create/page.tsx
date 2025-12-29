'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bot, User, LineChart, MessageCircle, Landmark, Wrench, Code, BarChart3 } from 'lucide-react';
import TzurixLogo from '@/components/ui/TzurixLogo';

export default function CreatePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>
      
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <TzurixLogo size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-3">Create a Reputation Stock</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          List an AI agent or yourself on Tzurix. Let the community invest in proven performance, not empty promises.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* List AI Agent Card */}
        <Link 
          href="/create/agent"
          className="glass-panel p-8 hover:border-cyan-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Bot className="text-cyan-400" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">List AI Agent</h2>
          <p className="text-slate-400 mb-6">
            Register your trading bot, DeFi agent, social bot, or utility agent. 
            We track wallet performance to calculate a real-time reputation score.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <LineChart size={12} />
              Trading
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <MessageCircle size={12} />
              Social
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Landmark size={12} />
              DeFi
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wrench size={12} />
              Utility
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">$12 listing fee</span>
            <span className="text-cyan-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Get Started
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>
        
        {/* List Yourself Card */}
        <Link 
          href="/create/individual"
          className="glass-panel p-8 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="text-emerald-400" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">List Yourself</h2>
          <p className="text-slate-400 mb-6">
            Are you a trader, influencer, developer, or analyst? 
            Create your personal reputation stock and let others invest in your success.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <LineChart size={12} />
              Trader
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400">
              <MessageCircle size={12} />
              Influencer
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Code size={12} />
              Developer
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <BarChart3 size={12} />
              Analyst
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">$12 listing fee</span>
            <span className="text-emerald-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Get Started
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </div>
      
      {/* Info Section */}
      <div className="mt-12 glass-panel p-6">
        <h3 className="font-semibold mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold mb-3">1</div>
            <p className="font-medium mb-1">Create Your Stock</p>
            <p className="text-slate-400">Pay a one-time $12 listing fee to create your reputation stock on Solana.</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold mb-3">2</div>
            <p className="font-medium mb-1">Build Your Score</p>
            <p className="text-slate-400">Your score updates daily based on real performance, engagement, and trust metrics.</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold mb-3">3</div>
            <p className="font-medium mb-1">Earn From Trading</p>
            <p className="text-slate-400">As your reputation grows, so does your stock price. Earn fees when others trade your stock.</p>
          </div>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="mt-8 glass-panel p-6">
        <h3 className="font-semibold mb-4">Common Questions</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-1">What determines my score?</p>
            <p className="text-slate-400">For agents: wallet performance, trading metrics, and holder trust. For individuals: social engagement, verified track record, and community reputation.</p>
          </div>
          <div>
            <p className="font-medium mb-1">How does pricing work?</p>
            <p className="text-slate-400">Price equals Score multiplied by $0.01. A score of 85 means a token price of $0.85. Scores are capped at plus or minus 10% change per day to prevent manipulation.</p>
          </div>
          <div>
            <p className="font-medium mb-1">What happens to my listing fee?</p>
            <p className="text-slate-400">The $12 fee covers on-chain deployment costs and platform maintenance. There are no ongoing fees after listing.</p>
          </div>
        </div>
      </div>
    </div>
  );
        }
