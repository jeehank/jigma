import { supabase } from './supabase';
import type { PresenceUser, CanvasSyncPayload } from '../types';

export const USER_COLORS = [
  '#00ff66',
  '#00d4ff',
  '#ff007f',
  '#ffbb00',
  '#a855f7',
  '#ff4444',
  '#38bdf8',
  '#f43f5e',
  '#4ade80',
  '#f97316',
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

export interface RealtimeSyncHandlers {
  onCanvasSync?: (payload: CanvasSyncPayload) => void;
  onCursorMove?: (user: PresenceUser) => void;
  onPresenceUpdate?: (users: PresenceUser[]) => void;
}

export function subscribeToProjectRoom(
  projectId: string,
  currentUser: { id: string; name: string; avatar_url?: string },
  handlers: RealtimeSyncHandlers
) {
  const channelName = `project_room_${projectId}`;
  const userColor = getUserColor(currentUser.id);

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { ack: false, self: false },
      presence: { key: currentUser.id },
    },
  });

  channel
    .on('broadcast', { event: 'canvas_sync' }, (payload) => {
      if (payload.payload && payload.payload.senderId !== currentUser.id) {
        handlers.onCanvasSync?.(payload.payload);
      }
    })
    .on('broadcast', { event: 'cursor_move' }, (payload) => {
      if (payload.payload && payload.payload.id !== currentUser.id) {
        handlers.onCursorMove?.(payload.payload);
      }
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineUsers: PresenceUser[] = [];

      Object.keys(state).forEach((key) => {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          const p = presences[0];
          onlineUsers.push({
            id: p.id || key,
            name: p.name || 'Collaborator',
            color: p.color || getUserColor(p.id || key),
            avatar_url: p.avatar_url,
            x: p.x || 0,
            y: p.y || 0,
            lastSeen: Date.now(),
          });
        }
      });

      handlers.onPresenceUpdate?.(onlineUsers);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          id: currentUser.id,
          name: currentUser.name,
          color: userColor,
          avatar_url: currentUser.avatar_url,
          x: 0,
          y: 0,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  const broadcastCanvas = (data: any) => {
    channel.send({
      type: 'broadcast',
      event: 'canvas_sync',
      payload: {
        senderId: currentUser.id,
        projectId,
        data,
        timestamp: Date.now(),
      } as CanvasSyncPayload,
    });
  };

  const broadcastCursor = (x: number, y: number) => {
    channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        id: currentUser.id,
        name: currentUser.name,
        color: userColor,
        avatar_url: currentUser.avatar_url,
        x,
        y,
        lastSeen: Date.now(),
      } as PresenceUser,
    });
  };

  const unsubscribe = () => {
    channel.untrack();
    supabase.removeChannel(channel);
  };

  return {
    broadcastCanvas,
    broadcastCursor,
    unsubscribe,
  };
}
