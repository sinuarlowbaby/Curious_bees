'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  Network, 
  CheckCircle2, 
  Bot, 
  Calendar,
  MessageSquare,
  Briefcase,
  Users,
  Bell,
  Mail,
  Zap,
  ChevronRight,
  Shield,
  Database,
  Lock,
  RefreshCw
} from 'lucide-react';
import TagPill from '@/components/TagPill';
import GlowButton from '@/components/GlowButton';
import GlassCard from '@/components/GlassCard';

export default function LandingPage() {
  const [stats, setStats] = useState({ departments: 0, researchers: 0, accuracy: 0 });

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setStats({
        departments: Math.min(Math.floor((40 / steps) * currentStep), 40),
        researchers: Math.min(Math.floor((200 / steps) * currentStep), 200),
        accuracy: Math.min(Math.floor((98 / steps) * currentStep), 98),
      });

      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const departmentsList = [
    'Information Technology', 'Mechanical Engineering', 'Nanotechnology', 
    'Physics & Astronomy', 'Genetic Engineering', 'Computer Science', 
    'Biotechnology', 'Electronics & Communication'
  ];

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col justify-between selection:bg-black selection:text-white relative overflow-hidden font-sans">
      
      {/* 🚀 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-borderStroke px-10 h-[60px] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* RC square monogram */}
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

        <div className="flex items-center space-x-6">
          <Link href="/about" className="hidden sm:block text-textSecondary font-sans font-medium text-[14px] hover:text-black transition-colors">
            About
          </Link>
          <Link href="/features" className="hidden sm:block text-textSecondary font-sans font-medium text-[14px] hover:text-black transition-colors">
            Features
          </Link>
          <Link href="/login">
            <button className="h-[40px] px-5 bg-black hover:bg-[#222222] text-white font-sans font-semibold text-[14px] rounded-lg transition-colors cursor-pointer">
              Sign In
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        
        {/* 🚀 2. HERO SECTION */}
        <section className="bg-darkBg pt-[100px] pb-[80px] px-10 text-center flex flex-col items-center">
          <div className="max-w-[1280px] w-full flex flex-col items-center">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 bg-white border border-borderStroke px-3.5 py-1.5 rounded-full text-[12px] font-sans font-medium text-textSecondary">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
              <span>Next-gen SRM Research OS</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-light text-[56px] text-black tracking-tighter leading-[1.1] max-w-3xl mt-6 text-center select-none">
              Where SRM<br />Research Begins
            </h1>

            {/* Subtext */}
            <p className="text-textSecondary font-sans font-normal text-[18px] leading-[1.6] max-w-[520px] mx-auto mt-5">
              An AI-powered intranet for faculty and PhD scholars to collaborate, discover, and grow.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row justify-center items-center gap-3 w-full sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="h-[44px] px-6 bg-black hover:bg-[#222222] text-white font-sans font-semibold text-[15px] rounded-lg flex items-center justify-center space-x-2.5 transition-colors w-full sm:w-auto cursor-pointer">
                  {/* Google G SVG */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </Link>
              <a href="#bento" className="w-full sm:w-auto">
                <button className="h-[44px] px-6 bg-white border border-black text-black font-sans font-medium text-[15px] rounded-lg transition-colors hover:bg-darkSurfaceMuted w-full sm:w-auto cursor-pointer">
                  Learn how it works
                </button>
              </a>
            </div>

            {/* Trust Line */}
            <div className="mt-12 flex items-center justify-center space-x-2 text-[13px] font-sans font-normal text-textMuted select-none">
              <Shield className="w-3.5 h-3.5 text-textMuted" />
              <span>Secured by Firebase</span>
              <span>·</span>
              <Database className="w-3.5 h-3.5 text-textMuted" />
              <span>Supabase PostgreSQL</span>
              <span>·</span>
              <Lock className="w-3.5 h-3.5 text-textMuted" />
              <span>Google SSO</span>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full border-t border-borderStroke" />

        {/* Stats Row */}
        <section className="bg-white py-8 px-10 flex justify-center">
          <div className="max-w-[1280px] w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat 1 */}
            <div className="text-center md:border-r border-borderStroke last:border-none flex flex-col justify-center py-2 select-none">
              <p className="text-[36px] font-display font-light text-black leading-none">{stats.departments}+</p>
              <p className="text-[13px] font-sans font-normal text-textMuted uppercase tracking-[0.5px] mt-2">Departments</p>
            </div>

            {/* Stat 2 */}
            <div className="text-center md:border-r border-borderStroke last:border-none flex flex-col justify-center py-2 select-none">
              <p className="text-[36px] font-display font-light text-black leading-none">{stats.researchers}+</p>
              <p className="text-[13px] font-sans font-normal text-textMuted uppercase tracking-[0.5px] mt-2">PhD Researchers</p>
            </div>

            {/* Stat 3 */}
            <div className="text-center flex flex-col justify-center py-2 select-none">
              <p className="text-[36px] font-display font-light text-black leading-none">{stats.accuracy}%</p>
              <p className="text-[13px] font-sans font-normal text-textMuted uppercase tracking-[0.5px] mt-2">AI Accuracy</p>
            </div>

          </div>
        </section>

        {/* Marquee */}
        <section className="bg-darkBg py-5 border-t border-borderStroke overflow-hidden relative">
          <div className="relative w-full flex items-center overflow-hidden">
            <div className="flex w-max gap-4 animate-marquee whitespace-nowrap">
              {/* repeating list x3 */}
              {[...departmentsList, ...departmentsList, ...departmentsList].map((dept, index) => (
                <span
                  key={`${dept}-${index}`}
                  className="px-3 py-1.5 bg-white border border-borderStroke rounded-full text-[13px] font-sans font-normal text-black"
                >
                  🏫 {dept}
                </span>
              ))}
            </div>
            {/* Edge fades */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-darkBg to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-darkBg to-transparent pointer-events-none" />
          </div>
        </section>

        {/* 🚀 3. FEATURE BENTO GRID */}
        <section id="bento" className="bg-darkBg py-20 px-10 flex justify-center">
          <div className="max-w-[1280px] w-full flex flex-col items-center space-y-6">
            
            {/* Bento Hub Header */}
            <div className="text-center max-w-xl mx-auto mb-16">
              <div className="inline-flex items-center bg-white border border-borderStroke px-3.5 py-1 rounded-full text-[11px] font-sans font-medium text-textSecondary">
                BENTO HUB
              </div>
              <h2 className="font-display font-light text-[36px] text-black mt-4 tracking-tight leading-tight">
                Platform Architecture
              </h2>
              <p className="text-textSecondary font-sans font-normal text-[16px] leading-[1.6] mt-2">
                Designed with premium aesthetics, clean sentence-casing, and absolute visual signal.
              </p>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              
              {/* [A] AI Event Ingestion Card - THE ONLY DARK ELEMENT */}
              <div className="md:col-span-2 bg-darkPanel rounded-2xl p-8 flex flex-col justify-between min-h-[350px] relative select-none">
                <div>
                  <div className="inline-flex items-center border border-aiBlue/30 text-aiBlue bg-transparent px-3 py-1 rounded-full text-[11px] font-sans font-medium">
                    AI POWERED
                  </div>
                  <h3 className="font-display font-light text-[28px] text-white mt-4 mb-2 leading-tight">
                    AI Event Ingestion
                  </h3>
                  <p className="text-textMuted font-sans text-[14px] leading-relaxed max-w-md">
                    CuriousBees continuously listens to departmental email announcements, parses metadata via Gemini 2.5 Flash, and publishes calendar hooks in real time.
                  </p>
                </div>

                {/* Flat Ingestion Flow Graph */}
                <div className="w-full bg-black/40 border border-white/5 rounded-xl p-5 mt-6 font-mono text-[12px] text-textMuted flex flex-col gap-4">
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-1.5 p-2 rounded bg-white text-black shrink-0 font-sans font-medium">
                      <Mail className="w-3.5 h-3.5 text-textSecondary" />
                      <span>Inbound Email</span>
                    </div>
                    
                    {/* Pipeline line */}
                    <div className="flex-1 border-t border-dashed border-white/10 mx-4 relative" />

                    <div className="flex items-center gap-1.5 p-2 rounded border border-aiBlue/20 bg-aiBlue/5 text-aiBlue shrink-0 font-sans font-medium">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Gemini 2.5 Flash</span>
                    </div>

                    <div className="flex-1 border-t border-dashed border-white/10 mx-4 relative" />

                    <div className="flex items-center gap-1.5 p-2 rounded bg-white text-black shrink-0 font-sans font-medium">
                      <Calendar className="w-3.5 h-3.5 text-textSecondary" />
                      <span>Smart Calendar</span>
                    </div>
                  </div>

                  <div className="font-mono text-[12px] text-textMuted select-none text-left">
                    curiousbees@srmist.edu.in
                  </div>
                </div>
              </div>

              {/* [B] Smart Notifications */}
              <div className="bg-white border border-borderStroke rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
                <div>
                  <Bell className="w-6 h-6 text-black mb-4" />
                  <h3 className="font-display font-medium text-[20px] text-black mb-2 leading-tight">
                    Smart Push
                  </h3>
                  <p className="text-textSecondary font-sans text-[14px] leading-relaxed">
                    Real-time push alerts map directly to your academic discipline profile, notifying you on openings instantly.
                  </p>
                </div>

                {/* Notification visual */}
                <div className="p-3 bg-darkSurfaceMuted border border-borderStroke rounded-xl flex gap-2.5 items-start mt-6 relative select-none">
                  <div className="absolute left-0 inset-y-0 w-[2px] bg-aiBlue" />
                  <div className="text-left font-sans text-[13px] leading-snug">
                    <p className="font-semibold text-black">New event: ML Workshop</p>
                    <p className="text-textSecondary mt-0.5 text-[12px]">
                      CS & AI pipeline processing completed successfully.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              
              {/* [C] Discussion Threads */}
              <div className="bg-white border border-borderStroke rounded-xl p-6 flex flex-col justify-between min-h-[220px] group transition-colors duration-200">
                <div>
                  <MessageSquare className="w-6 h-6 text-black mb-4" />
                  <h3 className="font-display font-medium text-[20px] text-black mb-2 leading-tight">
                    Research Feed
                  </h3>
                  <p className="text-textSecondary font-sans text-[14px] leading-relaxed">
                    Interdisciplinary message boards mapping grant coordinates, hardware resources, and joint paper coordinates.
                  </p>
                </div>
                <div className="pt-6 font-sans text-[13px] text-black font-semibold flex items-center gap-1">
                  <span className="underline group-hover:text-textSecondary transition-colors">View threads →</span>
                </div>
              </div>

              {/* [D] Opportunities Board */}
              <div className="bg-white border border-borderStroke rounded-xl p-6 flex flex-col justify-between min-h-[220px] group transition-colors duration-200">
                <div>
                  <Briefcase className="w-6 h-6 text-black mb-4" />
                  <h3 className="font-display font-medium text-[20px] text-black mb-2 leading-tight">
                    Opportunities
                  </h3>
                  <p className="text-textSecondary font-sans text-[14px] leading-relaxed">
                    Faculty-verified boards posting JRF roles, post-doc slots, and DST-SERB funded fellowship open calls.
                  </p>
                </div>
                <div className="pt-6 font-sans text-[13px] text-black font-semibold flex items-center gap-1">
                  <span className="underline group-hover:text-textSecondary transition-colors">Browse openings →</span>
                </div>
              </div>

              {/* [E] Events Calendar */}
              <div className="bg-white border border-borderStroke rounded-xl p-6 flex flex-col justify-between min-h-[220px] group transition-colors duration-200">
                <div>
                  <Calendar className="w-6 h-6 text-black mb-4" />
                  <h3 className="font-display font-medium text-[20px] text-black mb-2 leading-tight">
                    AI Calendar
                  </h3>
                  <p className="text-textSecondary font-sans text-[14px] leading-relaxed">
                    Fully interactive warm calendar skins grouping vivas, symposium details, and AI parsed guest lectures.
                  </p>
                </div>
                <div className="pt-6 font-sans text-[13px] text-black font-semibold flex items-center gap-1">
                  <span className="underline group-hover:text-textSecondary transition-colors">Explore calendar →</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 🚀 4. PIPELINE WORKFLOW SECTION */}
        <section className="bg-white py-20 px-10 flex justify-center border-t border-borderStroke">
          <div className="max-w-[1280px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Numbered List */}
            <div className="text-left space-y-6">
              <div className="inline-flex items-center border border-aiBlue text-aiBlue bg-white px-3 py-1 rounded-full text-[11px] font-sans font-medium">
                PIPELINE WORKFLOWS
              </div>
              <h2 className="font-display font-light text-[40px] text-black tracking-tight leading-tight">
                Seamlessly Processing<br />Inbound Announcements
              </h2>
              <p className="text-textSecondary font-sans text-[16px] leading-relaxed max-w-md">
                CuriousBees coordinates with native NestJS queues and Google Cloud endpoints to process events with zero manual actions.
              </p>

              <div className="space-y-6 pt-4">
                {[
                  { step: '01', title: 'Gmail Inbox Polling', desc: 'Polls official inbox every 5 seconds for new emails' },
                  { step: '02', title: 'Pre-filtering Safety', desc: 'Keyword + whitelist filter removes spam' },
                  { step: '03', title: 'BullMQ Rate-Limited Queue', desc: 'Backoff queuing respects Gemini API limits' },
                  { step: '04', title: 'Gemini 2.5 Flash Extraction', desc: 'Extracts title, date, venue, category, tags' },
                  { step: '05', title: 'Firebase Push Broadcast', desc: 'Targeted alerts to matching researcher profiles' },
                ].map((wf, idx, arr) => (
                  <div key={wf.step} className="flex flex-col">
                    <div className="flex gap-4 items-start">
                      <span className="font-sans font-bold text-[12px] text-black w-7 h-7 rounded-full bg-darkSurfaceMuted border border-borderStroke flex items-center justify-center shrink-0">
                        {wf.step}
                      </span>
                      <div className="text-left">
                        <h4 className="text-[15px] font-semibold text-black leading-none">{wf.title}</h4>
                        <p className="text-[14px] text-textSecondary mt-1 leading-normal">{wf.desc}</p>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-7 flex justify-center my-2">
                        <div className="w-[1px] h-4 bg-borderStroke" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual telemetry */}
            <div className="w-full flex items-center justify-center">
              <div className="w-full max-w-md p-6 bg-darkSurfaceMuted border border-borderStroke rounded-2xl relative shadow-none text-left flex flex-col gap-6">
                
                <span className="text-[11px] font-sans font-semibold text-textMuted uppercase tracking-wider block">
                  Pipeline Live Nodes
                </span>

                {/* Stacks */}
                <div className="space-y-4 font-sans">
                  
                  {/* Card 1 */}
                  <div className="flex items-center gap-3.5 p-3.5 bg-white border border-borderStroke rounded-xl select-none">
                    <Mail className="w-4 h-4 text-textSecondary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[12px] font-bold text-black truncate">ANNOUNCEMENTS@SRMIST.EDU.IN</p>
                      <p className="text-textMuted text-[13px] mt-0.5">Raw academic email received</p>
                    </div>
                  </div>

                  {/* Connector dots */}
                  <div className="flex flex-col items-center gap-1.5 py-1 text-borderStroke">
                    <span className="w-1.5 h-1.5 rounded-full bg-borderStroke" />
                    <span className="w-1.5 h-1.5 rounded-full bg-borderStroke" />
                    <span className="w-1.5 h-1.5 rounded-full bg-borderStroke" />
                  </div>

                  {/* Card 2 - ACTIVE */}
                  <div className="flex items-center gap-3.5 p-3.5 bg-white border border-aiBlue rounded-xl select-none">
                    <Sparkles className="w-4 h-4 text-aiBlue shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[12px] font-bold text-black truncate">GEMINI 2.5 FLASH PARSING</p>
                      <p className="text-aiBlue text-[13px] mt-0.5 font-medium">Confidence: 98.4% · Success</p>
                    </div>
                  </div>

                  {/* Connector dots */}
                  <div className="flex flex-col items-center gap-1.5 py-1 text-borderStroke">
                    <span className="w-1.5 h-1.5 rounded-full bg-borderStroke" />
                    <span className="w-1.5 h-1.5 rounded-full bg-borderStroke" />
                    <span className="w-1.5 h-1.5 rounded-full bg-borderStroke" />
                  </div>

                  {/* Card 3 */}
                  <div className="flex items-center gap-3.5 p-3.5 bg-white border border-borderStroke rounded-xl select-none">
                    <Calendar className="w-4 h-4 text-textSecondary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[12px] font-bold text-black truncate">SMART CALENDAR API</p>
                      <p className="text-textMuted text-[13px] mt-0.5">FCM push broadcast complete</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* 🚀 5. FOOTER SECTION */}
      <footer className="bg-black text-white py-[60px] px-10 border-t border-[#222222]">
        <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-display font-bold text-[13px] rounded-sm">
                RC
              </div>
              <span className="font-sans font-semibold text-[15px] tracking-tight">CuriousBees</span>
            </div>
            <p className="text-[14px] text-[#888888] font-sans leading-relaxed">
              Automated SRM Intranet.
            </p>
          </div>

          {/* Links 2 */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#888888]">Platform</h4>
            <ul className="space-y-2 text-[14px] text-[#888888] font-sans">
              <li><Link href="/login" className="hover:text-white transition-colors">Portal Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Calendar Feed</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#888888]">Research</h4>
            <ul className="space-y-2 text-[14px] text-[#888888] font-sans">
              <li><Link href="/login" className="hover:text-white transition-colors">PhD Openings</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Faculty Directory</Link></li>
            </ul>
          </div>

          {/* Links 4 */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#888888]">Institutional</h4>
            <ul className="space-y-2 text-[14px] text-[#888888] font-sans">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-[1280px] w-full mx-auto border-t border-[#222222] mt-[24px] pt-[24px] text-[13px] text-[#555555] font-sans flex items-center justify-between">
          <p>© {new Date().getFullYear()} CuriousBees · SRM Institute of Science & Technology</p>
        </div>
      </footer>
    </div>
  );
}
