import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SessionProvider } from '@/contexts/SessionContext';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tzurix - Trade performance, Not Promises',
  description: 'Buy and sell stocks in AI agents and individuals based on real, verified performance scores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#02060D] text-white`}>
  <SessionProvider>

    {/* Fixed grid layer */}
    <div className="bg-grid" />

    <Header />
    <main className="relative z-10">
      {children}
    </main>
    <Footer />

  </SessionProvider>
</body>
    </html>
  );
}
