'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Check, Wallet, Bot, 
  LineChart, MessageCircle, Landmark, Wrench,
  Plus, X, ExternalLink, AlertCircle, Loader2,
  Twitter, Github, Globe, Copy, CheckCircle2
} from 'lucide-react';
import TzurixLogo from '@/components/ui/TzurixLogo';
import { AGENT_TYPES } from '@/lib/constants';
import { AgentType } from '@/types';

// ============================================================================
// STEP INDICATOR - Shows progress through the wizard
// ============================================================================
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    'Connect Wallet',
    'Agent Details', 
    'Register Wallets',
    'Social Accounts',
    'Verification',
    'Review & Pay',
    'Success'
  ];
  
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step Labels (desktop only) */}
      <div className="hidden md:flex justify-between">
        {steps.map((step, i) => (
          <div 
            key={i}
            className={`text-xs transition-colors ${
              i + 1 <= currentStep ? 'text-cyan-400' : 'text-slate-600'
            }`}
          >
            {i + 1}. {step}
          </div>
        ))}
      </div>
      
      {/* Mobile: Current step label */}
      <div className="md:hidden text-center">
        <span className="text-cyan-400 text-sm">
          Step {currentStep} of {totalSteps}: {steps[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1: CONNECT WALLET
// ============================================================================
function Step1ConnectWallet({ onNext }: { onNext: () => void }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  const handleConnect = async () => {
    setConnecting(true);
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    setWalletAddress('7jDVmS8HBdDNdtGXSxepjcktvG6FzbPurZvYUVgY7TG5');
    setConnected(true);
    setConnecting(false);
  };
  
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Wallet className="text-cyan-400" size={40} />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Connect your Solana wallet to create and manage your AI agent stock. 
        This wallet will be the creator wallet and receive trading fees.
      </p>
      
      {!connected ? (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn-primary inline-flex items-center gap-2"
        >
          {connecting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={18} />
              Connect Phantom Wallet
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 size={18} />
            Wallet Connected
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500 mb-1">Creator Wallet</p>
            <p className="font-mono text-sm">{walletAddress}</p>
          </div>
          
          <button onClick={onNext} className="btn-primary">
            Continue
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 2: AGENT DETAILS
// ============================================================================
function Step2AgentDetails({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}: { 
  data: { name: string; type: AgentType; description: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = 'Agent name is required';
    if (data.name.length > 32) newErrors.name = 'Name must be 32 characters or less';
    if (!data.type) newErrors.type = 'Select an agent type';
    if (!data.description.trim()) newErrors.description = 'Description is required';
    if (data.description.length > 280) newErrors.description = 'Description must be 280 characters or less';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validate()) onNext();
  };
  
  const agentTypeOptions = [
    { value: 'trading', label: 'Trading Agent', icon: LineChart, desc: 'Automated trading bots' },
    { value: 'social', label: 'Social Agent', icon: MessageCircle, desc: 'Social media automation' },
    { value: 'defi', label: 'DeFi Agent', icon: Landmark, desc: 'DeFi protocol bots' },
    { value: 'utility', label: 'Utility Agent', icon: Wrench, desc: 'Task automation' },
  ];
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Agent Details</h2>
      <p className="text-slate-400 mb-8">
        Tell us about your AI agent. This information will be displayed on its profile.
      </p>
      
      {/* Agent Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Agent Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Alpha Trading Bot"
          className={`input-field ${errors.name ? 'border-red-500/50' : ''}`}
          maxLength={32}
        />
        <div className="flex justify-between mt-1">
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
          <p className="text-slate-500 text-xs ml-auto">{data.name.length}/32</p>
        </div>
      </div>
      
      {/* Agent Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Agent Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {agentTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = data.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('type', option.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <Icon size={24} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
                <p className={`font-medium mt-2 ${isSelected ? 'text-cyan-400' : ''}`}>
                  {option.label}
                </p>
                <p className="text-xs text-slate-500">{option.desc}</p>
              </button>
            );
          })}
        </div>
        {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
      </div>
      
      {/* Description */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe what your agent does, its strategy, and what makes it unique..."
          className={`input-field min-h-[100px] resize-none ${errors.description ? 'border-red-500/50' : ''}`}
          maxLength={280}
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
          <p className="text-slate-500 text-xs ml-auto">{data.description.length}/280</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <button onClick={handleNext} className="btn-primary inline-flex items-center gap-2">
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: REGISTER WALLETS
// ============================================================================
function Step3RegisterWallets({
  wallets,
  onAddWallet,
  onRemoveWallet,
  onNext,
  onBack
}: {
  wallets: string[];
  onAddWallet: (address: string) => void;
  onRemoveWallet: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [newWallet, setNewWallet] = useState('');
  const [error, setError] = useState('');
  
  const validateSolanaAddress = (address: string) => {
    // Basic Solana address validation (base58, 32-44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };
  
  const handleAddWallet = () => {
    setError('');
    
    if (!newWallet.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (!validateSolanaAddress(newWallet)) {
      setError('Invalid Solana wallet address');
      return;
    }
    
    if (wallets.includes(newWallet)) {
      setError('This wallet is already added');
      return;
    }
    
    if (wallets.length >= 5) {
      setError('Maximum 5 wallets allowed');
      return;
    }
    
    onAddWallet(newWallet);
    setNewWallet('');
  };
  
  const handleNext = () => {
    if (wallets.length === 0) {
      setError('Add at least one wallet to track');
      return;
    }
    onNext();
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Register Agent Wallets</h2>
      <p className="text-slate-400 mb-8">
        Add the wallet addresses that your agent uses for trading. 
        These wallets will be tracked to calculate your agent's performance score.
      </p>
      
      {/* Info Box */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-cyan-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-cyan-400 font-medium">Why register wallets?</p>
            <p className="text-slate-400 mt-1">
              We track your agent's wallets to calculate real performance metrics like P&L, 
              win rate, and trading activity. This data determines your agent's score.
            </p>
          </div>
        </div>
      </div>
      
      {/* Add Wallet Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Add Wallet Address</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            placeholder="Enter Solana wallet address"
            className="input-field flex-1 font-mono text-sm"
          />
          <button
            onClick={handleAddWallet}
            className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      
      {/* Wallet List */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Registered Wallets ({wallets.length}/5)
        </label>
        
        {wallets.length === 0 ? (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center">
            <Wallet className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No wallets added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((wallet, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-mono text-sm truncate max-w-[300px]">{wallet}</span>
                </div>
                <div className="flex items-center gap-2">
                  
                    href={`https://solscan.io/account/${wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => onRemoveWallet(i)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <button onClick={handleNext} className="btn-primary inline-flex items-center gap-2">
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: SOCIAL ACCOUNTS (Optional)
// ============================================================================
function Step4SocialAccounts({
  socials,
  onChange,
  onNext,
  onBack
}: {
  socials: { twitter: string; github: string; website: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Social Accounts</h2>
      <p className="text-slate-400 mb-8">
        Connect social accounts to increase your agent's credibility. This step is optional.
      </p>
      
      {/* Twitter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          <Twitter size={16} className="inline mr-2 text-blue-400" />
          Twitter Handle
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
          <input
            type="text"
            value={socials.twitter}
            onChange={(e) => onChange('twitter', e.target.value)}
            placeholder="youragent"
            className="input-field pl-8"
          />
        </div>
      </div>
      
      {/* GitHub */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          <Github size={16} className="inline mr-2" />
          GitHub Repository
        </label>
        <input
          type="text"
          value={socials.github}
          onChange={(e) => onChange('github', e.target.value)}
          placeholder="https://github.com/your-repo"
          className="input-field"
        />
      </div>
      
      {/* Website */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          <Globe size={16} className="inline mr-2 text-emerald-400" />
          Website
        </label>
        <input
          type="text"
          value={socials.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="https://youragent.com"
          className="input-field"
        />
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <button onClick={onNext} className="btn-primary inline-flex items-center gap-2">
          {socials.twitter || socials.github || socials.website ? 'Continue' : 'Skip'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: VERIFICATION (Optional)
// ============================================================================
function Step5Verification({
  onNext,
  onBack
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [verified, setVerified] = useState(false);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Creator Verification</h2>
      <p className="text-slate-400 mb-8">
        Verify your identity to increase your credibility score. This is optional but recommended.
      </p>
      
      {/* Gitcoin Passport */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
            <Check className="text-emerald-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Gitcoin Passport</h3>
            <p className="text-sm text-slate-400 mb-4">
              Connect your Gitcoin Passport to prove your humanity and boost your reputation score by up to 20%.
            </p>
            {!verified ? (
              <button
                onClick={() => setVerified(true)}
                className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium"
              >
                Connect Gitcoin Passport
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Verified (Score: 24.5)</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Benefits */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-8">
        <p className="text-sm text-cyan-400 font-medium mb-2">Benefits of Verification:</p>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Higher starting reputation score</li>
          <li>• Verified badge on your agent's profile</li>
          <li>• Increased trust from potential investors</li>
        </ul>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <button onClick={onNext} className="btn-primary inline-flex items-center gap-2">
          {verified ? 'Continue' : 'Skip'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: REVIEW & PAY
// ============================================================================
function Step6ReviewPay({
  agentData,
  wallets,
  socials,
  onSubmit,
  onBack,
  isSubmitting
}: {
  agentData: { name: string; type: AgentType; description: string };
  wallets: string[];
  socials: { twitter: string; github: string; website: string };
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const typeConfig = AGENT_TYPES[agentData.type];
  const TypeIcon = typeConfig?.icon || LineChart;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review & Pay</h2>
      <p className="text-slate-400 mb-8">
        Review your agent details and pay the listing fee to create your stock.
      </p>
      
      {/* Agent Summary */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-white/10">
            <Bot className="text-cyan-400" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{agentData.name}</h3>
            <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border mt-1 ${typeConfig?.bg} ${typeConfig?.border} ${typeConfig?.color}`}>
              <TypeIcon size={10} />
              {typeConfig?.label}
            </div>
          </div>
        </div>
        <p className="text-slate-400 text-sm">{agentData.description}</p>
      </div>
      
      {/* Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Tracked Wallets</span>
          <span className="font-medium">{wallets.length} wallet(s)</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Twitter</span>
          <span className="font-medium">{socials.twitter ? `@${socials.twitter}` : 'Not connected'}</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Starting Score</span>
          <span className="font-medium text-cyan-400">10</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Starting Price</span>
          <span className="font-medium">$0.10</span>
        </div>
      </div>
      
      {/* Fee */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Listing Fee</p>
            <p className="text-xs text-slate-500">One-time payment to create stock</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-400">$12</p>
            <p className="text-xs text-slate-500">≈ 0.05 SOL</p>
          </div>
        </div>
      </div>
      
      {/* Note */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-400">
          <strong>Note:</strong> Score updates daily starting tomorrow. Daily score changes are capped at ±10%.
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button 
          onClick={onBack} 
          disabled={isSubmitting}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="btn-primary inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Pay $12 & Create
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 7: SUCCESS
// ============================================================================
function Step7Success({ agentName, agentId }: { agentName: string; agentId: number }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://tzurix.com/agent/${agentId}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="text-center">
      {/* Success Animation */}
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <CheckCircle2 className="text-emerald-400" size={48} />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Agent Created!</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        <strong className="text-white">{agentName}</strong> is now live on Tzurix. 
        Share it with your community and start building your reputation.
      </p>
      
      {/* Share URL */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-md mx-auto mb-6">
        <p className="text-xs text-slate-500 mb-2">Share Link</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent font-mono text-sm outline-none"
          />
          <button
            onClick={copyLink}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      
      {/* Share Buttons */}
      <div className="flex justify-center gap-3 mb-8">
        
          href={`https://twitter.com/intent/tweet?text=I just listed my AI agent "${agentName}" on @Tzurix! Trade reputation, not promises. Check it out: ${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium inline-flex items-center gap-2"
        >
          <Twitter size={16} />
          Share on Twitter
        </a>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link href={`/agent/${agentId}`} className="btn-primary inline-flex items-center justify-center gap-2">
          View Agent Profile
          <ArrowRight size={18} />
        </Link>
        <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function CreateAgentPage() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [agentData, setAgentData] = useState({
    name: '',
    type: 'trading' as AgentType,
    description: ''
  });
  const [wallets, setWallets] = useState<string[]>([]);
  const [socials, setSocials] = useState({
    twitter: '',
    github: '',
    website: ''
  });
  const [createdAgentId, setCreatedAgentId] = useState<number>(0);
  
  // Handlers
  const handleAgentDataChange = (field: string, value: string) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSocialsChange = (field: string, value: string) => {
    setSocials(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddWallet = (address: string) => {
    setWallets(prev => [...prev, address]);
  };
  
  const handleRemoveWallet = (index: number) => {
    setWallets(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate fake agent ID
    setCreatedAgentId(Math.floor(Math.random() * 1000) + 1);
    setIsSubmitting(false);
    setCurrentStep(7);
  };
  
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Back to Home */}
      {currentStep < 7 && (
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <TzurixLogo size={48} />
        </div>
        <h1 className="text-3xl font-bold">List AI Agent</h1>
      </div>
      
      {/* Step Indicator */}
      {currentStep < 7 && (
        <StepIndicator currentStep={currentStep} totalSteps={6} />
      )}
      
      {/* Step Content */}
      <div className="glass-panel p-8">
        {currentStep === 1 && (
          <Step1ConnectWallet onNext={nextStep} />
        )}
        
        {currentStep === 2 && (
          <Step2AgentDetails
            data={agentData}
            onChange={handleAgentDataChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 3 && (
          <Step3RegisterWallets
            wallets={wallets}
            onAddWallet={handleAddWallet}
            onRemoveWallet={handleRemoveWallet}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 4 && (
          <Step4SocialAccounts
            socials={socials}
            onChange={handleSocialsChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 5 && (
          <Step5Verification
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 6 && (
          <Step6ReviewPay
            agentData={agentData}
            wallets={wallets}
            socials={socials}
            onSubmit={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 7 && (
          <Step7Success
            agentName={agentData.name}
            agentId={createdAgentId}
          />
        )}
      </div>
    </div>
  );
      }
