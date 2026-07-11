# Azolik — AI Workforce OS

The operating system for a modern AI-powered company. Six AI departments. Forty-four specialized agents. One cinematic, intelligent workspace.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build (type-checked, 0 errors)
```

**Keyboard** — `⌘K` command palette · `⌘J` AI copilot · `Esc` close · `↑↓↵` in palette

## Stack

React 19 + TypeScript · Vite · Tailwind v4 · Framer Motion · React Router 7 · @xyflow/react · Recharts · Lucide

## Quality system

### Design foundations
- **Typography:** Inter with optical sizing, -0.022em tracking on headings, tabular numerics, text-balance
- **Color:** Hand-tuned `ink-*` neutrals + single-source `brand-*` gradient, six accent tones (violet/cyan/emerald/amber/rose/brand)
- **Glass system:** Three tiers (default/strong/subtle) with matched blur, saturation, border, inset highlight, and multi-layer shadow stacks
- **Depth:** Grounding shadows, edge highlights, ambient radial lighting, dot grid with radial mask
- **Motion:** Apple-ease springs (`[0.22, 1, 0.36, 1]`), tuned stiffness/damping/mass per surface — never generic defaults

### Accessibility & performance
- Respects `prefers-reduced-motion` globally — disables parallax, tilts, particles, bounces, pulses
- Touch devices auto-disable cursor glow, click ripple, and magnetic effects
- All ambient layers use `pointer-events: none` and GPU-only properties (`transform`, `opacity`, `filter`)
- Canvas neural network uses DPR clamping (≤2), rAF-coalesced mouse tracking, passive listeners
- Visible focus rings (2px brand ring with ink-950 gap) on all interactive elements
- Semantic headings, keyboard navigation, `aria-hidden` on decorations

### Intelligence layer (`lib/aiStore.tsx`)
Event-sourced central state drives: thinking states, conversational context, department activation, live activity, ambient event generation (~2s cadence), and keyboard shortcuts.

### OS modules (`components/os/`)
- **CommandPalette** — Raycast-style fuzzy search over navigation, actions, and AI; arrow-key navigation; voice button; AI mode when query ends with `?` or starts with `>`
- **AICopilot** — Persistent side panel with thinking dots, gradient progress bar, step-by-step reasoning chains, auto-resizing textarea, contextual suggestions
- **DepartmentActivation** — Cinematic "waking up" sequence with pulsing rings, animated checklist, progress bar, and "Enter" completion
- **LiveActivityTicker** — Real-time event stream with level-coded icons, department-color dots, time-ago ticks, layout-animated entries
- **Onboarding** — 4-step handcrafted tour, localStorage persistence, per-step spring icons and progress dots
- **BootSplash** — ~1s launch with pulsing rings, moving gradient loader, blur-crossfade to workspace

### Scene FX (`components/effects/`)
- **AuroraBackground** — four radial glows on independent sine paths + vignette + parallaxed dot grid
- **NeuralNetwork** — 28-node canvas graph with distance-based gradient links and subtle mouse attractor
- **Particles** — 28 depth-graded motes with twinkle + drift
- **CursorGlow** — spring-smoothed 440px pointer spotlight
- **ClickRipple** — soft energy pulse from every click (disabled on inputs/coarse pointers)

### Physics primitives (`components/ui/`)
- **GlassCard** — 3.5° pointer-tilt (1400px perspective), cursor-tracked border glow + specular glare (mix-blend-overlay), refined edge/ground highlights, spring lift
- **Button** — 4px magnetic pull, elastic 0.95 press scale, cursor-tracked radial glow, horizontal shine sweep, ambient halo on primary; secondary/ghost/glass variants
- **IconButton** — micro-magnetic, 0.9 bouncy press, optional pulse ring
- **Avatar** — spring-scale hover, status pings with colored glow shadows, ring-2 inset
- **Badge** — 7 tones, optional pulse dot, backdrop-blur, matched heights for alignment
- **PageHeader / FadeIn / Stagger / Float** — orchestration primitives with consistent spring configs

### Workflow builder
Full visual node editor on React Flow, themed dark-glass, with custom AI nodes featuring per-department gradient colors, pulse rings on executing nodes, glowing animated edges, mini-map, controls, and a floating playback bar.

### Pages
- **Dashboard** — hero with KPI tiles, live activity chart, floating department cards with shimmer bars, live activity stream, voice card, notifications, conversations, automations, business health
- **Departments** — grid of all 6 teams with stats and open-dept actions
- **Automation** — stat tiles, visual workflow canvas, automations list, live execution feed
- **Integrations** — searchable connector grid with hover-reveal connect buttons
- **Analytics** — KPI strip, charts, top-agents leaderboard, coverage bars
- **Marketplace** — "coming soon" teaser with glow and email form
- **Settings** — sections sidebar with animated active pill, working Profile + Appearance panels

## Architecture

```
src/
├─ components/
│  ├─ ui/          GlassCard, Button, IconButton, Avatar, Badge, PageHeader, Stagger/FadeIn, Float, Divider
│  ├─ layout/      AppShell, Sidebar, Topbar
│  ├─ effects/     BootSplash, AuroraBackground, NeuralNetwork, Particles, CursorGlow, ClickRipple
│  ├─ os/          CommandPalette, AICopilot, DepartmentActivation, LiveActivityTicker, Onboarding
│  ├─ workflow/    React Flow custom nodes/edges/canvas
│  └─ dashboard/   Hero, chart, department cards, automations, health, notifications, quick actions, conversations, ticker
├─ lib/            cn, motion springs, hooks (useMouseParallax, usePointerTilt), aiStore
├─ pages/          Dashboard, Departments, Automation, Integrations, Analytics, Marketplace, Settings
├─ data/           Mock data & types
├─ App.tsx         Routes + AIProvider + global overlays
└─ index.css       Tailwind theme + glass/depth/ambient utility classes
```
