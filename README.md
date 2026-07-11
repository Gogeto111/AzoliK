# Azolik — AI Workforce OS

The operating system for a modern AI-powered company. Six AI departments. Forty-four specialized agents. One cinematic, intelligent workspace.

## Features

### Core MVP (Must Have)
- **AI Departments** — Support, Sales, Marketing, Finance, Operations, HR
- **CEO Dashboard** — Business health, today's results, department status
- **Integrations** — WhatsApp, Gmail, Google Sheets, Google Calendar
- **Knowledge Base** — PDFs, Excel, FAQs, Catalogs, Policies
- **Workflow Automation** — Visual workflow builder for business processes
- **Human Approval** — AI drafts, you approve/edit/auto-send
- **Activity Feed** — GitHub-style timeline of all AI actions
- **Analytics** — Hours saved, revenue assisted, response time
- **Multi-language** — English, Hindi, Hinglish support
- **Authentication** — Business/Employee roles, permissions, 2FA

### Should Have
- CRM pipeline
- Calendar appointments
- Contacts management
- Notification center
- Marketplace for department templates
- Reports (weekly/monthly)
- Customer memory

### Wow Features
- **AI Workforce View** — Departments visibly "thinking → working → done"
- **One-Click Department Install** — Connected → Working in seconds
- **Live Activity Feed** — Real-time timeline like GitHub
- **Ask Azolik** — CEO assistant ("What happened today?")
- **Business Health Score** — 96% with reasons

---

## Tech Stack

- **React 19** + TypeScript
- **Vite** + Rolldown (lightning fast)
- **Tailwind CSS v4** + custom design system
- **Framer Motion** — Apple-quality animations
- **@xyflow/react** — Visual workflow builder
- **Recharts** — Analytics charts
- **Lucide React** — Icons

---

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint & typecheck
npm run lint
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # GlassCard, Button, Avatar, Badge, etc.
│   ├── layout/       # AppShell, Sidebar, Topbar
│   ├── effects/      # AuroraBackground, NeuralNetwork, Particles
│   ├── os/           # CommandPalette, AICopilot, DepartmentActivation
│   ├── workflow/     # React Flow custom nodes/edges
│   └── dashboard/    # Dashboard widgets
├── pages/
│   ├── Dashboard.tsx         # CEO view
│   ├── Departments.tsx       # Department grid
│   ├── DepartmentDetail.tsx  # Department view
│   ├── Inbox.tsx             # Support inbox with AI suggestions
│   ├── Automation.tsx        # Visual workflow builder
│   ├── Integrations.tsx      # Connect tools
│   ├── Knowledge.tsx         # Upload PDFs, Excel, FAQs
│   ├── Analytics.tsx         # Business metrics
│   ├── AIWorkforce.tsx       # Live department view
│   ├── ActivityFeed.tsx      # GitHub-style timeline
│   ├── Marketplace.tsx       # Department templates
│   └── Settings.tsx          # Business/Profile/AI settings
├── lib/
│   ├── aiStore.tsx    # Central state (Zustand)
│   ├── engine.ts      # Workforce simulation engine
│   ├── hooks.ts       # Custom hooks
│   └── utils.ts       # Helpers
├── data/
│   ├── departments.ts # Department configs
│   └── mockData.ts    # Demo data
└── types.ts           # TypeScript definitions
```

---

## Design System

### Colors
- **Ink** — Dark neutrals (ink-950 to ink-100)
- **Brand** — Blue/violet gradient (#5f76ff → #3b4fff)
- **Accents** — Cyan, Emerald, Violet, Amber, Rose

### Glass Cards
Three tiers: `default`, `strong`, `subtle` with matched blur, border, highlight

### Motion
- Apple spring: `[0.22, 1, 0.36, 1]`
- Per-component stiffness/damping/mass
- Respects `prefers-reduced-motion`

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Deploy — zero config

### Docker
```bash
docker build -t azolik .
docker run -p 80:80 azolik
```

### Mobile App
```bash
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios  # or android
```

---

## License

MIT — Build your AI workforce.