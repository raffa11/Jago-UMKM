import React, { useState } from 'react';
import { Invoice, Product, Customer, UserProfile, TransactionType, OperationType } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Search, Receipt, Package, Check, X, Loader2, Zap, ArrowRight, Wallet, History, TrendingUp, User } from 'lucide-react';
import { collection, addDoc, serverTimestamp, Timestamp, runTransaction, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SalesProps {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  profile: UserProfile;
  activeBranchId: string;
}

export function Sales({ products, customers, invoices, profile, activeBranchId }: SalesProps) {
  const [mode, setMode] = useState<'dashboard' | 'quick' | 'invoice'>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleQuickSale = async () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || loading) return;

    setLoading(true);
    try {
      await runTransaction(db, async (tx) => {
        const productRef = doc(db, 'products', product.id);
        const pDoc = await tx.get(productRef);
        if (!pDoc.exists()) throw new Error("Produk tidak ada");

        const qtyNum = parseFloat(qty);
        const totalAmount = product.price * qtyNum;
        const totalOfCost = product.cost * qtyNum;

        tx.update(productRef, { stock: pDoc.data().stock - qtyNum });

        const transRef = doc(collection(db, 'transactions'));
        tx.set(transRef, {
          type: TransactionType.INCOME,
          amount: totalAmount,
          category: 'Penjualan Langsung',
          description: `Jual Cepat: ${product.name} x${qtyNum}`,
          date: Timestamp.now(),
          userId: auth.currentUser?.uid,
          branchId: activeBranchId,
          createdAt: serverTimestamp(),
          productId: product.id,
          quantity: qtyNum,
        });

        const invRef = doc(collection(db, 'invoices'));
        tx.set(invRef, {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          items: [{
            productId: product.id,
            name: product.name,
            quantity: qtyNum,
            price: product.price,
            cost: product.cost
          }],
          totalAmount,
          totalCost: totalOfCost,
          profit: totalAmount - totalOfCost,
          status: 'Lunas',
          userId: auth.currentUser?.uid,
          branchId: activeBranchId,
          date: Timestamp.now(),
          createdAt: serverTimestamp(),
        });
      });
      setSelectedProductId('');
      setQty('1');
      setMode('dashboard');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'quick-sale');
    } finally {
      setLoading(false);
    }
  };

  const todaySales = invoices.filter(inv => {
    const invDate = inv.date.toDate();
    const today = new Date();
    return invDate.getDate() === today.getDate() &&
           invDate.getMonth() === today.getMonth() &&
           invDate.getFullYear() === today.getFullYear();
  });

  const totalRevenue = todaySales.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalProfit = todaySales.reduce((acc, curr) => acc + curr.profit, 0);

  return (
    <div className="section-container">
      {mode === 'dashboard' && (
        <div className="space-y-10">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 gap-3">
              <div className="card-fintech border-neon-lime/10">
                  <div className="flex items-center gap-2 text-neon-lime mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-label text-neon-lime">Revenue hari ini</span>
                  </div>
                  <p className="text-xl font-bold text-white tracking-tight leading-none">
                    {formatCurrency(totalRevenue, profile.currency)}
                  </p>
              </div>
              <div className="card-fintech">
                  <div className="flex items-center gap-2 text-white/40 mb-2">
                      <Wallet className="w-4 h-4" />
                      <span className="text-label text-white/40">Profit bersih</span>
                  </div>
                  <p className="text-xl font-bold text-white tracking-tight leading-none">
                    {formatCurrency(totalProfit, profile.currency)}
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('quick')}
              className="relative group h-56 card-fintech flex flex-col justify-between hover:border-neon-lime/30"
            >
              <div className="w-14 h-14 bg-neon-lime rounded-2xl flex items-center justify-center shadow-lg shadow-neon-lime/20 group-hover:scale-105 transition-transform">
                <Zap className="w-7 h-7 text-black fill-black" />
              </div>
              <div className="text-left">
                <span className="text-label text-neon-lime mb-1 block">Kilat</span>
                <h3 className="text-xl font-bold text-white leading-tight">Jual instan</h3>
              </div>
              <div className="absolute top-4 right-4 text-white/5"><Plus className="w-8 h-8" /></div>
            </button>

            <button 
              onClick={() => setMode('invoice')}
              className="relative group h-56 card-fintech flex flex-col justify-between hover:border-white/20"
            >
              <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                <Receipt className="w-7 h-7" />
              </div>
              <div className="text-left">
                <span className="text-label text-white/20 mb-1 block">Arsip</span>
                <h3 className="text-xl font-bold text-white leading-tight">Buat tagihan</h3>
              </div>
              <div className="absolute top-4 right-4 text-white/5"><History className="w-7 h-7" /></div>
            </button>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-end px-1">
                <div>
                    <p className="text-label mb-1">Log performa</p>
                    <h2 className="text-xl">Status invoice</h2>
                </div>
                <button className="text-label text-neon-lime font-semibold">Semua data</button>
             </div>
             <div className="space-y-3">
               {invoices.slice(0, 5).map(inv => (
                 <div key={inv.id} className="card-fintech flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/10 group-hover:text-white transition-colors">
                         <Receipt className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-white text-sm leading-none mb-1.5">{inv.invoiceNumber}</p>
                         <div className="flex items-center gap-1.5 opacity-30">
                            <User className="w-3 h-3" />
                            <p className="text-[10px] text-white font-medium">{inv.customerName || 'Pelanggan Umum'}</p>
                         </div>
                       </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-neon-lime mb-2">{formatCurrency(inv.totalAmount, profile.currency)}</p>
                      <span className={cn(
                        "text-[10px] px-2 py-1 rounded-lg inline-flex items-center gap-1.5 font-semibold",
                        inv.status === 'Lunas' ? "bg-neon-lime/10 text-neon-lime" : "bg-red-500/10 text-red-500"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", inv.status === 'Lunas' ? "bg-neon-lime" : "bg-red-500")} />
                        {inv.status}
                      </span>
                    </div>
                 </div>
               ))}
               {invoices.length === 0 && (
                 <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                   <Receipt className="w-10 h-10 mb-4" />
                   <p className="text-caption text-center">Belum ada transaksi invoice</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {mode === 'quick' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 50 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="fixed inset-0 z-[150] bg-dark-bg flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2"
          >
            <header className="px-6 py-5 flex justify-between items-center border-b border-white/5">
              <button onClick={() => setMode('dashboard')} className="p-2 -ml-2 text-white/30 hover:text-white transition-colors"><X className="w-6 h-6 stroke-[2.5]" /></button>
              <span className="text-sm font-bold text-white">Kilat terminal ⚡</span>
              <div className="w-10" />
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar">
              <div className="space-y-4">
                <label className="text-label ml-2">Pilih produk</label>
                <div className="grid grid-cols-2 gap-3">
                  {products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={cn(
                        "p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                        selectedProductId === p.id 
                          ? "border-neon-lime bg-neon-lime/10" 
                          : "border-transparent bg-white/5"
                      )}
                    >
                      <p className={cn("text-xs font-bold leading-tight mb-2 line-clamp-2 h-8", selectedProductId === p.id ? "text-neon-lime" : "text-white")}>{p.name}</p>
                      <div className="flex justify-between items-center">
                        <p className={cn("text-[10px] font-bold font-mono", selectedProductId === p.id ? "text-white" : "text-neon-lime")}>{formatCurrency(p.price, profile.currency)}</p>
                        <p className="text-[10px] text-white/20">Stok: {p.stock}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedProductId && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="card-fintech p-6 relative overflow-hidden"
                 >
                   <div className="relative z-10 space-y-6">
                      <div className="space-y-3">
                        <label className="text-label text-center block text-white/20">Kuantitas item</label>
                        <div className="flex items-center gap-4 bg-black/40 rounded-2xl p-2 border border-white/5">
                          <button 
                             onClick={() => setQty(Math.max(1, parseFloat(qty || '1') - 1).toString())}
                             className="w-12 h-12 bg-white/5 rounded-xl text-xl font-bold text-white active:scale-95 transition-all"
                          >—</button>
                          <input 
                            type="number" 
                            value={qty} 
                            onChange={e => setQty(e.target.value)}
                            className="flex-1 bg-transparent border-none text-center text-3xl font-bold text-white outline-none font-mono"
                          />
                          <button 
                             onClick={() => setQty((parseFloat(qty || '1') + 1).toString())}
                             className="w-12 h-12 bg-neon-lime rounded-xl text-xl font-bold text-black active:scale-95 transition-all shadow-lg shadow-neon-lime/20"
                          >+</button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-label text-white/20">Total transaksi</p>
                          <p className="text-2xl font-bold text-neon-lime font-mono">
                            {formatCurrency((products.find(p => p.id === selectedProductId)?.price || 0) * parseFloat(qty || '0'), profile.currency)}
                          </p>
                        </div>
                        <div className="text-[10px] font-semibold bg-neon-lime/10 px-3 py-1.5 rounded-lg text-neon-lime border border-neon-lime/20">Siap simpan</div>
                      </div>
                   </div>
                 </motion.div>
              )}
            </div>

            <footer className="p-6 border-t border-white/5 bg-dark-bg">
              <button 
                disabled={!selectedProductId || loading}
                onClick={handleQuickSale}
                className="btn-primary w-full h-16 text-sm"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : (
                    <>
                        <span>Eksekusi kilat</span>
                        <Zap className="w-5 h-5 fill-black" />
                    </>
                )}
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'invoice' && (
        <InvoiceGenerator 
          products={products} 
          customers={customers} 
          profile={profile} 
          activeBranchId={activeBranchId}
          onClose={() => setMode('dashboard')} 
        />
      )}
    </div>
  );
}

function InvoiceGenerator({ products, customers, profile, activeBranchId, onClose }: { products: Product[], customers: Customer[], profile: UserProfile, activeBranchId: string, onClose: () => void }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [status, setStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
  const [loading, setLoading] = useState(false);

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.productId === product.id);
    if (existing) {
      setCart(cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, quantity: 1, price: product.price, cost: product.cost }]);
    }
  };

  const totalAmount = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const totalCost = cart.reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0);

  const handleGenerate = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);

    try {
      await runTransaction(db, async (tx) => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        const invId = doc(collection(db, 'invoices'));
        const invData: any = {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          customerName: customer?.name || 'Pelanggan Umum',
          items: cart,
          totalAmount,
          totalCost,
          profit: totalAmount - totalCost,
          status,
          userId: auth.currentUser?.uid,
          branchId: activeBranchId,
          date: Timestamp.now(),
          createdAt: serverTimestamp(),
        };

        if (selectedCustomerId && selectedCustomerId !== '') {
          invData.customerId = selectedCustomerId;
        }

        tx.set(invId, invData);

        const transRef = doc(collection(db, 'transactions'));
        tx.set(transRef, {
          type: TransactionType.INCOME,
          amount: status === 'Lunas' ? totalAmount : 0, 
          category: 'Penjualan Invoice',
          description: `Invoice ${invData.invoiceNumber} - ${invData.customerName}`,
          date: Timestamp.now(),
          userId: auth.currentUser?.uid,
          branchId: activeBranchId,
          createdAt: serverTimestamp(),
        });

        for (const item of cart) {
          const productRef = doc(db, 'products', item.productId);
          const pDoc = await tx.get(productRef);
          if (pDoc.exists()) {
            tx.update(productRef, { stock: pDoc.data().stock - item.quantity });
          }
        }

        if (selectedCustomerId && status === 'Belum Lunas') {
          const custRef = doc(db, 'customers', selectedCustomerId);
          const cDoc = await tx.get(custRef);
          if (cDoc.exists()) {
            tx.update(custRef, { 
              totalSpent: cDoc.data().totalSpent + totalAmount,
              totalDebt: cDoc.data().totalDebt + totalAmount 
            });
          }
        } else if (selectedCustomerId) {
           const custRef = doc(db, 'customers', selectedCustomerId);
           const cDoc = await tx.get(custRef);
           if (cDoc.exists()) {
             tx.update(custRef, { totalSpent: cDoc.data().totalSpent + totalAmount });
           }
        }
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'invoice-generator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }} 
      className="fixed inset-0 bg-dark-bg z-[150] flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2"
    >
       <header className="px-6 py-5 flex justify-between items-center border-b border-white/5">
         <button onClick={onClose} className="p-2 text-white/30"><X className="w-6 h-6 stroke-[2.5]" /></button>
         <span className="text-sm font-bold text-white">Buat tagihan</span>
         <div className="w-10"></div>
       </header>

       <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar">
          <div className="space-y-4">
             <label className="text-label ml-2">Pilih pelanggan</label>
             <select 
               value={selectedCustomerId} 
               onChange={e => setSelectedCustomerId(e.target.value)}
               className="input-field py-4 px-6 text-sm"
             >
               <option value="">Pelanggan umum (tanpa akun)</option>
               {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>

          <div className="space-y-4">
             <label className="text-label ml-2">Pilih produk</label>
             <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x px-1">
                {products.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addToCart(p)}
                    className="flex-shrink-0 w-36 card-fintech p-4 text-left snap-start group relative"
                  >
                    <Package className="w-5 h-5 text-neon-lime mb-4" />
                    <p className="text-[11px] font-bold text-white line-clamp-1 mb-1">{p.name}</p>
                    <p className="text-[10px] text-neon-lime font-bold font-mono">{formatCurrency(p.price, profile.currency)}</p>
                    <div className="absolute top-3 right-3 text-neon-lime opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4" /></div>
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-label ml-2">Rincian belanja</label>
             <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center card-fintech p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neon-lime/10 flex items-center justify-center text-[11px] font-bold text-neon-lime">
                            {item.quantity}x
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-white leading-tight mb-0.5">{item.name}</p>
                            <p className="text-[10px] font-medium text-white/30 font-mono">{formatCurrency(item.price, profile.currency)}</p>
                        </div>
                    </div>
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {cart.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                        <Wallet className="w-8 h-8 mb-4" />
                        <p className="text-caption text-center">Keranjang masih kosong</p>
                    </div>
                )}
             </div>
          </div>

          <div className="space-y-4 pb-4">
             <label className="text-label ml-2">Status penagihan</label>
             <div className="flex gap-3">
               {['Lunas', 'Belum Lunas'].map(s => (
                 <button 
                   key={s} 
                   onClick={() => setStatus(s as any)}
                   className={cn(
                     "flex-1 py-4 rounded-xl font-bold text-xs border-2 transition-all",
                     status === s 
                        ? "border-neon-lime bg-neon-lime text-black" 
                        : "border-white/5 bg-white/5 text-white/20 hover:text-white"
                   )}
                 >
                   {s}
                 </button>
               ))}
             </div>
          </div>
       </div>

       <div className="p-6 bg-dark-bg border-t border-white/5">
          <div className="flex justify-between items-end mb-6 px-2">
            <div>
                <span className="text-label text-white/20">Total tagihan</span>
                <p className="text-3xl font-bold text-white font-mono leading-none">{formatCurrency(totalAmount, profile.currency)}</p>
            </div>
            <div className="px-3 py-1 bg-neon-lime/10 rounded-lg text-[10px] font-bold text-neon-lime border border-neon-lime/20">Invoice valid</div>
          </div>
          <button 
            disabled={cart.length === 0 || loading}
            onClick={handleGenerate}
            className="btn-primary w-full h-16 text-sm group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : (
                <div className="flex items-center gap-2">
                    <span>Proses transaksi</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            )}
          </button>
       </div>
    </motion.div>
  );
}
