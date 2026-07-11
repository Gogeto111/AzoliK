# Azolik — How to use it

Azolik isn't a chatbot. It's your AI workforce. You run it, and six departments (Support, Sales, Marketing, Operations, Finance, HR) start doing real work right in front of you.

## Start the app

```bash
cd /home/user/azolik
npm run dev
```

Then open http://localhost:5173

You'll see:

```
Good morning, Aarish.
Your workforce is on shift.

🟢 Support     · Replying to Ananya R.
🟢 Sales       · Generating ₹549 payment link
🟢 Marketing   · Drafting tomorrow's Instagram post
🟢 Operations  · Reserving 1 Chocolate Cake (500g)
🟢 Finance     · Logging to Finance sheet
🟢 HR          · On standby
```

That's the product. No chat box up front. No "Ask AI…" prompt. Just your employees working.

## The five core things you can do

### 1. Watch a customer be handled end-to-end (do this first)
Wait ~3 seconds after load, or click one of the demo messages in the **Assign work** FAB (bottom-right, purple):

- 🥖 "Do you have chocolate cake?"
- 📅 "Doctor free tomorrow?"
- 💪 "Fees kitni hai?"

Watch the flow go across your screen:

1. A new message appears in **Customer Inbox**
2. **Live Execution** panel shows each step: "Reading request → Checking FAQs → Checking inventory → Handing off to Sales → Generating payment link → Reserving stock → Sending WhatsApp confirmation"
3. The department node pulses on the **Collaboration** map and a glowing dot travels between Support → Sales → Operations → Finance → Support
4. A ✅ result card lands in **For You** ("Order #103 completed…" or "Appointment booked…")

That's the whole product promise in 12 seconds.

### 2. Assign any real task yourself
Click the **"Assign work"** purple button (bottom right) or press **⌘K** → "Assign a customer message", then type anything — for example:

- `"Hi, can I book a table for 4 tonight at 9?"`
- `"Send a follow-up to the Acme lead"`
- `"I need to return my order #NW-4821"`
- `"Do you have a 1-day gym trial available tomorrow 7am?"`

Support picks it up, routes to the right team, and you get notified when it's done.

### 3. Switch which business you run
Top of the dashboard, click **"Change business"** (next to your business name chip), or use ⌘K and search "Switch to…":

- 🥖 Bakery
- 🦷 Dental Clinic
- 💪 Gym & Fitness
- 🍽 Restaurant
- 📦 E-commerce
- 🎨 Creative Agency

Each one loads different **products, prices, opening hours, policies, customer seeds, and default flows** — the exact scenarios you described (cake inquiry, doctor appointment, fees/membership question).

### 4. Browse the App Store for AI Departments
Go to **Marketplace** (sidebar, or ⌘K → "Browse Marketplace"). This is the long-term vision: click **Install pack** on any industry card and your whole workforce reconfigures itself for that business.

### 5. Manage individual departments
Click any department card on the Dashboard, or go to **Departments** in the sidebar and click **Open department**, to see:

- The live "Right now" status strip
- Team members (the named agents: "Inbox Resolver", "Deal Desk", "Stock Keeper"…)
- Connected tools (WhatsApp, Gmail, Razorpay, Shopify, Calendar, etc.)
- Recent tool activity with timings
- Pause / Resume controls

## Keyboard shortcuts

| Key | What it does |
|---|---|
| `⌘K` (Ctrl+K) | Command palette — jump anywhere, assign work, switch industry |
| `⌘J` (Ctrl+J) | Open the Azolik copilot (if you *do* want to chat) |
| Click "Assign work" (bottom-right) | Open the quick task composer |

## The philosophy of what you're looking at

- **"Tasks running"** isn't a spinner. It's ToolCallsFeed showing you exactly which tool is being called right now (e.g. `WhatsApp Business · running · Support · 2.1s`).
- **Handoffs aren't abstract.** You see a glowing particle travel from the Support node to the Sales node on the Collaboration map.
- **Memory is real.** The Business Memory panel starts with your products, policies, VIP customers, brand voice, and grows as departments learn (e.g. after a customer orders, a new memory entry appears).
- **Notifications are only the things that matter.** "Needs your attention" only shows approvals (Q3 budget) and anomalies (GST mismatch). Everything else your departments just handle.
- **The tagline everywhere:** *Most AIs work with you. Azolik works for you.*

## Pages walkthrough

| Page | What it's for |
|---|---|
| **Dashboard** | Mission control — workforce status, inbox, live execution, results |
| **Departments** | All 6 teams with stats, agents, tools, pause/activate |
| **Workflows** | Live React Flow canvas showing a workflow executing node-by-node, plus one-click demo flows |
| **Integrations** | All the tools your teams use, with health/account/permissions/sync status |
| **Analytics** | Real engine metrics — revenue, orders, appointments, top agents, dept breakdown |
| **Marketplace** | Install more departments (industry packs now, custom departments later) |
| **Settings** | Profile, workspace, billing, appearance |

## Try these scenarios to feel the product

1. **Bakery** → click Assign work → type *"do you have chocolate cake right now? can i pick up in 20 min?"* → watch Support check stock, Sales send a ₹549 payment link, Operations reserve it, Support confirm on WhatsApp, and a ✅ pickup notification appear.
2. **Dental** → change business to Dental Clinic (click the chip top-left of hero) → type *"doctor free tomorrow for a checkup?"* → calendar lookup → deposit invoice → reminder queued → appointment booked notification.
3. **Gym** → change to Gym & Fitness → type *"fees kitni hai?"* → pricing sent → trial booked for tomorrow 7am → welcome message queued → new lead notification.

That's it. You're not talking to an assistant — you're watching your employees do their jobs.
