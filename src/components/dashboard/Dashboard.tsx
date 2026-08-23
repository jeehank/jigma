import React, { useState } from 'react';
import type { Project, UserProfile, ProjectType } from '../../types';
import Scanner from '../common/Scanner';
import {
  Search,
  ChevronDown,
  Bell,
  Clock,
  Globe,
  FileText,
  LayoutGrid,
  Boxes,
  Trash2,
  Settings,
  ChevronRight,
  ChevronLeft,
  Layout,
  Edit3,
  List,
  MoreHorizontal,
  Copy,
  Lock,
  LogOut,
  FolderPlus,
  Share2,
  Star,
  Sparkles,
  ExternalLink,
  BookOpen,
  Palette,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateProjectClick: (defaultType?: ProjectType) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleStar?: (projectId: string) => void;
  onSignOut: () => void;
}

type SidebarView = 'recents' | 'community' | 'drafts' | 'all' | 'resources' | 'trash' | 'admin';

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  projects,
  onOpenProject,
  onCreateProjectClick,
  onDeleteProject,
  onDuplicateProject,
  onToggleStar,
  onSignOut,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState<SidebarView>('recents');
  const [activeTab, setActiveTab] = useState<'recents' | 'shared_files' | 'shared_projects'>('recents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | ProjectType>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStarredExpanded, setIsStarredExpanded] = useState(true);

  const displayName = user.full_name || user.email?.split('@')[0] || 'Param';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const starredProjects = projects.filter((p) => p.is_starred);

  // Filter projects depending on active navigation view and search query
  const getDisplayProjects = () => {
    let list = projects;
    if (sidebarView === 'drafts') {
      list = projects.filter((p) => !p.is_password_protected);
    } else if (sidebarView === 'trash') {
      return [];
    }

    return list.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  const filteredProjects = getDisplayProjects();

  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Edited just now';
      if (diffHours < 24) return `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `Edited ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      const diffMonths = Math.floor(diffDays / 30);
      return `Edited ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } catch {
      return 'Edited recently';
    }
  };

  // Community showcase templates
  const COMMUNITY_TEMPLATES = [
    {
      id: 'template_saas',
      title: 'Neon SaaS Landing Page',
      type: 'design' as ProjectType,
      author: 'DesignOps Collective',
      likes: '1.4k',
      tags: ['Landing Page', 'Dark Mode', 'Cyberpunk'],
      description: 'High-converting dark UI hero sections, pricing cards, and glow effect components.',
    },
    {
      id: 'template_mobile',
      title: 'iOS 18 Fintech Mobile Kit',
      type: 'design' as ProjectType,
      author: 'Fintech Lab',
      likes: '920',
      tags: ['Mobile UI', 'iOS 18', 'Crypto'],
      description: 'Complete mobile screens with transaction lists, biometric auth states, and charts.',
    },
    {
      id: 'template_whiteboard',
      title: 'Interactive User Journey Flowchart',
      type: 'whiteboard' as ProjectType,
      author: 'Product Strategy Club',
      likes: '840',
      tags: ['Whiteboard', 'Flowchart', 'UX Research'],
      description: 'Sticky notes, directional nodes, user personas, and agile sprint ideation canvas.',
    },
    {
      id: 'template_design_system',
      title: 'Titan Glassmorphism Design System',
      type: 'design' as ProjectType,
      author: 'Studio Apex',
      likes: '2.1k',
      tags: ['Design System', 'Glass UI', 'Tokens'],
      description: 'Comprehensive design tokens, typography styles, button states, and modal dialogs.',
    },
  ];

  return (
    <div className="h-screen w-screen bg-[#070b09] text-[#e3e8ec] flex relative overflow-hidden font-jakarta select-none">
      {/* Background Scanner Glow Effect */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <Scanner
          color1="#00ff66"
          color2="#042f1a"
          color3="#22c55e"
          speed={0.35}
          sweepSpeed={0.15}
          glow={0.2}
          bandDensity={8}
        />
      </div>

      {/* LEFT SIDEBAR - Exact Figma Navigation */}
      <aside className="w-64 bg-[#0d120f]/95 border-r border-white/[0.08] backdrop-blur-xl flex flex-col justify-between z-20 shrink-0">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top User Profile Bar */}
          <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06]">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors group text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {displayInitial}
                </div>
                <span className="font-semibold text-xs text-white max-w-[110px] truncate font-jakarta">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute top-11 left-2 w-52 bg-[#121915] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 font-jakarta">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white">{displayName}</p>
                    <p className="text-[11px] text-emerald-400/80 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="w-full mt-1 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-xl flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-2 right-2" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-3.5 pt-3.5 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects"
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-[#121915] border border-white/[0.06] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all font-jakarta"
              />
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="px-2 py-2 space-y-0.5">
            <button
              onClick={() => setSidebarView('recents')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${sidebarView === 'recents'
                ? 'bg-[#1d2b23] text-emerald-300 shadow-sm border border-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Clock className={`w-4 h-4 ${sidebarView === 'recents' ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>Recents</span>
            </button>
          </div>

          {/* Team / Workspace Section Header */}
          <div className="px-3.5 pt-4 pb-1">
            <button
              onClick={() => setSidebarView('admin')}
              className="flex items-center space-x-2 text-left group w-full p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-sky-500 text-[10px] font-bold text-black flex items-center justify-center">
                x
              </div>
              <span className="font-semibold text-xs text-white truncate font-jakarta">
                User Dashboard
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-white ml-auto" />
            </button>
          </div>

          {/* Team Workspace Submenu */}
          <div className="px-2 py-1 space-y-0.5">
            <button
              onClick={() => setSidebarView('drafts')}
              className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sidebarView === 'drafts'
                ? 'bg-[#1d2b23] text-emerald-300 shadow-sm border border-emerald-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <FileText className={`w-3.5 h-3.5 ${sidebarView === 'drafts' ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>Drafts</span>
            </button>

            <button
              onClick={() => setSidebarView('all')}
              className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sidebarView === 'all'
                ? 'bg-[#1d2b23] text-emerald-300 shadow-sm border border-emerald-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${sidebarView === 'all' ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>All projects</span>
            </button>

            <button
              onClick={() => setSidebarView('resources')}
              className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sidebarView === 'resources'
                ? 'bg-[#1d2b23] text-emerald-300 shadow-sm border border-emerald-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Boxes className={`w-3.5 h-3.5 ${sidebarView === 'resources' ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>Resources</span>
            </button>

            <button
              onClick={() => setSidebarView('trash')}
              className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sidebarView === 'trash'
                ? 'bg-[#1d2b23] text-red-300 shadow-sm border border-red-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Trash2 className={`w-3.5 h-3.5 ${sidebarView === 'trash' ? 'text-red-400' : 'text-gray-400'}`} />
              <span>Trash</span>
            </button>

            <button
              onClick={() => setSidebarView('admin')}
              className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sidebarView === 'admin'
                ? 'bg-[#1d2b23] text-emerald-300 shadow-sm border border-emerald-500/20'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Settings className={`w-3.5 h-3.5 ${sidebarView === 'admin' ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>Admin</span>
            </button>
          </div>

          {/* Starred Section - Dynamically populated with real starred projects */}
          <div className="px-2 pt-4 pb-2">
            <button
              onClick={() => setIsStarredExpanded(!isStarredExpanded)}
              className="flex items-center space-x-1.5 px-3 py-1 text-[11px] font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wider transition-colors w-full text-left"
            >
              <ChevronDown
                className={`w-3 h-3 text-gray-400 transform transition-transform ${isStarredExpanded ? '' : '-rotate-90'
                  }`}
              />
              <span className="flex items-center space-x-1.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Starred ({starredProjects.length})</span>
              </span>
            </button>

            {isStarredExpanded && (
              <div className="mt-1 space-y-0.5">
                {starredProjects.length === 0 ? (
                  <p className="px-3 py-1.5 text-[11px] text-gray-500 italic">
                    No starred files. Click ••• on any project to star.
                  </p>
                ) : (
                  starredProjects.map((p) => {
                    const isDesign = p.type === 'design';
                    return (
                      <button
                        key={p.id}
                        onClick={() => onOpenProject(p.id)}
                        className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all text-left group"
                      >
                        {isDesign ? (
                          <Layout className="w-3.5 h-3.5 text-[#0d99ff] shrink-0" />
                        ) : (
                          <Edit3 className="w-3.5 h-3.5 text-[#a259ff] shrink-0" />
                        )}
                        <span className="truncate group-hover:text-emerald-300 transition-colors">
                          {p.title}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3.5 border-t border-white/[0.06] text-[11px] text-gray-400 flex items-center justify-between font-mono">
          <span className="text-emerald-400/80">JIGMA v2.5</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header with Breadcrumbs & Action Pills */}
        <header className="h-14 border-b border-white/[0.06] bg-[#090e0b]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-jakarta">
            <div className="flex items-center space-x-1 mr-2 text-gray-400">
              <button
                onClick={() => setSidebarView('recents')}
                className="p-1 hover:text-white rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 hover:text-white rounded transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm font-semibold text-white font-syne capitalize">
              {sidebarView === 'all'
                ? 'All Projects'
                : sidebarView === 'recents'
                  ? 'Recents'
                  : sidebarView}
            </span>
          </div>

          {/* Creation Action Buttons: Design and Whiteboard only */}
          <div className="flex items-center space-x-2.5 font-jakarta">
            {/* Design Board Button */}
            <button
              onClick={() => onCreateProjectClick('design')}
              className="px-4 py-1.5 bg-[#0d99ff] hover:bg-[#0088ee] text-white text-xs font-semibold rounded-full shadow-lg shadow-sky-950/40 flex items-center space-x-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              title="Create new Figma Design Board"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>+ Design</span>
            </button>

            {/* Whiteboard Button */}
            <button
              onClick={() => onCreateProjectClick('whiteboard')}
              className="px-4 py-1.5 bg-[#a259ff] hover:bg-[#9044ee] text-white text-xs font-semibold rounded-full shadow-lg shadow-purple-950/40 flex items-center space-x-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              title="Create new Whiteboard"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>+ Whiteboard</span>
            </button>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* RESOURCES VIEW */}
          {sidebarView === 'resources' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white font-syne flex items-center space-x-2">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                  <span>Design Resources & Cheatsheets</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Handpicked guides, shortcuts, and typography pairings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#111814]/90 border border-white/[0.08] space-y-2">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                  <h4 className="text-xs font-bold text-white">Keyboard Shortcuts</h4>
                  <p className="text-[11px] text-gray-400">
                    Press <code className="text-emerald-300 font-mono">[</code> to send layer to back, <code className="text-emerald-300 font-mono">]</code> to bring to front.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111814]/90 border border-white/[0.08] space-y-2">
                  <Palette className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">28 Aesthetic Fonts</h4>
                  <p className="text-[11px] text-gray-400">
                    Syne, Space Grotesk, Bricolage, Instrument Serif, Fraunces, Chakra Petch & more.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111814]/90 border border-white/[0.08] space-y-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">Clipping Masks</h4>
                  <p className="text-[11px] text-gray-400">
                    Place any shape under an image and click Mask to clip precisely to the boundary.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN / WORKSPACE VIEW */}
          {sidebarView === 'admin' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-white font-syne flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <span>Workspace Settings:</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage members, permissions, and cloud persistence.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#111814]/90 border border-white/[0.08] space-y-3 font-jakarta">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <p className="text-xs font-bold text-white">Owner Account</p>
                    <p className="text-[11px] text-gray-400">{user.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Admin
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Total Projects</p>
                    <p className="text-[11px] text-gray-400">{projects.length} files saved in Supabase</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {projects.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TRASH VIEW */}
          {sidebarView === 'trash' && (
            <div className="p-12 text-center my-8 max-w-md mx-auto bg-white/[0.02] rounded-3xl border border-white/[0.06] backdrop-blur-md">
              <div className="w-14 h-14 bg-red-950/40 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1 font-syne">Trash is empty</h3>
              <p className="text-xs text-gray-400 font-jakarta">
                Deleted files will appear here before being permanently erased.
              </p>
            </div>
          )}

          {/* DEFAULT / RECENTS / DRAFTS / ALL PROJECTS VIEW */}
          {['recents', 'drafts', 'all'].includes(sidebarView) && (
            <>
              {/* Subheader Filters & View Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* View Tabs */}
                <div className="flex items-center space-x-2 font-jakarta">
                  <button
                    onClick={() => setActiveTab('recents')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'recents'
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                  >
                    Recently viewed
                  </button>
                  <button
                    onClick={() => setActiveTab('shared_files')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'shared_files'
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                  >
                    Shared files
                  </button>
                  <button
                    onClick={() => setActiveTab('shared_projects')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'shared_projects'
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                  >
                    Shared projects
                  </button>
                </div>

                {/* Right Dropdown Selectors & Grid/List Switcher */}
                <div className="flex items-center space-x-3 text-xs text-gray-300 font-jakarta">
                  {/* Filter Type Selector */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-1.5 bg-[#111714] hover:bg-[#16201b] border border-white/[0.08] rounded-xl text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All files</option>
                    <option value="design">Design files</option>
                    <option value="whiteboard">Whiteboards</option>
                  </select>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/[0.12] text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      title="Grid view"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/[0.12] text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      title="List view"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Projects Container */}
              {filteredProjects.length === 0 ? (
                <div className="p-12 text-center my-12 max-w-md mx-auto bg-white/[0.02] rounded-3xl border border-white/[0.06] backdrop-blur-md">
                  <div className="w-14 h-14 bg-emerald-950/60 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <FolderPlus className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 font-syne">No files found</h3>
                  <p className="text-xs text-gray-400 mb-6 font-jakarta">
                    {searchQuery ? `No files matching "${searchQuery}"` : 'Create your first design board or whiteboard.'}
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => onCreateProjectClick('design')}
                      className="px-4 py-2 bg-[#0d99ff] hover:bg-[#0088ee] text-white text-xs font-semibold rounded-xl shadow-md inline-flex items-center space-x-2 transition-all font-jakarta"
                    >
                      <span>New Design File</span>
                    </button>
                    <button
                      onClick={() => onCreateProjectClick('whiteboard')}
                      className="px-4 py-2 bg-[#a259ff] hover:bg-[#9044ee] text-white text-xs font-semibold rounded-xl shadow-md inline-flex items-center space-x-2 transition-all font-jakarta"
                    >
                      <span>New Whiteboard</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
                      : 'space-y-2'
                  }
                >
                  {filteredProjects.map((project) => {
                    const isDesign = project.type === 'design';

                    if (viewMode === 'list') {
                      return (
                        <div
                          key={project.id}
                          onClick={() => onOpenProject(project.id)}
                          className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#111814]/90 hover:bg-[#18221c] border border-white/[0.06] hover:border-emerald-500/40 cursor-pointer transition-all font-jakarta"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDesign ? 'bg-sky-500/20 text-[#0d99ff]' : 'bg-purple-500/20 text-[#a259ff]'
                                }`}
                            >
                              {isDesign ? <Layout className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                {project.title}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {project.is_password_protected ? 'Password protected • ' : ''}
                                {formatRelativeTime(project.updated_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            {project.is_starred && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            )}
                            {project.is_password_protected && (
                              <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {displayInitial}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === project.id ? null : project.id);
                              }}
                              className="p-1 text-gray-400 hover:text-white rounded-lg"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={project.id}
                        onClick={() => onOpenProject(project.id)}
                        className="group bg-[#111714]/90 hover:bg-[#16201b] border border-white/[0.06] hover:border-emerald-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-950/30"
                      >
                        {/* Thumbnail Card Preview Area */}
                        <div className="h-44 bg-[#080d0a] relative overflow-hidden flex items-center justify-center border-b border-white/[0.04]">
                          {project.thumbnail_url ? (
                            <img
                              src={project.thumbnail_url}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-[#0c1410] via-black to-[#08100d] relative">
                              <div className="w-full h-full border border-white/[0.08] rounded-xl p-3 bg-black/60 flex flex-col justify-between">
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                                  <span className="uppercase text-[9px] tracking-wider text-emerald-400">
                                    {isDesign ? 'Design' : 'Whiteboard'}
                                  </span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <div className="text-center py-2">
                                  <p className="text-xs text-gray-200 font-syne font-bold truncate">
                                    {project.title}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-jakarta mt-0.5">
                                    Realtime Workspace
                                  </p>
                                </div>
                                <div className="h-1 w-full bg-emerald-950/80 rounded overflow-hidden">
                                  <div className="h-full bg-emerald-400 w-2/3" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Star Badge if Starred */}
                          {project.is_starred && (
                            <div className="absolute top-2.5 left-2.5 p-1 bg-black/80 rounded-lg backdrop-blur-md border border-amber-500/40">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            </div>
                          )}

                          {/* Options Button on hover */}
                          <div className="absolute top-2.5 right-2.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === project.id ? null : project.id);
                              }}
                              className="p-1.5 bg-black/80 hover:bg-neutral-800 text-gray-300 hover:text-white rounded-lg backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === project.id && (
                              <div
                                className="absolute right-0 top-8 w-44 bg-[#121915] rounded-xl shadow-2xl border border-white/10 p-1.5 z-30 font-jakarta animate-in fade-in zoom-in-95"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onToggleStar?.(project.id);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-gray-300 hover:text-amber-300 hover:bg-white/[0.06] rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${project.is_starred ? 'text-amber-400 fill-amber-400' : 'text-gray-400'
                                      }`}
                                  />
                                  <span>{project.is_starred ? 'Unstar project' : 'Star project'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDuplicateProject(project);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-gray-300 hover:text-emerald-300 hover:bg-white/[0.06] rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onOpenProject(project.id);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-gray-300 hover:text-emerald-300 hover:bg-white/[0.06] rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Share link</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDeleteProject(project.id);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Metadata Footer (Figma style) */}
                        <div className="p-3.5 flex items-center justify-between font-jakarta">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {/* Project Type Icon */}
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${isDesign ? 'bg-[#0d99ff] text-white' : 'bg-[#a259ff] text-white'
                                }`}
                            >
                              {isDesign ? <Layout className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                                {project.title}
                              </h4>
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {project.is_password_protected ? 'Password protected • ' : ''}
                                {formatRelativeTime(project.updated_at)}
                              </p>
                            </div>
                          </div>

                          {/* User Avatar Circle */}
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 ml-2 shadow-sm">
                            {displayInitial}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Bottom-Right Help Circle */}
      <button
        onClick={() => setSidebarView('resources')}
        className="fixed bottom-5 right-5 w-8 h-8 rounded-full bg-[#18221c] hover:bg-[#202e26] border border-white/10 text-gray-400 hover:text-white flex items-center justify-center font-bold text-xs shadow-lg transition-all z-30"
        title="Help & Resources"
      >
        ?
      </button>
    </div>
  );
};
