import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
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
      setInsight("Error getting insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden my-4 group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-indigo-400" />
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300">Smart Insights</h4>
      </div>

      <div className="relative z-10 min-h-[100px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest animate-pulse">Analyzing your data...</p>
          </div>
        ) : insight ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-indigo-50 text-sm leading-relaxed font-medium whitespace-pre-wrap italic">
              "{insight}"
            </div>
            <button 
              onClick={fetchInsights}
              className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Refresh Insights
            </button>
          </motion.div>
        ) : (
          <div className="text-center py-6">
            <p className="text-indigo-100/60 text-sm mb-6 leading-relaxed">
              Get customized recommendations based on your transaction patterns.
            </p>
            <button
              onClick={fetchInsights}
              className="bg-indigo-500 text-white font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Generate AI Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
