'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import TzurixLogo from '@/components/ui/TzurixLogo';
import { useSession } from '@/contexts/SessionContext';
import { shortenAddress } from '@/lib/api';
import { NAV_LINKS } from '@/lib/constants';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, walletAddress, connect, disconnect, isLoading } = useSession();
  const pathname = usePathname();

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <TzurixLogo size={36} />
          <span className="text-xl font-bold tracking-tight">TZURIX</span>
        </Link>
        
        <div className="hidden md:flex gap-8 text-sm text-slate-400">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`hover:text-white transition-colors ${pathname === link.href ? 'text-cyan-400' : ''}`}>
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          
          {isConnected ? (
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/dashboard"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={disconnect}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                {shortenAddress(walletAddress || '', 4)}
              </button>
            </div>
          ) : (
            <button 
              onClick={connect}
              disabled={isLoading}
              className="hidden md:block px-5 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors text-sm disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#02060D]/95 backdrop-blur-xl pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-4 text-lg">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={`py-3 border-b border-white/10 ${pathname === link.href ? 'text-cyan-400' : 'text-slate-400'}`} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button className="mt-4 w-full py-3 bg-cyan-500 text-black font-bold rounded-xl">Connect Wallet</button>
          </div>
        </div>
      )}
    </>
  );
      }
