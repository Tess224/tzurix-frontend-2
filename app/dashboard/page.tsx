'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot, TrendingUp, TrendingDown, Users, DollarSign,
  Activity, RefreshCw, Settings, ArrowRight, Clock,
  AlertCircle, CheckCircle2, XCircle, Upload, ChevronRight,
  BarChart3, Code, Wallet, Plus
} from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { 
  getCreatedAgents, 
  getAgentArenaResults,
  uploadAgentInterface,
  changeAgentTier,
  formatNumber,
  shortenAddress
} from '@/lib/api';
import { TIERS } from '@/lib/constants';
import { CreatorAgent, ArenaResult, TierType } from '@/types';

// ============================================================================
// CONNECT WALLET PROMPT
// ============================================================================
function ConnectPrompt({ onConnect, isLoading }: { onConnect: () => void; isLoading: boolean }) {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Bot className="text-cyan-400" size={48} />
      </div>
      <h1 className="text-2xl font-bold mb-3">Creator Dashboard</h1>
      <p className="text-slate-400 mb-8">
        Connect your wallet to manage your agents, view arena results, and track earnings.
      </p>
      <button
        onClick={onConnect}
        disabled={isLoading}
        className="btn-primary inline-flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet size={18} />
            Connect Wallet
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// STATS CARDS
// ============================================================================
function StatsCards({ agents }: { agents: CreatorAgent[] }) {
  const totalEarnings = agents.reduce((sum, a) => sum + (a.earnings_sol || 0), 0);
  const totalHolders = agents.reduce((sum, a) => sum + (a.holders || 0), 0);
  const totalVolume = agents.reduce((sum, a) => sum + (a.volume_24h || 0), 0);
  const avgScore = agents.length > 0 
    ? agents.reduce((sum, a) => sum + a.current_score, 0) / agents.length 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={16} className="text-cyan-400" />
          <span className="text-sm text-slate-400">My Agents</span>
        </div>
        <p className="text-2xl font-bold">{agents.length}</p>
      </div>
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-emerald-400" />
          <span className="text-sm text-slate-400">Total Earnings</span>
        </div>
        <p className="text-2xl font-bold">{totalEarnings.toFixed(3)} SOL</p>
      </div>
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-purple-400" />
          <span className="text-sm text-slate-400">Total Holders</span>
        </div>
        <p className="text-2xl font-bold">{formatNumber(totalHolders)}</p>
      </div>
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-amber-400" />
          <span className="text-sm text-slate-400">Avg Score</span>
        </div>
        <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
      </div>
    </div>
  );
}

