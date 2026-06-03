'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { SRM_DEPARTMENTS } from '@curiousbees/shared-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileSchema } from '@curiousbees/shared-utils';
import { UserRole } from '@curiousbees/types';
import { 
  BookOpen, 
  MapPin, 
  FileText, 
  Check, 
  Edit3, 
  Tag, 
  Plus, 
  X,
  Sparkles,
  GraduationCap,
  UserSquare,
  Award,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { currentUser, updateProfile, interestsList, roleOverride, threads } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentUser?.interests?.map((i) => i.interest?.name || '') || []
  );
  const [newInterestInput, setNewInterestInput] = useState('');

  // Setup form validation via React Hook Form and Zod
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      role: currentUser?.role || 'PHD_SCHOLAR',
      department: currentUser?.department || '',
      bio: currentUser?.bio || '',
    }
  });

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      interests: selectedInterests
    };

    try {
      await updateProfile(payload);
      setIsEditing(false);
    } catch (e: any) {
      alert(`Error updating profile: ${e.message}`);
    }
  };

  const handleAddInterest = (name: string) => {
    const cleaned = name.trim();
    if (cleaned && !selectedInterests.includes(cleaned)) {
      if (selectedInterests.length >= 8) {
        alert('You can select up to 8 interests only.');
        return;
      }
      setSelectedInterests([...selectedInterests, cleaned]);
    }
    setNewInterestInput('');
  };

  const handleRemoveInterest = (name: string) => {
    setSelectedInterests(selectedInterests.filter(t => t !== name));
  };

  const getRoleBadge = (role: string) => {
    return role === 'FACULTY' 
      ? 'bg-curiousbees-crimson/10 text-curiousbees-crimson border-curiousbees-crimson/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
      : 'bg-curiousbees-blue/10 text-curiousbees-blue border-curiousbees-blue/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30';
  };

  // Filter threads made by current user
  const userThreads = threads.filter(t => t.authorId === currentUser?.id);

  return (
    <div className="space-y-8 max-w-6xl mx-auto select-none">
      
      {/* 🚀 1. UPPER PROFILE SUMMARY CARD (Academic Identity Card) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left bg-white dark:bg-slate-900/15 shadow-sm transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-curiousbees-crimson/[0.01] to-curiousbees-gold/[0.01] -z-10" />
        
        {/* Avatar Image */}
        <div className="relative shrink-0">
          <img 
            src={currentUser?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180'} 
            className="w-20 h-20 rounded-full border-2 border-curiousbees-gold object-cover shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-950 border border-slate-800/80 flex items-center justify-center text-slate-400 shadow">
            <Sparkles className="w-3.5 h-3.5 text-curiousbees-gold animate-pulse" />
          </div>
        </div>

        {/* Basic user info */}
        <div className="flex-1 space-y-2.5 min-w-0 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-905 dark:text-white leading-tight">
              {currentUser?.name || 'Academic Scholar'}
            </h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border leading-none w-fit ${getRoleBadge(roleOverride)}`}>
              {roleOverride === 'FACULTY' ? (
                <>
                  <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                  Verified Faculty PI
                </>
              ) : (
                <>
                  <UserSquare className="w-2.5 h-2.5 mr-0.5" />
                  PhD Scholar
                </>
              )}
            </span>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed truncate">
            {currentUser?.department || 'Computing Technologies (CSE / IT / Swe)'}
          </p>

          <p className="text-slate-450 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wide leading-none">
            Intranet Credentials: {currentUser?.email}
          </p>
        </div>

        {/* Edit Button Toggle */}
        <div className="shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Bio'}</span>
          </button>
        </div>
      </div>

      {/* 🚀  main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8-Columns: Dynamic Profile Editor Form OR static display */}
        <div className="lg:col-span-8 space-y-6">
          {isEditing ? (
            /* PROFILE EDITOR FORM */
            <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 space-y-6 text-left shadow-sm">
              <span className="text-[9px] font-black text-curiousbees-crimson dark:text-curiousbees-gold uppercase tracking-widest block border-b border-slate-100 dark:border-slate-850 pb-2">
                ⚙️ Update Academic Bio
              </span>

              {/* Form Input fields */}
              <div className="space-y-4">
                {/* 1. Name */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
                    placeholder="E.g. Dr. Ramesh Kumar"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.name.message as string}</p>}
                </div>

                {/* 2. Role Switch */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Portal Academic Role</label>
                  <select
                    {...register('role')}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    <option value="PHD_SCHOLAR" className="bg-slate-50 dark:bg-slate-950">PhD Scholar</option>
                    <option value="FACULTY" className="bg-slate-50 dark:bg-slate-950">Verified Faculty</option>
                  </select>
                  {errors.role && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.role.message as string}</p>}
                </div>

                {/* 3. Department Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Academic Department</label>
                  <select
                    {...register('department')}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    <option value="" className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-500">Select Department</option>
                    {SRM_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.department.message as string}</p>}
                </div>

                {/* 4. Bio rich description */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Research Biography</label>
                  <textarea
                    rows={6}
                    {...register('bio')}
                    className="w-full px-3.5 py-3 rounded-xl glass-input text-xs leading-relaxed font-sans font-semibold"
                    placeholder="Outline your research focus, grants secured, and lab equipment availability..."
                  />
                  {errors.bio && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.bio.message as string}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white curiousbees-gradient hover:opacity-95 shadow transition-all duration-200 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STATIC ACADEMIC DETAILS */
            <div className="space-y-6">
              
              {/* Biography Block */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 text-left shadow-sm space-y-4">
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <FileText className="w-4.5 h-4.5 text-curiousbees-crimson dark:text-curiousbees-gold" />
                  <span>Research Biography</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-850/60 whitespace-pre-line font-semibold">
                  {currentUser?.bio || 'Introduce your scientific projects, grant pipelines, and collaboration requirements. Hit Edit Bio to complete your details.'}
                </p>
              </div>

              {/* Verified Credentials block */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 text-left shadow-sm space-y-4">
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Award className="w-4.5 h-4.5 text-curiousbees-crimson dark:text-curiousbees-gold" />
                  <span>Institutional Credentials</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Affiliation node</p>
                    <p className="text-xs text-slate-800 dark:text-white font-bold mt-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-curiousbees-crimson shrink-0" />
                      <span>Kattankulathur Main Campus</span>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Credential Status</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black mt-1.5 flex items-center gap-1">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Verified Intranet Collaborative Node</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Publications Timeline Placeholder */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 text-left shadow-sm space-y-4">
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <BookOpen className="w-4.5 h-4.5 text-curiousbees-crimson dark:text-curiousbees-gold" />
                  <span>Academic Timeline & Publications</span>
                </h3>
                
                {/* Timeline display list */}
                <div className="space-y-4">
                  
                  {/* Item 1 */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 bg-curiousbees-crimson/5 dark:bg-curiousbees-gold/5 border border-curiousbees-crimson/15 dark:border-curiousbees-gold/15 rounded text-curiousbees-crimson dark:text-curiousbees-gold font-black text-[9px] uppercase tracking-wider shrink-0 mt-0.5">2026</div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">"Edge-AI Transceiver Chips Optimization under SERB Core Grants"</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-1">IEEE Journal of Solid-State Circuits (Placeholder Timeline Record)</p>
                    </div>
                  </div>

                  {/* Item 2 (Render created threads) */}
                  {userThreads.map(t => (
                    <div key={t.id} className="flex items-start gap-3.5 border-t border-slate-100 dark:border-slate-850/50 pt-3">
                      <div className="p-2 bg-curiousbees-blue/10 border border-curiousbees-blue/20 rounded text-curiousbees-blue font-black text-[9px] uppercase tracking-wider shrink-0 mt-0.5">Proposal</div>
                      <div>
                        <Link href={`/threads/${t.id}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug hover:underline flex items-center gap-1">
                          <span>{t.title}</span>
                          <Sparkles className="w-3 h-3 text-curiousbees-gold" />
                        </Link>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-1">Published Active Intranet Thread</p>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right 4-Columns: Dynamic research interests block (Always available and interactive!) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 text-left shadow-sm space-y-6">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
              <BookOpen className="w-4.5 h-4.5 text-curiousbees-crimson dark:text-curiousbees-gold" />
              <span>Research Domains</span>
            </h3>

            {/* Current tag pool */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {selectedInterests.length === 0 ? (
                  <p className="text-slate-550 dark:text-slate-500 text-xs font-semibold leading-relaxed italic">No research fields pinned yet. Pinned fields will index your profile across searches.</p>
                ) : (
                  selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-curiousbees-gold"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-1 text-slate-400 hover:text-slate-800 dark:hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Input for new tag */}
              <div className="relative">
                <input
                  type="text"
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest(newInterestInput))}
                  placeholder="Type new focus and hit enter..."
                  className="w-full pl-8 pr-10 py-2 text-xs rounded-lg glass-input placeholder-slate-450 dark:placeholder-slate-650 font-semibold"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 absolute left-2.5 top-2.5" />
                <button
                  type="button"
                  onClick={() => handleAddInterest(newInterestInput)}
                  className="absolute right-1.5 top-1.5 p-1 rounded bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-250 dark:border-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick pool selector suggestions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850/60 space-y-3">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trending Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {interestsList.filter(item => !selectedInterests.includes(item)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddInterest(tag)}
                    className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-curiousbees-crimson dark:hover:text-curiousbees-gold transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
