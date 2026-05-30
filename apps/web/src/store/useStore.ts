import { create } from 'zustand';
import { User, Thread, Comment, Opportunity, UserRole, Event } from '@srm-recollab/types';
import { auth } from '@/lib/firebase';

const MOCK_INTERESTS = [
  'Generative AI & LLMs',
  'Quantum Computing',
  'Silicon Photonics',
  'Nanomaterials & Thin Films',
  'Cancer Immunotherapy',
  '5G/6G Wireless Networks',
  'VLSI System Design',
  'Bioinformatics'
];

interface AppState {
  // Session & Profiles
  currentUser: User | null;
  roleOverride: UserRole; // Syncs to current user role
  interestsList: string[];
  
  // UI states
  isLoading: boolean;
  showMobileSidebar: boolean;
  searchQuery: string;
  activeTag: string;
  theme: 'dark' | 'light';

  // Domain states
  threads: Thread[];
  opportunities: Opportunity[];
  events: Event[];
  aiLogs: any[];
  collaborators: User[];

  // Setters & Actions
  setCurrentUser: (user: User | null) => void;
  setMobileSidebar: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setActiveTag: (tag: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Live REST API Actions (Integrates Firebase Bearer JWT)
  syncUserSession: () => Promise<User | null>;
  fetchData: () => Promise<void>;
  fetchCollaborators: (search?: string, department?: string) => Promise<User[]>;
  createThread: (title: string, content: string, tags: string[]) => Promise<Thread>;
  addComment: (threadId: string, content: string) => Promise<Comment>;
  createOpportunity: (title: string, description: string, department: string, researchDomain: string) => Promise<Opportunity>;
  updateProfile: (data: { name: string; department: string; bio: string; role: UserRole; interests: string[] }) => Promise<User>;
  fetchEvents: (showIndicator?: boolean) => Promise<Event[]>;
  fetchAiLogs: () => Promise<any[]>;
  createEvent: (title: string, date: string, time: string, venue: string) => Promise<Event>;
  updateEvent: (id: string, title: string, date: string, time: string, venue: string) => Promise<Event>;
  deleteEvent: (id: string) => Promise<Event>;
  logout: () => void;
}

// Helper to asynchronously extract valid Firebase ID Token Bearer header
const getBearerHeader = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true); // Enforce fresh token
    return { 'Authorization': `Bearer ${token}` };
  }
  
  // Local development bypass support
  if (typeof window !== 'undefined') {
    const mockToken = localStorage.getItem('recollab-mock-token');
    if (mockToken) {
      return { 'Authorization': `Bearer ${mockToken}` };
    }
  }
  return {};
};

export const useStore = create<AppState>((set, get) => ({
  currentUser: null, // Default to null for strict live login checking
  roleOverride: 'PHD_SCHOLAR',
  interestsList: MOCK_INTERESTS,
  
  isLoading: false,
  showMobileSidebar: false,
  searchQuery: '',
  activeTag: '',
  theme: 'light',

  threads: [],
  opportunities: [],
  events: [],
  aiLogs: [],
  collaborators: [],

  setCurrentUser: (user) => set({ currentUser: user, roleOverride: user?.role || 'PHD_SCHOLAR' }),
  setMobileSidebar: (show) => set({ showMobileSidebar: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTag: (tag) => set({ activeTag: tag }),
  
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('srm-recollab-theme', theme);
    }
    set({ theme });
  },

  // 1. Sync User session from Firebase auth token with the Supabase Backend
  syncUserSession: async () => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      if (Object.keys(headers).length === 0) {
        set({ currentUser: null });
        return null;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          set({ currentUser: data.user, roleOverride: data.user.role });
          return data.user;
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('recollab-mock-token');
      }
      set({ currentUser: null });
      return null;
    } catch (e) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('recollab-mock-token');
      }
      set({ currentUser: null });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. Fetch live Threads and Opportunities concurrently
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const [threadsRes, oppsRes] = await Promise.all([
        fetch('/api/threads', { headers }),
        fetch('/api/opportunities', { headers })
      ]);

      if (threadsRes.ok && oppsRes.ok) {
        const threads = await threadsRes.json();
        const opportunities = await oppsRes.json();
        set({ threads, opportunities });
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  // 3. Query directory of co-authors / research experts from database
  fetchCollaborators: async (search, department) => {
    try {
      const headers = await getBearerHeader();
      let query = '';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (department) query += `department=${encodeURIComponent(department)}`;

      const res = await fetch(`/api/users/collaborators?${query}`, { headers });
      if (res.ok) {
        const data = await res.json();
        set({ collaborators: data });
        return data;
      }
      return [];
    } catch (e) {
      console.error('Failed to query expert directory:', e);
      return [];
    }
  },

  // 4. Create a new discussion thread
  createThread: async (title, content, tags) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ title, content, tags })
      });
      if (res.ok) {
        const newThread = await res.json();
        set((state) => ({
          threads: [newThread, ...state.threads]
        }));
        return newThread;
      }
      throw new Error('Failed to publish thread.');
    } finally {
      set({ isLoading: false });
    }
  },

  // 5. Comment on an active thread
  addComment: async (threadId, content) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ threadId, content })
      });
      if (res.ok) {
        const newComment = await res.json();
        set((state) => {
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              return {
                ...t,
                comments: [...(t.comments || []), newComment]
              };
            }
            return t;
          });
          return { threads: updatedThreads };
        });
        return newComment;
      }
      throw new Error('Failed to publish comment.');
    } finally {
      set({ isLoading: false });
    }
  },

  // 6. Publish a research opportunity (Hiring/Collaboration)
  createOpportunity: async (title, description, department, researchDomain) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ title, description, department, researchDomain })
      });
      if (res.ok) {
        const newOpp = await res.json();
        set((state) => ({
          opportunities: [newOpp, ...state.opportunities]
        }));
        return newOpp;
      }
      throw new Error('Failed to publish opportunity.');
    } finally {
      set({ isLoading: false });
    }
  },

  // 7. Update logged-in Profile metadata
  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        set({ currentUser: updatedUser, roleOverride: updatedUser.role });
        return updatedUser;
      }
      throw new Error('Failed to update profile.');
    } finally {
      set({ isLoading: false });
    }
  },

  // 8. Event Operations (Calendar view hooks)
  fetchEvents: async (showIndicator = false) => {
    if (showIndicator) set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/events', { headers });
      if (res.ok) {
        const data = await res.json();
        set({ events: data });
        return data;
      }
      throw new Error();
    } catch (e) {
      return get().events;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAiLogs: async () => {
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/events/ai-logs', { headers });
      if (res.ok) {
        const data = await res.json();
        set({ aiLogs: data });
        return data;
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  createEvent: async (title, date, time, venue) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ title, date, time, venue })
      });
      if (res.ok) {
        const data = await res.json();
        set(state => ({ events: [...state.events, data] }));
        return data;
      }
      throw new Error();
    } finally {
      set({ isLoading: false });
    }
  },

  updateEvent: async (id, title, date, time, venue) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id, title, date, time, venue })
      });
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          events: state.events.map(ev => ev.id === id ? data : ev)
        }));
        return data;
      }
      throw new Error();
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true });
    try {
      const headers = await getBearerHeader();
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          events: state.events.filter(ev => ev.id !== id)
        }));
        return data;
      }
      throw new Error();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recollab-mock-token');
    }
    import('@/lib/firebase').then(({ auth }) => {
      auth.signOut().catch(() => {});
    });
    set({ currentUser: null });
  }
}));
