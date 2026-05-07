import { useState } from 'react';
import { format } from 'date-fns';
import { Transaction, UserProfile, TransactionType, Product, Branch } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, Sparkles, AlertTriangle, Building2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddTransaction } from './AddTransaction';
import { AIInsights } from './AIInsights';

interface DashboardProps {
  transactions: Transaction[];
  profile: UserProfile;
  products?: Product[];
  branches?: Branch[];
}

export function Dashboard({ transactions, profile, products = [], branches = [] }: DashboardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const activeBranch = branches.find(b => b.id === profile.activeBranchId);

  return (
    <div className="section-container">
      {/* Saldo Utama */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-fintech relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-neo-gradient opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
        <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-label">Total saldo</p>
                    <h1 className="text-[32px] text-white">
                        {formatCurrency(balance, profile.currency)}
                    </h1>
                </div>
                <div className="w-12 h-12 bg-neon-lime/10 rounded-xl flex items-center justify-center text-neon-lime">
                    <Wallet className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-bg/60 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
                        <span className="text-caption">Harian</span>
                    </div>
                    <div>
                        <p className="text-label text-white/40 mb-0.5">Pemasukan</p>
                        <p className="text-base font-semibold text-white">{formatCurrency(totalIncome, profile.currency)}</p>
                    </div>
                </div>
                <div className="p-4 bg-dark-bg/60 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-caption">Harian</span>
                    </div>
                    <div>
                        <p className="text-label text-white/40 mb-0.5">Pengeluaran</p>
                        <p className="text-base font-semibold text-white">{formatCurrency(totalExpense, profile.currency)}</p>
                    </div>
                </div>
            </div>
            
            {activeBranch && (
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neon-lime/60" />
                        <span className="text-label">{activeBranch.name}</span>
                    </div>
                    <span className="text-caption text-neon-lime font-medium">Sinkron real-time</span>
                </div>
            )}
        </div>
      </motion.div>

      {/* Peringatan Stok */}
      {lowStockProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger/10 border border-danger/20 p-4 rounded-fintech flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center text-danger">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-label text-danger font-semibold mb-0.5">Peringatan operasional</p>
            <p className="text-body font-medium">{lowStockProducts.length} produk hampir habis!</p>
          </div>
        </motion.div>
      )}

      {/* AI Intelligence */}
      <AIInsights transactions={transactions} profile={profile} />

      {/* Aktivitas Terbaru */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <p className="text-label mb-0.5">Cek aktivitas</p>
            <h2>Terbaru</h2>
          </div>
          <button className="text-label text-neon-lime font-semibold hover:opacity-70 transition-opacity">Lihat semua</button>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="card-fintech flex items-center justify-between group py-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  t.type === TransactionType.INCOME 
                    ? "bg-success/10 text-success" 
                    : "bg-white/5 text-white/40"
                )}>
                  {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-white text-base leading-none mb-1">{t.category}</p>
                  <p className="text-caption leading-none">{t.description || 'Catatan kosong'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                   "text-base font-bold",
                   t.type === TransactionType.INCOME ? "text-success" : "text-white"
                )}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount, profile.currency)}
                </p>
                <p className="text-caption mt-1">
                  {format(t.date.toDate(), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center card-fintech border-dashed border-white/10">
              <TrendingUp className="w-10 h-10 text-white/10 mb-4" />
              <p className="text-caption px-8 text-center">Belum ada transaksi di cabang ini</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddOpen && profile.activeBranchId && (
          <AddTransaction 
            onClose={() => setIsAddOpen(false)} 
            profile={profile} 
            products={products}
            activeBranchId={profile.activeBranchId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
