Jigma — Summary

Jigma is a web-based collaborative design and whiteboard platform, essentially combining features similar to Figma + Miro, with real-time multiplayer collaboration.

Main Features
Two modes:
Design Board — Figma-style vector design and artboards.
Whiteboard — Infinite canvas for drawing, brainstorming, and notes.
Real-time collaboration with:
Live cursors
User avatars/name badges
Synchronized canvas changes
Shareable project links
Project security:
Password-protected projects
Guest collaboration
Supabase authentication
Design Tools
Rectangle, circle, star, arrow, and line tools
Text editor with 28 Google Fonts
Font sizing, weights, alignment, and text styling
Image uploading for PNG, JPEG, WEBP, and SVG
Advanced image editing with exposure, brightness, contrast, saturation, hue, temperature, tint, blur, grayscale, sepia, and invert
Frames for creating artboards and exporting selected areas
Vector clipping masks
Layer management with drag-and-drop, visibility, and locking
Whiteboard
Freehand pen
Highlighter
Sticky notes
Infinite pan and zoom
Export to PNG, SVG, or PDF
Projects & Storage

Projects are stored in Supabase PostgreSQL with local caching.

It includes:

Recents
Drafts
All Projects
Starred Projects
Resources
Trash
Admin section
Project duplication and deletion
Keyboard Shortcuts

V → Select
R → Rectangle
O → Circle
T → Text
F → Frame
[ / ] → Move layer down/up
Delete → Delete object
Space + Drag → Pan
Ctrl + Scroll → Zoom

Technology Stack
Frontend: React 19 + TypeScript + Vite 8
Graphics: Fabric.js v7 + Perfect-Freehand + HTML Canvas
Styling: Tailwind CSS + Lucide
Backend: Supabase PostgreSQL, Auth & Realtime
Exports: html2canvas + jsPDF + SVG serializers
Running It

Requires Node.js 18+ and npm/yarn.

Clone the repository
Run npm install
Add Supabase credentials
Run npm run dev
Open localhost:5173
Run npm run build for production

In short: Jigma is a full-stack, Figma-like collaborative design tool combining vector editing, image editing, infinite whiteboarding, cloud storage, and real-time multiplayer collaboration.
