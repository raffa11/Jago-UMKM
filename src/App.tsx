import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { Transaction, UserProfile } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Reports } from './components/Reports';
import { Onboarding } from './components/Onboarding';
import { Profile } from './components/Profile';
import { LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'profile'>('dashboard');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        setProfile(null);
        setTransactions([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Listen to profile
    const profileRef = doc(db, 'userProfiles', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Profile listen error:", err);
      setLoading(false);
    });

    // Listen to transactions
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(txs);
    }, (err) => {
      console.error("Transactions listen error:", err);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeTransactions();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse font-sans">Loading SmartBiz Finance...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 mb-8 shadow-xl shadow-indigo-100">
            <span className="text-3xl font-bold text-white font-sans">SB</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4 font-sans leading-tight">SmartBiz Finance</h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed px-4 font-sans">
            Simplify your SME finances with real-time tracking and AI insights.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-4 px-6 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98] font-sans"
          >
            <LogIn className="w-5 h-5 text-indigo-600" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile || !profile.onboardingCompleted) {
    return <Onboarding user={user} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} profile={profile} />;
      case 'transactions':
        return <TransactionList transactions={transactions} profile={profile} />;
      case 'reports':
        return <Reports transactions={transactions} profile={profile} />;
      case 'profile':
        return <Profile profile={profile} user={user} />;
      default:
        return <Dashboard transactions={transactions} profile={profile} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-24 pt-4"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
