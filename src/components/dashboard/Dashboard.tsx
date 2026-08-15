import React, { useState } from 'react';
import type { Project, UserProfile, ProjectType } from '../../types';
import Scanner from '../common/Scanner';
import {
  Plus,
  Search,
  Layout,
  Edit3,
  MoreVertical,
  Trash2,
  Copy,
  Clock,
  LogOut,
  FolderPlus,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateProjectClick: () => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onSignOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  projects,
  onOpenProject,
  onCreateProjectClick,
  onDeleteProject,
  onDuplicateProject,
  onSignOut,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | ProjectType>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#030704] text-gray-100 flex flex-col relative font-sans overflow-x-hidden">
      {/* WebGL Scanner Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Scanner
          color1="#00ff66"
          color2="#042f1a"
          color3="#22c55e"
          speed={0.4}
          sweepSpeed={0.2}
          glow={0.25}
          bandDensity={10}
        />
      </div>

      {/* Top Header - ONLY text saying 'Jigma' */}
      <header className="h-16 border-b border-emerald-500/30 glass-panel px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Jigma
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onCreateProjectClick}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <div className="flex items-center space-x-3 pl-4 border-l border-emerald-900/60">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
              alt={user.full_name || user.email}
              className="w-8 h-8 rounded-full border border-emerald-500/60 bg-black"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white font-mono">{user.full_name || 'User'}</p>
              <p className="text-[10px] text-emerald-400/80 truncate max-w-[140px] font-mono">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-wider font-mono uppercase">Recent Projects</h2>
            <p className="text-xs text-emerald-400/80 mt-1 font-mono">
              Your saved design boards and whiteboards synchronized
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-black/90 border border-emerald-900/80 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex bg-black/90 p-1 border border-emerald-900/80 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  filterType === 'all'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('design')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center space-x-1.5 transition-all ${
                  filterType === 'design'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Design Boards</span>
              </button>
              <button
                onClick={() => setFilterType('whiteboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center space-x-1.5 transition-all ${
                  filterType === 'whiteboard'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Whiteboards</span>
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-emerald-500/20 my-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono uppercase">No projects found</h3>
            <p className="text-xs text-emerald-400/70 mb-6 font-mono">
              {searchQuery
                ? `No projects matching "${searchQuery}"`
                : 'Create your first design board or whiteboard.'}
            </p>
            <button
              onClick={onCreateProjectClick}
              className="px-5 py-2.5 bg-emerald-500 text-black text-xs font-bold font-mono uppercase rounded-xl shadow-lg shadow-emerald-500/25 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group glass-panel rounded-2xl border border-emerald-500/20 hover:border-emerald-400 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer bg-[#050b07]/90"
                onClick={() => onOpenProject(project.id)}
              >
                {/* Real Canvas Preview Snapshot Image (NO TYPE BADGE ON TOP LEFT) */}
                <div className="h-44 bg-black relative overflow-hidden flex items-center justify-center border-b border-emerald-900/40">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-emerald-950/60 via-black to-emerald-950/40 relative">
                      <div className="w-full h-full border border-emerald-500/30 rounded-xl p-3 bg-black/60 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-[10px] text-emerald-400 font-mono">
                          <span>PREVIEW</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="text-center py-2">
                          <p className="text-xs text-gray-300 font-mono font-medium truncate">{project.title}</p>
                          <p className="text-[10px] text-emerald-500 font-mono mt-1">Canvas Data Snapshot</p>
                        </div>
                        <div className="h-1 w-full bg-emerald-900/60 rounded overflow-hidden">
                          <div className="h-full bg-emerald-400 w-3/4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Menu button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === project.id ? null : project.id);
                      }}
                      className="p-1.5 bg-black/80 hover:bg-emerald-950 text-emerald-400 rounded-lg backdrop-blur-md border border-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === project.id && (
                      <div
                        className="absolute right-0 top-9 w-40 glass-modal rounded-xl shadow-xl border border-emerald-500/40 p-1 z-20 font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDuplicateProject(project);
                          }}
                          className="w-full px-3 py-2 text-xs text-gray-300 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteProject(project.id);
                          }}
                          className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between font-mono">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-emerald-500/80 mt-3 pt-3 border-t border-emerald-900/60">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px] uppercase">OPEN →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
