# ⚡ Jigma — Next-Gen Collaborative Design & Whiteboard Suite

![Jigma Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop)

**Jigma** is a modern, high-performance web-based design and digital whiteboard platform built for real-time collaboration. It combines the power of vector artboard tooling, advanced image color grading, and dynamic layer hierarchies with a freehand digital ideation canvas, cloud persistence, and multi-peer live sync.

---

## 🌟 Table of Contents

- [Core Highlights](#-core-highlights)
- [Real-Time Collaboration & Security](#-real-time-collaboration--security)
- [Account & Authentication System](#-account--authentication-system)
- [Figma Design Canvas Suite](#-figma-design-canvas-suite)
  - [Vector Shapes & Primitives](#vector-shapes--primitives)
  - [Curated Typography Engine (28 Fonts)](#curated-typography-engine-28-fonts)
  - [Image Pipeline & 10-Channel Color Grading](#image-pipeline--10-channel-color-grading)
  - [Frame Artboard Containment & Cropped Export](#frame-artboard-containment--cropped-export)
  - [Vector Clipping Masks](#vector-clipping-masks)
  - [Layer Hierarchy & Drag-and-Drop Control](#layer-hierarchy--drag-and-drop-control)
- [Digital Whiteboard & Ideation Suite](#-digital-whiteboard--ideation-suite)
- [Project Management & Cloud Persistence](#-project-management--cloud-persistence)
- [Keyboard Shortcuts Cheatsheet](#-keyboard-shortcuts-cheatsheet)
- [Technology Stack](#-technology-stack)
- [Getting Started & Local Development](#-getting-started--local-development)

---

## 🚀 Core Highlights

- **Dual Mode Studio:** Seamlessly switch between pixel-perfect **Design Boards** and infinite **Whiteboard** canvases.
- **True Real-Time Multiplayer:** Instant peer canvas synchronization and live cursor tracking with name badges.
- **Password-Protected Projects:** Set project passwords with built-in verification locks for secure file sharing.
- **Cloud Database Persistence:** Backed by **Supabase PostgreSQL** with optimistic local caching.
- **28 Curated Aesthetic Fonts:** Google Fonts typography library for modern UI/UX design.
- **10-Channel Color Grading:** Real-time Exposure, Temperature, Tint, Saturation, Contrast, Hue, Blur, and photo filters.
- **Frame-Bounded Artboard Exports:** Export specifically within defined frame boundaries to PNG (2x Retina), SVG, and PDF.

---

## 👥 Real-Time Collaboration & Security

```
[User A (Client)] <----\
                         \----> [Supabase Realtime Channel] <----> [User B (Client)]
[User C (Client)] <----/
```

### 1. Live Multiplayer Cursors & Awareness
- Displays real-time cursor coordinates and avatar badges for all active participants in a project room.
- Each collaborator is assigned a distinct neon identity color and avatar.
- Tracks active selections and cursor movements with sub-millisecond latency.

### 2. Live Canvas Broadcasting
- Utilizes **Supabase Realtime Broadcast Channels** (`project:<id>`) to synchronize vector modifications, layer reordering, and strokes across all connected clients without page reloads.

### 3. Shareable Project Links
- Generate instant share URLs (`?project=<project_id>`) for any file.
- Anyone with the link can join the project room as an authenticated user or guest collaborator.

### 4. Password Protection & Security Wall
- Toggle **Password Protection** on sensitive projects from the **Share** modal.
- When protected, visiting users must enter the correct password via the **Password Prompt Modal** before access to the canvas is granted.
- Unlocked permissions are remembered for the active browser session.

---

## 🔐 Account & Authentication System

- **Supabase Auth Engine:** Secure email/password login and user registration.
- **Session Persistence:** User profiles, avatar identities, and login tokens are automatically refreshed and maintained in browser local storage.
- **Guest Support:** Allows instant collaboration on shared links even before signing in.
- **User Dropdown & Sign Out:** Dedicated profile switcher with instant workspace cleanup on sign out.

---

## 🎨 Figma Design Canvas Suite

Powered by an optimized **Fabric.js v7** engine, the Design Canvas delivers professional artboard workflows:

### Vector Shapes & Primitives
- **Rectangle (`R`):** Rounded corner radius support, stroke customization, and hex color picker.
- **Circle (`O`):** Perfect ellipses and circle boundaries.
- **Star:** Multi-pointed polygon vector shape.
- **Arrow & Line:** Vector direction indicators and connectors.

### Curated Typography Engine (28 Fonts)
Loaded with 28 aesthetic, high-impact Google Fonts for modern design:
- **Display & Headings:** `Syne`, `Space Grotesk`, `Bricolage Grotesque`, `Cabinet Grotesk`, `Clash Display`, `Unbounded`, `Chakra Petch`, `Orbitron`
- **Serifs & Editorial:** `Instrument Serif`, `Fraunces`, `Cinzel`, `DM Serif Display`, `Playfair Display`, `Bodoni Moda`
- **Clean UI & Body:** `Inter`, `Plus Jakarta Sans`, `Outfit`, `Sora`, `Manrope`, `Urbanist`, `General Sans`, `Poppins`
- **Monospace & Code:** `JetBrains Mono`, `Space Mono`, `Fira Code`, `DM Mono`
- **Handwritten / Accent:** `Caveat`, `Covered By Your Grace`

**Typography Controls:**
- Live font family dropdown with styled font previews.
- Quick size presets (`16px`, `24px`, `32px`, `48px`, `64px`, `96px`) + numeric input (up to 300px).
- Font weight selector (`Light 300`, `Regular 400`, `Semi Bold 600`, `Bold 700`, `Black 900`).
- Text alignment: Left, Center, Right, Justify.
- Styles: Italic, Underline, Strikethrough.

### Image Pipeline & 10-Channel Color Grading
Upload any image file (`PNG`, `JPEG`, `WEBP`, `SVG`). Images are automatically optimized and scaled before placement.

Select any image to access the **10-Channel Color Grading Suite** in the Right Sidebar:

| Channel | Range | Effect Description |
| :--- | :--- | :--- |
| **Exposure** | `-100` to `+100` | Adjusts photographic exposure levels |
| **Brightness** | `-100` to `+100` | Baseline luminance adjustment |
| **Contrast** | `-100` to `+100` | Expands or compresses tonal range |
| **Saturation** | `-100` to `+100` | Color vibrancy control |
| **Hue Shift** | `-180°` to `+180°`| 360° color wheel rotation |
| **Temperature** | `-100` to `+100` | Cool blue (`#00bfff`) to warm orange (`#ff8c00`) tinting |
| **Tint** | `-100` to `+100` | Green (`#00ff66`) to magenta (`#ff007f`) chromatic shift |
| **Blur** | `0` to `100` | Gaussian smoothing filter |
| **Grayscale** | `0` to `100` | Monochrome average filter |
| **Sepia** | `0` to `100` | Vintage warm tone photographic filter |
| **Invert** | `0` to `100` | Inverts color spectrum |

### Frame Artboard Containment & Cropped Export
- Select any group of elements and click **"Convert to Frame" (`F`)**.
- A custom frame container artboard encapsulates the selection.
- **Export Frame Only:** Export only what is inside the frame boundary to **PNG** (at 2x retina multiplier), **SVG**, or **PDF** (rather than exporting the entire canvas).

### Vector Clipping Masks
- Place any vector shape (Rectangle, Circle, Star, or Polygon) beneath an image.
- Select the elements and click **"Mask" (Eye Icon)**.
- The image is cleanly clipped to the exact vector silhouette using `clipPath` absolute coordinates.
- Click **"Unmask"** at any time to restore the original unclipped assets.

### Layer Hierarchy & Drag-and-Drop Control
- **Interactive Left Sidebar:** Lists all elements on the canvas in top-to-bottom visual order.
- **Drag-and-Drop:** Drag layers up or down in the sidebar to reorder their Z-index stack.
- **Visibility & Locking:** Hide or lock individual elements to prevent accidental edits.
- **Layer Shortcuts:**
  - Send to Lowest Layer / Bottom: `[`
  - Bring to Highest Layer / Top: `]`

---

## ✏️ Digital Whiteboard & Ideation Suite

- **Smooth Freehand Pen:** Utilizes `perfect-freehand` for pressure-sensitive, organic stroke rendering.
- **Highlighter Tool:** Semi-transparent highlighter for wireframing and sketching notes.
- **Cyber Sticky Notes:** Interactive sticky notes with customizable neon cyber colors (`#042f1a`, `#064e3b`, `#022c22`, `#065f46`, `#14532d`).
- **Infinite Pan & Zoom:** Pan using Middle Mouse, Spacebar + Drag, or the dedicated Pan tool. Zoom up to 250%.
- **Whiteboard Exports:** Export drawings and brainstorm sessions to high-resolution PNG, SVG, or vector PDF.

---

## 🗄️ Project Management & Cloud Persistence

```
[Jigma Client] <=======> [Local Cache (Instant)] <=======> [Supabase Cloud DB (Postgres)]
```

- **Cloud Database:** Projects are stored in the `public.projects` table on Supabase with JSONB data schemas.
- **Safe Lifecycle Serialization:** Guarded with `isLoadingRef` and `isDisposingRef` flags to prevent race conditions or canvas teardown from overwriting database records on page reload.
- **Starred Projects:** Star files from the `•••` action menu. Starred files are dynamically organized under the **Starred** folder in the left sidebar with 1-click access.
- **Sidebar Directory:**
  - **Recents:** Chronologically ordered list of recently updated files.
  - **Drafts:** Filter personal and unpassworded projects.
  - **All Projects:** Full searchable project catalog.
  - **Resources:** Cheatsheets, typography pairings, and shortcut documentation.
  - **Trash:** Manage deleted files.
  - **Admin:** Workspace team information and account stats.
- **Duplicate & Delete:** 1-click project duplication with automated `(Copy)` renaming and safe deletion.

---

## ⌨️ Keyboard Shortcuts Cheatsheet

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `V` | Select / Move Tool | Design Board |
| `R` | Create Rectangle | Design Board |
| `O` | Create Circle | Design Board |
| `T` | Create Text Layer | Design Board |
| `F` | Convert to Frame Artboard | Design Board |
| `[` | Send Layer to Lowest Bottom | Design Board |
| `]` | Bring Layer to Highest Top | Design Board |
| `Delete` / `Backspace` | Delete Selected Object | Design Board |
| `Space + Drag` | Pan Canvas | Design & Whiteboard |
| `Ctrl + Scroll` | Zoom In / Zoom Out | Design & Whiteboard |

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite 8 |
| **Canvas & Graphics** | Fabric.js v7, Perfect-Freehand, HTML5 Canvas API |
| **Styling & Effects** | Tailwind CSS, Lucide Icons, Custom WebGL Shader Scanner |
| **Backend & Cloud** | Supabase (PostgreSQL, Realtime Broadcast, Auth) |
| **Export Utilities** | `html2canvas`, `jspdf`, Vector SVG Serializers |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js `v18.0.0` or higher
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/jigma.git
cd jigma
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Supabase Environment
Edit `src/lib/supabase.ts` with your Supabase credentials:
```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
