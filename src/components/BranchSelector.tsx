import React from 'react';
import { Branch } from '../types';
import { Building2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BranchSelectorProps {
  branches: Branch[];
  activeBranchId: string | undefined;
  onSelect: (id: string) => void;
  onManage: () => void;
}

export function BranchSelector({ branches, activeBranchId, onSelect, onManage }: BranchSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const activeBranch = branches.find(b => b.id === activeBranchId);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 glass-pill py-2.5 px-5 group active:scale-95 transition-all"
      >
        <div className="w-6 h-6 rounded-lg bg-neon-lime flex items-center justify-center text-dark-bg shadow-lg shadow-neon-lime/20 group-hover:scale-110 transition-transform">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-medium text-white/40 leading-none mb-1">Toko aktif</p>
          <span className="text-xs font-bold text-white block truncate max-w-[100px]">{activeBranch?.name || 'Pilih cabang'}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-full right-0 mt-3 w-64 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-2 z-50"
          >
            <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    onSelect(branch.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group",
                    activeBranchId === branch.id ? "bg-neon-lime/10" : "hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    activeBranchId === branch.id ? "bg-neon-lime text-black" : "bg-dark-bg text-white/20"
                  )}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-semibold mb-0.5",
                      activeBranchId === branch.id ? "text-neon-lime" : "text-white"
                    )}>{branch.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{branch.address || 'Tanpa alamat'}</p>
                  </div>
                </button>
              ))}
              
              {branches.length === 0 && (
                <div className="p-6 text-center text-white/20 text-xs">
                  Belum ada cabang
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-dark-border mt-2">
              <button 
                onClick={() => {
                  onManage();
                  setIsOpen(false);
                }}
                className="w-full py-3 text-xs font-semibold text-white/40 hover:text-white transition-colors text-center"
              >
                Manajemen cabang
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
