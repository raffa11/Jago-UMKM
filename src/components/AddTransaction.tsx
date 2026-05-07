import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, updateDoc, doc, runTransaction } from 'firebase/firestore';
import { UserProfile, TransactionType, Product, OperationType, Transaction } from '../types';
import { X, ArrowUpRight, ArrowDownLeft, FileText, Check, Loader2, Tag, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AddTransactionProps {
  onClose: () => void;
  profile: UserProfile;
  transaction?: Transaction;
  products?: Product[];
  activeBranchId: string;
}

const CATEGORIES = {
  [TransactionType.INCOME]: ['Penjualan', 'Modal', 'Refund', 'Lainnya'],
  [TransactionType.EXPENSE]: ['Stok Barang', 'Pemasaran', 'Sewa', 'Utilitas', 'Gaji', 'Lainnya']
};

export function AddTransaction({ onClose, profile, transaction, products = [], activeBranchId }: AddTransactionProps) {
  const isEditing = !!transaction;
  const [type, setType] = useState<TransactionType>(transaction?.type || TransactionType.EXPENSE);
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [productId, setProductId] = useState(transaction?.productId || '');
  const [quantity, setQuantity] = useState(transaction?.quantity?.toString() || '1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId && !isEditing) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setCategory(type === TransactionType.INCOME ? 'Penjualan' : 'Stok Barang');
        const price = type === TransactionType.INCOME ? product.price : product.cost;
        setAmount((price * parseFloat(quantity)).toString());
        if (!description) setDescription(`${type === TransactionType.INCOME ? 'Penjualan' : 'Pembelian'} ${product.name}`);
      }
    }
  }, [productId, type, quantity, products, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || loading) return;

    setLoading(true);
    try {
      if (isEditing && transaction) {
        await updateDoc(doc(db, 'transactions', transaction.id), {
          type,
          amount: parseFloat(amount),
          category,
          description,
        });
      } else {
        if (productId) {
          await runTransaction(db, async (tx) => {
            const productRef = doc(db, 'products', productId);
            const productDoc = await tx.get(productRef);
            if (!productDoc.exists()) throw new Error("Produk tidak ditemukan!");

            const currentStock = productDoc.data().stock;
            const qtyNum = parseFloat(quantity);
            const newStock = type === TransactionType.INCOME ? currentStock - qtyNum : currentStock + qtyNum;

            const transRef = doc(collection(db, 'transactions'));
            tx.set(transRef, {
              type,
              amount: parseFloat(amount),
              category,
              description,
              date: Timestamp.now(),
              userId: auth.currentUser?.uid,
              branchId: activeBranchId,
              createdAt: serverTimestamp(),
              productId,
              quantity: qtyNum,
            });
            tx.update(productRef, { stock: newStock });
          });
        } else {
          await addDoc(collection(db, 'transactions'), {
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: Timestamp.now(),
            userId: auth.currentUser?.uid,
            branchId: activeBranchId,
            createdAt: serverTimestamp(),
          });
        }
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 100 }}
      className="fixed inset-0 z-[120] bg-dark-bg flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2 overflow-hidden shadow-2xl"
    >
      <header className="px-6 py-5 flex justify-between items-center border-b border-dark-border">
        <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <span className="font-display font-semibold text-white text-base">
          {isEditing ? 'Detail transaksi' : 'Catat transaksi'}
        </span>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-8 pb-12 space-y-10 no-scrollbar">
        <div className="px-6">
          <div className="flex bg-dark-card p-1.5 rounded-xl border border-dark-border">
            <button
              type="button"
              onClick={() => { setType(TransactionType.EXPENSE); setCategory(''); }}
              className={cn(
                "flex-1 py-4 rounded-lg font-semibold text-sm transition-all",
                type === TransactionType.EXPENSE ? "bg-danger text-white" : "text-white/20"
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => { setType(TransactionType.INCOME); setCategory(''); }}
              className={cn(
                "flex-1 py-4 rounded-lg font-semibold text-sm transition-all",
                type === TransactionType.INCOME ? "bg-success text-black" : "text-white/20"
              )}
            >
              Pemasukan
            </button>
          </div>
        </div>

        <div className="px-8 space-y-4">
          <label className="text-label ml-1">Nominal ({profile.currency})</label>
          <div className="relative group">
            <div className="flex items-end font-display font-bold text-6xl text-white tracking-tight">
              <span className="text-2xl text-neon-lime mb-2 mr-2 font-sans opacity-40">Rp</span>
              <input
                required
                autoFocus
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-white/10 caret-neon-lime"
              />
            </div>
            <div className="h-1 w-16 bg-white/10 mt-4 rounded-full group-focus-within:w-full group-focus-within:bg-neon-lime transition-all duration-500" />
          </div>
        </div>

        {!isEditing && products.length > 0 && (
          <div className="space-y-4 px-6">
            <div className="flex justify-between items-end px-2">
              <label className="text-label">Pilih produk</label>
              {productId && <button type="button" onClick={() => setProductId('')} className="text-xs text-danger font-medium hover:underline">Reset</button>}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
              <button
                type="button"
                onClick={() => setProductId('')}
                className={cn(
                  "snap-center flex-shrink-0 w-28 aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                  productId === '' ? "border-white bg-white text-black" : "border-dark-border bg-dark-card text-white/20"
                )}
              >
                <Tag className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Umum</span>
              </button>
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductId(p.id)}
                  className={cn(
                    "snap-center flex-shrink-0 w-28 aspect-square rounded-2xl border flex flex-col items-start p-4 transition-all",
                    productId === p.id ? "border-neon-lime bg-neon-lime/10 text-neon-lime" : "border-dark-border bg-dark-card text-white/20 hover:border-white/10"
                  )}
                >
                  <Package className="w-5 h-5 mb-auto" />
                  <div className="text-left w-full">
                    <span className="text-[10px] font-semibold truncate block">{p.name}</span>
                    <span className="text-[9px] opacity-60 block">Stok: {p.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {productId && (
          <div className="px-8 space-y-3">
            <label className="text-label ml-1">Jumlah</label>
            <div className="flex items-center gap-4 bg-dark-card border border-dark-border p-3 rounded-xl">
              <button 
                type="button" 
                onClick={() => setQuantity(q => Math.max(1, parseFloat(q) - 1).toString())}
                className="w-12 h-12 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center text-white"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 bg-transparent text-center font-display font-bold text-xl text-white outline-none"
              />
              <button 
                type="button" 
                onClick={() => setQuantity(q => (parseFloat(q) + 1).toString())}
                className="w-12 h-12 rounded-lg bg-neon-lime text-black flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {!productId && (
          <div className="px-8 space-y-4">
            <label className="text-label ml-1">Kategori</label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES[type].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "py-4 px-3 rounded-xl border text-xs font-semibold transition-all",
                    category === cat 
                      ? "border-neon-lime bg-neon-lime/10 text-neon-lime" 
                      : "border-dark-border bg-dark-card text-white/20 hover:border-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-8 space-y-3">
          <label className="text-label ml-1">Detail keterangan</label>
          <div className="flex items-center gap-3 bg-dark-card border border-dark-border p-4 rounded-xl group focus-within:border-neon-lime/50 transition-all">
            <FileText className="w-5 h-5 text-white/10" />
            <input
              type="text"
              placeholder="Contoh: beli bensin, bayar listrik"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-sm font-medium outline-none text-white placeholder:text-white/10"
            />
          </div>
        </div>
      </form>

      <div className="p-8 pt-4 bg-dark-bg border-t border-dark-border">
        <button
          disabled={!amount || (!productId && !category) || loading}
          onClick={handleSubmit}
          className="btn-primary w-full h-16 shadow-lg shadow-neon-lime/10 disabled:opacity-30"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          <span>{isEditing ? 'Simpan perubahan' : 'Konfirmasi transaksi'}</span>
        </button>
      </div>
    </motion.div>
  );
}
