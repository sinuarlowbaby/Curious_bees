'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  Briefcase, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  Compass,
  ChevronRight,
  TrendingUp,
  Cpu,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  Sun,
  Moon,
  Network,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Load and apply theme on landing page
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

  const toggleLocalTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('srm-recollab-theme', nextTheme);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 18 }
    }
  };

  const statistics = [
    { number: '140+', label: 'Indexed Research Focuses' },
    { number: '520+', label: 'Faculty Mentors' },
    { number: '950+', label: 'PhD Scholars Connected' },
    { number: '₹18Cr+', label: 'DST/SERB Projects Aligned' }
  ];

  const features = [
    {
      title: 'Expert Discovery Engine',
      description: 'Search for faculty members and PhD scholars across departments using automated keyphrase and research domain indexing.',
      icon: Search,
      color: 'from-srm-blue/20 to-srm-accent/25 border-srm-blue/30',
      badge: 'ResearchGate Fusion'
    },
    {
      title: 'Interdisciplinary Feeds',
      description: 'Engage in academic discussions, request GPGPU resource shares, or review grant applications in real-time.',
      icon: MessageSquare,
      color: 'from-srm-crimson/10 to-srm-crimson/20 border-srm-crimson/30',
      badge: 'Slack Style Chat'
    },
    {
      title: 'Academic Career Hub',
      description: 'Faculty can publish fully-funded junior researcher openings, DST-SERB project vacancies, or PhD slots directly to scholars.',
      icon: Briefcase,
      color: 'from-amber-500/10 to-srm-gold/20 border-srm-gold/30',
      badge: 'Linear Style Board'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-srm-gold selection:text-black transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic light gradient background nodes */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-srm-crimson/5 dark:bg-srm-crimson/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-srm-blue/5 dark:bg-srm-blue/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* 🚀 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-[#07090e]/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 md:px-12 h-16 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2.5">
          <img src="/logo.png" className="w-8 h-8 object-contain shrink-0" alt="ReCollab" />
          <div className="flex items-baseline">
            <span className="font-display font-black text-sm tracking-tight text-slate-900 dark:text-white">
              ReCollab
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          {/* Theme switcher on landing */}
          <button
            onClick={toggleLocalTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="Switch theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-recollab-gold" /> : <Moon className="w-4 h-4 text-recollab-crimson" />}
          </button>
          
          <Link 
            href="/login" 
            className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition"
          >
            Portal Sign In
          </Link>
          
          <Link 
            href="/login" 
            className="text-xs font-black uppercase tracking-wider text-white bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-recollab-crimson dark:hover:bg-recollab-gold dark:hover:text-black px-5 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all duration-200"
          >
            Launch MVP
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        
        {/* 🚀 2. HERO SECTION */}
        <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-6">
            {/* Tag badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-1.5 bg-recollab-crimson/5 dark:bg-recollab-crimson/10 border border-recollab-crimson/20 dark:border-recollab-crimson/30 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-recollab-crimson dark:text-red-400 shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-recollab-crimson dark:text-red-400" />
              <span>ReCollab Intranet Research Operating System</span>
            </motion.div>

            {/* Main title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-tight max-w-4xl mx-auto"
            >
              The Collaborative Core for <br />
              <span className="bg-gradient-to-r from-recollab-crimson via-recollab-crimson to-recollab-gold dark:from-white dark:via-white dark:to-recollab-gold bg-clip-text text-transparent">
                Research Excellence
              </span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            >
              Discover matching research domains, coordinate DST-SERB grant applications, and recruit high-caliber PhD scholars. A highly secure, enterprise collaboration hub designed exclusively for <strong>Verified Faculty, Mentors, and PhD Candidates</strong>.
            </motion.p>

            {/* Action buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3"
            >
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-955 hover:bg-recollab-crimson dark:hover:bg-recollab-gold dark:hover:text-black shadow-lg shadow-slate-900/10 dark:shadow-recollab-gold/5 transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>Access with Google Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#vision"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-center space-x-1.5"
              >
                <span>Explore Platform Vision</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* 🚀 3. RESEARCH COLLABORATION VISION */}
        <section id="vision" className="py-20 border-t border-slate-200/60 dark:border-slate-850 px-6 relative bg-white/40 dark:bg-slate-900/10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-5 text-left"
            >
              <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold uppercase tracking-widest flex items-center space-x-1">
                <Compass className="w-4 h-4 mr-1 text-recollab-crimson dark:text-recollab-gold" />
                Interdisciplinary Synergy
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
                Aligning Academic Talents, Unifying the Knowledge Core
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Modern academic breakthroughs occur at the boundaries of disciplines. Computational intelligence intersects biotechnology; optical semiconductor components power high-speed neural network decoders.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                <strong>ReCollab</strong> acts as the central digital synapse, indexing academic interests, providing a collaborative sandbox, and allowing scholars to easily identify grant co-authors across departments in clicks.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Strict Intranet Security</h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Only verified @srmist.edu.in accounts.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4.5 h-4.5 text-recollab-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">High-Impact Synergy</h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Shared GPU clusters, joint papers, and speed.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Static layout card mockup representing joint papers */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left bg-white dark:bg-slate-900/10 shadow-xl overflow-hidden space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-recollab-crimson/10 text-recollab-crimson border border-recollab-crimson/25">DST proposal</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Nanophotonics sequencing</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Biotech + ECE</span>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  "Exploring transition metal modulators for raw genomic biosensors. Seeking ECE co-authors for waveguide fabrication and optic signals..."
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-recollab-crimson/20 flex items-center justify-center font-bold text-[9px] text-recollab-crimson">Dr</div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">Dr. Priya Subramanian</span>
                  </div>
                  <Link href="/login" className="text-[10px] font-black text-recollab-gold hover:text-recollab-crimson flex items-center gap-0.5">
                    <span>Propose Synergy</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🚀 4. AI-POWERED WORKFLOWS MATCHING GRAPH (SIMULATED) */}
        <section className="py-20 border-t border-slate-250/60 dark:border-slate-850 px-6 max-w-5xl mx-auto text-center space-y-12">
          <div>
            <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold tracking-widest uppercase">SYNERGY CONNECTOR MAP</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-955 dark:text-white mt-2">
              Automated Institutional Matching Flow
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
              How ReCollab seamlessly translates department barriers into unified research pipelines.
            </p>
          </div>

          {/* Graphical workflow node matrix */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            {/* Node 1 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-lg bg-recollab-crimson/10 text-recollab-crimson flex items-center justify-center font-black text-xs">CSE</div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Computing Lab</h4>
              <p className="text-[9px] text-slate-450 dark:text-slate-500">Fine-tuning large language models</p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex justify-center text-slate-350 dark:text-slate-750">
              <Network className="w-6 h-6 animate-pulse" />
            </div>

            {/* Node 2 - The AI Bridge */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 border border-slate-800 dark:border-slate-100 shadow-md flex flex-col items-center space-y-2.5 relative">
              <div className="w-9 h-9 rounded-full bg-recollab-gold/20 dark:bg-recollab-gold/10 text-recollab-gold flex items-center justify-center font-bold">
                <Sparkles className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-recollab-gold">Matching Engine</h4>
              <p className="text-[9px] text-slate-350 dark:text-slate-500 font-semibold">Semantic Co-Author Alignment</p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex justify-center text-slate-350 dark:text-slate-750">
              <Network className="w-6 h-6 animate-pulse" />
            </div>

            {/* Node 3 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-lg bg-recollab-blue/10 text-recollab-blue flex items-center justify-center font-black text-xs">BIO</div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Biotech Division</h4>
              <p className="text-[9px] text-slate-450 dark:text-slate-500">Executing complex protein sequence grids</p>
            </div>

          </div>
        </section>

        {/* 🚀 5. FACULTY-SCHOLAR COLLABORATION (SYNERGY CARDS) */}
        <section className="py-20 border-t border-slate-200/60 dark:border-slate-850 px-6 bg-slate-50/40 dark:bg-slate-900/10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-left"
            >
              <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold uppercase tracking-widest">Synergy Roles</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 dark:text-white leading-tight">
                Designed to Power Faculty and PhD Relations
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                ReCollab supports discrete permission scopes to protect administrative credentials while supporting rapid interdisciplinary synergy:
              </p>
              
              <div className="space-y-3.5">
                <div className="p-3 bg-white dark:bg-slate-950/45 rounded-xl border border-slate-200 dark:border-slate-855 flex space-x-3">
                  <div className="w-7 h-7 rounded bg-recollab-crimson/10 text-recollab-crimson flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">Verified Faculty Principal Investigators</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Publish fully funded opportunities, assign computing assets, and schedule departmental vivas.</p>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-slate-950/45 rounded-xl border border-slate-200 dark:border-slate-855 flex space-x-3">
                  <div className="w-7 h-7 rounded bg-recollab-blue/10 text-recollab-blue flex items-center justify-center shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">Active PhD Candidates & Researchers</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Apply for open funded positions, tag research domains, discover domain mentors, and share scripts.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Roster Sandbox card preview */}
            <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left bg-white dark:bg-slate-900/10 shadow-lg space-y-4">
              <span className="text-[9px] font-black text-recollab-gold uppercase tracking-wider block">🛡️ Sandbox Role Switch Demo</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Test the platform under either role inside the dashboard sidebar simulator. Feel the exact custom filters, opportunities restriction alerts, and tailored dashboards immediate response.
              </p>
              
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
                <Link href="/login" className="flex-1 py-2 px-3 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-center font-bold text-[10px] uppercase shadow-sm">
                  Test as Faculty PI
                </Link>
                <Link href="/login" className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-center font-bold text-[10px] uppercase">
                  Test as PhD Scholar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 6. RESEARCH DISCOVERY ECOSYSTEM (INTERACTIVE GRID) */}
        <section className="py-20 border-t border-slate-200/60 dark:border-slate-850 px-6 max-w-5xl mx-auto text-center space-y-8">
          <div>
            <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold tracking-widest uppercase">indexed study nodes</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-2">
              Browse Research Sub-Systems
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
              Seamlessly locate peer collaborators indexing similar keyphrase study domains.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Generative AI & LLMs', 'Quantum Chips', 'Cancer Immunotherapy', 'Silicon Photonics', 'Thin Film Materials', '6G Wireless networks', 'VLSI System Design', 'Genomic Sequencing'].map((topic) => (
              <Link 
                key={topic} 
                href="/login" 
                className="p-3 bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-recollab-gold dark:hover:border-recollab-gold transition text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                #{topic}
              </Link>
            ))}
          </div>
        </section>

        {/* 🚀 7. FEATURE SHOWCASE (NOTION STYLE LAYOUTS) */}
        <section className="py-20 border-t border-slate-200/60 dark:border-slate-850 px-6 bg-slate-50/40 dark:bg-slate-900/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold uppercase tracking-widest">Portal Features</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-955 dark:text-white mt-1">
                Engineered Features for Academic Scale
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto mt-2">
                A clean structure built specifically to streamline complex institutional workflows.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {features.map((feature) => (
                <motion.div 
                  variants={itemVariants}
                  key={feature.title} 
                  className="p-6 bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg transition-all duration-300 relative text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-recollab-crimson/5 dark:bg-recollab-gold/5 border border-recollab-crimson/15 dark:border-recollab-gold/15 flex items-center justify-center text-recollab-crimson dark:text-recollab-gold mb-5">
                    <feature.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-recollab-gold tracking-wider">{feature.badge}</span>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mt-2 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 🚀 8. INSTITUTIONAL TRUST & METRICS SECTION */}
        <section className="py-16 border-t border-slate-200/60 dark:border-slate-850 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {statistics.map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="inline-flex p-1.5 bg-recollab-gold/15 text-recollab-gold rounded-lg mb-2">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <p className="font-display font-black text-2xl text-slate-900 dark:text-white leading-none">{stat.number}</p>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase mt-1 tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 9. FINAL GOOGLE SIGN-IN CTA */}
        <section className="py-20 border-t border-slate-250/60 dark:border-slate-850 px-6">
          <div className="max-w-4xl mx-auto bg-slate-900 dark:bg-slate-950/60 text-white rounded-3xl p-10 sm:p-14 border border-slate-850 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-recollab-blue/10 to-recollab-crimson/10 -z-10 animate-pulse" />
            <span className="text-[10px] font-black text-recollab-gold tracking-widest uppercase">INTRANET AUTHORIZED ACCESS ONLY</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-3 mb-4 leading-tight">
              Ready to Accelerate Your Academic Synergy?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-8 font-medium">
              Only Google Sign-In ending with <strong className="text-recollab-gold">@srmist.edu.in</strong> is authorized. Unauthorized logins are automatically redirected.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-white hover:bg-recollab-gold hover:text-black transition-all duration-200 space-x-2 shadow-sm"
            >
              <span>Connect Google Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* 🚀 FOOTER SECTION */}
      <footer className="border-t border-slate-200/80 dark:border-slate-850 bg-white dark:bg-[#05070a] py-8 px-6 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg recollab-gradient flex items-center justify-center font-bold text-white text-[10px]">
              RC
            </div>
            <span className="font-display font-bold text-xs text-slate-700 dark:text-slate-350">
              ReCollab <span className="font-light text-slate-500 font-sans text-[11px] ml-1">Phase 1</span>
            </span>
          </div>
          
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} ReCollab Academic Portal. All Research Systems Protected.
          </p>
        </div>
      </footer>
    </div>
  );
}
