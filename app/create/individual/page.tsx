'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Check, Wallet, User,
  LineChart, MessageCircle, Code, BarChart3,
  AlertCircle, Loader2,
  Twitter, Github, Globe, Copy, CheckCircle2
} from 'lucide-react';
import TzurixLogo from '@/components/ui/TzurixLogo';
import { INDIVIDUAL_TYPES } from '@/lib/constants';
import { IndividualType } from '@/types';

// ============================================================================
// STEP INDICATOR
// ============================================================================

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    'Connect Wallet',
    'Your Details', 
    'Social Verification',
    'Track Record',
    'Review & Pay',
    'Success'
  ];
  
  return (
    <div className="mb-8">
      <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
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
        Connect your Solana wallet to create your performance stock. 
        This wallet will receive trading fees when others trade your stock.
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
            <p className="text-xs text-slate-500 mb-1">Your Wallet</p>
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
// STEP 2: YOUR DETAILS
// ============================================================================

function Step2YourDetails({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}: { 
  data: { name: string; type: IndividualType; bio: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = 'Display name is required';
    if (data.name.length > 32) newErrors.name = 'Name must be 32 characters or less';
    if (!data.type) newErrors.type = 'Select your category';
    if (!data.bio.trim()) newErrors.bio = 'Bio is required';
    if (data.bio.length > 280) newErrors.bio = 'Bio must be 280 characters or less';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validate()) onNext();
  };
  
  const typeOptions = [
    { value: 'trader', label: 'Trader', icon: LineChart, desc: 'Active crypto trader' },
    { value: 'influencer', label: 'Influencer', icon: MessageCircle, desc: 'Content creator / KOL' },
    { value: 'developer', label: 'Developer', icon: Code, desc: 'Builder / Engineer' },
    { value: 'analyst', label: 'Analyst', icon: BarChart3, desc: 'Research / Analysis' },
  ];
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Your Details</h2>
      <p className="text-slate-400 mb-8">
        Tell us about yourself. This information will be displayed on your public profile.
      </p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Display Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., CryptoWhale"
          className={`input-field ${errors.name ? 'border-red-500/50' : ''}`}
          maxLength={32}
        />
        <div className="flex justify-between mt-1">
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
          <p className="text-slate-500 text-xs ml-auto">{data.name.length}/32</p>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {typeOptions.map((option) => {
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
      
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Bio <span className="text-red-400">*</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="Tell people about yourself, your expertise, and what makes you unique..."
          className={`input-field min-h-[100px] resize-none ${errors.bio ? 'border-red-500/50' : ''}`}
          maxLength={280}
        />
        <div className="flex justify-between mt-1">
          {errors.bio && <p className="text-red-400 text-xs">{errors.bio}</p>}
          <p className="text-slate-500 text-xs ml-auto">{data.bio.length}/280</p>
        </div>
      </div>
      
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
// STEP 3: SOCIAL VERIFICATION
// ============================================================================

function Step3SocialVerification({
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
  const [twitterVerified, setTwitterVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const handleVerifyTwitter = async () => {
    if (!socials.twitter) return;
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTwitterVerified(true);
    setVerifying(false);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Social Verification</h2>
      <p className="text-slate-400 mb-8">
        Verify your social accounts to build credibility. At least Twitter verification is required.
      </p>
      
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-cyan-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-cyan-400 font-medium">Why verify?</p>
            <p className="text-slate-400 mt-1">
              Verified accounts start with a higher performance score and display a verified badge. 
              This builds trust with potential investors.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          <Twitter size={16} className="inline mr-2 text-blue-400" />
          Twitter Handle <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
            <input
              type="text"
              value={socials.twitter}
              onChange={(e) => {
                onChange('twitter', e.target.value);
                setTwitterVerified(false);
              }}
              placeholder="yourusername"
              className="input-field pl-8"
              disabled={twitterVerified}
            />
          </div>
          {!twitterVerified ? (
            <button
              onClick={handleVerifyTwitter}
              disabled={!socials.twitter || verifying}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors font-medium disabled:opacity-50"
            >
              {verifying ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          ) : (
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={18} />
              Verified
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          We will verify ownership by checking for a verification tweet.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          <Github size={16} className="inline mr-2" />
          GitHub Profile (Optional)
        </label>
        <input
          type="text"
          value={socials.github}
          onChange={(e) => onChange('github', e.target.value)}
          placeholder="https://github.com/yourusername"
          className="input-field"
        />
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          <Globe size={16} className="inline mr-2 text-emerald-400" />
          Website (Optional)
        </label>
        <input
          type="text"
          value={socials.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="https://yourwebsite.com"
          className="input-field"
        />
      </div>
      
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!twitterVerified}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: TRACK RECORD
// ============================================================================

function Step4TrackRecord({
  trackRecord,
  onChange,
  onNext,
  onBack
}: {
  trackRecord: { tradingWallet: string; portfolioLink: string; experience: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Track Record</h2>
      <p className="text-slate-400 mb-8">
        Optionally provide evidence of your track record. This helps establish your starting score.
      </p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Public Trading Wallet (Optional)
        </label>
        <input
          type="text"
          value={trackRecord.tradingWallet}
          onChange={(e) => onChange('tradingWallet', e.target.value)}
          placeholder="Enter Solana wallet address"
          className="input-field font-mono text-sm"
        />
        <p className="text-xs text-slate-500 mt-2">
          If you are a trader, link a public wallet to verify your trading history.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Portfolio / Work Link (Optional)
        </label>
        <input
          type="text"
          value={trackRecord.portfolioLink}
          onChange={(e) => onChange('portfolioLink', e.target.value)}
          placeholder="https://yourportfolio.com"
          className="input-field"
        />
        <p className="text-xs text-slate-500 mt-2">
          Link to your portfolio, published research, or previous work.
        </p>
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Experience Summary (Optional)
        </label>
        <textarea
          value={trackRecord.experience}
          onChange={(e) => onChange('experience', e.target.value)}
          placeholder="Describe your relevant experience, achievements, or credentials..."
          className="input-field min-h-[100px] resize-none"
          maxLength={500}
        />
        <div className="flex justify-end mt-1">
          <p className="text-slate-500 text-xs">{trackRecord.experience.length}/500</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
        <p className="text-sm text-slate-400">
          <strong className="text-white">Note:</strong> All individuals start with a base score of 10. 
          Your score will increase based on verified track record, social engagement, and community trust over time.
        </p>
      </div>
      
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <button onClick={onNext} className="btn-primary inline-flex items-center gap-2">
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: REVIEW & PAY
// ============================================================================

function Step5ReviewPay({
  userData,
  socials,
  onSubmit,
  onBack,
  isSubmitting
}: {
  userData: { name: string; type: IndividualType; bio: string };
  socials: { twitter: string; github: string; website: string };
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const typeConfig = INDIVIDUAL_TYPES[userData.type];
  const TypeIcon = typeConfig?.icon || User;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review and Pay</h2>
      <p className="text-slate-400 mb-8">
        Review your details and pay the listing fee to create your performance stock.
      </p>
      
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-xl flex items-center justify-center border border-white/10">
            <User className="text-emerald-400" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{userData.name}</h3>
            <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border mt-1 ${typeConfig?.bg} ${typeConfig?.border} ${typeConfig?.color}`}>
              <TypeIcon size={10} />
              {typeConfig?.label}
            </div>
          </div>
        </div>
        <p className="text-slate-400 text-sm">{userData.bio}</p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Twitter</span>
          <span className="font-medium text-blue-400">@{socials.twitter}</span>
        </div>
        {socials.github && (
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="text-slate-400">GitHub</span>
            <span className="font-medium">{socials.github}</span>
          </div>
        )}
        {socials.website && (
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="text-slate-400">Website</span>
            <span className="font-medium">{socials.website}</span>
          </div>
        )}
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Starting Score</span>
          <span className="font-medium text-cyan-400">10</span>
        </div>
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-slate-400">Starting Price</span>
          <span className="font-medium">$0.10</span>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Listing Fee</p>
            <p className="text-xs text-slate-500">One-time payment to create stock</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-400">$12</p>
            <p className="text-xs text-slate-500">Approximately 0.05 SOL</p>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-400">
          <strong>Note:</strong> Your score will update daily based on your social engagement, 
          trading performance (if applicable), and community trust. Daily changes are capped at plus or minus 10%.
        </p>
      </div>
      
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
              Pay $12 and Create
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: SUCCESS
// ============================================================================

function Step6Success({ userName, individualId }: { userName: string; individualId: number }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://tzurix.com/individual/${individualId}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <CheckCircle2 className="text-emerald-400" size={48} />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">You are Listed!</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        <strong className="text-white">{userName}</strong> is now live on Tzurix. 
        Share your profile with your community and let them invest in your success.
      </p>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-md mx-auto mb-6">
        <p className="text-xs text-slate-500 mb-2">Your Profile Link</p>
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
      
      <div className="flex justify-center gap-3 mb-8">
        <a
          href={`https://twitter.com/intent/tweet?text=I just listed myself on @Tzurix! Now you can invest in my performance. Check out my profile: ${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium inline-flex items-center gap-2"
        >
          <Twitter size={16} />
          Share on Twitter
        </a>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link href={`/individual/${individualId}`} className="btn-primary inline-flex items-center justify-center gap-2">
          View Your Profile
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

export default function CreateIndividualPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userData, setUserData] = useState({
    name: '',
    type: 'trader' as IndividualType,
    bio: ''
  });
  const [socials, setSocials] = useState({
    twitter: '',
    github: '',
    website: ''
  });
  const [trackRecord, setTrackRecord] = useState({
    tradingWallet: '',
    portfolioLink: '',
    experience: ''
  });
  const [createdId, setCreatedId] = useState<number>(0);
  
  const handleUserDataChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSocialsChange = (field: string, value: string) => {
    setSocials(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTrackRecordChange = (field: string, value: string) => {
    setTrackRecord(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCreatedId(Math.floor(Math.random() * 1000) + 1);
    setIsSubmitting(false);
    setCurrentStep(6);
  };
  
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {currentStep < 6 && (
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      )}
      
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <TzurixLogo size={48} />
        </div>
        <h1 className="text-3xl font-bold">List Yourself</h1>
        <p className="text-slate-400 mt-2">Create your performance stock</p>
      </div>
      
      {currentStep < 6 && (
        <StepIndicator currentStep={currentStep} totalSteps={5} />
      )}
      
      <div className="glass-panel p-8">
        {currentStep === 1 && (
          <Step1ConnectWallet onNext={nextStep} />
        )}
        
        {currentStep === 2 && (
          <Step2YourDetails
            data={userData}
            onChange={handleUserDataChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 3 && (
          <Step3SocialVerification
            socials={socials}
            onChange={handleSocialsChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 4 && (
          <Step4TrackRecord
            trackRecord={trackRecord}
            onChange={handleTrackRecordChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 5 && (
          <Step5ReviewPay
            userData={userData}
            socials={socials}
            onSubmit={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 6 && (
          <Step6Success
            userName={userData.name}
            individualId={createdId}
          />
        )}
      </div>
    </div>
  );
}