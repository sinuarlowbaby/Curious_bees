'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/navigation/sidebar';
import { Topbar } from '@/components/dashboard/navigation/topbar';
import { useStore } from '@/store/useStore';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();

  // Basic client-side auth check (replace with middleware for robust protection)
  if (!currentUser) {
    // redirect('/auth/login'); 
    // Commented out temporarily for easy local testing without strict auth block
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
