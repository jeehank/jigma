import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';
import type { UserProfile, Project, ProjectType, PresenceUser, CanvasSyncPayload } from './types';
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
import { ShareModal } from './components/editor/ShareModal';
import { PasswordPromptModal } from './components/editor/PasswordPromptModal';
import { subscribeToProjectRoom } from './lib/realtime';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedUser = localStorage.getItem('jigma_user_session');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const local = localStorage.getItem(`figmaclone_projects_${u.id}`);
        if (local) {
          const parsed = JSON.parse(local);
          return Array.isArray(parsed) ? parsed.filter((p: Project) => p.user_id === u.id) : [];
        }
      }
    } catch (e) {}
    return [];
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeDesignTool, setActiveDesignTool] = useState('select');
  const [activeWhiteboardTool, setActiveWhiteboardTool] = useState<
    'select' | 'pan' | 'pen' | 'highlighter' | 'eraser' | 'sticky' | 'rect' | 'circle' | 'text'
  >('pen');
  const [whiteboardColor, setWhiteboardColor] = useState('#00ff66');
  const [whiteboardWidth, setWhiteboardWidth] = useState(6);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [elementsList, setElementsList] = useState<any[]>([]);

  // Collaboration and Security state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [pendingProtectedProject, setPendingProtectedProject] = useState<Project | null>(null);
  const [collaborators, setCollaborators] = useState<PresenceUser[]>([]);
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('jigma_unlocked_projects');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const realtimeRef = useRef<{
    broadcastCanvas: (data: any) => void;
    broadcastCursor: (x: number, y: number) => void;
    unsubscribe: () => void;
  } | null>(null);

  // Authentication initialization
  useEffect(() => {
    const savedSession = localStorage.getItem('jigma_user_session');
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
        setIsAuthOpen(false);
      } catch (e) {}
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const uProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.id}`,
        };
        setUser(uProfile);
        localStorage.setItem('jigma_user_session', JSON.stringify(uProfile));
        setIsAuthOpen(false);
      } else if (!savedSession) {
        setIsAuthOpen(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.id}`,
        };
        setUser(uProfile);
        localStorage.setItem('jigma_user_session', JSON.stringify(uProfile));
        setIsAuthOpen(false);
      } else if (!savedSession) {
        setUser(null);
        setProjects([]);
        localStorage.removeItem('jigma_user_session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isValidUUID = (id?: string) => !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch projects list strictly for current user
  useEffect(() => {
    if (user?.id) {
      const local = localStorage.getItem(`figmaclone_projects_${user.id}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setProjects(Array.isArray(parsed) ? parsed.filter((p: Project) => p.user_id === user.id) : []);
        } catch {
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
      fetchProjects(user.id);
    } else {
      setProjects([]);
    }
  }, [user?.id]);

  const fetchProjects = async (userIdOverride?: string) => {
    const currentUserId = userIdOverride || user?.id;
    if (!currentUserId) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', currentUserId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setProjects(data as Project[]);
        localStorage.setItem(`figmaclone_projects_${currentUserId}`, JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.warn('Supabase fetch error, using fallback store', e);
    }

    const local = localStorage.getItem(`figmaclone_projects_${currentUserId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const userProjects = Array.isArray(parsed) ? parsed.filter((p: Project) => p.user_id === currentUserId) : [];
        setProjects(userProjects);
      } catch {
        setProjects([]);
      }
    } else {
      setProjects([]);
      localStorage.setItem(`figmaclone_projects_${currentUserId}`, JSON.stringify([]));
    }
  };

  // URL Query Parameters parsing for Shared Project Links (?project=<id>)
  useEffect(() => {
    const checkUrlProject = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedId = urlParams.get('project') || urlParams.get('p');
      if (!sharedId) return;

      // Check if project exists in local state first
      let project = projects.find((p) => p.id === sharedId);

      if (!project) {
        // Fetch project from Supabase
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', sharedId)
            .maybeSingle();

          if (!error && data) {
            project = data as Project;
            setProjects((prev) => {
              if (prev.some((p) => p.id === sharedId)) return prev;
              return [project!, ...prev];
            });
          }
        } catch (e) {
          console.warn('Failed to load shared project from Supabase:', e);
        }
      }

      if (project) {
        openProjectWithProtectionCheck(project);
      }
    };

    checkUrlProject();
  }, [projects]);

  const openProjectWithProtectionCheck = (project: Project) => {
    if (
      project.is_password_protected &&
      project.password &&
      project.user_id !== user?.id &&
      !unlockedProjectIds.has(project.id)
    ) {
      setPendingProtectedProject(project);
      setIsPasswordPromptOpen(true);
    } else {
      setActiveProjectId(project.id);
      const url = new URL(window.location.href);
      url.searchParams.set('project', project.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleVerifyPassword = (enteredPassword: string): boolean => {
    if (pendingProtectedProject && pendingProtectedProject.password === enteredPassword) {
      const nextUnlocked = new Set(unlockedProjectIds);
      nextUnlocked.add(pendingProtectedProject.id);
      setUnlockedProjectIds(nextUnlocked);
      sessionStorage.setItem('jigma_unlocked_projects', JSON.stringify(Array.from(nextUnlocked)));

      setActiveProjectId(pendingProtectedProject.id);
      setIsPasswordPromptOpen(false);
      setPendingProtectedProject(null);

      const url = new URL(window.location.href);
      url.searchParams.set('project', pendingProtectedProject.id);
      window.history.replaceState({}, '', url.toString());
      return true;
    }
    return false;
  };

  // Real-time Collaboration Channel Setup
  useEffect(() => {
    if (!activeProjectId) {
      if (realtimeRef.current) {
        realtimeRef.current.unsubscribe();
        realtimeRef.current = null;
      }
      setCollaborators([]);
      return;
    }

    const currentProfile = user || {
      id: 'guest_' + Math.random().toString(36).slice(2, 7),
      email: 'guest@jigma.app',
      full_name: 'Collaborator',
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=guest`,
    };

    const channel = subscribeToProjectRoom(
      activeProjectId,
      {
        id: currentProfile.id,
        name: currentProfile.full_name || 'Guest User',
        avatar_url: currentProfile.avatar_url,
      },
      {
        onCanvasSync: (payload: CanvasSyncPayload) => {
          if (payload.projectId === activeProjectId) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === activeProjectId
                  ? { ...p, data: payload.data, updated_at: new Date().toISOString() }
                  : p
              )
            );
          }
        },
        onCursorMove: (cursorUser: PresenceUser) => {
          setCollaborators((prev) => {
            const exists = prev.find((c) => c.id === cursorUser.id);
            if (exists) {
              return prev.map((c) => (c.id === cursorUser.id ? { ...c, ...cursorUser } : c));
            }
            return [...prev, cursorUser];
          });
        },
        onPresenceUpdate: (onlineUsers: PresenceUser[]) => {
          setCollaborators(onlineUsers);
        },
      }
    );

    realtimeRef.current = channel;

    return () => {
      channel.unsubscribe();
      realtimeRef.current = null;
    };
  }, [activeProjectId, user]);

  const handleBroadcastCursor = useCallback((x: number, y: number) => {
    realtimeRef.current?.broadcastCursor(x, y);
  }, []);

  const [createModalDefaultType, setCreateModalDefaultType] = useState<ProjectType>('design');

  const handleCreateProject = async (title: string, type: ProjectType) => {
    const dbUserId = isValidUUID(user?.id) ? user!.id : null;
    const newProj: Project = {
      id: crypto.randomUUID(),
      user_id: user?.id,
      title,
      type,
      data: {},
      is_password_protected: false,
      is_starred: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('projects').insert({
        id: newProj.id,
        user_id: dbUserId,
        title: newProj.title,
        type: newProj.type,
        data: newProj.data,
        is_password_protected: false,
        is_starred: false,
        created_at: newProj.created_at,
        updated_at: newProj.updated_at,
      });
      if (error) {
        console.error('Supabase project insert error:', error);
      }
    } catch (e) {
      console.error('Failed to insert project into Supabase:', e);
    }

    const updated = [newProj, ...projects];
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }
    setIsCreateModalOpen(false);
    openProjectWithProtectionCheck(newProj);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete project from Supabase:', e);
    }

    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    const dbUserId = isValidUUID(user?.id) ? user!.id : null;
    const duplicated: Project = {
      ...project,
      id: crypto.randomUUID(),
      user_id: user?.id,
      title: `${project.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('projects').insert({
        id: duplicated.id,
        user_id: dbUserId,
        title: duplicated.title,
        type: duplicated.type,
        data: duplicated.data,
        is_password_protected: duplicated.is_password_protected,
        password: duplicated.password,
        is_starred: duplicated.is_starred,
        created_at: duplicated.created_at,
        updated_at: duplicated.updated_at,
      });
    } catch (e) {
      console.error('Failed to duplicate project in Supabase:', e);
    }

    const updated = [duplicated, ...projects];
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleToggleStarProject = async (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const newStarred = !target.is_starred;
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, is_starred: newStarred } : p
    );
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }

    try {
      await supabase
        .from('projects')
        .update({ is_starred: newStarred, updated_at: new Date().toISOString() })
        .eq('id', projectId);
    } catch (e) {
      console.error('Failed to toggle star in Supabase:', e);
    }
  };

  const handleUpdateProjectData = async (data: any, thumbnailUrl?: string) => {
    if (!activeProjectId) return;

    // Broadcast canvas changes to all live peers in real-time
    realtimeRef.current?.broadcastCanvas(data);

    const updated = projects.map((p) =>
      p.id === activeProjectId
        ? {
            ...p,
            data,
            thumbnail_url: thumbnailUrl || p.thumbnail_url,
            updated_at: new Date().toISOString(),
          }
        : p
    );
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }

    try {
      await supabase
        .from('projects')
        .update({
          data,
          thumbnail_url: thumbnailUrl || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeProjectId);
    } catch (e) {
      console.error('Failed to update project data in Supabase:', e);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeProjectId) return;
    const updated = projects.map((p) =>
      p.id === activeProjectId ? { ...p, title: newTitle } : p
    );
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }

    try {
      await supabase
        .from('projects')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', activeProjectId);
    } catch (e) {
      console.error('Failed to update title in Supabase:', e);
    }
  };

  const handleUpdateSecurity = async (isProtected: boolean, password?: string) => {
    if (!activeProjectId) return;
    const updated = projects.map((p) =>
      p.id === activeProjectId
        ? { ...p, is_password_protected: isProtected, password: password || undefined }
        : p
    );
    setProjects(updated);
    if (user) {
      localStorage.setItem(`figmaclone_projects_${user.id}`, JSON.stringify(updated));
    }

    try {
      await supabase
        .from('projects')
        .update({
          is_password_protected: isProtected,
          password: password || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeProjectId);
    } catch (e) {
      console.error('Failed to update security in Supabase:', e);
    }
  };

  const handleBackToDashboard = () => {
    setActiveProjectId(null);
    setSelectedElement(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.searchParams.delete('p');
    window.history.replaceState({}, '', url.pathname);
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
            onOpenProject={(id) => {
              const target = projects.find((p) => p.id === id);
              if (target) openProjectWithProtectionCheck(target);
            }}
            onCreateProjectClick={(type) => {
              setCreateModalDefaultType(type || 'design');
              setIsCreateModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onToggleStar={handleToggleStarProject}
            onSignOut={() => {
              supabase.auth.signOut();
              localStorage.removeItem('jigma_user_session');
              setUser(null);
              setProjects([]);
              setActiveProjectId(null);
              setIsAuthOpen(true);
            }}
          />
        )}

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          defaultType={createModalDefaultType}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />

        {pendingProtectedProject && (
          <PasswordPromptModal
            isOpen={isPasswordPromptOpen}
            projectTitle={pendingProtectedProject.title}
            onVerify={handleVerifyPassword}
            onCancel={() => {
              setIsPasswordPromptOpen(false);
              setPendingProtectedProject(null);
              handleBackToDashboard();
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#030704] text-white overflow-hidden select-none font-sans">
      <EditorHeader
        project={activeProject}
        onUpdateTitle={handleUpdateTitle}
        onBackToDashboard={handleBackToDashboard}
        onOpenShareModal={() => setIsShareModalOpen(true)}
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
        collaborators={collaborators}
      />

      <div className="flex-1 flex relative overflow-hidden">
        {activeProject.type === 'design' && (
          <LeftSidebar
            elements={elementsList}
            selectedId={selectedElement?.id || null}
            onSelectElement={() => {}}
            onDeleteElement={(id) => (window as any).__designCanvasActions?.deleteElementById(id)}
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
                collaborators={collaborators}
                onCursorMove={handleBroadcastCursor}
              />
              <DesignToolbar
                activeTool={activeDesignTool}
                onSelectTool={setActiveDesignTool}
                onAddShape={(type) => (window as any).__designCanvasActions?.addShape(type)}
                onAddText={() => (window as any).__designCanvasActions?.addText()}
                onAddImage={(url) => (window as any).__designCanvasActions?.addImage(url)}
                onConvertToFrame={() => (window as any).__designCanvasActions?.convertToFrame()}
                onToggleMask={() => (window as any).__designCanvasActions?.toggleMask()}
                onDeleteSelected={() => (window as any).__designCanvasActions?.deleteActiveElement()}
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
                collaborators={collaborators}
                onCursorMove={handleBroadcastCursor}
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
            onDeleteSelected={() => (window as any).__designCanvasActions?.deleteActiveElement()}
            onExportPng={() => (window as any).__designCanvasActions?.exportPng()}
            onExportSvg={() => (window as any).__designCanvasActions?.exportSvg()}
            onExportPdf={() => (window as any).__designCanvasActions?.exportPdf()}
          />
        )}
      </div>

      {/* Share and Security Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={activeProject}
        collaborators={collaborators}
        onUpdateSecurity={handleUpdateSecurity}
      />

      {/* Password Prompt when opening password-protected project */}
      {pendingProtectedProject && (
        <PasswordPromptModal
          isOpen={isPasswordPromptOpen}
          projectTitle={pendingProtectedProject.title}
          onVerify={handleVerifyPassword}
          onCancel={() => {
            setIsPasswordPromptOpen(false);
            setPendingProtectedProject(null);
            handleBackToDashboard();
          }}
        />
      )}
    </div>
  );
}
