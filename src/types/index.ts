export type ProjectType = 'design' | 'whiteboard';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Project {
  id: string;
  user_id?: string;
  title: string;
  type: ProjectType;
  data: any;
  thumbnail_url?: string;
  is_password_protected?: boolean;
  password?: string;
  is_starred?: boolean;
  created_at: string;
  updated_at: string;
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface ColorAdjustments {
  exposure: number;
  tint: number;
  temperature: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hueShift: number;
  blur: number;
  sepia: number;
  grayscale: number;
  invert: number;
}

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  activeElementId?: string;
  avatar_url?: string;
  lastSeen?: number;
}

export interface CanvasSyncPayload {
  senderId: string;
  projectId: string;
  data: any;
  timestamp: number;
}

