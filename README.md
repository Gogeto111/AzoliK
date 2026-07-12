# Azolik - AI Workforce Platform

A complete business automation platform with 6 AI departments (Support, Sales, Marketing, Finance, Operations, HR) powered by 44 specialized agents.

## Features

- **Google Authentication** - Firebase Auth with Google, Microsoft, Email OTP
- **7-Step Onboarding** - Business info → Discovery → Maps lookup → Confirm → Connect apps → Departments → Knowledge → Training → Launch
- **Mission Control Dashboard** - Real-time department status, KPIs, activity feed
- **Supabase Database** - PostgreSQL with RLS, real-time subscriptions
- **Integrations** - Gmail, Google Sheets, Google Calendar, WhatsApp, Shopify, Razorpay, HubSpot
- **Analytics** - Revenue assisted, customers helped, hours saved, departments active
- **AI Engine** - Message → Knowledge → Reply → CRM → Book → Invoice workflow

## Quick Start

### 1. Clone and Install
```bash
cd azolik
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- **Firebase** - Get from Firebase Console
- **Supabase** - Get from Supabase Dashboard
- **Google Maps API** - For business discovery
- **Google OAuth** - For Gmail/Sheets/Calendar integrations

### 3. Set Up Supabase Database
1. Create a new Supabase project
2. Run the SQL from `supabase/schema.sql` in the SQL Editor
3. Enable Row Level Security (already in schema)

### 4. Set Up Firebase
1. Create a Firebase project
2. Enable Authentication (Google, Microsoft, Email/Password)
3. Add authorized domains
4. Copy config to `.env`

### 5. Run Development Server
```bash
npm run dev
```

## Project Structure

```
azolik/
├── src/
│   ├── components/
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── onboarding/     # 7-step onboarding screens
│   │   ├── ui/             # Reusable UI components
│   │   └── layout/         # App shell, navigation
│   ├── contexts/
│   │   └── AuthContext.tsx # Firebase + Supabase auth
│   ├── lib/
│   │   ├── firebase.ts     # Firebase config
│   │   ├── supabase.ts     # Supabase client & types
│   │   ├── engine.ts       # AI engine state
│   │   └── utils.ts        # Helpers
│   ├── pages/
│   │   ├── AuthPage.tsx    # Multi-step auth
│   │   ├── OnboardingPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Analytics.tsx
│   │   └── ...
│   ├── services/
│   │   ├── google.ts       # Gmail/Sheets/Calendar APIs
│   │   ├── whatsapp.ts     # WhatsApp Business API
│   │   └── razorpay.ts     # Payment integration
│   └── App.tsx             # Routes
├── supabase/
│   ├── schema.sql          # Database schema
│   └── functions/          # Edge functions
└── .env.example
```

## Onboarding Flow

1. **Welcome** - Introduction to Azolik
2. **Sign In** - Google / Email OTP / Microsoft
3. **Business Info** - Name, type, team size, channels
4. **Discovery** - Google Maps lookup by phone
5. **Confirm** - Review and verify business details
6. **Connect Apps** - Gmail, Sheets, Calendar, WhatsApp, etc.
7. **Departments** - Choose Support, Sales, Finance, etc.
8. **Knowledge** - Products, services, FAQs, inventory, payments
9. **Training** - AI trains on your data (~2 min)
10. **Launch** - Mission Control dashboard

## Dashboard

- **KPIs**: Revenue assisted, customers helped, appointments, orders, hours saved
- **Departments**: Support (Working...), Sales (Following up...), Finance (Reconciling...)
- **Live Activity**: Real-time task feed
- **Attention Items**: Approvals, messages needing review
- **Quick Actions**: Reply inbox, approve, create order, book appointment

## Integrations

| Service | Type | Features |
|---------|------|----------|
| Gmail | OAuth | Send/receive, invoices, threading |
| Google Sheets | OAuth | Read/write, inventory sync |
| Google Calendar | OAuth | Book appointments, reminders |
| WhatsApp | Cloud API | Customer messaging, templates |
| Shopify | OAuth | Orders, products, customers |
| Razorpay | API Keys | UPI, cards, netbanking |
| HubSpot | OAuth | CRM sync, deals, contacts |

## AI Engine Workflow

```
Incoming Message
       ↓
Read Knowledge Base (vector search)
       ↓
Generate AI Reply (GPT-4o)
       ↓
Send Reply (WhatsApp/Email)
       ↓
Update CRM / Conversation
       ↓
Detect Actions:
  ├─ Book Appointment → Calendar API
  ├─ Create Invoice → Invoice table
  ├─ Update Lead → CRM
  └─ Create Task → Task queue
       ↓
Complete
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```
Add environment variables in Vercel dashboard.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **Auth**: Firebase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **State**: React Context + Supabase Realtime
- **APIs**: Google APIs, WhatsApp Cloud API, Razorpay

## License

MIT