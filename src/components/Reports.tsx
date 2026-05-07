import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Transaction, UserProfile, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths, startOfDay, endOfDay, subDays, subWeeks, isSameDay } from 'date-fns';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import React, { useState } from 'react';

interface ReportsProps {
  transactions: Transaction[];
  profile: UserProfile;
}

type Range = 'today' | 'week' | 'month' | '6months' | 'custom';

export function Reports({ transactions, profile }: ReportsProps) {
  const [range, setRange] = useState<Range>('month');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const getRangeInterval = () => {
    const now = new Date();
    switch (range) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfDay(subWeeks(now, 1)), end: endOfDay(now) };
      case '6months':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      case 'custom':
        return { 
          start: startOfDay(new Date(customStart)), 
          end: endOfDay(new Date(customEnd)) 
        };
      case 'month':
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const currentInterval = getRangeInterval();

  const filteredTransactions = transactions.filter(t => 
    isWithinInterval(t.date.toDate(), currentInterval)
  );

  const stats = {
    income: filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((a, b) => a + b.amount, 0),
    expense: filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((a, b) => a + b.amount, 0),
  };
  const profit = stats.income - stats.expense;

  const summaryData = [
    { name: 'Pemasukan', value: stats.income, color: '#39FF14' },
    { name: 'Pengeluaran', value: stats.expense, color: 'rgba(255,255,255,0.1)' }
  ].filter(item => item.value > 0);

  const categoryData = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc: any[], t) => {
      const normalizedCategory = t.category.toLowerCase() === 'stok barang' ? 'Bahan Baku' : t.category;
      const existing = acc.find(item => item.name === normalizedCategory);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: normalizedCategory, value: t.amount });
      }
      return acc;
    }, []);

  const NEON_COLORS = ['#39FF14', '#CCFF00', '#00FFF0', '#FF007F', '#BC13FE', '#FFFB1D'];

  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const mStart = startOfMonth(d);
    const mEnd = endOfMonth(d);
    const mtxs = transactions.filter(t => isWithinInterval(t.date.toDate(), { start: mStart, end: mEnd }));
    
    return {
      name: format(d, 'MMM'),
      income: mtxs.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0),
      expense: mtxs.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0),
    };
  });

  return (
    <div className="section-container pb-32">
      <header className="flex justify-between items-end px-1">
        <div>
          <p className="text-label mb-0.5">Business intel</p>
          <h1 className="text-neon-lime text-2xl">Financial Report</h1>
        </div>
        <Activity className="w-8 h-8 text-white/10" />
      </header>

      {/* Range Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
            {(['today', 'week', 'month', '6months', 'custom'] as Range[]).map((r) => (
                <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        range === r 
                            ? 'bg-neon-lime text-black border-neon-lime shadow-lg shadow-neon-lime/20' 
                            : 'bg-white/5 text-white/40 border-transparent hover:text-white'
                    }`}
                >
                    {r === 'today' && 'Hari Ini'}
                    {r === 'week' && '7 Hari'}
                    {r === 'month' && 'Bulan Ini'}
                    {r === '6months' && '6 Bulan'}
                    {r === 'custom' && 'Kustom'}
                </button>
            ))}
        </div>

        {range === 'custom' && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                    <label className="text-[10px] text-white/20 ml-2">Mulai</label>
                    <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon-lime/30"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-white/20 ml-2">Sampai</label>
                    <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon-lime/30"
                    />
                </div>
            </div>
        )}
      </div>

      {/* PnL Dashboard */}
      <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 card-fintech relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Wallet className="w-16 h-16 text-neon-lime" />
              </div>
              <div className="relative z-10 space-y-1">
                  <span className="text-label text-neon-lime">Total Keuntungan Bersih</span>
                  <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(profit, profile.currency)}</p>
                  <p className="text-[10px] text-white/20">Selisih Pemasukan & Pengeluaran</p>
              </div>
          </div>
          
          <div className="card-fintech group">
              <div className="flex items-center gap-2 text-neon-lime mb-2">
                  <ArrowUpCircle className="w-4 h-4" />
                  <span className="text-label text-neon-lime/60">Pemasukan</span>
              </div>
              <p className="text-xl font-bold text-white leading-none">{formatCurrency(stats.income, profile.currency)}</p>
          </div>

          <div className="card-fintech group">
              <div className="flex items-center gap-2 text-white/30 mb-2">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span className="text-label text-white/20">Pengeluaran</span>
              </div>
              <p className="text-xl font-bold text-white leading-none">{formatCurrency(stats.expense, profile.currency)}</p>
          </div>
      </div>

      {/* Cashflow Summary Chart */}
      <div className="card-fintech group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-neon-lime" />
                <h3 className="text-label">Performa Pemasukan vs Pengeluaran</h3>
            </div>
            
            <div className="h-[200px] w-full">
            {summaryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summaryData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={85}
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: '700', fill: 'rgba(255,255,255,0.6)' }}
                        />
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value, profile.currency)}
                            contentStyle={{ 
                                backgroundColor: '#0A0A0B', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '8px 12px',
                                fontSize: '12px', 
                                fontWeight: '600',
                                color: '#fff'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                            {summaryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/5 space-y-4">
                    <BarChart3 className="w-12 h-12" />
                    <p className="text-caption">Belum ada data transaksi</p>
                </div>
            )}
            </div>
        </div>
      </div>

      {/* Monthly Expense Breakdown */}
      <div className="card-fintech group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-neon-lime" />
                <h3 className="text-label">Distribusi biaya periode ini</h3>
            </div>
            
            <div className="h-[240px] w-full">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    >
                    {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => formatCurrency(value, profile.currency)}
                        contentStyle={{ 
                            backgroundColor: '#0A0A0B', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '8px 12px',
                            fontSize: '12px', 
                            fontWeight: '600',
                            color: '#fff'
                        }}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/5 space-y-4">
                    <PieIcon className="w-12 h-12" />
                    <p className="text-caption">Tidak ada pengeluaran di periode ini</p>
                </div>
            )}
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
            {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: NEON_COLORS[i % NEON_COLORS.length] }} />
                <div className="flex flex-col min-w-0">
                    <span className="text-label text-white/40 truncate">{item.name}</span>
                    <span className="text-sm font-bold text-white leading-tight">{formatCurrency(item.value, profile.currency)}</span>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card-fintech group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-neon-lime" />
                <h3 className="text-label">Performa 6 bulan terakhir</h3>
            </div>

            <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: '500', fill: 'rgba(255,255,255,0.2)' }} 
                />
                <YAxis hide />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ 
                        backgroundColor: '#0A0A0B', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}
                />
                <Bar name="Pendapatan" dataKey="income" fill="#39FF14" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar name="Pengeluaran" dataKey="expense" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
