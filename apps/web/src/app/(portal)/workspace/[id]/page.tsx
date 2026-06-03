'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  FolderOpen, 
  CheckSquare, 
  Megaphone, 
  UploadCloud, 
  Plus, 
  Calendar, 
  User, 
  ArrowLeft,
  Loader2,
  FileText
} from 'lucide-react';
import TagPill from '@/components/TagPill';
import AvatarRing from '@/components/AvatarRing';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const { 
    currentUser, 
    activeWorkspace, 
    fetchWorkspaceDetails, 
    addWorkspaceFile, 
    addWorkspaceMilestone, 
    toggleWorkspaceMilestone, 
    addWorkspaceAnnouncement, 
    isLoading 
  } = useStore();

  // Local Form States
  const [activeTab, setActiveTab] = useState<'files' | 'milestones' | 'announcements'>('files');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceDetails(workspaceId).catch(() => {
        router.push('/dashboard');
      });
    }
  }, [workspaceId, fetchWorkspaceDetails, router]);

  if (isLoading && !activeWorkspace) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigoElectric animate-spin" />
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="text-center py-12">
        <p className="text-textSecondary">Workspace not found or unauthorized.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-black text-white rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Find if current user is owner of workspace
  const userMemberRecord = activeWorkspace.members?.find(m => m.userId === currentUser?.id);
  const isOwner = userMemberRecord?.role === 'OWNER' || currentUser?.role === 'FACULTY' || currentUser?.role === 'ADMIN';

  // Handle file upload
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !fileUrl) return;

    try {
      // Simulate size in KB
      const simulatedSize = Math.floor(Math.random() * 8000) + 500;
      await addWorkspaceFile(workspaceId, fileName, fileUrl, simulatedSize);
      setFileName('');
      setFileUrl('');
      setShowFileModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle milestone add
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle) return;

    try {
      await addWorkspaceMilestone(workspaceId, milestoneTitle, milestoneDesc, milestoneDueDate || undefined);
      setMilestoneTitle('');
      setMilestoneDesc('');
      setMilestoneDueDate('');
      setShowMilestoneModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle announcement add
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    try {
      await addWorkspaceAnnouncement(workspaceId, announceTitle, announceContent);
      setAnnounceTitle('');
      setAnnounceContent('');
      setShowAnnounceModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans select-none">
      
      {/* 🔙 BACK HEADER */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center space-x-2 text-xs font-semibold text-textSecondary hover:text-black transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Research Hub</span>
      </div>

      {/* 📄 WORKSPACE HEADER DETAILS */}
      <div className="bg-white border border-borderStroke rounded-2xl p-6 sm:p-8 space-y-4">
        <h1 className="font-display font-light text-2xl sm:text-3xl text-black tracking-tight leading-tight">
          {activeWorkspace.title}
        </h1>
        <p className="text-textSecondary text-[14px] max-w-2xl leading-relaxed">
          {activeWorkspace.description || 'Shared institutional workspace for research peer collaboration, file management, and milestones tracking.'}
        </p>

        {/* Members ring */}
        <div className="pt-4 border-t border-borderStroke flex flex-wrap items-center gap-4">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Group Members:</span>
          <div className="flex items-center space-x-4">
            {activeWorkspace.members?.map((member) => (
              <div key={member.userId} className="flex items-center space-x-2">
                <AvatarRing 
                  src={member.user?.image || undefined} 
                  name={member.user?.name || undefined}
                  role={member.user?.role}
                  size="sm"
                />
                <div className="text-left">
                  <p className="text-xs font-semibold text-black leading-none">{member.user?.name}</p>
                  <span className="text-[9px] text-textSecondary">{member.role === 'OWNER' ? 'Principal Investigator' : 'Collaborator'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎛️ TAB TRIGGERS */}
      <div className="flex border-b border-borderStroke">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center space-x-2 pb-3.5 px-4 font-semibold text-xs uppercase tracking-wider cursor-pointer border-b-2 transition ${
            activeTab === 'files' ? 'border-black text-black' : 'border-transparent text-textMuted hover:text-black'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Files & Artifacts</span>
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center space-x-2 pb-3.5 px-4 font-semibold text-xs uppercase tracking-wider cursor-pointer border-b-2 transition ${
            activeTab === 'milestones' ? 'border-black text-black' : 'border-transparent text-textMuted hover:text-black'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Milestones</span>
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 pb-3.5 px-4 font-semibold text-xs uppercase tracking-wider cursor-pointer border-b-2 transition ${
            activeTab === 'announcements' ? 'border-black text-black' : 'border-transparent text-textMuted hover:text-black'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements</span>
        </button>
      </div>

      {/* ⚡ TAB CONTENTS */}
      <div className="min-h-[300px]">
        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Shared Documents</h3>
              <button 
                onClick={() => setShowFileModal(true)} 
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-black hover:bg-[#222222] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {activeWorkspace.files && activeWorkspace.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeWorkspace.files.map((file) => (
                  <div key={file.id} className="bg-white border border-borderStroke rounded-xl p-4 flex items-start justify-between hover:border-black transition">
                    <div className="flex items-start space-x-3 text-left min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigoElectric/5 text-indigoElectric flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-black truncate">{file.name}</h4>
                        <p className="text-[10px] text-textSecondary mt-0.5">
                          Uploaded by {file.uploadedBy?.name} | {file.size} KB
                        </p>
                      </div>
                    </div>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-indigoElectric hover:underline shrink-0 ml-2"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-borderStroke rounded-2xl text-textMuted flex flex-col items-center justify-center space-y-2">
                <FolderOpen className="w-8 h-8" />
                <span className="text-xs">No files uploaded yet.</span>
              </div>
            )}
          </div>
        )}

        {/* MILESTONES TAB */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Research Checklist</h3>
              {isOwner && (
                <button 
                  onClick={() => setShowMilestoneModal(true)} 
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-black hover:bg-[#222222] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              )}
            </div>

            {activeWorkspace.milestones && activeWorkspace.milestones.length > 0 ? (
              <div className="bg-white border border-borderStroke rounded-xl divide-y divide-borderStroke">
                {activeWorkspace.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 flex items-start space-x-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={milestone.completed}
                      onChange={(e) => toggleWorkspaceMilestone(workspaceId, milestone.id, e.target.checked)}
                      className="w-4 h-4 rounded text-black border-borderStroke focus:ring-black cursor-pointer mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold leading-tight ${milestone.completed ? 'line-through text-textMuted' : 'text-black'}`}>
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className={`text-xs mt-1 ${milestone.completed ? 'text-textMuted' : 'text-textSecondary'}`}>
                          {milestone.description}
                        </p>
                      )}
                      {milestone.dueDate && (
                        <div className="flex items-center text-[10px] text-textMuted mt-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-borderStroke rounded-2xl text-textMuted flex flex-col items-center justify-center space-y-2">
                <CheckSquare className="w-8 h-8" />
                <span className="text-xs">No milestones defined yet.</span>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Synergy Broadcasts</h3>
              <button 
                onClick={() => setShowAnnounceModal(true)} 
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-black hover:bg-[#222222] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Post Announcement</span>
              </button>
            </div>

            {activeWorkspace.announcements && activeWorkspace.announcements.length > 0 ? (
              <div className="space-y-4">
                {activeWorkspace.announcements.map((announce) => (
                  <div key={announce.id} className="bg-white border border-borderStroke rounded-xl p-5 space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AvatarRing 
                          src={announce.author?.image || undefined} 
                          name={announce.author?.name || undefined}
                          size="sm"
                        />
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-black leading-tight">{announce.author?.name}</h4>
                          <span className="text-[9px] text-textMuted">Posted {new Date(announce.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-black">{announce.title}</h3>
                      <p className="text-xs text-textSecondary leading-relaxed">{announce.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-borderStroke rounded-2xl text-textMuted flex flex-col items-center justify-center space-y-2">
                <Megaphone className="w-8 h-8" />
                <span className="text-xs">No announcements posted.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🚀 MODAL 1: ADD FILE */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-borderStroke p-6 w-full max-w-sm text-left space-y-4">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Share Document</h3>
            <form onSubmit={handleUploadFile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">File Name</label>
                <input 
                  type="text" 
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. ResearchDraft_V1.pdf"
                  className="w-full h-[38px] px-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Document URL</label>
                <input 
                  type="url" 
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="e.g. https://storage.srmist.edu/files/draft.pdf"
                  className="w-full h-[38px] px-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowFileModal(false)}
                  className="px-3.5 py-1.5 border border-borderStroke hover:bg-darkSurfaceMuted rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222222] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 2: ADD MILESTONE */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-borderStroke p-6 w-full max-w-sm text-left space-y-4">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">New Research Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Milestone Title</label>
                <input 
                  type="text" 
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. Literature Review Compilation"
                  className="w-full h-[38px] px-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Description</label>
                <textarea 
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Details of what needs to be finalized..."
                  className="w-full h-[60px] p-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Due Date</label>
                <input 
                  type="date" 
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="w-full h-[38px] px-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-3.5 py-1.5 border border-borderStroke hover:bg-darkSurfaceMuted rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222222] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 3: ADD ANNOUNCEMENT */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-borderStroke p-6 w-full max-w-sm text-left space-y-4">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Synergy Broadcast</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Subject Title</label>
                <input 
                  type="text" 
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. Next Meeting Scheduled"
                  className="w-full h-[38px] px-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Content Message</label>
                <textarea 
                  required
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Write the announcement details..."
                  className="w-full h-[90px] p-3 bg-darkSurfaceMuted border border-borderStroke focus:border-black rounded-lg text-xs text-black outline-none resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-3.5 py-1.5 border border-borderStroke hover:bg-darkSurfaceMuted rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222222] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
