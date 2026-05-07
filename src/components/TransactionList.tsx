import { useState } from 'react';
import { format } from 'date-fns';
import { Transaction, UserProfile, TransactionType, OperationType, Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownLeft, Search, Edit2, Trash2, X, Archive, CalendarDays, History } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { AddTransaction } from './AddTransaction';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
  profile: UserProfile;
  products?: Product[];
}

export function TransactionList({ transactions, profile, products = [] }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  return (
    <div className="px-6 pt-2 pb-10 space-y-10">
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-muted/40 group-focus-within:text-neon-lime transition-colors">
          <Search className="w-full h-full stroke-[3]" />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari dalam arsip..." 
          className="w-full bg-dark-card border border-dark-border rounded-[2rem] py-6 pl-16 pr-6 text-sm font-bold text-white placeholder:text-neon-muted/20 outline-none focus:border-neon-lime/30 transition-all shadow-xl"
        />
      </div>

      <div className="space-y-10">
        {filteredTransactions.length === 0 ? (
          <div className="py-24 text-center card-primary border-dashed bg-white/[0.02]">
            <History className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Tidak ada rekaman transaksi</p>
          </div>
        ) : (
          filteredTransactions.map((t, i) => {
            const dateObj = t.date.toDate();
            const showDate = i === 0 || format(dateObj, 'MMM d') !== format(filteredTransactions[i-1].date.toDate(), 'MMM d');
            
            return (
              <div key={t.id} className="space-y-5">
                {showDate && (
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-lime" />
                    <h3 className="text-[10px] font-black text-neon-muted/50 uppercase tracking-[0.4em] italic">
                      {format(dateObj, 'EEEE, d MMM yyyy')}
                    </h3>
                  </div>
                )}
                <div className={cn(
                    "flex items-center justify-between group overflow-hidden relative card-primary p-6 transition-all",
                    deletingId === t.id && "opacity-20 pointer-events-none"
                )}>
                  <div className="absolute inset-0 bg-white/[0.01] -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                      t.type === TransactionType.INCOME 
                        ? 'bg-neon-lime/10 text-neon-lime shadow-lg shadow-neon-lime/5' 
                        : 'bg-rose-500/10 text-rose-500'
                    )}>
                      {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-6 h-6 stroke-[3]" /> : <ArrowDownLeft className="w-6 h-6 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-base font-black text-white leading-none tracking-tight">
                          {t.category.toLowerCase() === 'stok barang' ? 'Bahan Baku' : t.category}
                        </p>
                        {t.quantity && (
                          <span className="label-micro !text-[8px] px-2 py-0.5 rounded-lg bg-neon-muted/5 border border-white/5 data-tabular">
                            {t.quantity} qty
                          </span>
                        )}
                      </div>
                      <p className="label-micro !text-[10px] !tracking-widest line-clamp-1">{t.description || 'Catatan kosong'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="text-right">
                      <p className={cn(
                        "text-base font-black tracking-tighter leading-none mb-2 data-tabular",
                        t.type === TransactionType.INCOME ? 'text-neon-lime' : 'text-white'
                      )}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount, profile.currency)}
                      </p>
                      <p className="label-micro !text-[8px] !tracking-tighter leading-none data-tabular">
                        {format(dateObj, 'HH:mm')}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingTransaction(t)}
                        className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-neon-muted/40 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingId(t.id)}
                        className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-neon-muted/40 hover:text-rose-500 transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTransaction && profile.activeBranchId && (
          <AddTransaction 
            profile={profile} 
            transaction={editingTransaction} 
            products={products}
            activeBranchId={profile.activeBranchId}
            onClose={() => setEditingTransaction(null)} 
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {deletingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-dark-bg/80 backdrop-blur-md flex items-end justify-center px-8 pb-12"
          >
            <motion.div 
              initial={{ y: 200, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 200, scale: 0.9 }}
              className="w-full max-w-sm bg-dark-card border border-dark-border rounded-[3rem] p-10 space-y-10 neo-shadow"
            >
              <div className="space-y-3 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-[1.75rem] flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Hapus Record?</h3>
                <p className="text-sm text-neon-muted/40 leading-relaxed font-medium">Data transaksi akan dihapus permanen dari audit trail cabang ini.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="h-16 rounded-[1.75rem] bg-dark-bg text-neon-muted/40 font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-dark-border active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleDelete(deletingId)}
                  className="h-16 rounded-[1.75rem] bg-rose-500 text-dark-bg font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
