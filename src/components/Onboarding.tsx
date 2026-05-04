import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { UserProfile, OperationType } from '../types';
import { Check, ArrowRight, Store, CircleDollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  user: User;
}

export function Onboarding({ user }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const profile: UserProfile = {
        businessName,
        currency,
        businessType,
        email: user.email || '',
        onboardingCompleted: true,
        createdAt: serverTimestamp() as any,
      };
      await setDoc(doc(db, 'userProfiles', user.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `userProfiles/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 py-12 justify-center font-sans">
      <div className="mb-12">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-slate-100'}`} 
            />
          ))}
        </div>
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Step {step} of 3</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">What's your business name?</h2>
            <p className="text-slate-500 mb-8">This will be used in your financial reports.</p>
            <div className="relative">
              <Store className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Kedai Kopi Mantap"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              disabled={!businessName}
              onClick={() => setStep(2)}
              className="mt-12 w-full bg-indigo-600 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">Choose your currency</h2>
            <p className="text-slate-500 mb-8">Select the currency you use for your business.</p>
            <div className="grid grid-cols-2 gap-4">
              {['IDR', 'USD', 'SGD', 'MYR'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`py-6 px-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    currency === curr 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <CircleDollarSign className={`w-8 h-8 ${currency === curr ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-lg">{curr}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              className="mt-12 w-full bg-indigo-600 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">One last thing...</h2>
            <p className="text-slate-500 mb-8">What type of business are you running?</p>
            <div className="space-y-4">
              {['Retail', 'F&B', 'Services', 'Manufacturing', 'Technology'].map((type) => (
                <button
                  key={type}
                  onClick={() => setBusinessType(type)}
                  className={`w-full py-4 px-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    businessType === type 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <span className="font-bold">{type}</span>
                  {businessType === type && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              ))}
            </div>
            <button
              disabled={!businessType || loading}
              onClick={handleSubmit}
              className="mt-12 w-full bg-indigo-600 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100"
            >
              {loading ? 'Please wait...' : 'Let\'s Get Started!'} 
              {!loading && <Check className="w-5 h-5" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