// ============================================================================
// TIER BADGE
// ============================================================================
function TierBadge({ tier }: { tier: TierType }) {
  const config = TIERS[tier];
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${config.bgClass} ${config.textClass}`}>
      {config.emoji} {config.name}
    </span>
  );
}

// ============================================================================
// STATUS BADGE
// ============================================================================
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { icon: typeof CheckCircle2; class: string; label: string }> = {
    ready: { icon: CheckCircle2, class: 'text-emerald-400', label: 'Arena Ready' },
    pending_validation: { icon: Clock, class: 'text-amber-400', label: 'Pending Validation' },
    needs_github: { icon: AlertCircle, class: 'text-red-400', label: 'Needs GitHub' },
  };
  
  const config = configs[status] || configs.needs_github;
  const Icon = config.icon;
  
  return (
    <span className={`flex items-center gap-1 text-xs ${config.class}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// ============================================================================
// AGENT CARD
// ============================================================================
function AgentCard({ 
  agent, 
  onUploadInterface,
  onUpgradeTier 
}: { 
  agent: CreatorAgent;
  onUploadInterface: (agentId: number) => void;
  onUpgradeTier: (agentId: number) => void;
}) {
  const scoreChange = agent.current_score - agent.previous_score;
  const isPositive = scoreChange >= 0;

  return (
    <div className="glass-panel p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <TierBadge tier={agent.tier} />
          </div>
          <StatusBadge status={agent.arena_status} />
        </div>
        <Link 
          href={`/agent/${agent.id}`}
          className="text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* Score */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Score</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{agent.current_score.toFixed(1)}</span>
            <span className="text-xs text-slate-500">/ {agent.score_ceiling}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="font-medium">{isPositive ? '+' : ''}{scoreChange.toFixed(1)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xs text-slate-500">Holders</p>
          <p className="font-medium">{formatNumber(agent.holders || 0)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xs text-slate-500">24h Vol</p>
          <p className="font-medium">${formatNumber(agent.volume_24h || 0)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xs text-slate-500">Earnings</p>
          <p className="font-medium">{(agent.earnings_sol || 0).toFixed(3)}</p>
        </div>
      </div>

      {/* Last Arena */}
      {agent.last_arena_run && (
        <p className="text-xs text-slate-500 mb-4">
          Last arena: {new Date(agent.last_arena_run).toLocaleDateString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!agent.has_github && (
          <button
            onClick={() => onUploadInterface(agent.id)}
            className="flex-1 px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 
              rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors
              flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            Connect GitHub
          </button>
        )}
        {agent.tier !== 'omega' && (
          <button
            onClick={() => onUpgradeTier(agent.id)}
            className="flex-1 px-3 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 
              rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors
              flex items-center justify-center gap-2"
          >
            <TrendingUp size={14} />
            Upgrade Tier
          </button>
        )}
        <Link
          href={`/agent/${agent.id}`}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm 
            hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Settings size={14} />
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// ARENA RESULTS TABLE
// ============================================================================
function ArenaResultsTable({ results }: { results: ArenaResult[] }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No arena results yet. Connect GitHub to start testing.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-2 text-slate-500 font-medium">Date</th>
            <th className="text-left py-3 px-2 text-slate-500 font-medium">Arena</th>
            <th className="text-right py-3 px-2 text-slate-500 font-medium">Score</th>
            <th className="text-right py-3 px-2 text-slate-500 font-medium">Raw</th>
            <th className="text-left py-3 px-2 text-slate-500 font-medium">Templates</th>
            <th className="text-right py-3 px-2 text-slate-500 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 px-2">
                {new Date(result.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-2 capitalize">{result.arena_type}</td>
              <td className="py-3 px-2 text-right font-mono font-medium text-cyan-400">
                {result.score.toFixed(1)}
              </td>
              <td className="py-3 px-2 text-right font-mono text-slate-400">
                {result.raw_score.toFixed(1)}
              </td>
              <td className="py-3 px-2">
                <div className="flex flex-wrap gap-1">
                  {result.templates_run.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white/10 rounded">
                      {t}
                    </span>
                  ))}
                  {result.templates_run.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{result.templates_run.length - 3} more
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 text-right text-slate-400">
                {result.execution_time_ms}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// UPLOAD INTERFACE MODAL
// ============================================================================
function UploadInterfaceModal({
  agentId,
  agentName,
  walletAddress,
  onClose,
  onSuccess
}: {
  agentId: number;
  agentName: string;
  walletAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!code.includes('def decide(')) {
      setError('Code must contain a decide(market_data, portfolio) function');
      return;
    }

    setUploading(true);
    setError('');

    const result = await uploadAgentInterface(agentId, code, walletAddress);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Failed to upload interface');
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Connect GitHub for {agentName}</h2>
          <p className="text-sm text-slate-400 mt-1">
            Paste your decision interface code below
          </p>
        </div>
        
        <div className="p-6">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-[#0a0f1a] border border-white/10 rounded-xl p-4 
              font-mono text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
            placeholder="def decide(market_data: dict, portfolio: dict) -> dict:
    # Your decision logic here
    return {'action': 'hold', 'reason': 'Example'}"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !code}
            className="btn-primary inline-flex items-center gap-2"
          >
            {uploading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UPGRADE TIER MODAL
// ============================================================================
function UpgradeTierModal({
  agent,
  walletAddress,
  onClose,
  onSuccess
}: {
  agent: CreatorAgent;
  walletAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');

  const currentTier = agent.tier;
  const nextTier: TierType = currentTier === 'alpha' ? 'beta' : 'omega';
  const nextTierConfig = TIERS[nextTier];
  const estimatedNewScore = agent.current_score * 0.5; // 50% carry

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError('');

    const result = await changeAgentTier(agent.id, nextTier, walletAddress);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Failed to upgrade tier');
    }
    setUpgrading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Upgrade to {nextTierConfig.name}</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <TierBadge tier={currentTier} />
              <p className="text-2xl font-bold mt-2">{agent.current_score.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Current</p>
            </div>
            <ArrowRight className="text-slate-500" />
            <div className="text-center">
              <TierBadge tier={nextTier} />
              <p className="text-2xl font-bold mt-2">{estimatedNewScore.toFixed(1)}</p>
              <p className="text-xs text-slate-500">After (50% carry)</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-400 font-medium">Score Reduction Warning</p>
                <p className="text-slate-400 mt-1">
                  Upgrading carries only 50% of your current score. Your new score
                  will be approximately {estimatedNewScore.toFixed(1)}.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">New max score:</span>
              <span className="font-medium">{nextTierConfig.maxScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Difficulty:</span>
              <span className="font-medium">{nextTierConfig.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Upgrade fee:</span>
              <span className="font-medium">$5.00</span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4 flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="btn-primary inline-flex items-center gap-2"
          >
            {upgrading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Upgrading...
              </>
            ) : (
              <>
                <TrendingUp size={16} />
                Upgrade for $5
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================
export default function DashboardPage() {
  const { session, isConnected, connect, isLoading: sessionLoading } = useSession();
  
  const [agents, setAgents] = useState<CreatorAgent[]>([]);
  const [arenaResults, setArenaResults] = useState<ArenaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [uploadModalAgent, setUploadModalAgent] = useState<number | null>(null);
  const [upgradeModalAgent, setUpgradeModalAgent] = useState<CreatorAgent | null>(null);

  // Fetch data
  const fetchData = async () => {
    if (!session?.walletAddress) return;
    
    try {
      const agentsData = await getCreatedAgents(session.walletAddress);
      setAgents(agentsData);

      // Fetch arena results for first agent (or all)
      if (agentsData.length > 0) {
        const results = await getAgentArenaResults(agentsData[0].id, 10);
        setArenaResults(results);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && session?.walletAddress) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isConnected, session?.walletAddress]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <ConnectPrompt onConnect={connect} isLoading={sessionLoading} />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-cyan-400" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-slate-400">
            Manage your agents and track performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link href="/create/agent" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            Create Agent
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsCards agents={agents} />

      {/* No agents state */}
      {agents.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Bot size={48} className="text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Agents Yet</h2>
          <p className="text-slate-400 mb-6">
            Create your first agent to start earning from trading fees.
          </p>
          <Link href="/create/agent" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            Create Your First Agent
          </Link>
        </div>
      ) : (
        <>
          {/* Agent Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">My Agents</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onUploadInterface={setUploadModalAgent}
                  onUpgradeTier={() => setUpgradeModalAgent(agent)}
                />
              ))}
            </div>
          </div>

          {/* Arena Results */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Arena Results</h2>
            <ArenaResultsTable results={arenaResults} />
          </div>
        </>
      )}

      {/* Modals */}
      {uploadModalAgent && (
        <UploadInterfaceModal
          agentId={uploadModalAgent}
          agentName={agents.find(a => a.id === uploadModalAgent)?.name || 'Agent'}
          walletAddress={session?.walletAddress || ''}
          onClose={() => setUploadModalAgent(null)}
          onSuccess={fetchData}
        />
      )}

      {upgradeModalAgent && (
        <UpgradeTierModal
          agent={upgradeModalAgent}
          walletAddress={session?.walletAddress || ''}
          onClose={() => setUpgradeModalAgent(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
                    }
