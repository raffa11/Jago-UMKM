import React, { useState } from 'react';
import { X, ChevronDown, Check, Coins, Tag, FileText, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { TransactionType, UserProfile, OperationType } from '../types';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AddTransactionProps {
  onClose: () => void;
  profile: UserProfile;
}

const CATEGORIES = {
  [TransactionType.INCOME]: ['Sales', 'Service', 'Invest', 'Refund', 'Other'],
  [TransactionType.EXPENSE]: ['Inventory', 'Marketing', 'Rent', 'Utilities', 'Salary', 'Tax', 'Travel', 'Other']
};

export function AddTransaction({ onClose, profile }: AddTransactionProps) {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: Timestamp.now(),
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2"
    >
      <header className="px-6 py-4 flex justify-between items-center border-bottom border-slate-100">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">New Entry</span>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        {/* Type Selector */}
        <div className="flex bg-slate-50 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setType(TransactionType.EXPENSE); setCategory(''); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
              type === TransactionType.EXPENSE ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
            )}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => { setType(TransactionType.INCOME); setCategory(''); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
              type === TransactionType.INCOME ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
            )}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Amount ({profile.currency})</label>
          <div className="flex items-center text-5xl font-black text-slate-900 tracking-tighter">
            <span className="mr-2 opacity-20">{profile.currency === 'IDR' ? 'Rp' : '$'}</span>
            <input
              autoFocus
              required
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-100"
            />
          </div>
        </div>

        {/* Category Picker */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES[type].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-3 px-1 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all",
                  category === cat 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                    : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description Label */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Notes</label>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-indigo-200 transition-all">
            <FileText className="w-5 h-5 text-slate-300" />
            <input
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none text-slate-700 placeholder:text-slate-300"
            />
          </div>
        </div>
      </form>

      <div className="p-6">
        <button
          disabled={!amount || !category || loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white font-black py-5 px-6 rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Check className="w-6 h-6" />
              <span className="uppercase tracking-widest text-sm">Save Transaction</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
