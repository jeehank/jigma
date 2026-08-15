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
  exposure: number; // -100 to 100
  tint: number; // -100 to 100 (green <-> magenta)
  temperature: number; // -100 to 100 (cool <-> warm)
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hueShift: number; // -180 to 180
  blur: number; // 0 to 50
  sepia: number; // 0 to 100
  grayscale: number; // 0 to 100
  invert: number; // 0 to 100
}

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  activeElementId?: string;
}
