'use client';

import React from 'react';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { GlassCard } from '@/components/shared/glass-card';
import { ShieldCheck, Server, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <DashboardShell withBackground>
      <PageHeader 
        title="Institution Admin" 
        subtitle="Global oversight of the CuriousBees institutional ecosystem."
        icon={<ShieldCheck className="w-5 h-5" />}
        actions={
          <button className="px-4 py-2 border border-outline-variant/50 hover:bg-muted text-sm font-semibold rounded-lg transition-colors">
            Generate Report
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Users" 
          value={1420} 
          icon={<Users />}
          variant="primary"
          delta="+12 this week"
          deltaType="up"
        />
        <MetricCard 
          title="Active Sessions" 
          value={342} 
          icon={<Activity />}
          variant="success"
        />
        <MetricCard 
          title="Storage Used" 
          value="450 GB" 
          icon={<Server />}
          variant="warning"
          delta="85% capacity"
          deltaType="down"
        />
        <MetricCard 
          title="System Health" 
          value="99.9%" 
          icon={<ShieldCheck />}
          variant="info"
          delta="All systems operational"
          deltaType="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard padding="lg">
            <h3 className="cb-section-title mb-4">Institutional Analytics</h3>
            <div className="text-sm text-muted-foreground">
              Integration with analytics pipeline required.
            </div>
          </GlassCard>
        </div>
        
        <div className="space-y-6">
          <GlassCard padding="lg">
            <h3 className="cb-section-title mb-4">Audit Logs</h3>
            <div className="text-sm text-muted-foreground">
              Recent system events will appear here.
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}
