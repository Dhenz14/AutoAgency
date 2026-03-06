# AutoAgency — Full Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [AI Integration](#ai-integration)
8. [Frontend Pages](#frontend-pages)
9. [Environment Variables](#environment-variables)
10. [Development](#development)
11. [Deployment](#deployment)

---

## Overview

AutoAgency is a full-stack AI SaaS dashboard for autonomous social media management. It enables users to:

- Manage 100+ social media accounts across platforms (X/Twitter, Instagram, LinkedIn, Medium, Reddit)
- Drop in content (URL or raw text) and have Claude AI generate short-form posts, reply-guy ammo, and long-form articles
- Monitor viral threads for reply opportunities (Reply Ops)
- Review AI-generated content with an approval workflow before distribution
- Configure a multi-agent system (Content Agent, Reply Agent, Research Agent, Strategy Agent)
- Track performance analytics with AI-powered growth recommendations

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Dashboard │ │ Accounts │ │ Content  │ │ Reply    │   │
│  │          │ │ Fleet    │ │ Engine   │ │ Ops      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Scheduler │ │AI Agents │ │Analytics │ │Settings  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  TanStack Query hooks (client/src/lib/api.ts)           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON)
┌──────────────────────┴──────────────────────────────────┐
│                 SERVER (Express + TypeScript)             │
│                                                          │
│  server/routes.ts     ← API endpoints                   │
│  server/storage.ts    ← Database abstraction layer      │
│  server/ai.ts         ← Claude API integration          │
│  server/db.ts         ← PostgreSQL connection (Drizzle) │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    ┌─────┴─────┐           ┌──────┴──────┐
    │ PostgreSQL │           │ Anthropic   │
    │ (Neon)     │           │ Claude API  │
    └───────────┘           └─────────────┘
```

### Design Principles
- **Frontend-heavy**: Most logic lives in the React frontend. The backend handles data persistence and Claude API calls.
- **Thin API routes**: Routes validate input with Zod, delegate to the storage layer, and return JSON.
- **Single source of truth**: `shared/schema.ts` defines all database tables, insert schemas, and TypeScript types used by both client and server.
- **Dark Future aesthetic**: Glassmorphic UI with Inter + Plus Jakarta Sans fonts, `hsl(224, 71%, 4%)` background, `hsl(210, 100%, 50%)` primary blue.

---

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 18, TypeScript, Tailwind CSS, ShadCN UI       |
| Routing     | wouter (client), Express (server)                   |
| State       | TanStack Query (React Query)                        |
| Backend     | Express.js, TypeScript, tsx (dev runner)             |
| Database    | PostgreSQL via @neondatabase/serverless              |
| ORM         | Drizzle ORM with drizzle-zod for validation         |
| AI          | Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`) |
| Charts      | Recharts                                            |
| Build       | Vite (frontend), esbuild (server)                   |
| Icons       | Lucide React                                        |

---

## Project Structure

```
autoagency/
├── client/                          # React frontend
│   ├── index.html                   # HTML entry point with meta tags
│   ├── public/
│   │   ├── favicon.png
│   │   └── opengraph.jpg
│   └── src/
│       ├── App.tsx                  # Root component with route definitions
│       ├── main.tsx                 # React DOM entry point
│       ├── index.css                # Global styles (Tailwind + custom)
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppLayout.tsx    # Sidebar + header shell
│       │   └── ui/                  # ShadCN UI component library (~50 components)
│       ├── hooks/
│       │   ├── use-mobile.tsx       # Viewport detection
│       │   └── use-toast.ts         # Toast notification hook
│       ├── lib/
│       │   ├── api.ts              # TanStack Query hooks for all API endpoints
│       │   ├── queryClient.ts      # Query client configuration
│       │   └── utils.ts            # Tailwind class merge utility
│       └── pages/
│           ├── Dashboard.tsx        # Main overview with stats + top posts
│           ├── Accounts.tsx         # Account fleet table + AI tuning modal
│           ├── ContentLibrary.tsx   # Content upload → Claude generation pipeline
│           ├── Scheduler.tsx        # Post queue with approval workflow
│           ├── Agents.tsx           # AI agent configuration panel
│           ├── Opportunities.tsx    # Reply Ops — viral thread monitoring
│           ├── Analytics.tsx        # Charts + AI strategy recommendations
│           ├── Settings.tsx         # API key status + system prompt config
│           └── not-found.tsx        # 404 page
├── server/                          # Express backend
│   ├── index.ts                     # Server bootstrap
│   ├── routes.ts                    # All API route handlers
│   ├── storage.ts                   # IStorage interface + DatabaseStorage impl
│   ├── ai.ts                       # Claude API functions
│   ├── db.ts                       # PostgreSQL connection via Drizzle
│   ├── static.ts                   # Static file serving (production)
│   └── vite.ts                     # Vite dev server middleware
├── shared/
│   └── schema.ts                   # Drizzle schema + Zod schemas + TypeScript types
├── script/
│   └── build.ts                    # Production build script
├── drizzle.config.ts               # Drizzle Kit configuration
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
└── replit.md                       # Quick project reference
```

---

## Database Schema

All tables are defined in `shared/schema.ts` using Drizzle ORM.

### `accounts`
Social media accounts managed by the system.

| Column       | Type      | Default        | Description                                    |
|-------------|-----------|----------------|------------------------------------------------|
| id          | serial    | auto           | Primary key                                    |
| handle      | text      | required       | Account handle (e.g. `@techguru`)             |
| platform    | text      | `"x"`          | Platform: x, instagram, linkedin, medium, etc  |
| niche       | text      | `"General"`    | Content niche category                         |
| status      | text      | `"Active"`     | Active, Paused, Suspended                      |
| health      | text      | `"Good"`       | Excellent, Good, Viral, Needs Tuning, Critical |
| impressions | integer   | `0`            | 30-day impression count                        |
| growth      | text      | `"+0%"`        | Growth trend string (e.g. `"+12%"`)           |
| connected   | boolean   | `false`        | Whether API connection is live                 |
| created_at  | timestamp | `CURRENT_TIMESTAMP` | Creation date                             |

### `content_sources`
Uploaded content that feeds the AI generation pipeline.

| Column         | Type      | Default        | Description                              |
|---------------|-----------|----------------|------------------------------------------|
| id            | serial    | auto           | Primary key                              |
| title         | text      | required       | Source title                             |
| source_type   | text      | `"url"`        | Type: url, text, pdf                     |
| source_url    | text      | nullable       | URL if type is url                       |
| raw_text      | text      | nullable       | Raw text content                         |
| status        | text      | `"pending"`    | pending, processing, processed           |
| short_form_pct| integer   | `40`           | % allocation for short-form posts        |
| reply_ops_pct | integer   | `40`           | % allocation for reply angles            |
| long_form_pct | integer   | `20`           | % allocation for long-form articles      |
| created_at    | timestamp | `CURRENT_TIMESTAMP` | Creation date                       |

### `generated_posts`
AI-generated content pieces ready for scheduling/approval.

| Column           | Type      | Default        | Description                            |
|-----------------|-----------|----------------|----------------------------------------|
| id              | serial    | auto           | Primary key                            |
| content_source_id| integer  | nullable       | FK → content_sources.id (CASCADE)      |
| account_id      | integer   | nullable       | FK → accounts.id (SET NULL)            |
| platform        | text      | `"x"`          | Target platform                        |
| post_type       | text      | `"short"`      | short or long                          |
| content         | text      | required       | The generated post text                |
| status          | text      | `"draft"`      | draft, scheduled, pending_approval, published |
| scheduled_for   | timestamp | nullable       | When to publish                        |
| impressions     | integer   | `0`            | Post impression count                  |
| created_at      | timestamp | `CURRENT_TIMESTAMP` | Creation date                     |

### `reply_angles`
Extracted talking points and triggers for reply operations.

| Column           | Type      | Default        | Description                           |
|-----------------|-----------|----------------|---------------------------------------|
| id              | serial    | auto           | Primary key                           |
| content_source_id| integer  | nullable       | FK → content_sources.id (CASCADE)     |
| trigger         | text      | required       | Conversation trigger phrase           |
| angle           | text      | required       | The reply angle/talking point         |
| created_at      | timestamp | `CURRENT_TIMESTAMP` | Creation date                    |

### `reply_opportunities`
Viral threads identified for reply-guy engagement.

| Column              | Type      | Default        | Description                        |
|--------------------|-----------|----------------|------------------------------------|
| id                 | serial    | auto           | Primary key                        |
| target_handle      | text      | required       | Author of the target tweet         |
| target_followers   | text      | `"0"`          | Follower count string              |
| tweet_content      | text      | required       | Content of the viral tweet         |
| tweet_views        | text      | `"0"`          | View count string                  |
| niche              | text      | `"General"`    | Niche category                     |
| sentiment          | text      | `"Neutral"`    | Positive, Neutral, Negative        |
| ai_reply           | text      | nullable       | Claude-generated reply             |
| suggested_account_id| integer  | nullable       | FK → accounts.id (SET NULL)        |
| status             | text      | `"pending"`    | pending, fired, rejected           |
| created_at         | timestamp | `CURRENT_TIMESTAMP` | Creation date                 |

### `agent_configs`
Configuration for the AI agent fleet.

| Column        | Type      | Default        | Description                           |
|--------------|-----------|----------------|---------------------------------------|
| id           | serial    | auto           | Primary key                           |
| name         | text      | required       | Agent name                            |
| description  | text      | `""`           | What the agent does                   |
| icon         | text      | `"bot"`        | Icon identifier                       |
| status       | text      | `"Active"`     | Active or Sleeping                    |
| system_prompt| text      | nullable       | Custom system prompt override         |
| config       | jsonb     | nullable       | Arbitrary configuration JSON          |
| created_at   | timestamp | `CURRENT_TIMESTAMP` | Creation date                    |

---

## API Reference

Base URL: `/api`

All endpoints return JSON. Errors return `{ "error": "message" }`.

### Accounts

| Method   | Endpoint                    | Description                          |
|----------|-----------------------------|--------------------------------------|
| `GET`    | `/api/accounts`             | List all accounts (sorted by impressions) |
| `GET`    | `/api/accounts/stats`       | Get account health statistics        |
| `POST`   | `/api/accounts`             | Create a new account                 |
| `PATCH`  | `/api/accounts/:id`         | Update an account                    |
| `DELETE` | `/api/accounts/:id`         | Delete an account                    |
| `POST`   | `/api/accounts/:id/analyze` | Run Claude AI analysis on account    |

**POST /api/accounts** body:
```json
{
  "handle": "@techguru",
  "platform": "x",
  "niche": "AI/ML",
  "status": "Active",
  "health": "Good"
}
```

**POST /api/accounts/:id/analyze** response:
```json
{
  "recommendation": "Increase posting frequency to 3x daily...",
  "suggestedNichePivot": "Stay in current niche",
  "formatAdvice": "Prioritize hot takes over threads"
}
```

### Content Sources & AI Generation

| Method   | Endpoint                              | Description                        |
|----------|---------------------------------------|------------------------------------|
| `GET`    | `/api/content-sources`                | List all content sources           |
| `POST`   | `/api/content-sources`                | Create a content source            |
| `POST`   | `/api/content-sources/:id/generate`   | Generate AI content from source    |

**POST /api/content-sources/:id/generate** response:
```json
{
  "posts": 5,
  "replyAngles": 3,
  "longFormDrafts": 1,
  "generated": {
    "shortFormPosts": [{"text": "...", "suggestedAccount": "@handle"}],
    "replyAngles": [{"trigger": "...", "angle": "..."}],
    "longFormDrafts": [{"title": "...", "content": "...", "platforms": ["Medium"]}]
  }
}
```

### Generated Posts

| Method   | Endpoint                | Description                              |
|----------|-------------------------|------------------------------------------|
| `GET`    | `/api/posts`            | List posts (optional `?contentSourceId=`) |
| `GET`    | `/api/posts/top`        | Top posts by impressions (`?limit=`)     |
| `GET`    | `/api/posts/scheduled`  | Posts in draft/scheduled/pending status   |
| `PATCH`  | `/api/posts/:id`        | Update post status/content               |

### Reply Operations

| Method   | Endpoint                                      | Description                    |
|----------|-----------------------------------------------|--------------------------------|
| `GET`    | `/api/reply-angles`                           | List reply angles              |
| `GET`    | `/api/reply-opportunities`                    | List reply opportunities       |
| `POST`   | `/api/reply-opportunities`                    | Create a reply opportunity     |
| `POST`   | `/api/reply-opportunities/:id/generate-reply` | Generate AI reply for opportunity |
| `PATCH`  | `/api/reply-opportunities/:id`                | Update opportunity status      |

### AI Agents

| Method   | Endpoint            | Description              |
|----------|---------------------|--------------------------|
| `GET`    | `/api/agents`       | List all agent configs   |
| `POST`   | `/api/agents`       | Create an agent config   |
| `PATCH`  | `/api/agents/:id`   | Update agent config      |

### System

| Method   | Endpoint               | Description                          |
|----------|------------------------|--------------------------------------|
| `GET`    | `/api/dashboard/stats` | Aggregated dashboard statistics      |
| `GET`    | `/api/health`          | Health check + AI key status         |

---

## AI Integration

### Configuration
The AI layer uses the Anthropic Claude API directly via the user's own API key.

- **Model**: `claude-sonnet-4-20250514`
- **Key**: Read from `process.env.ANTHROPIC_API_KEY`
- **File**: `server/ai.ts`

### Functions

#### `generateContentFromSource(sourceText, title, shortFormPct, replyOpsPct, longFormPct, accountHandles)`
Takes raw source material and generates:
- Short-form posts (tweets) matched to available accounts
- Reply angles (trigger + talking point pairs)
- Long-form article drafts

Uses a structured JSON prompt. Returns `GeneratedContent` type.

#### `generateReply(tweetContent, tweetAuthor, niche, brandVoice?)`
Generates a single intelligent reply to a viral tweet. Rules enforced:
- No generic agreement
- No hashtags
- No AI-sounding words ("delve", "tapestry", etc.)
- Under 280 characters
- Slightly contrarian, value-adding

#### `analyzeAccountPerformance(handle, niche, impressions, growth)`
Analyzes an account and returns:
- Actionable recommendation (2-3 sentences)
- Suggested niche pivot or confirmation to stay
- Post format advice (threads vs singles, hot takes vs data)

---

## Frontend Pages

### Dashboard (`/`)
- Stat cards: total engagement, AI-generated posts, active agents, thriving accounts
- Top performing posts list
- Agent status panel with live indicators

### Account Fleet (`/accounts`)
- Full table of managed accounts with handle, platform, niche, impressions, growth, health
- "Add Account" modal for creating new accounts
- "AI Tune" button per account — opens Claude analysis modal with recommendations
- Delete accounts inline

### Content Engine (`/content`)
- URL input or raw text "brain dump" input
- Distribution sliders (Short-form / Reply Ops / Long-form percentages)
- Claude processing animation
- Campaign view showing generated short posts, reply angles, and long-form drafts in columns
- Previous sources accessible via buttons

### Post Scheduler (`/scheduler`)
- Queue of all draft/scheduled/pending posts
- Per-post approve button (draft → scheduled)
- "Approve All Drafts" bulk action
- Status badges (draft = amber, scheduled = blue)

### AI Agent Hive (`/agents`)
- Grid of agent cards with status indicators (green glow = Active)
- Toggle Active/Sleeping per agent
- "Load Default Agents" seeds 4 starter agents (Content, Reply, Research, Strategy)
- "New Agent" creation modal

### Reply Ops (`/opportunities`)
- Full card per opportunity: target handle, followers, tweet content, views, niche
- "Generate AI Reply" button per opportunity
- Reply approval flow: review AI reply → Fire Reply or Reject
- "Add Opportunity" modal for manual entry

### AI Analytics (`/analytics`)
- Network impressions area chart (Recharts)
- Top posts by impressions sidebar
- AI strategy recommendation cards (Trend Alert, Format Optimization, Health Alert)

### Settings (`/settings`)
- API key status indicator (configured vs not configured)
- Global system prompt textarea for agent persona
- Safety guardrails checkboxes
- Architecture info (Claude Sonnet 4)

---

## Environment Variables

| Variable           | Required | Description                                      |
|-------------------|----------|--------------------------------------------------|
| `DATABASE_URL`    | Yes      | PostgreSQL connection string (auto-provisioned on Replit) |
| `ANTHROPIC_API_KEY`| Yes     | Your Anthropic Claude API key from [console.anthropic.com](https://console.anthropic.com/settings/keys) |

---

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Commands

```bash
npm run dev          # Start dev server (frontend + backend on port 5000)
npm run build        # Production build (Vite frontend + esbuild backend)
npm run start        # Start production server
npm run db:push      # Push schema changes to database
npm run check        # TypeScript type checking
```

### Adding a New Feature

1. **Schema**: Add table/columns in `shared/schema.ts`, create insert schema + types
2. **Storage**: Add CRUD methods to `IStorage` interface and `DatabaseStorage` class in `server/storage.ts`
3. **Routes**: Add Express routes in `server/routes.ts` with Zod validation
4. **API Hooks**: Add TanStack Query hooks in `client/src/lib/api.ts`
5. **UI**: Create page in `client/src/pages/`, register route in `client/src/App.tsx`
6. **Nav**: Add nav item in `client/src/components/layout/AppLayout.tsx`
7. **Push schema**: Run `npm run db:push`

### Key Patterns

- All PATCH routes validate with `.partial()` Zod schemas
- All route params are validated for `NaN`
- Storage methods return `undefined` for not-found, routes return 404
- Frontend uses `useMutation` with `onSuccess` invalidation for cache sync
- API errors surface as `{ error: "message" }` consistently

---

## Deployment

### On Replit
The app is configured for autoscale deployment:
- **Build**: `npm run build`
- **Run**: `node dist/index.cjs`
- **Port**: 5000

### Manual Deployment
1. Set `DATABASE_URL` and `ANTHROPIC_API_KEY` environment variables
2. Run `npm run build`
3. Run `npm run start`
4. App serves on port 5000
