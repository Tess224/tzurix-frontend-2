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
      <body className={`${inter.className} bg-[#02060D] text-white antialiased`}>
        <SessionProvider>
          
          {/* 1. The Fixed Grid Layer */}
          {/* We use z-[-1] to force it behind everything else */}
          <div className="bg-grid-pattern fixed inset-0 z-[-1] pointer-events-none" />

          {/* 2. The Content Layer */}
          {/* This relative wrapper ensures children don't inherit the grid logic */}
          <div className="relative flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>

        </SessionProvider>
      </body>
    </html>
  );
}

