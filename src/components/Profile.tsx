import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { LogOut, Store, Mail, Globe, Settings, ShieldCheck, ChevronRight, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  profile: UserProfile;
  user: FirebaseUser;
  onManageBranches: () => void;
}

export function Profile({ profile, user, onManageBranches }: ProfileProps) {
  const handleSignOut = () => auth.signOut();

  return (
    <div className="section-container">
      <header className="text-center group pt-10">
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 mx-auto mb-6 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-all">
          <Store className="w-10 h-10 text-neon-lime relative z-10" />
        </div>
        <h1 className="text-3xl font-bold text-white leading-tight mb-2">{profile.businessName}</h1>
        <div className="inline-flex bg-neon-lime/10 border border-neon-lime/20 rounded-full py-1.5 px-4 items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse" />
            <span className="text-caption !text-neon-lime font-medium">
                {profile.businessType || 'UMKM Digital'}
            </span>
        </div>
      </header>

      <div className="space-y-8 pt-4">
        <section className="space-y-4">
          <h2 className="px-1 text-lg">Identitas bisnis</h2>
          <div className="card-fintech !p-0 overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-label text-white/40">Penanggung jawab</span>
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon-lime/5 border border-neon-lime/20 flex items-center justify-center text-neon-lime">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-label text-neon-lime/60">Wilayah operasi</span>
                  <span className="text-sm font-semibold text-white">{profile.currency} (Indonesia)</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-1 text-lg">Pengaturan sistem</h2>
          <div className="space-y-3">
            <button 
                onClick={onManageBranches}
                className="w-full flex items-center justify-between p-5 card-fintech hover:border-neon-lime/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-neon-lime group-hover:text-black transition-all">
                   <Building2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="text-sm font-bold text-white block">Manajemen cabang</span>
                    <span className="text-caption text-white/30">Multi-branch system</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </button>

            <button className="w-full flex items-center justify-between p-5 card-fintech hover:border-neon-lime/30 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-neon-lime group-hover:text-black transition-all">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="text-sm font-bold text-white block">Keamanan data</span>
                    <span className="text-caption text-white/30">Proteksi digital</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </button>
          </div>
        </section>

        <button 
          onClick={handleSignOut}
          className="w-full h-16 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Keluar sistem</span>
        </button>
      </div>

      <div className="pt-12 pb-8 text-center">
        <p className="text-caption text-white/10">
            Jago UMKM engine core v5.0
        </p>
      </div>
    </div>
  );
}
