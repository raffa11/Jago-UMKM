import React from 'react';
import { Home, List, PieChart, User, Plus, Package, Receipt, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'sales' | 'inventory' | 'customers' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'sales' | 'inventory' | 'customers' | 'profile') => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg font-sans text-white">
      <main className="min-h-screen pb-28 md:max-w-md md:mx-auto md:bg-dark-bg relative overflow-x-hidden">
        {children}
        
        {/* Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass-nav px-6 pt-3 pb-8 flex items-center justify-between z-50 rounded-t-3xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1",
              activeTab === 'dashboard' ? "text-neon-lime" : "text-white/20"
            )}
          >
            <Home className={cn("w-6 h-6", activeTab === 'dashboard' ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] font-medium">Beranda</span>
          </button>
          
          <button
            onClick={() => setActiveTab('sales')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1",
              activeTab === 'sales' ? "text-neon-lime" : "text-white/20"
            )}
          >
            <Receipt className={cn("w-6 h-6", activeTab === 'sales' ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] font-medium">Penjualan</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className="flex flex-col items-center transition-all flex-1 -mt-12"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
              activeTab === 'inventory' 
                ? "bg-neon-lime text-black shadow-neon-lime/20" 
                : "bg-dark-card text-white/20 border border-dark-border"
            )}>
              <Package className={cn("w-6 h-6", activeTab === 'inventory' ? "stroke-[2.5]" : "stroke-2")} />
            </div>
            <span className={cn(
              "text-[10px] font-medium mt-1",
              activeTab === 'inventory' ? "text-neon-lime" : "text-white/20"
            )}>Stok</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1",
              activeTab === 'customers' ? "text-neon-lime" : "text-white/20"
            )}
          >
            <Users className={cn("w-6 h-6", activeTab === 'customers' ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] font-medium">Pelanggan</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1",
              activeTab === 'profile' ? "text-neon-lime" : "text-white/20"
            )}
          >
            <User className={cn("w-6 h-6", activeTab === 'profile' ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
