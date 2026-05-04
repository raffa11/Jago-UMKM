import React from 'react';
import { Home, List, PieChart, User, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'transactions' | 'reports' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'reports' | 'profile') => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white overflow-x-hidden">
        {children}
        
        {/* Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex items-center justify-between z-50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'dashboard' ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('transactions')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'transactions' ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <List className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Trans</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'reports' ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <PieChart className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'profile' ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
