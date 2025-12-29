import { AgentStock, IndividualStock, DailyScore } from '@/types';

// ⚠️ CHANGE THIS TO YOUR RAILWAY BACKEND URL
export const API_BASE = 'https://tzurix.up.railway.app';

// Fetch wrapper
async function fetchApi<T>(endpoint: string): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    return { success: false, error: 'Failed to fetch data' };
  }
}

// Agent APIs
export async function getAgents(): Promise<AgentStock[]> {
  const response = await fetchApi<{ agents: AgentStock[] }>('/api/agents');
  return response.data?.agents || [];
}

export async function getAgent(id: string): Promise<AgentStock | null> {
  const response = await fetchApi<{ agent: AgentStock }>(`/api/agents/${id}`);
  return response.data?.agent || null;
}

// Individual APIs
export async function getIndividuals(): Promise<IndividualStock[]> {
  const response = await fetchApi<{ individuals: IndividualStock[] }>('/api/individuals');
  return response.data?.individuals || [];
}

export async function getIndividual(id: string): Promise<IndividualStock | null> {
  const response = await fetchApi<{ individual: IndividualStock }>(`/api/individuals/${id}`);
  return response.data?.individual || null;
}

// Format helpers
export function formatPrice(score: number): string {
  return `$${(score * 0.01).toFixed(2)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
