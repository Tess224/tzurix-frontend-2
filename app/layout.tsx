import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tzurix - Trade Reputation, Not Promises',
  description: 'Buy and sell stocks in AI agents and individuals based on real, verified performance scores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#02060D] text-white`}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-900/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-radial from-cyan-900/10 via-transparent to-transparent blur-3xl" />
        </div>
        
        <Header />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
