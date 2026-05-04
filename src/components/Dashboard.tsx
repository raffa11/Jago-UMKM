import { useState } from 'react';
import { Transaction, UserProfile, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AddTransaction } from './AddTransaction';
import { AIInsights } from './AIInsights';

interface DashboardProps {
  transactions: Transaction[];
  profile: UserProfile;
}

export function Dashboard({ transactions, profile }: DashboardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="px-6 py-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest leading-none mb-1">Overview</h2>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{profile.businessName}</h1>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </header>

      {/* Main Balance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 mb-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-8 -mb-8 blur-xl" />
        
        <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2 z-10 relative">Net Balance</p>
        <h3 className="text-4xl font-extrabold tracking-tighter mb-8 z-10 relative">
          {formatCurrency(balance, profile.currency)}
        </h3>
        
        <div className="flex gap-4 z-10 relative">
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-wider mb-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400 stroke-[4]" />
              Income
            </div>
            <p className="font-bold text-sm">{formatCurrency(totalIncome, profile.currency)}</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-wider mb-1">
              <ArrowDownLeft className="w-3 h-3 text-rose-400 stroke-[4]" />
              Expenses
            </div>
            <p className="font-bold text-sm">{formatCurrency(totalExpense, profile.currency)}</p>
          </div>
        </div>
      </motion.div>

      {/* AI Insights Section */}
      <AIInsights transactions={transactions} profile={profile} />

      {/* Recent Activity Mini List */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activity</h4>
          <button className="text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:opacity-70 transition-opacity">See all</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 4).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">{t.category}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter italic">{t.description || 'No description'}</p>
                </div>
              </div>
              <p className={`font-black text-sm ${
                t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'
              }`}>
                {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount, profile.currency)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
              <TrendingUp className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddOpen && <AddTransaction onClose={() => setIsAddOpen(false)} profile={profile} />}
    </div>
  );
}
