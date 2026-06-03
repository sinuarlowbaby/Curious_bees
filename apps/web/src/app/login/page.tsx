'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertTriangle,
  GraduationCap,
  UserSquare2,
  Lock,
  Terminal,
  Activity,
  Shield,
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
      const { user } = await signInWithGoogle();
      const syncedUser = await syncUserSession();
      if (syncedUser) {
        router.push('/dashboard');
      } else {
        await signOut(auth);
        setErrorMsg('Authentication succeeded but failed to sync profile with backend database.');
      }
    } catch (e: any) {
      console.error(e);
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
        localStorage.setItem('curiousbees-mock-token', mockToken);
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
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row overflow-hidden font-sans relative selection:bg-black selection:text-white">
      
      {/* 1.5% paper noise texture overlay */}
      <div className="noise-overlay" />

      {/* Left Panel - Hero Area */}
      <div className="relative hidden md:flex flex-col justify-between w-full md:w-5/12 lg:w-1/2 p-12 lg:p-16 xl:p-20 bg-darkBg border-r border-borderStroke z-10">
        
        {/* Branding */}
        <div className="flex items-center space-x-3 text-left">
          {/* RC monogram monogram */}
          <div className="w-7 h-7 bg-black flex items-center justify-center font-display font-bold text-white text-[13px] tracking-tight rounded-sm">
            RC
          </div>
          <span className="font-sans font-semibold text-[15px] tracking-tight text-black">
            CuriousBees
          </span>
          <span className="bg-darkSurfaceMuted border border-borderStroke text-textSecondary text-[11px] font-sans px-2 py-0.5 rounded-full">
            SRM IST
          </span>
        </div>

        {/* Main Headline & rhythm */}
        <div className="max-w-md my-auto text-left space-y-6">
          <h2 className="font-display font-light text-[52px] leading-[1.1] text-black tracking-tighter">
            Connect.<br/>
            <span className="text-textSecondary">Research.</span><br/>
            Collaborate.
          </h2>
          <p className="text-textSecondary font-sans font-normal text-[16px] leading-[1.6] max-w-[340px]">
            Discover researchers, publish breakthroughs, scale innovation across the institution.
          </p>

          {/* Feature List (flat outline) */}
          <div className="space-y-4 pt-4 select-none">
            <div className="flex items-center space-x-3 text-[15px] font-sans text-black">
              <div className="w-9 h-9 rounded-full bg-white border border-borderStroke flex items-center justify-center text-black shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <span>Find interdisciplinary synergies</span>
            </div>
            <div className="flex items-center space-x-3 text-[15px] font-sans text-black">
              <div className="w-9 h-9 rounded-full bg-white border border-borderStroke flex items-center justify-center text-black shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span>Accelerate grant acquisitions</span>
            </div>
            <div className="flex items-center space-x-3 text-[15px] font-sans text-black">
              <div className="w-9 h-9 rounded-full bg-white border border-borderStroke flex items-center justify-center text-black shrink-0">
                <Globe2 className="w-4 h-4" />
              </div>
              <span>Publish to a global repository</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div className="flex items-center space-x-4 text-[13px] font-sans font-normal text-textMuted select-none">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured by Firebase</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-borderStroke" />
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Sync</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-borderStroke" />
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Access</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Credentials Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-white">
        
        {/* Back Link to Home */}
        <Link 
          href="/" 
          className="absolute top-8 right-8 md:left-8 md:right-auto flex items-center space-x-2 text-xs font-semibold text-textSecondary hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <div className="w-full max-w-[360px] flex flex-col">
          {/* Form Header */}
          <div className="text-center md:text-left mb-8">
            <h2 className="font-display font-light text-[32px] tracking-tight mb-2 text-black leading-tight">
              Access Portal
            </h2>
            <p className="text-[15px] text-textSecondary font-sans leading-normal">
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
                <div className="bg-[#fff2f2] border border-[#fca5a5] text-[#c00] rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-[13px] leading-relaxed font-medium">{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action controls */}
          <div className="space-y-6">
            
            {/* Google Continue button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full h-13 rounded-xl flex items-center justify-center space-x-3 bg-white border-[1.5px] border-borderStroke hover:border-black hover:bg-[#fafafa] transition-all duration-200 text-black text-[15px] font-semibold cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {/* Google colorful G logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.04 12 5.04z" />
                <path fill="#4285F4" d="M22.29 12.25c0-.82-.07-1.6-.2-2.35H12v4.51h5.81c-.25 1.33-1 2.45-2.12 3.2l3.27 2.54c1.91-1.76 3.01-4.35 3.01-7.4z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18V6.89H2.18C1.43 8.38 1 10.05 1 12s.43 3.62 1.18 5.11l3.66-2.84z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.27-2.54c-.9.61-2.07.98-3.42.98-2.86 0-5.29-2.26-6.16-5.01H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              </svg>
              <span>{authLoading ? 'Verifying...' : 'Continue with Google'}</span>
            </button>

            {/* Fine print */}
            <p className="text-center text-[13px] text-textMuted font-sans">
              Sign in with your <span className="text-black font-semibold">@srmist.edu.in</span> Google account
            </p>

            {/* Divider */}
            <div className="w-full border-t border-borderStroke" />

            {/* Restricted access alert box */}
            <div className="bg-[#f7f4f2] border border-borderStroke rounded-lg p-3.5 flex items-start space-x-2.5 select-none">
              <Lock className="w-4 h-4 text-textMuted shrink-0 mt-0.5" />
              <p className="text-[13px] text-textSecondary font-sans leading-normal">
                Access restricted to SRM IST faculty and PhD scholars
              </p>
            </div>

            {/* Sandbox Developer Bypass */}
            {(isFirebasePlaceholder || errorMsg?.includes('API key')) && (
              <div className="mt-8 pt-6 border-t border-borderStroke">
                <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-4 select-none">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Developer Sandbox Active</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setBypassRole('faculty')}
                    className={`py-2 px-3 rounded-lg border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                      bypassRole === 'faculty'
                        ? 'border-black bg-darkSurfaceMuted text-black font-semibold'
                        : 'border-borderStroke bg-transparent text-textSecondary hover:bg-darkSurfaceMuted'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="text-[11px]">Faculty PI</span>
                  </button>

                  <button
                    onClick={() => setBypassRole('scholar')}
                    className={`py-2 px-3 rounded-lg border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                      bypassRole === 'scholar'
                        ? 'border-black bg-darkSurfaceMuted text-black font-semibold'
                        : 'border-borderStroke bg-transparent text-textSecondary hover:bg-darkSurfaceMuted'
                    }`}
                  >
                    <UserSquare2 className="w-4 h-4 shrink-0" />
                    <span className="text-[11px]">PhD Scholar</span>
                  </button>
                </div>

                <button
                  onClick={handleDeveloperBypass}
                  disabled={authLoading}
                  className="w-full py-3 rounded-lg text-xs font-semibold text-black bg-darkSurfaceMuted hover:bg-[#eae6e2] border border-borderStroke transition flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Launch Simulation</span>
                </button>
              </div>
            )}
          </div>

          {/* Legal bottom disclaimer */}
          <div className="text-center mt-12 text-[13px] text-textMuted leading-relaxed">
            By continuing, you agree to the university<br />
            <a href="#" className="text-black underline font-medium">Terms of Service</a> and{" "}
            <a href="#" className="text-black underline font-medium">Privacy Policy</a>.
          </div>

        </div>
      </div>
    </div>
  );
}
