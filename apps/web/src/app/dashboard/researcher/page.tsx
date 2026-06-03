'use client';

import React from 'react';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { GlassCard } from '@/components/shared/glass-card';
import { BookOpen, FileText, Calendar, TrendingUp } from 'lucide-react';

export default function ResearcherDashboard() {
  return (
    <DashboardShell withBackground>
      <PageHeader 
        title="Scholar Dashboard" 
        subtitle="Track your research progress, collaborations, and upcoming milestones."
        icon={<BookOpen className="w-5 h-5" />}
        actions={
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            New Draft
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Projects" 
          value={3} 
          icon={<FileText />}
          variant="primary"
          delta="Stable"
          deltaType="neutral"
        />
        <MetricCard 
          title="Publications" 
          value={12} 
          icon={<BookOpen />}
          variant="success"
          delta="+2 this year"
          deltaType="up"
        />
        <MetricCard 
          title="Citations" 
          value={342} 
          icon={<TrendingUp />}
          variant="info"
          delta="+14 this month"
          deltaType="up"
        />
        <MetricCard 
          title="Upcoming Deadlines" 
          value={2} 
          icon={<Calendar />}
          variant="warning"
          delta="Next: 3 days"
          deltaType="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard padding="lg">
            <h3 className="cb-section-title mb-4">Recent Collaboration Threads</h3>
            <div className="text-sm text-muted-foreground">
              Integration with backend required to display recent threads.
            </div>
          </GlassCard>
        </div>
        
        <div className="space-y-6">
          <GlassCard padding="lg">
            <h3 className="cb-section-title mb-4">Supervisor Feedback</h3>
            <div className="text-sm text-muted-foreground">
              No new feedback from your supervisor.
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}
