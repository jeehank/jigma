import React from 'react';
import type { PresenceUser } from '../../types';
import { MousePointer2 } from 'lucide-react';

interface CollaboratorCursorsProps {
  collaborators: PresenceUser[];
  currentUserId?: string;
  zoomLevel?: number;
  panOffset?: { x: number; y: number };
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({
  collaborators,
  currentUserId,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
}) => {
  const otherUsers = collaborators.filter(
    (c) => c.id !== currentUserId && c.x !== undefined && c.y !== undefined
  );

  if (otherUsers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {otherUsers.map((user) => {
        // Compute screen coordinates if in canvas space
        const screenX = user.x * zoomLevel + panOffset.x;
        const screenY = user.y * zoomLevel + panOffset.y;

        return (
          <div
            key={user.id}
            className="absolute transition-all duration-75 ease-out flex items-start space-x-1"
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <MousePointer2
              className="w-5 h-5 drop-shadow-md"
              style={{
                color: user.color || '#00ff66',
                fill: user.color || '#00ff66',
              }}
            />
            <div
              className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-black shadow-lg flex items-center space-x-1 whitespace-nowrap"
              style={{ backgroundColor: user.color || '#00ff66' }}
            >
              <span>{user.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
