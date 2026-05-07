import React, { useState } from 'react';
import { Customer, OperationType, UserProfile } from '../types';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Plus, Search, User, Phone, Mail, ChevronRight, UserPlus, Trash2, X, Loader2, Coins, Check, Zap } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CustomersProps {
  customers: Customer[];
  profile: UserProfile;
  activeBranchId: string;
}

export function Customers({ customers, profile, activeBranchId }: CustomersProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
          placeholder="Cari pelanggan..." 
          className="input-field pl-14"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <p className="text-label mb-0.5">Manajemen pelanggan</p>
            <h2>Database cabang</h2>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="w-12 h-12 rounded-xl bg-neon-lime text-black flex items-center justify-center shadow-lg shadow-neon-lime/10 active:scale-95 transition-all"
          >
            <UserPlus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="grid gap-4">
           {filtered.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className="w-full card-fintech flex items-center justify-between group transition-colors hover:bg-white/[0.02]"
            >
               <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon-lime/10 flex items-center justify-center text-neon-lime">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white text-base leading-none mb-1">{c.name}</h3>
                  <p className="text-caption leading-none">{c.phone || 'Non-WhatsApp'}</p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-4">
                <div className="text-right">
                  <p className="text-label text-white/40 mb-1">Total belanja</p>
                  <p className="text-base font-bold text-white">
                     {formatCurrency(c.totalSpent, profile.currency)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-neon-lime transition-colors" />
              </div>
            </button>
          ))}
          {customers.length === 0 && (
            <div className="py-20 text-center card-fintech border-dashed">
              <User className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-caption px-12">Database pelanggan masih kosong di cabang ini</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(isAddOpen || selectedCustomer) && (
          <CustomerModal 
            onClose={() => { setIsAddOpen(false); setSelectedCustomer(null); }}
            customer={selectedCustomer || undefined}
            profile={profile}
            activeBranchId={activeBranchId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerModal({ onClose, customer, profile, activeBranchId }: { onClose: () => void, customer?: Customer, profile: UserProfile, activeBranchId: string }) {
  const isEditing = !!customer;
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || loading) return;

    setLoading(true);
    try {
      if (isEditing && customer) {
        await updateDoc(doc(db, 'customers', customer.id), { name, phone, email });
      } else {
        await addDoc(collection(db, 'customers'), {
          name,
          phone,
          email,
          totalSpent: 0,
          totalDebt: 0,
          userId: auth.currentUser?.uid,
          branchId: activeBranchId,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer || !window.confirm('Hapus profil pelanggan? All history will remain in invoices but identity will be removed.')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'customers', customer.id));
      onClose();
    } catch (err) {
       handleFirestoreError(err, OperationType.DELETE, `customers/${customer.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ y: 500 }} animate={{ y: 0 }} exit={{ y: 500 }} className="fixed inset-0 bg-dark-bg z-[160] flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2 shadow-2xl">
       <header className="px-6 py-6 flex justify-between items-center border-b border-dark-border">
         <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
         <span className="font-display font-semibold text-white text-base">Profil pelanggan</span>
         <div className="w-10 text-right">
           {isEditing && (
              <button onClick={handleDelete} className="p-2 text-danger hover:bg-danger/10 rounded-lg">
                 <Trash2 className="w-5 h-5" />
              </button>
           )}
         </div>
       </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-10 space-y-8 no-scrollbar">
          <div className="space-y-4">
            <label className="text-label ml-2">Data personal</label>
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-6">
                <div className="space-y-2">
                    <p className="text-caption ml-1">Nama lengkap</p>
                    <div className="flex items-center gap-3 bg-dark-bg/60 p-4 rounded-lg border border-white/5">
                        <User className="w-5 h-5 text-neon-lime/40" />
                        <input 
                            required
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-caption ml-1">Nomor WhatsApp</p>
                    <div className="flex items-center gap-3 bg-dark-bg/60 p-4 rounded-lg border border-white/5">
                        <Phone className="w-5 h-5 text-neon-lime/40" />
                        <input 
                            type="text" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)}
                            placeholder="0812..."
                            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-caption ml-1">Alamat email</p>
                    <div className="flex items-center gap-3 bg-dark-bg/60 p-4 rounded-lg border border-white/5">
                        <Mail className="w-5 h-5 text-neon-lime/40" />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            placeholder="pelanggan@mail.com"
                            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                        />
                    </div>
                </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4 pt-4">
                <label className="text-label ml-2">Analitik loyalitas</label>
                <div className="card-fintech space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neon-lime/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-neon-lime" />
                        </div>
                        <p className="text-body font-semibold">Statistik belanja</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 w-full">
                        <div className="space-y-1">
                            <p className="text-caption">Total belanja</p>
                            <p className="text-lg font-bold text-neon-lime">{formatCurrency(customer!.totalSpent, profile.currency)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-caption text-right">Saldo piutang</p>
                            <p className={cn(
                                "text-lg font-bold text-right",
                                customer!.totalDebt > 0 ? "text-danger" : "text-white/20"
                            )}>
                                {formatCurrency(customer!.totalDebt, profile.currency)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </form>

       <div className="p-8 bg-dark-bg border-t border-dark-border">
          <button 
            disabled={loading || !name}
            onClick={handleSubmit}
            className="btn-primary w-full h-16"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Simpan data pelanggan</span>
              </div>
            )}
          </button>
       </div>
    </motion.div>
  );
}
