import { format } from 'date-fns';
import { Transaction, UserProfile, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  profile: UserProfile;
}

export function TransactionList({ transactions, profile }: TransactionListProps) {
  return (
    <div className="px-6">
      <header className="mb-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Audit Trail</h2>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transactions</h1>
      </header>

      {/* Search Bar - Aesthetic Only for now */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input 
          type="text" 
          placeholder="Search by category or notes..." 
          className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="space-y-6">
        {transactions.length === 0 ? (
          <div className="text-center py-20 px-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No transactions recorded</p>
          </div>
        ) : (
          transactions.map((t, i) => {
            const showDate = i === 0 || format(t.date.toDate(), 'MMM d') !== format(transactions[i-1].date.toDate(), 'MMM d');
            
            return (
              <div key={t.id}>
                {showDate && (
                  <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-4 mt-2">
                    {format(t.date.toDate(), 'EEEE, MMM do')}
                  </h3>
                )}
                <div className="flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 ${
                      t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-5 h-5 stroke-[3]" /> : <ArrowDownLeft className="w-5 h-5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">{t.category}</p>
                      <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{t.description || 'No notes added'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black tracking-tight ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount, profile.currency)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                      {format(t.date.toDate(), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
