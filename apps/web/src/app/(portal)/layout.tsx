'use client';
 
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
 
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, fetchData, setTheme } = useStore();
 
  // Sync local storage theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('srm-recollab-theme') as 'dark' | 'light') || 'light';
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Client-side authentication guard simulation:
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else {
      fetchData(); // Trigger initial simulated API fetch
    }
  }, [currentUser, router, fetchData]);
 
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-srm-gold border-t-transparent animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider">Verifying Intranet Security Credentials...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Persistent Navigational Sidebar */}
      <Sidebar />
 
      {/* Main content body containing header and main child view */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        
        {/* Scrollable contents zone */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
