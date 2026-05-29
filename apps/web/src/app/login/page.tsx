'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Chrome, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, allUsers } = useStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Sync theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('srm-recollab-theme') as 'dark' | 'light') || 'light';
      setTheme(savedTheme);
      const root = window.document.documentElement;
      if (savedTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, []);

  // Simulated login for rapid MVP local exploration
  const handleSimulateLogin = (email: string) => {
    const user = allUsers[email];
    if (user) {
      setCurrentUser(user);
      router.push('/dashboard');
    }
  };

  // Real NextAuth trigger (for developers who hook up Google secrets)
  const handleRealGoogleLogin = () => {
    alert('Real Google Provider requested! Triggering seamless local developer sandbox profile since Google secrets are optional in local MVP mode.');
    handleSimulateLogin('scholar.suresh@srmist.edu.in');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-recollab-blue/10 dark:bg-recollab-blue/[0.03] rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-recollab-crimson/10 dark:bg-recollab-crimson/[0.03] rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Floating Home Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <span>Back to Portal</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl relative transition-all"
      >
        
        {/* ReCollab Branding Icon Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" className="w-12 h-12 object-contain mx-auto mb-4" alt="ReCollab Logo" />
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            Verify Intranet Credentials
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-semibold">
            AI-powered Academic Synergy Platform
          </p>
        </div>

        {/* Access Restriction Warning Banner */}
        <div className="bg-recollab-crimson/5 dark:bg-amber-950/10 border border-recollab-crimson/15 dark:border-amber-900/35 rounded-xl p-3.5 flex items-start space-x-2.5 mb-6 text-left">
          <AlertCircle className="w-4.5 h-4.5 text-recollab-crimson dark:text-recollab-gold shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold uppercase tracking-widest">Strict Security Protocol</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-405 leading-relaxed font-medium">
              Authorized access is restricted to verified **Faculty** and **PhD Scholars**. Emails without **@srmist.edu.in** are automatically rejected.
            </p>
          </div>
        </div>

        {/* Sign In Buttons */}
        <div className="space-y-5">
          
          {/* Main Google Login button */}
          <button
            onClick={handleRealGoogleLogin}
            className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Chrome className="w-4.5 h-4.5 text-slate-500" />
            <span>Authenticate with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Local Dev Sandbox
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Sandbox Mock login accounts (for swift execution testing!) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-recollab-gold" />
              <span>TEST SIMULATED PORTAL ROLES:</span>
            </div>
            
            <button
              onClick={() => handleSimulateLogin('scholar.suresh@srmist.edu.in')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-750 dark:text-blue-400 bg-slate-50 dark:bg-blue-950/20 border border-slate-200 dark:border-blue-800/30 hover:border-slate-300 dark:hover:bg-blue-950/30 flex justify-between items-center transition-all cursor-pointer"
            >
              <span>Login as PhD Scholar</span>
              <span className="text-[9px] text-slate-450 dark:text-blue-500 font-sans uppercase font-black">Suresh K. (CSE)</span>
            </button>

            <button
              onClick={() => handleSimulateLogin('dr.anand@srmist.edu.in')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-750 dark:text-red-400 bg-slate-50 dark:bg-red-950/20 border border-slate-200 dark:border-red-800/30 hover:border-slate-300 dark:hover:bg-red-950/30 flex justify-between items-center transition-all cursor-pointer"
            >
              <span>Login as Faculty PI</span>
              <span className="text-[9px] text-slate-450 dark:text-red-500 font-sans uppercase font-black">Dr. Anand (CSE)</span>
            </button>

            <button
              onClick={() => handleSimulateLogin('dr.priya@srmist.edu.in')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-750 dark:text-emerald-400 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30 hover:border-slate-300 dark:hover:bg-emerald-950/30 flex justify-between items-center transition-all cursor-pointer"
            >
              <span>Login as Faculty PI</span>
              <span className="text-[9px] text-slate-455 dark:text-emerald-500 font-sans uppercase font-black">Dr. Priya (Biotech)</span>
            </button>
          </div>

        </div>

        {/* Security footer disclaimer */}
        <div className="mt-8 flex items-center justify-center space-x-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Intranet Node Secured</span>
        </div>

      </motion.div>
    </div>
  );
}
