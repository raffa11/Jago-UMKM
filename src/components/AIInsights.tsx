import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFinancialInsights } from '../services/aiService';
import { Transaction, UserProfile } from '../types';

interface AIInsightsProps {
  transactions: Transaction[];
  profile: UserProfile;
}

export function AIInsights({ transactions, profile }: AIInsightsProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const result = await getFinancialInsights(transactions, profile.businessName);
      setInsight(result);
    } catch (err) {
      console.error(err);
      setInsight("Maaf, terjadi gangguan saat menganalisis data cabang Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-primary p-1 rounded-[3rem] relative overflow-hidden group">
      <div className="absolute inset-0 bg-neo-gradient opacity-[0.05]" />
      <div className="bg-dark-card rounded-[2.8rem] p-8 relative z-10 space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neon-lime/10 flex items-center justify-center border border-neon-lime/20 shadow-lg shadow-neon-lime/5">
                    <Sparkles className="w-6 h-6 text-neon-lime" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-lime">Jago AI Core</h4>
                    <p className="text-xs font-bold text-white/40 italic">Predictive Analysis</p>
                </div>
            </div>
            {!loading && insight && (
                <button 
                  onClick={fetchInsights}
                  className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-white transition-colors"
                >
                  <Zap className="w-4 h-4" />
                </button>
            )}
        </div>

        <div className="relative min-h-[120px] flex flex-col justify-center">
            {loading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                    <div className="relative">
                        <Loader2 className="w-10 h-10 text-neon-lime animate-spin" />
                        <div className="absolute inset-0 blur-lg bg-neon-lime/20 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black text-neon-lime/60 uppercase tracking-[0.4em] animate-pulse">Scanning Data...</p>
                </div>
            ) : insight ? (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <p className="text-white text-sm leading-relaxed font-semibold italic border-l-2 border-neon-lime/30 pl-6 py-1">
                        "{insight}"
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-neon-lime shadow-[0_0_8px_#39FF14]" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Wawasan Siap Digunakan</span>
                    </div>
                </motion.div>
            ) : (
                <div className="text-center space-y-8 py-6">
                    <p className="text-white/40 text-sm leading-relaxed px-6">
                        Dapatkan strategi pertumbuhan eksklusif dari AI untuk cabang ini.
                    </p>
                    <button
                        onClick={fetchInsights}
                        className="w-full bg-white text-dark-bg font-black py-5 px-8 rounded-[1.75rem] text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        Aktifkan Jago AI <Sparkles className="w-4 h-4 text-neon-lime fill-neon-lime" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
