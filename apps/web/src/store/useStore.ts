import { create } from 'zustand';
import { User, Thread, Comment, Opportunity, UserRole, Event } from '@srm-recollab/types';

// Mock DB Initial Data for out-of-the-box local testing
const MOCK_INTERESTS = [
  { id: '1', name: 'Generative AI & LLMs' },
  { id: '2', name: 'Quantum Computing' },
  { id: '3', name: 'Silicon Photonics' },
  { id: '4', name: 'Nanomaterials & Thin Films' },
  { id: '5', name: 'Cancer Immunotherapy' },
  { id: '6', name: '5G/6G Wireless Networks' },
  { id: '7', name: 'VLSI System Design' },
  { id: '8', name: 'Bioinformatics' }
];

const MOCK_USERS: Record<string, User> = {
  'dr.anand@srmist.edu.in': {
    id: 'u1',
    name: 'Dr. Anand Ramachandran',
    email: 'dr.anand@srmist.edu.in',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'FACULTY',
    department: 'Computing Technologies (CSE / IT / Swe)',
    bio: 'Professor of Computer Science. Researching distributed systems, edge computing, and large language model optimizations for low-resource environments.',
    createdAt: new Date().toISOString(),
    interests: [
      { userId: 'u1', interestId: '1', interest: MOCK_INTERESTS[0] },
      { userId: 'u1', interestId: '8', interest: MOCK_INTERESTS[7] }
    ]
  },
  'dr.priya@srmist.edu.in': {
    id: 'u2',
    name: 'Dr. Priya Subramanian',
    email: 'dr.priya@srmist.edu.in',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'FACULTY',
    department: 'Biotechnology & Bioengineering',
    bio: 'Associate Professor of Bioengineering. Focused on genomic sequencing algorithms, targeted drug delivery, and computational oncology.',
    createdAt: new Date().toISOString(),
    interests: [
      { userId: 'u2', interestId: '5', interest: MOCK_INTERESTS[4] },
      { userId: 'u2', interestId: '8', interest: MOCK_INTERESTS[7] }
    ]
  },
  'scholar.suresh@srmist.edu.in': {
    id: 'u3',
    name: 'Suresh Karthik',
    email: 'scholar.suresh@srmist.edu.in',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'PHD_SCHOLAR',
    department: 'Computing Technologies (CSE / IT / Swe)',
    bio: 'PhD Candidate supervised by Dr. Anand. Working on parameter-efficient fine-tuning (PEFT) methods for vision-language models.',
    createdAt: new Date().toISOString(),
    interests: [
      { userId: 'u3', interestId: '1', interest: MOCK_INTERESTS[0] }
    ]
  }
};

