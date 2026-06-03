'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sparkles, UserCheck, Search, Users, LogOut } from 'lucide-react';
import TagPill from '@/components/TagPill';

export default function PendingPage() {
  const router = useRouter();
  const { currentUser, syncUserSession, collaborators, fetchCollaborators, requestSupervisor, logout } = useStore();
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Sync session on load and periodically check approval
  useEffect(() => {
    const checkStatus = async () => {
      const user = await syncUserSession();
      if (user && (user.isApproved || user.role === 'FACULTY' || user.role === 'ADMIN')) {
        router.replace('/dashboard');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 6000); // Check every 6s
    return () => clearInterval(interval);
  }, [syncUserSession, router]);

  // 2. Fetch faculty list for supervisor mapping
  useEffect(() => {
    fetchCollaborators('', 'FACULTY');
  }, [fetchCollaborators]);

  // 3. Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupervisor) {
      setErrorMsg('Please select a faculty supervisor.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await requestSupervisor(selectedSupervisor);
      await syncUserSession();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter supervisors on search term
  const facultySupervisors = collaborators.filter(
    (c) =>
      c.role === 'FACULTY' &&
      (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingSupervisor = collaborators.find(c => c.id === currentUser?.supervisorId);

  return (
    <div className="min-h-screen bg-darkBg text-black flex flex-col justify-between font-sans relative overflow-hidden select-none p-6">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigoElectric/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="flex justify-between items-center max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-[32px] h-[32px] bg-black text-white rounded-lg flex items-center justify-center font-display font-light text-lg">
            🐝
          </div>
          <span className="font-display font-light tracking-tight text-lg text-black">CuriousBees</span>
        </div>
        <button 
          onClick={() => { logout(); router.push('/login'); }}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-borderStroke rounded-lg text-xs font-semibold hover:bg-darkSurfaceMuted transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main card panel */}
      <main className="flex-1 flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-md bg-white border border-borderStroke rounded-2xl p-6 sm:p-8 shadow-sm">
          
          <div className="text-center space-y-3 mb-6">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-darkSurfaceMuted text-textSecondary border border-borderStroke">
              <Sparkles className="w-3.5 h-3.5 text-indigoElectric" />
              <span>Pending Access</span>
            </span>
            <h2 className="font-display font-light text-2xl tracking-tight text-black">
              Scholar Registration
            </h2>
            <p className="text-[13px] text-textSecondary max-w-sm mx-auto leading-relaxed">
              To activate your CuriousBees account, your registered PhD supervisor must verify and approve your affiliation request.
            </p>
          </div>

          {currentUser?.supervisorId ? (
            /* 📝 STATE A: PENDING APPROVAL */
            <div className="space-y-6">
              <div className="p-5 border border-borderStroke rounded-xl bg-darkSurfaceMuted text-left space-y-4">
                <h4 className="text-[12px] font-semibold text-textMuted uppercase tracking-wider">
                  Requested Supervisor
                </h4>
                <div className="flex items-center space-x-3">
                  {pendingSupervisor?.image ? (
                    <img 
                      src={pendingSupervisor.image} 
                      alt="Supervisor" 
                      className="w-11 h-11 rounded-full border border-borderStroke object-cover" 
                    />
                  ) : (
                    <div className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {pendingSupervisor?.name?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-[14px] font-bold text-black leading-tight">
                      {pendingSupervisor?.name || 'Faculty Member'}
                    </h3>
                    <p className="text-xs text-textSecondary mt-0.5">
                      🏫 {pendingSupervisor?.department || 'Research Supervisor'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 p-4 border border-indigoElectric/20 bg-indigoElectric/5 rounded-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigoElectric opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigoElectric"></span>
                </span>
                <span className="text-[12px] font-semibold text-textSecondary">
                  Waiting for supervisor approval...
                </span>
              </div>

              <p className="text-center text-[11px] text-textMuted leading-relaxed">
                Tip: Once Prof. {pendingSupervisor?.name?.split(' ')[0] || 'your supervisor'} approves this request on their dashboard, this page will automatically redirect you.
              </p>
            </div>
          ) : (
            /* 🔍 STATE B: SELECT SUPERVISOR FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black text-textSecondary uppercase tracking-wider block">
                  Search & Choose Supervisor
                </label>
                
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-[40px] pl-9 pr-4 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-sm text-black placeholder-textMuted transition-colors outline-none"
                  />
                </div>

                {/* Supervisor List */}
                <div className="border border-borderStroke rounded-lg max-h-[160px] overflow-y-auto bg-white p-1 divide-y divide-borderStroke">
                  {facultySupervisors.length > 0 ? (
                    facultySupervisors.map((faculty) => (
                      <div
                        key={faculty.id}
                        onClick={() => setSelectedSupervisor(faculty.id)}
                        className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition ${
                          selectedSupervisor === faculty.id 
                            ? 'bg-black text-white' 
                            : 'hover:bg-darkSurfaceMuted text-black'
                        }`}
                      >
                        <div className="text-left min-w-0">
                          <h4 className="text-xs font-bold truncate">{faculty.name}</h4>
                          <span className={`text-[10px] truncate block ${selectedSupervisor === faculty.id ? 'text-gray-300' : 'text-textSecondary'}`}>
                            🏫 {faculty.department}
                          </span>
                        </div>
                        {selectedSupervisor === faculty.id && (
                          <UserCheck className="w-4 h-4 text-white shrink-0 ml-2" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-textMuted flex flex-col items-center justify-center space-y-2">
                      <Users className="w-5 h-5 text-textMuted" />
                      <span>No supervisor found.</span>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 border border-dangerAlert/20 bg-dangerAlert/5 rounded-xl text-dangerAlert text-xs font-medium text-left">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedSupervisor}
                className="w-full h-[44px] flex items-center justify-center bg-black hover:bg-[#222222] text-white font-semibold text-sm rounded-xl transition disabled:opacity-40 cursor-pointer border border-black"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Supervisor Request'}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer bar */}
      <footer className="text-center text-xs text-textMuted z-10 py-4 border-t border-borderStroke max-w-5xl mx-auto w-full">
        Built for the CuriousBees Academic Research Community &copy; 2026
      </footer>

    </div>
  );
}
