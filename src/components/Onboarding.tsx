import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, OperationType } from '../types';
import { Building2, Sparkles, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Onboarding({ user }: { user: User }) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Retail');
  const [branchName, setBranchName] = useState('Cabang Utama');
  const [branchAddress, setBranchAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create Profile
      const profile: UserProfile = {
        businessName,
        businessType,
        currency: 'IDR',
        email: user.email || '',
        onboardingCompleted: false, // will set to true after branch
        createdAt: serverTimestamp() as any,
      };
      await setDoc(doc(db, 'userProfiles', user.uid), profile);

      // 2. Create Initial Branch
      const branchRef = await addDoc(collection(db, 'branches'), {
        name: branchName,
        address: branchAddress,
        phone: '',
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // 3. Complete Onboarding with activeBranchId
      await setDoc(doc(db, 'userProfiles', user.uid), {
        ...profile,
        onboardingCompleted: true,
        activeBranchId: branchRef.id,
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'onboarding');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && businessName) setStep(2);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-lime/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-4 text-center items-center flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center text-neon-lime">
                  <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold leading-tight">Beritahu kami tentang <span className="text-neon-lime">bisnis kamu.</span></h1>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-label ml-2">Nama bisnis</label>
                  <input
                    autoFocus
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Jago Kopi"
                    className="input-field py-5 px-6 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-label ml-2">Kategori</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Retail', 'F&B', 'Jasa', 'Lainnya'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setBusinessType(type)}
                        className={`h-14 rounded-xl border-2 font-semibold text-sm transition-all ${
                          businessType === type 
                            ? 'bg-neon-lime text-black border-neon-lime' 
                            : 'bg-white/5 border-transparent text-white/40'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!businessName}
                onClick={nextStep}
                className="btn-primary w-full h-16 text-sm"
              >
                <span>Lanjut ke lokasi</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-4 text-center items-center flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center text-neon-lime">
                  <MapPin className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold leading-tight">Lokasi <span className="text-neon-lime">cabang pertama.</span></h1>
                <p className="text-white/40 text-sm leading-relaxed">Multi-cabang memungkinkan kamu mengelola banyak toko dalam satu akun.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-label ml-2">Nama cabang / toko</label>
                  <input
                    autoFocus
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Contoh: Cabang Utama"
                    className="input-field py-5 px-6 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-label ml-2">Alamat (opsional)</label>
                  <input
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="Alamat toko..."
                    className="input-field py-5 px-6 text-base"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  disabled={loading || !branchName}
                  onClick={handleSubmit}
                  className="btn-primary w-full h-16 text-sm"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : (
                    <div className="flex items-center gap-2">
                      <span>Selesaikan setup</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </button>
                <button onClick={() => setStep(1)} className="w-full py-4 text-xs font-semibold text-white/20 hover:text-white transition-colors">
                  Kembali edit bisnis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