const INITIAL_THREADS: Thread[] = [
  {
    id: 't1',
    title: 'Call for Collaboration: GPGPU Resource Sharing for LLM Fine-Tuning',
    content: `Hello Colleagues,

Our lab in the Computing Technologies department has recently set up a cluster of 4x NVIDIA H100 GPUs for fine-tuning custom models on institutional datasets. 

We are currently looking to collaborate with faculty members in the **Biotechnology & Bioengineering** department who need GPU cycles to accelerate protein fold sequencing or drug discovery workflows. 

If your PhD scholars have computationally demanding deep learning workloads (written in PyTorch or JAX), please reach out. We would love to co-author and share these resources to produce high-impact joint publications.

Best regards,
Dr. Anand Ramachandran`,
    authorId: 'u1',
    author: MOCK_USERS['dr.anand@srmist.edu.in'],
    tags: ['GPU Cluster', 'Generative AI & LLMs', 'Bioinformatics', 'Collaboration'],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    comments: [
      {
        id: 'c1',
        content: `Dr. Anand, my PhD scholar Divya Nambiar is currently running molecular modeling using very heavy Graph Neural Networks. Our current local RTX 3090s are taking weeks to complete the epochs. Access to your H100 cluster would speed up her thesis work by at least 10x. We would be absolutely thrilled to collaborate!`,
        threadId: 't1',
        authorId: 'u2',
        author: MOCK_USERS['dr.priya@srmist.edu.in'],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c2',
        content: `Thank you Dr. Priya! Yes, Divya is welcome to share our cluster. I have asked my PhD scholar Suresh to set up Docker containers and provision SSH keys for her. Let's schedule a Zoom call this Monday to align on the technical details.`,
        threadId: 't1',
        authorId: 'u1',
        author: MOCK_USERS['dr.anand@srmist.edu.in'],
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ]
  },
  {
    id: 't2',
    title: 'Interdisciplinary Study on Silicon Photonics-based Genomic Sequencing Chips',
    content: `Hi everyone,

I am drafting a proposal for the upcoming **DST-SERB Core Research Grant** focusing on creating high-throughput genomic sequencing sensors integrated directly on-chip using silicon photonics.

This is a highly cross-disciplinary endeavor requiring:
1. **ECE experts** with experience in silicon waveguide fabrication and optical resonators (Dr. Ramesh's team).
2. **Biotech experts** with experience in bio-functionalizing chip surfaces to bind DNA molecules (my team).
3. **Computer Science experts** to design fast signal decoding algorithms directly running on raw optical sensor data.

We are holding an initial brainstorming session in the ECE Seminar Hall next Friday at 2:00 PM. Please reply to this thread if you are interested in joining the proposal!

Best,
Dr. Priya Subramanian`,
    authorId: 'u2',
    author: MOCK_USERS['dr.priya@srmist.edu.in'],
    tags: ['Silicon Photonics', 'Bioinformatics', 'Research Grant', 'DST-SERB'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    comments: []
  }
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1',
    title: 'PhD Position: Reinforcement Learning for Smart Grid Optimization',
    description: `We are seeking an outstanding PhD candidate to join the EEE department under the joint supervision of EEE and CSE faculty.

The project involves designing multi-agent reinforcement learning (MARL) algorithms to optimize energy distribution and load balancing in next-generation microgrids.

**Required Qualifications:**
- B.Tech/M.Tech in EEE, ECE, or CSE with a strong academic track record.
- Exceptional programming skills in Python (PyTorch or TensorFlow).
- Solid foundation in linear algebra, probability, and control systems.

**Funding:** Monthly stipend of ₹38,000 + HRA as per SRM Institute norms for the first 2 years, upgradable to SRF in the 3rd year.`,
    department: 'Electrical & Electronics Engineering (EEE)',
    researchDomain: 'Reinforcement Learning',
    authorId: 'u1',
    author: MOCK_USERS['dr.anand@srmist.edu.in'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'o2',
    title: 'Research Assistant: 2D Nanomaterials for Energy Storage',
    description: `The Materials Science Lab is recruiting a full-time Research Assistant (RA) for a sponsored project on synthesizing transition metal dichalcogenide (TMD) thin films for supercapacitor electrodes.

**Key Responsibilities:**
- Physical vapor deposition (PVD) and chemical vapor deposition (CVD) synthesis of thin films.
- Characterization using XRD, SEM, and Raman spectroscopy.
- Electrochemical performance evaluation using cyclic voltammetry.

**Duration:** 12 Months (extendable based on performance and fund availability).
**Stipend:** ₹31,000 consolidated per month.`,
    department: 'Chemistry & Materials Science',
    researchDomain: 'Nanomaterials & Thin Films',
    authorId: 'u2',
    author: MOCK_USERS['dr.priya@srmist.edu.in'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    event: 'PhD Viva Defense: GPGPU Virtualization & LLM Tuning',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    venue: 'ECE Seminar Hall (PG Block)'
  },
  {
    id: 'e2',
    event: 'Seminar: DNA-functionalized Silicon Photonics Ring Resonators',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '02:30 PM',
    venue: 'Biotech Conference Room'
  },
  {
    id: 'e3',
    event: 'Workshop: DST-SERB Proposal Drafting & Grant Compliance',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    time: '11:15 AM',
    venue: 'Main Auditorium (Administrative Block)'
  }
];

interface AppState {
  // Session & Profiles
  currentUser: User | null;
  roleOverride: UserRole; // Dev override helper
  allUsers: Record<string, User>;
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

  // Setters & Actions
  setCurrentUser: (user: User | null) => void;
  toggleRoleOverride: () => void;
  setRoleOverride: (role: UserRole) => void;
  setMobileSidebar: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setActiveTag: (tag: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Mutations (Mock-database stateful fallbacks)
  fetchData: () => Promise<void>;
  createThread: (title: string, content: string, tags: string[]) => Promise<Thread>;
  addComment: (threadId: string, content: string) => Promise<Comment>;
  createOpportunity: (title: string, description: string, department: string, researchDomain: string) => Promise<Opportunity>;
  updateProfile: (data: { name: string; department: string; bio: string; role: UserRole; interests: string[] }) => Promise<User>;
  fetchEvents: (showIndicator?: boolean) => Promise<Event[]>;
  createEvent: (event: string, date: string, time: string, venue: string) => Promise<Event>;
  updateEvent: (id: string, event: string, date: string, time: string, venue: string) => Promise<Event>;
  deleteEvent: (id: string) => Promise<Event>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS['scholar.suresh@srmist.edu.in'], // Default dev user
  roleOverride: 'PHD_SCHOLAR',
  allUsers: MOCK_USERS,
  interestsList: MOCK_INTERESTS.map(i => i.name),
  
  isLoading: false,
  showMobileSidebar: false,
  searchQuery: '',
  activeTag: '',
  theme: 'light',

  threads: INITIAL_THREADS,
  opportunities: INITIAL_OPPORTUNITIES,
  events: INITIAL_EVENTS,

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
  
  setRoleOverride: (role) => {
    set((state) => {
      const updatedUser = state.currentUser ? { ...state.currentUser, role } : null;
      return {
        roleOverride: role,
        currentUser: updatedUser
      };
    });
  },

  toggleRoleOverride: () => {
    const currentRole = get().roleOverride;
    const nextRole = currentRole === 'FACULTY' ? 'PHD_SCHOLAR' : 'FACULTY';
    get().setRoleOverride(nextRole);
  },

  fetchData: async () => {
    set({ isLoading: true });
    // In production we would fetch from NestJS, e.g.:
    // fetch('http://localhost:4000/api/threads')
    // Here we just simulate a tiny network delay for visual loading feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ isLoading: false });
  },

  createThread: async (title, content, tags) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = get().currentUser || MOCK_USERS['scholar.suresh@srmist.edu.in'];
    const newThread: Thread = {
      id: `t_${Date.now()}`,
      title,
      content,
      authorId: user.id,
      author: user,
      tags,
      createdAt: new Date().toISOString(),
      comments: []
    };

    set((state) => ({
      threads: [newThread, ...state.threads],
      isLoading: false
    }));

    return newThread;
  },

  addComment: async (threadId, content) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = get().currentUser || MOCK_USERS['scholar.suresh@srmist.edu.in'];
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      content,
      threadId,
      authorId: user.id,
      author: user,
      createdAt: new Date().toISOString()
    };

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
      return {
        threads: updatedThreads,
        isLoading: false
      };
    });

    return newComment;
  },

  createOpportunity: async (title, description, department, researchDomain) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = get().currentUser || MOCK_USERS['dr.anand@srmist.edu.in'];
    const newOpp: Opportunity = {
      id: `o_${Date.now()}`,
      title,
      description,
      department,
      researchDomain,
      authorId: user.id,
      author: user,
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      opportunities: [newOpp, ...state.opportunities],
      isLoading: false
    }));

    return newOpp;
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));

    const current = get().currentUser || MOCK_USERS['scholar.suresh@srmist.edu.in'];
    const updated: User = {
      ...current,
      name: data.name,
      department: data.department,
      bio: data.bio,
      role: data.role,
      interests: data.interests.map((name, index) => ({
        userId: current.id,
        interestId: String(index),
        interest: { id: String(index), name }
      }))
    };

    set({
      currentUser: updated,
      roleOverride: data.role,
      isLoading: false
    });

    return updated;
  },

  fetchEvents: async (showIndicator = false) => {
    if (showIndicator) set({ isLoading: true });
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        set({ events: data, isLoading: false });
        return data;
      }
      throw new Error();
    } catch (e) {
      // Offline fallback
      await new Promise(resolve => setTimeout(resolve, 200));
      set({ isLoading: false });
      return get().events;
    }
  },

  createEvent: async (event, date, time, venue) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, date, time, venue })
      });
      if (res.ok) {
        const data = await res.json();
        set(state => ({ events: [...state.events, data], isLoading: false }));
        return data;
      }
      throw new Error();
    } catch (e) {
      // Offline fallback
      await new Promise(resolve => setTimeout(resolve, 300));
      const newEvent: Event = {
        id: `mock-e-${Date.now()}`,
        event,
        date,
        time,
        venue
      };
      set(state => ({ events: [...state.events, newEvent], isLoading: false }));
      return newEvent;
    }
  },

  updateEvent: async (id, event, date, time, venue) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, event, date, time, venue })
      });
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          events: state.events.map(ev => ev.id === id ? data : ev),
          isLoading: false
        }));
        return data;
      }
      throw new Error();
    } catch (e) {
      // Offline fallback
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedEvent: Event = { id, event, date, time, venue };
      set(state => ({
        events: state.events.map(ev => ev.id === id ? updatedEvent : ev),
        isLoading: false
      }));
      return updatedEvent;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          events: state.events.filter(ev => ev.id !== id),
          isLoading: false
        }));
        return data;
      }
      throw new Error();
    } catch (e) {
      // Offline fallback
      await new Promise(resolve => setTimeout(resolve, 200));
      const deleted = get().events.find(ev => ev.id === id) || { id, event: 'Deleted Event', date: '', time: '', venue: '' };
      set(state => ({
        events: state.events.filter(ev => ev.id !== id),
        isLoading: false
      }));
      return deleted;
    }
  }
}));
