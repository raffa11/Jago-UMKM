import React, { useState } from 'react';
import { Product, UserProfile, OperationType } from '../types';
import { formatCurrency, cn, formatNumber, parseNumber } from '../lib/utils';
import { Search, Plus, Package, Edit2, Trash2, ArrowUp, ArrowDown, Loader2, Tag, Box, Info, Check } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryProps {
  products: Product[];
  profile: UserProfile;
  activeBranchId: string;
}

export function Inventory({ products, profile, activeBranchId }: InventoryProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="section-container">
      <div className="relative group px-1">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-neon-lime transition-colors">
          <Search className="w-full h-full" />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari bahan atau material..." 
          className="input-field pl-14"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <p className="text-label mb-0.5">Sistem Pabrik</p>
            <h2>Bahan & Produksi</h2>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="w-12 h-12 rounded-xl bg-neon-lime text-black flex items-center justify-center shadow-lg shadow-neon-lime/10 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="grid gap-4">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center card-fintech border-dashed">
              <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-caption">Belum ada inventaris</p>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <motion.div 
                layout
                key={p.id} 
                className="card-fintech space-y-6 group relative"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-lime/10 flex items-center justify-center text-neon-lime">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base leading-none mb-1">{p.name}</h3>
                      <div className="flex gap-2">
                         <span className="text-[10px] font-medium text-white/40 glass-pill px-2 py-0.5 border-white/5">
                           {p.sku || 'No SKU'}
                         </span>
                         <span className="text-[10px] font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                           {p.unit}
                         </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingProduct(p)}
                    className="p-3 text-white/20 hover:text-neon-lime transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-dark-bg/40 p-4 rounded-xl border border-white/5">
                    <p className="text-label mb-1">Volume Bahan</p>
                    <p className={cn(
                      "text-xl font-bold",
                      p.stock <= 5 ? "text-danger" : "text-white"
                    )}>
                      {p.stock}
                    </p>
                  </div>
                  <div className="bg-dark-bg/40 p-4 rounded-xl border border-white/5 text-right">
                    <p className="text-label mb-1 text-right">Nilai Satuan</p>
                    <p className="text-xl font-bold text-neon-lime">
                      {formatCurrency(p.price, profile.currency)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {(isAddOpen || editingProduct) && (
          <ProductModal 
            profile={profile} 
            activeBranchId={activeBranchId}
            product={editingProduct || undefined} 
            onClose={() => {
              setIsAddOpen(false);
              setEditingProduct(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProductModalProps {
  onClose: () => void;
  profile: UserProfile;
  activeBranchId: string;
  product?: Product;
}

function ProductModal({ onClose, profile, activeBranchId, product }: ProductModalProps) {
  const isEditing = !!product;
  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock.toString() || '0');
  const [unit, setUnit] = useState(product?.unit || 'pcs');
  const [price, setPrice] = useState(product?.price ? formatNumber(product.price) : '');
  const [cost, setCost] = useState(product?.cost ? formatNumber(product.cost) : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || loading) return;

    setLoading(true);
    try {
      if (isEditing && product) {
        await updateDoc(doc(db, 'products', product.id), {
          name,
          sku,
          stock: parseFloat(stock),
          unit,
          price: parseNumber(price),
          cost: parseNumber(cost),
        });
      } else {
        await addDoc(collection(db, 'products'), {
          name,
          sku,
          stock: parseFloat(stock),
          unit,
          price: parseNumber(price),
          cost: parseNumber(cost),
          userId: auth.currentUser?.uid,
          branchId: activeBranchId,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, isEditing ? `products/${product!.id}` : 'products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !window.confirm('Hapus produk ini dari database? Sistem akan menghapus permanen.')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'products', product.id));
      onClose();
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `products/${product.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[140] bg-dark-bg flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2 shadow-2xl"
    >
      <header className="px-6 py-6 flex justify-between items-center border-b border-dark-border">
        <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <Plus className="w-7 h-7 rotate-45" />
        </button>
        <span className="font-display font-semibold text-white text-base">
          {isEditing ? 'Detail material' : 'Material baru'}
        </span>
        {isEditing ? (
          <button onClick={handleDelete} className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-10 space-y-10 no-scrollbar">
        <div className="space-y-4">
          <label className="text-label ml-2">Spesifikasi Material</label>
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 focus-within:border-neon-lime/30 transition-all">
            <input
              required
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Telur, Susu, Cokelat"
              className="w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-white/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <p className="text-caption mb-1">Kode Material</p>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="RAW-MAT"
                className="w-full bg-transparent text-sm font-semibold text-neon-lime outline-none"
              />
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <p className="text-caption mb-1">Satuan Ukur</p>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, box, liter"
                className="w-full bg-transparent text-sm font-semibold text-white outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-label ml-2">Stok & inventaris</label>
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-caption">Kuantitas</p>
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="bg-transparent text-3xl font-bold text-white outline-none w-32"
                />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Box className="w-6 h-6 text-white/20" />
              </div>
          </div>
        </div>

        <div className="space-y-4 pb-12">
          <label className="text-label ml-2">Estimasi Nilai</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-2">
              <p className="text-caption">Biaya Kulakan</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/20 font-bold">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cost}
                  onChange={(e) => setCost(formatNumber(e.target.value))}
                  placeholder="0"
                  className="w-full bg-transparent text-base font-bold text-white outline-none"
                />
              </div>
            </div>
            <div className="bg-dark-card border border-neon-lime/20 rounded-xl p-4 space-y-2">
              <p className="text-caption text-neon-lime/60">Harga Output</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-neon-lime/40 font-bold">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(formatNumber(e.target.value))}
                  placeholder="0"
                  className="w-full bg-transparent text-base font-bold text-neon-lime outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="p-8 pt-4 bg-dark-bg border-t border-dark-border">
        <button
          disabled={!name || loading}
          onClick={handleSubmit}
          className="btn-primary w-full h-16"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Simpan data material</span>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function CheckIcon() {
    return (
        <div className="w-6 h-6 rounded-full bg-dark-bg/20 flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[4] -rotate-45" />
        </div>
    )
}
