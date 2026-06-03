'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateThreadSchema } from '@curiousbees/shared-utils';
import { 
  FileText, 
  Eye, 
  ArrowLeft, 
  HelpCircle, 
  Check, 
  Tag, 
  Plus, 
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CreateThreadPage() {
  const router = useRouter();
  const { createThread } = useStore();
  const [tags, setTags] = useState<string[]>(['Collaboration']);
  const [newTagInput, setNewTagInput] = useState('');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Setup form validation
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(CreateThreadSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: ['Collaboration']
    }
  });

  const contentText = watch('content');
  const titleText = watch('title');

  const onSubmit = async (data: any) => {
    try {
      await createThread(data.title, data.content, tags);
      router.push('/threads');
    } catch (e: any) {
      alert(`Error creating proposal: ${e.message}`);
    }
  };

  const handleAddTag = () => {
    const cleaned = newTagInput.trim().replace(/#/g, '');
    if (cleaned && !tags.includes(cleaned)) {
      if (tags.length >= 5) {
        alert('You can add up to 5 tags.');
        return;
      }
      const updated = [...tags, cleaned];
      setTags(updated);
      setValue('tags', updated);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag);
    setTags(updated);
    setValue('tags', updated);
  };

  // Convert custom Markdown paragraphs, headers, and bullet points into basic HTML elements for the preview pane
  const renderMarkdownPreview = (text: string) => {
    if (!text.trim()) return '<p class="text-slate-400 dark:text-slate-500 italic text-xs">Nothing to preview. Compose details in the editor panel first.</p>';
    
    return text
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) return `<h1 class="text-lg font-black font-display text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-100 dark:border-slate-850 pb-1">${trimmed.substring(2)}</h1>`;
        if (trimmed.startsWith('## ')) return `<h2 class="text-sm font-bold font-display text-slate-850 dark:text-white mt-3 mb-2">${trimmed.substring(3)}</h2>`;
        if (trimmed.startsWith('- ')) return `<li class="text-slate-650 dark:text-slate-300 text-xs ml-4 list-disc my-1 font-semibold">${trimmed.substring(2)}</li>`;
        if (trimmed.startsWith('* ')) return `<li class="text-slate-650 dark:text-slate-300 text-xs ml-4 list-disc my-1 font-semibold">${trimmed.substring(2)}</li>`;
        return trimmed ? `<p class="text-slate-650 dark:text-slate-350 text-xs leading-relaxed my-2 font-medium">${trimmed}</p>` : '';
      })
      .join('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Back to threads navigation row */}
      <div className="text-left">
        <Link 
          href="/threads" 
          className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Page Title details */}
      <div className="text-left">
        <span className="text-[10px] font-black text-curiousbees-crimson dark:text-curiousbees-gold uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intranet Proposal Writer</span>
        </span>
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1.5">
          Publish Collaboration Request
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Outline your proposal details, share lab resource timelines, or solicit interdisciplinary assistance.
        </p>
      </div>

      {/* 📱 MOBILE VIEW: Tab Selector */}
      <div className="flex md:hidden bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            mobileTab === 'edit'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-455 dark:text-slate-500'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            mobileTab === 'preview'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-455 dark:text-slate-500'
          }`}
        >
          Preview
        </button>
      </div>

      {/* 🖥️ SPLIT-PANE DESKTOP DESIGN (Notion Style Side-by-Side) */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: The Composer Panel */}
          <div className={`md:col-span-7 bg-white dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left ${mobileTab === 'edit' ? 'block' : 'hidden md:block'}`}>
            <span className="text-[9px] font-black text-curiousbees-crimson dark:text-curiousbees-gold uppercase tracking-widest block border-b border-slate-100 dark:border-slate-850 pb-2">
              📝 Composer Panel
            </span>

            {/* 1. Title Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Proposal Title</label>
              <input
                type="text"
                {...register('title')}
                placeholder="E.g. Collaboration Request for Edge-AI Transceiver Chip Testing"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
              />
              {errors.title && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.title.message as string}</p>}
            </div>

            {/* 2. Content rich textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Research Scope Description</label>
                <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 mr-0.5" />
                  Markdown compatible: # H1, - Bullet
                </span>
              </div>
              <textarea
                rows={10}
                {...register('content')}
                placeholder="Outline your research hypothesis, specify the lab materials requested or cycles allocated, and indicate suitable milestones..."
                className="w-full px-3.5 py-3 rounded-xl glass-input text-xs leading-relaxed font-sans font-medium"
              />
              {errors.content && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.content.message as string}</p>}
            </div>

            {/* 3. Tags input selectors */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Academic Tag Keywords</label>
              
              {/* tags container */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-curiousbees-gold"
                  >
                    <span>#{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-slate-400 hover:text-slate-800 dark:hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Enter tag keyword..."
                  className="w-full pl-8 pr-10 py-2 text-xs rounded-lg glass-input placeholder-slate-450 dark:placeholder-slate-650 font-semibold"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 absolute left-2.5 top-2.5" />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="absolute right-1.5 top-1.5 p-1 rounded bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-250 dark:border-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {errors.tags && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.tags.message as string}</p>}
            </div>
          </div>

          {/* RIGHT COLUMN: The Notion Real-time Previewer */}
          <div className={`md:col-span-5 bg-white dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-left md:sticky md:top-24 min-h-[400px] flex flex-col ${mobileTab === 'preview' ? 'block' : 'hidden md:block'}`}>
            <span className="text-[9px] font-black text-curiousbees-crimson dark:text-curiousbees-gold uppercase tracking-widest block border-b border-slate-100 dark:border-slate-850 pb-2">
              👁️ Real-time Document Preview
            </span>
            
            <div className="flex-1 flex flex-col justify-start">
              {titleText || contentText ? (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-base text-slate-900 dark:text-white leading-snug">
                    {titleText || <span className="text-slate-400 dark:text-slate-500 italic">Untitled Proposal</span>}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-900">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div 
                    className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 border-t border-slate-100 dark:border-slate-850/50 pt-4"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(contentText) }}
                  />
                </div>
              ) : (
                <div className="my-auto text-center py-12 text-slate-400 dark:text-slate-600 space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-bold">Nothing to preview yet</p>
                  <p className="text-[10px] text-slate-450 max-w-[200px] mx-auto leading-relaxed font-semibold">Enter a title or proposal description to preview the live rendered output.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Action Submission Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-850">
          <Link
            href="/threads"
            className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Discard
          </Link>
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
                <span>Publish to Intranet</span>
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
