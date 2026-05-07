import React, { useState } from 'react';
import { Branch, OperationType } from '../types';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { X, Plus, MapPin, Phone, Building2, Trash2, Check, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BranchManagerProps {
  onClose: () => void;
  branches: Branch[];
}

export function BranchManager({ onClose, branches }: BranchManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setIsAdding(false);
    setEditingBranch(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || loading) return;

    setLoading(true);
    try {
      if (editingBranch) {
        await updateDoc(doc(db, 'branches', editingBranch.id), {
          name,
          address,
          phone,
        });
      } else {
        await addDoc(collection(db, 'branches'), {
          name,
          address,
          phone,
          userId: auth.currentUser?.uid,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, editingBranch ? `branches/${editingBranch.id}` : 'branches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus cabang ini? Semua data terkait (transaksi, stok, dll) akan tetap ada tetapi tidak terlihat jika cabang dipilih.')) return;
    try {
      await deleteDoc(doc(db, 'branches', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `branches/${id}`);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
    setPhone(branch.phone);
    setIsAdding(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[150] bg-dark-bg flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2"
    >
      <header className="px-6 py-5 flex justify-between items-center border-b border-dark-border">
        <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <span className="font-display font-semibold text-white text-base">
          Manajemen cabang
        </span>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {!isAdding ? (
          <>
            <div className="flex justify-between items-end px-1">
              <div>
                <p className="text-label mb-0.5">Daftar lokasi</p>
                <h2>Daftar cabang</h2>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="w-12 h-12 rounded-xl bg-neon-lime text-black flex items-center justify-center shadow-lg shadow-neon-lime/10 active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            <div className="space-y-4">
              {branches.map((branch) => (
                <div key={branch.id} className="card-fintech flex justify-between items-center group transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-lime/10 flex items-center justify-center text-neon-lime">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base leading-none mb-1">{branch.name}</h3>
                      <div className="flex items-center gap-2 text-caption">
                        <MapPin className="w-3 h-3 text-white/20" />
                        <span className="truncate max-w-[150px]">{branch.address || 'Tanpa alamat'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(branch)} className="p-2 text-white/20 hover:text-neon-lime transition-colors">
                      <Building2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(branch.id)} className="p-2 text-white/20 hover:text-danger transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {branches.length === 0 && (
                <div className="py-20 text-center card-fintech border-dashed">
                   <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
                   <p className="text-caption">Belum ada cabang terdaftar</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1 px-1">
              <h2>{editingBranch ? 'Edit cabang' : 'Tambah cabang baru'}</h2>
              <p className="text-caption">Lengkapi detail lokasi usaha kamu di bawah ini.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-label ml-2">Nama cabang</label>
                <div className="flex items-center gap-4 bg-dark-card border border-dark-border p-4 rounded-xl focus-within:border-neon-lime/30 transition-shadow">
                  <Building2 className="w-5 h-5 text-white/20" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Jago UMKM Pusat"
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-label ml-2">Alamat lengkap</label>
                <div className="flex items-start gap-4 bg-dark-card border border-dark-border p-4 rounded-xl focus-within:border-neon-lime/30 transition-shadow">
                  <MapPin className="w-5 h-5 text-white/20 mt-0.5" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat detail cabang..."
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/10 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-label ml-2">Telepon cabang</label>
                <div className="flex items-center gap-4 bg-dark-card border border-dark-border p-4 rounded-xl focus-within:border-neon-lime/30 transition-shadow">
                  <Phone className="w-5 h-5 text-white/20" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nomor telepon aktif..."
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 h-14 rounded-xl border border-dark-border text-white text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !name}
                className="btn-primary flex-[2] h-14"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>{editingBranch ? 'Simpan' : 'Daftarkan'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
