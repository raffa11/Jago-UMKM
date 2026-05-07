import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, handleFirestoreError } from './lib/firebase';
import { Transaction, UserProfile, Product, Customer, Invoice, Branch, OperationType } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Reports } from './components/Reports';
import { Onboarding } from './components/Onboarding';
import { Profile } from './components/Profile';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Customers } from './components/Customers';
import { AddTransaction } from './components/AddTransaction';
import { BranchSelector } from './components/BranchSelector';
import { BranchManager } from './components/BranchManager';
import { LogIn, Loader2, Plus, Coins, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Jago UMKM - Main Application Controller
 * Handles core lifecycle:
 * 1. Authentication state (Firebase Auth)
 * 2. Multi-branch data synchronization
 * 3. Real-time Firestore subscriptions with strict user scoping
 */
export default function App() {
  // --- Core State ---
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // --- Business Entities ---
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // --- UI Lifecycle ---
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'inventory' | 'reports' | 'profile'>('dashboard');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState(false);

  /**
   * Monitor Connectivity and Auth Session
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial splash delay
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        setProfile(null);
        setBranches([]);
        setTransactions([]);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(splashTimer);
      unsubscribeAuth();
    };
  }, []);

  /**
   * Data Layer Primary Synchronizer
   * Fetches User Profile and available Branches.
   * Scoped to Authenticated User UID only.
   */
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Listen to profile
    const profileRef = doc(db, 'userProfiles', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const pData = snap.data() as UserProfile;
        setProfile(pData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `userProfiles/${user.uid}`);
      setLoading(false);
    });

    // Listen to branches
    const branchesPath = 'branches';
    const branchesQuery = query(collection(db, branchesPath), where('userId', '==', user.uid));
    const unsubscribeBranches = onSnapshot(branchesQuery, (snap) => {
      const bData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Branch));
      setBranches(bData);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, branchesPath);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeBranches();
    };
  }, [user]);

  /**
   * Data Layer Secondary Synchronizer (Branch Scoped)
   * Real-time listeners for all financial records, scoped by Branch ID.
   */
  useEffect(() => {
    if (!user || !profile?.activeBranchId) {
      if (user && profile && branches.length > 0 && !profile.activeBranchId) {
        // Auto-select first branch if none active
        updateDoc(doc(db, 'userProfiles', user.uid), { activeBranchId: branches[0].id });
      }
      return;
    }
    
    // Branch context
    const branchId = profile.activeBranchId;

    // Listen to transactions
    const txPath = 'transactions';
    const q = query(
      collection(db, txPath),
      where('userId', '==', user.uid),
      where('branchId', '==', branchId),
      orderBy('date', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(txs);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, txPath);
    });

    // Listen to products
    const prodPath = 'products';
    const productsQuery = query(
      collection(db, prodPath),
      where('userId', '==', user.uid),
      where('branchId', '==', branchId)
    );
    const unsubscribeProducts = onSnapshot(productsQuery, (snap) => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(prods);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, prodPath);
    });

    // Listen to customers
    const custPath = 'customers';
    const customersQuery = query(
      collection(db, custPath),
      where('userId', '==', user.uid),
      where('branchId', '==', branchId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeCustomers = onSnapshot(customersQuery, (snap) => {
      const custs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
      setCustomers(custs);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, custPath);
    });

    // Listen to invoices
    const invPath = 'invoices';
    const invoicesQuery = query(
      collection(db, invPath),
      where('userId', '==', user.uid),
      where('branchId', '==', branchId),
      orderBy('date', 'desc')
    );
    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snap) => {
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
      setInvoices(invs);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, invPath);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeProducts();
      unsubscribeCustomers();
      unsubscribeInvoices();
    };
  }, [user, profile?.activeBranchId, branches.length]);

  const handleBranchSelect = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'userProfiles', user.uid), { activeBranchId: id });
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-lime/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-lime/5 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
            <Coins className="w-12 h-12 text-neon-lime" />
            <div className="absolute inset-0 bg-neon-lime/20 blur-2xl rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Jago <span className="text-neon-lime">UMKM</span></h1>
          <div className="w-48 h-1 bg-white/5 rounded-full mt-8 overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '100%' }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="h-full bg-neon-lime" 
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8">
          <Building2 className="w-10 h-10 opacity-50" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Koneksi terputus</h1>
        <p className="text-body text-white/40 mb-10 leading-relaxed max-w-xs">
          Sepertinya kamu sedang tidak terhubung ke internet. Pastikan koneksi kamu aktif untuk menggunakan Jago UMKM.
        </p>
        <button
          onClick={() => setIsOnline(window.navigator.onLine)}
          className="btn-primary w-full max-w-xs h-16 text-sm"
        >
          <span>Coba lagi</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-white">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-neon-lime animate-spin mb-6" />
          <div className="absolute inset-0 blur-xl bg-neon-lime/10 animate-pulse rounded-full" />
        </div>
        <p className="text-caption animate-pulse">Memuat aplikasi...</p>
      </div>
    );
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login Error:", error);
      alert(`Gagal masuk: ${error.message || "Pastikan browser kamu mengizinkan popup."}`);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg px-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-lime/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <Coins className="w-10 h-10 text-neon-lime" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Jago <span className="text-neon-lime">UMKM</span>
          </h1>
          <p className="text-body text-white/40 mb-10 leading-relaxed px-4">
            Kelola bisnis kamu dengan wawasan cerdas dan manajemen multi-cabang yang modern.
          </p>
          <button
            onClick={handleSignIn}
            className="btn-primary w-full h-16 text-sm"
          >
            <LogIn className="w-5 h-5 stroke-[3]" />
            <span>Masuk dengan Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile || !profile.onboardingCompleted) {
    return <Onboarding user={user} />;
  }

  const renderContent = () => {
    if (branches.length === 0 && activeTab !== 'profile') {
        return (
            <div className="px-8 py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center mx-auto text-neon-lime">
                    <Building2 className="w-8 h-8" />
                </div>
                <h2>Buat cabang pertama</h2>
                <p className="text-caption leading-relaxed max-w-[240px] mx-auto">Mendaftarkan cabang bisnis untuk mulai mencatat transaksi.</p>
                <button 
                    onClick={() => setIsBranchManagerOpen(true)}
                    className="btn-primary py-4 px-8 text-sm"
                >
                    <span>Mulai sekarang</span>
                </button>
            </div>
        );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} profile={profile} products={products} branches={branches} />;
      case 'sales':
        return <Sales products={products} customers={customers} invoices={invoices} profile={profile} activeBranchId={profile.activeBranchId!} />;
      case 'inventory':
        return <Inventory products={products} profile={profile} activeBranchId={profile.activeBranchId!} />;
      case 'reports':
        return <Reports transactions={transactions} profile={profile} />;
      case 'profile':
        return <Profile profile={profile} user={user} onManageBranches={() => setIsBranchManagerOpen(true)} />;
      default:
        return <Dashboard transactions={transactions} profile={profile} products={products} branches={branches} />;
    }
  };

  return (
    <>
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      headerRight={
        <BranchSelector 
            branches={branches} 
            activeBranchId={profile.activeBranchId} 
            onSelect={handleBranchSelect} 
            onManage={() => setIsBranchManagerOpen(true)}
        />
      }
    >
      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (profile.activeBranchId || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pb-24"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
    
    <button 
      onClick={() => setIsAddingTransaction(true)}
      disabled={branches.length === 0}
      className="fixed bottom-28 right-6 w-16 h-16 bg-neo-gradient text-dark-bg rounded-[1.75rem] shadow-2xl shadow-neon-lime/30 flex items-center justify-center z-40 active:scale-90 transition-all md:left-[calc(50%+130px)] md:right-auto disabled:opacity-20 neo-shadow"
    >
      <Plus className="w-9 h-9 stroke-[4]" />
    </button>

    <AnimatePresence>
      {isAddingTransaction && profile.activeBranchId && (
        <AddTransaction 
          onClose={() => setIsAddingTransaction(false)} 
          profile={profile}
          products={products}
          activeBranchId={profile.activeBranchId}
        />
      )}
      {isBranchManagerOpen && (
        <BranchManager 
            onClose={() => setIsBranchManagerOpen(false)} 
            branches={branches} 
        />
      )}
    </AnimatePresence>
    </>
  );
}
