import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { LogOut, Store, Mail, Globe, Settings, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  profile: UserProfile;
  user: FirebaseUser;
}

export function Profile({ profile, user }: ProfileProps) {
  const handleSignOut = () => auth.signOut();

  return (
    <div className="px-6">
      <header className="mb-10 text-center">
        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/5" />
          <Store className="w-10 h-10 text-indigo-600 relative z-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1">{profile.businessName}</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{profile.businessType || 'General SME'}</p>
      </header>

      <div className="space-y-6">
        <section>
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-2">Account Info</h4>
          <div className="bg-slate-50 rounded-3xl p-2">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                <p className="text-sm font-bold text-slate-700">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Currency</p>
                  <p className="text-sm font-bold text-slate-700">{profile.currency}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200" />
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-2">Preferences</h4>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl group transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">App Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200" />
            </button>
            <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl group transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">Security & Privacy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </section>

        <button 
          onClick={handleSignOut}
          className="w-full mt-12 bg-rose-50 text-rose-600 font-black py-5 px-6 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs">Sign Out</span>
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.3em]">SmartBiz v1.0.0</p>
      </div>
    </div>
  );
}
