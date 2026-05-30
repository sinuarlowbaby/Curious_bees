'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Chrome, 
  AlertTriangle,
  GraduationCap,
  UserSquare,
  Lock,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Globe2,
  Search,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signInWithGoogle, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { syncUserSession, currentUser } = useStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [bypassRole, setBypassRole] = useState<'faculty' | 'scholar'>('faculty');

  // Detect if Firebase has placeholder/unconfigured environment keys
  const isFirebasePlaceholder = 
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your-firebase-api-key' ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith('mock-');

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setAuthLoading(true);

    try {
      // 1. Trigger Firebase Popup Google sign-in
      const { user } = await signInWithGoogle();
      const email = user.email || '';

      // 4. Connect to backend to sync profile / auto-create in Supabase
      const syncedUser = await syncUserSession();
      if (syncedUser) {
        router.push('/dashboard');
      } else {
        await signOut(auth);
        setErrorMsg('Authentication succeeded but failed to sync profile with backend database.');
      }
    } catch (e: any) {
      console.error(e);
      // Helpful fallback note on invalid API key
      if (e.message?.includes('auth/api-key-not-valid') || e.code?.includes('api-key-not-valid')) {
        setErrorMsg('Security Alert: The Firebase API key configured is invalid. Use the local sandbox bypass below.');
      } else {
        setErrorMsg(e.message || 'Authentication aborted or failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeveloperBypass = async () => {
    setErrorMsg(null);
    setAuthLoading(true);
    try {
      const mockToken = `mock-bypass-token-${bypassRole}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('recollab-mock-token', mockToken);
      }
      
      const syncedUser = await syncUserSession();
      if (syncedUser) {
        router.push('/dashboard');
      } else {
        setErrorMsg('Local developer bypass failed to synchronize with backend database.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Developer bypass authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#030509] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Left Section - Hero Area */}
      <div className="relative hidden md:flex flex-col justify-between w-full md:w-5/12 lg:w-1/2 p-10 lg:p-14 xl:p-20 bg-slate-50/50 dark:bg-slate-950/20 border-r border-slate-200/50 dark:border-slate-800/40">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-recollab-blue/10 dark:bg-recollab-blue/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-recollab-crimson/10 dark:bg-recollab-crimson/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center space-x-4"
        >
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <img src="/logo.png" className="w-8 h-8 object-contain" alt="SRM ReCollab" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight">ReCollab</h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">SRM Institute</p>
          </div>
        </motion.div>

        {/* Main Copy */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="max-w-md my-auto"
        >
          <h2 className="font-display font-semibold text-4xl lg:text-5xl leading-tight mb-6 text-slate-900 dark:text-white">
            Connect.<br/>
            <span className="text-slate-400 dark:text-slate-500">Research.</span><br/>
            Collaborate.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10">
            Discover researchers, publish breakthroughs, and scale innovation across the institution.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-recollab-blue/10 dark:bg-recollab-blue/20 flex items-center justify-center text-recollab-blue dark:text-recollab-blue/80 shadow-sm">
                <Search className="w-5 h-5" />
              </div>
              <span>Find interdisciplinary synergies</span>
            </div>
            <div className="flex items-center space-x-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <span>Accelerate grant acquisitions</span>
            </div>
            <div className="flex items-center space-x-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-recollab-crimson/10 dark:bg-recollab-crimson/20 flex items-center justify-center text-recollab-crimson dark:text-recollab-crimson/80 shadow-sm">
                <Globe2 className="w-5 h-5" />
              </div>
              <span>Publish to a global repository</span>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center space-x-4 text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
            <span>Secured by Firebase</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center space-x-1.5">
            <Database className="w-4 h-4 text-recollab-blue/80" />
            <span>Supabase Sync</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-recollab-crimson/80" />
            <span>Secure Access</span>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Auth Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        
        {/* Mobile Branding Header */}
        <div className="md:hidden absolute top-8 left-8 flex items-center space-x-3">
          <img src="/logo.png" className="w-7 h-7 object-contain" alt="SRM ReCollab" />
          <span className="font-display font-bold tracking-tight">ReCollab</span>
        </div>

        {/* Back link */}
        <Link 
          href="/" 
          className="absolute top-8 right-8 md:left-8 md:right-auto flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[360px]"
        >
          {/* Form Header */}
          <div className="text-center md:text-left mb-8">
            <h2 className="font-display font-semibold text-2xl tracking-tight mb-2 text-slate-900 dark:text-white">Access Portal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in with your university credentials
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Controls Section */}
          <div className="space-y-5">
            
            {/* Main Google Authenticator Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="group w-full h-12 rounded-xl text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center space-x-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm"
            >
              <Chrome className={`w-5 h-5 ${authLoading ? 'animate-spin' : ''}`} />
              <span>{authLoading ? 'Verifying...' : 'Continue with Google'}</span>
            </button>

            {/* Note */}
            <p className="text-center text-[11px] text-slate-400 font-medium">
              Sign in with your <span className="text-slate-600 dark:text-slate-300 font-semibold">Google</span> account to continue.
            </p>

            {/* Local Developer Sandbox Bypass UI: Rendered in Dev mode or on configuration failure */}
            {(isFirebasePlaceholder || errorMsg?.includes('API key')) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Developer Sandbox Active</span>
                </div>

                {/* Sandbox Role Picker */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setBypassRole('faculty')}
                    className={`py-2 px-3 rounded-xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                      bypassRole === 'faculty'
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-semibold">Faculty PI</span>
                  </button>

                  <button
                    onClick={() => setBypassRole('scholar')}
                    className={`py-2 px-3 rounded-xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                      bypassRole === 'scholar'
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <UserSquare className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-semibold">PhD Scholar</span>
                  </button>
                </div>

                {/* Trigger local simulation */}
                <button
                  onClick={handleDeveloperBypass}
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Launch Simulation</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center px-6">
            <p className="text-[11px] text-slate-400 font-medium">
              By continuing, you agree to the university{" "}
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:underline">Privacy Policy</a>.
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
