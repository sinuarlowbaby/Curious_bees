'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { FolderOpen, ArrowRight, Calendar, Users, Loader2 } from 'lucide-react';

export default function WorkspacesListPage() {
  const { workspaces, fetchWorkspaces, isLoading } = useStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <div className="space-y-8 text-left font-sans select-none">
      
      {/* 🚀 HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-borderStroke pb-4">
        <div>
          <h1 className="font-display font-light text-2xl sm:text-3xl text-black tracking-tight">
            Research Workspaces
          </h1>
          <p className="text-textSecondary text-[13px] mt-1.5">
            Active workspaces generated from supervisor-approved research collaboration opportunities.
          </p>
        </div>
        <div className="w-[40px] h-[40px] bg-darkSurfaceMuted border border-borderStroke rounded-xl flex items-center justify-center text-textSecondary shrink-0">
          <FolderOpen className="w-5 h-5" />
        </div>
      </div>

      {/* ⚡ ACTIVE WORKSPACES */}
      {isLoading && workspaces.length === 0 ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigoElectric animate-spin" />
        </div>
      ) : workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((workspace) => (
            <Link 
              key={workspace.id}
              href={`/workspace/${workspace.id}`}
              className="bg-white border border-borderStroke rounded-2xl p-5 hover:border-black transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-start justify-between">
                  <div className="w-[36px] h-[36px] bg-indigoElectric/5 text-indigoElectric rounded-lg flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4.5 h-4.5" />
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-darkSurfaceMuted text-textSecondary border border-borderStroke uppercase tracking-wider">
                    Active
                  </span>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-display font-light text-lg text-black group-hover:text-indigoElectric transition-colors truncate">
                    {workspace.title}
                  </h3>
                  <p className="text-textSecondary text-xs line-clamp-2 leading-relaxed">
                    {workspace.description || 'Dedicated workspace for research documents, milestone checklists, and group announcements.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-borderStroke flex items-center justify-between">
                <div className="flex items-center space-x-4 text-[11px] text-textMuted font-semibold">
                  <div className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span>{workspace.members?.length || 0} Members</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    <span>Joined {new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="w-[28px] h-[28px] rounded-lg border border-borderStroke flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition duration-200 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-borderStroke rounded-2xl text-textMuted flex flex-col items-center justify-center space-y-3 bg-white">
          <FolderOpen className="w-10 h-10 text-textMuted" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-black">No Active Workspaces</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Workspaces are automatically provisioned as soon as a faculty supervisor accepts a collaboration request on an opportunity post.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
