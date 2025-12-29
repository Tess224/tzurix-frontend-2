import { LineChart, MessageCircle, Landmark, Wrench, Megaphone, Code, PieChart } from 'lucide-react';

export const AGENT_TYPES = {
  trading: { label: 'Trading', icon: LineChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  social: { label: 'Social', icon: MessageCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  defi: { label: 'DeFi', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  utility: { label: 'Utility', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
} as const;

export const INDIVIDUAL_TYPES = {
  trader: { label: 'Trader', icon: LineChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  influencer: { label: 'Influencer', icon: Megaphone, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  developer: { label: 'Developer', icon: Code, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  analyst: { label: 'Analyst', icon: PieChart, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/create/agent', label: 'Create' },
] as const;

export const SORT_OPTIONS = [
  { value: 'score', label: 'Sort by Score' },
  { value: 'volume', label: 'Sort by Volume' },
  { value: 'holders', label: 'Sort by Holders' },
  { value: 'newest', label: 'Sort by Newest' },
] as const;

export const TIME_RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
] as const;

export const EXTERNAL_LINKS = {
  solscan: (address: string) => `https://solscan.io/account/${address}`,
} as const;
