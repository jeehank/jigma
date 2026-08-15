import React, { useState } from 'react';
import { Project, UserProfile, ProjectType } from '../../types';
import {
  Plus,
  Search,
  Layout,
  Edit3,
  MoreVertical,
  Trash2,
  Copy,
  Clock,
  Sparkles,
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
    <div className="min-h-screen bg-[#0d0f17] text-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-white/10 glass-panel px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span>CollabCraft</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-semibold">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-gray-400">Design Board & Whiteboard Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onCreateProjectClick}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20 flex items-center space-x-2 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-800">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
              alt={user.full_name || user.email}
              className="w-8 h-8 rounded-full border border-purple-500/40 bg-gray-800"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white">{user.full_name || 'Creator'}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        {/* Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Projects</h2>
            <p className="text-xs text-gray-400 mt-1">
              Your saved design boards and whiteboards automatically synchronized
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900/90 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-gray-900/90 p-1 border border-gray-800 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('design')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  filterType === 'design'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Design Boards</span>
              </button>
              <button
                onClick={() => setFilterType('whiteboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  filterType === 'whiteboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Whiteboards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 my-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No projects found</h3>
            <p className="text-xs text-gray-400 mb-6">
              {searchQuery
                ? `No projects matching "${searchQuery}"`
                : 'Create your first collaborative design board or whiteboard to get started.'}
            </p>
            <button
              onClick={onCreateProjectClick}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/25 inline-flex items-center space-x-2"
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
                className="group glass-panel rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
                onClick={() => onOpenProject(project.id)}
              >
                {/* Card Thumbnail Preview */}
                <div className="h-44 bg-gray-900/90 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                  {project.type === 'design' ? (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-purple-950/40 via-gray-900 to-indigo-950/40 relative">
                      <div className="w-24 h-24 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <Layout className="w-10 h-10 text-purple-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-blue-950/40 via-gray-900 to-teal-950/40 relative">
                      <div className="w-24 h-24 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <Edit3 className="w-10 h-10 text-blue-400" />
                      </div>
                    </div>
                  )}

                  {/* Badge */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border backdrop-blur-md ${
                      project.type === 'design'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {project.type === 'design' ? 'Design Board' : 'Whiteboard'}
                  </span>

                  {/* Action Menu button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === project.id ? null : project.id);
                      }}
                      className="p-1.5 bg-gray-900/80 hover:bg-gray-800 text-gray-300 rounded-lg backdrop-blur-md border border-gray-700/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === project.id && (
                      <div
                        className="absolute right-0 top-9 w-40 glass-modal rounded-xl shadow-xl border border-white/10 p-1 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDuplicateProject(project);
                          }}
                          className="w-full px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 text-purple-400" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteProject(project.id);
                          }}
                          className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-800/60">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    </span>
                    <span className="text-purple-400 font-medium text-[10px]">Open Workspace →</span>
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
