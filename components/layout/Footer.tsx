import Link from 'next/link';
import TzurixLogo from '@/components/ui/TzurixLogo';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <TzurixLogo size={28} />
            <span className="font-bold">TZURIX</span>
          </Link>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <div className="text-xs text-slate-600">© 2025 Tzurix. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
