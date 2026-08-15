import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { UserProfile, Project, ProjectType } from './types';
import { AuthModal } from './components/auth/AuthModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { CreateProjectModal } from './components/dashboard/CreateProjectModal';
import { EditorHeader } from './components/editor/EditorHeader';
import { LeftSidebar } from './components/editor/LeftSidebar';
import { RightSidebar } from './components/editor/RightSidebar';
import { DesignToolbar } from './components/editor/DesignToolbar';
import { DesignCanvas } from './components/editor/DesignCanvas';
import { WhiteboardToolbar } from './components/editor/WhiteboardToolbar';
import { WhiteboardCanvas } from './components/editor/WhiteboardCanvas';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeDesignTool, setActiveDesignTool] = useState('select');
  const [activeWhiteboardTool, setActiveWhiteboardTool] = useState<
    'select' | 'pen' | 'highlighter' | 'eraser' | 'sticky' | 'rect' | 'circle' | 'text'
  >('pen');
  const [whiteboardColor, setWhiteboardColor] = useState('#38bdf8');
  const [whiteboardWidth, setWhiteboardWidth] = useState(6);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [elementsList, setElementsList] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.id}`,
        });
      } else {
        setIsAuthOpen(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.id}`,
        });
        setIsAuthOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setProjects(data as Project[]);
        return;
      }
    } catch (e) {
      console.warn('Supabase offline or fetching failed, using fallback store');
    }

    const local = localStorage.getItem('figmaclone_projects');
    if (local) {
      setProjects(JSON.parse(local));
    } else {
      const starterProjects: Project[] = [
        {
          id: 'proj_starter_design',
          title: 'Mobile App Interface Design',
          type: 'design',
          data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'proj_starter_wb',
          title: 'Team Architecture Brainstorming',
          type: 'whiteboard',
          data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setProjects(starterProjects);
      localStorage.setItem('figmaclone_projects', JSON.stringify(starterProjects));
    }
  };

  const handleCreateProject = async (title: string, type: ProjectType) => {
    const newProj: Project = {
      id: 'proj_' + Math.random().toString(36).slice(2, 9),
      user_id: user?.id,
      title,
      type,
      data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('projects').insert({
        id: newProj.id,
        user_id: user?.id,
        title: newProj.title,
        type: newProj.type,
        data: newProj.data,
      });
    } catch (e) {}

    const updated = [newProj, ...projects];
    setProjects(updated);
    localStorage.setItem('figmaclone_projects', JSON.stringify(updated));
    setIsCreateModalOpen(false);
    setActiveProjectId(newProj.id);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {}

    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem('figmaclone_projects', JSON.stringify(updated));
  };

  const handleDuplicateProject = async (project: Project) => {
    const duplicated: Project = {
      ...project,
      id: 'proj_' + Math.random().toString(36).slice(2, 9),
      title: `${project.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('projects').insert({
        id: duplicated.id,
        user_id: user?.id,
        title: duplicated.title,
        type: duplicated.type,
        data: duplicated.data,
      });
    } catch (e) {}

    const updated = [duplicated, ...projects];
    setProjects(updated);
    localStorage.setItem('figmaclone_projects', JSON.stringify(updated));
  };

  const handleUpdateProjectData = async (data: any) => {
    if (!activeProjectId) return;
    const updated = projects.map((p) =>
      p.id === activeProjectId
        ? { ...p, data, updated_at: new Date().toISOString() }
        : p
    );
    setProjects(updated);
    localStorage.setItem('figmaclone_projects', JSON.stringify(updated));

    try {
      await supabase
        .from('projects')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('id', activeProjectId);
    } catch (e) {}
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeProjectId) return;
    const updated = projects.map((p) =>
      p.id === activeProjectId ? { ...p, title: newTitle } : p
    );
    setProjects(updated);
    localStorage.setItem('figmaclone_projects', JSON.stringify(updated));

    try {
      await supabase
        .from('projects')
        .update({ title: newTitle })
        .eq('id', activeProjectId);
    } catch (e) {}
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  if (!user && isAuthOpen) {
    return <AuthModal isOpen={true} onSuccess={(u) => { setUser(u); setIsAuthOpen(false); }} />;
  }

  if (!activeProject) {
    return (
      <>
        {user && (
          <Dashboard
            user={user}
            projects={projects}
            onOpenProject={(id) => setActiveProjectId(id)}
            onCreateProjectClick={() => setIsCreateModalOpen(true)}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onSignOut={() => {
              supabase.auth.signOut();
              setUser(null);
              setIsAuthOpen(true);
            }}
          />
        )}

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />
      </>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d0f17] text-white overflow-hidden select-none">
      <EditorHeader
        project={activeProject}
        onUpdateTitle={handleUpdateTitle}
        onBackToDashboard={() => setActiveProjectId(null)}
        onExportPng={() => {
          if (activeProject.type === 'design') {
            (window as any).__designCanvasActions?.exportPng();
          } else {
            (window as any).__whiteboardCanvasActions?.exportPng();
          }
        }}
        onExportSvg={() => {
          if (activeProject.type === 'design') {
            (window as any).__designCanvasActions?.exportSvg();
          } else {
            (window as any).__whiteboardCanvasActions?.exportSvg();
          }
        }}
        onExportPdf={() => {
          if (activeProject.type === 'design') {
            (window as any).__designCanvasActions?.exportPdf();
          } else {
            (window as any).__whiteboardCanvasActions?.exportPdf();
          }
        }}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(2.5, z + 0.1))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))}
        onResetZoom={() => setZoomLevel(1)}
        collaborators={
          user
            ? [
                {
                  id: user.id,
                  name: user.full_name || 'You',
                  color: '#8b5cf6',
                  x: 0,
                  y: 0,
                },
              ]
            : []
        }
      />

      <div className="flex-1 flex relative overflow-hidden">
        {activeProject.type === 'design' && (
          <LeftSidebar
            elements={elementsList}
            selectedId={selectedElement?.id || null}
            onSelectElement={() => {}}
            onDeleteElement={() => {}}
            onToggleVisibility={() => {}}
            onToggleLock={() => {}}
          />
        )}

        <div className="flex-1 relative h-full">
          {activeProject.type === 'design' ? (
            <>
              <DesignCanvas
                initialData={activeProject.data}
                onChangeData={handleUpdateProjectData}
                selectedElementId={selectedElement?.id || null}
                onSelectElement={setSelectedElement}
                onUpdateElementsList={setElementsList}
                zoomLevel={zoomLevel}
              />
              <DesignToolbar
                activeTool={activeDesignTool}
                onSelectTool={setActiveDesignTool}
                onAddShape={(type) => (window as any).__designCanvasActions?.addShape(type)}
                onAddText={() => (window as any).__designCanvasActions?.addText()}
                onAddImage={(url) => (window as any).__designCanvasActions?.addImage(url)}
                onConvertToFrame={() => (window as any).__designCanvasActions?.convertToFrame()}
                onToggleMask={() => (window as any).__designCanvasActions?.toggleMask()}
              />
            </>
          ) : (
            <>
              <WhiteboardCanvas
                initialData={activeProject.data}
                onChangeData={handleUpdateProjectData}
                activeTool={activeWhiteboardTool}
                strokeColor={whiteboardColor}
                strokeWidth={whiteboardWidth}
                zoomLevel={zoomLevel}
              />
              <WhiteboardToolbar
                activeTool={activeWhiteboardTool}
                onSelectTool={setActiveWhiteboardTool}
                strokeColor={whiteboardColor}
                onChangeColor={setWhiteboardColor}
                strokeWidth={whiteboardWidth}
                onChangeWidth={setWhiteboardWidth}
              />
            </>
          )}
        </div>

        {activeProject.type === 'design' && (
          <RightSidebar
            selectedElement={selectedElement}
            onUpdateElement={(updates) => (window as any).__designCanvasActions?.updateActiveElement(updates)}
            onConvertToFrame={() => (window as any).__designCanvasActions?.convertToFrame()}
            onToggleMask={() => (window as any).__designCanvasActions?.toggleMask()}
            onExportPng={() => (window as any).__designCanvasActions?.exportPng()}
            onExportSvg={() => (window as any).__designCanvasActions?.exportSvg()}
            onExportPdf={() => (window as any).__designCanvasActions?.exportPdf()}
          />
        )}
      </div>
    </div>
  );
}
