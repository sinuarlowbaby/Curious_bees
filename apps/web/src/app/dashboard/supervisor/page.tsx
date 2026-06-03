'use client';

import React from 'react';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { GlassCard } from '@/components/shared/glass-card';
import { GraduationCap, Users, FileSignature, AlertCircle } from 'lucide-react';

export default function SupervisorDashboard() {
  return (
    <DashboardShell withBackground>
      <PageHeader 
        title="Supervisor Overview" 
        subtitle="Manage your PhD scholars, review submissions, and track research pipelines."
        icon={<GraduationCap className="w-5 h-5" />}
        actions={
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            Schedule Meeting
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Scholars" 
          value={8} 
          icon={<Users />}
          variant="primary"
        />
        <MetricCard 
          title="Pending Approvals" 
          value={5} 
          icon={<FileSignature />}
          variant="warning"
          delta="Requires attention"
          deltaType="down"
        />
        <MetricCard 
          title="Publications in Review" 
          value={3} 
          icon={<AlertCircle />}
          variant="info"
        />
        <MetricCard 
          title="Total Citations (Group)" 
          value={1240} 
          icon={<GraduationCap />}
          variant="success"
          delta="+45 this month"
          deltaType="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard padding="lg">
            <h3 className="cb-section-title mb-4">Scholar Progress Tracker</h3>
            <div className="text-sm text-muted-foreground">
              Integration with backend required to display scholar progress.
            </div>
          </GlassCard>
        </div>
        
        <div className="space-y-6">
          <GlassCard padding="lg">
            <h3 className="cb-section-title mb-4">Action Items</h3>
            <div className="text-sm text-muted-foreground">
              No urgent action items.
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}
