# AutoAgency

Autonomous AI social media agency SaaS dashboard.

## Architecture

- **Frontend**: React + Tailwind CSS + ShadCN UI (dark mode, glassmorphic design)
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Anthropic Claude API (user provides `ANTHROPIC_API_KEY`)
- **Routing**: wouter (frontend), Express (backend)

## Key Features

- **Account Fleet**: Manage 100+ social accounts with health tracking
- **Content Engine**: Drop content (URL/text) → Claude generates short-form posts, reply angles, and long-form articles
- **Reply Ops**: Monitor viral threads, Claude drafts intelligent replies
- **AI Analytics**: Track impressions, growth, AI strategy recommendations
- **Post Scheduler**: Queue management with approval workflow
- **AI Agents**: Configurable agent system (Content, Reply, Research, Strategy)

## Data Model (shared/schema.ts)

- `users` - Authentication
- `accounts` - Managed social media accounts
- `contentSources` - Uploaded content for AI processing
- `generatedPosts` - AI-generated posts (short/long form)
- `replyAngles` - Extracted reply talking points
- `replyOpportunities` - Viral threads to reply to
- `agentConfigs` - AI agent configurations

## API Routes (server/routes.ts)

All prefixed with `/api`:
- `/accounts` - CRUD + stats + AI analysis
- `/content-sources` - CRUD + `/generate` for AI content generation
- `/posts` - Generated posts, top posts, scheduled posts
- `/reply-angles` - Reply talking points
- `/reply-opportunities` - Viral thread tracking + AI reply generation
- `/agents` - Agent configuration
- `/dashboard/stats` - Aggregated dashboard statistics
- `/health` - System health check

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `ANTHROPIC_API_KEY` - User's Claude API key (TODO: user needs to add this)

## File Structure

- `client/src/pages/` - Dashboard, Accounts, ContentLibrary, Scheduler, Agents, Analytics, Opportunities, Settings
- `client/src/lib/api.ts` - TanStack Query hooks for all API endpoints
- `server/ai.ts` - Claude API integration (content generation, reply drafting, account analysis)
- `server/storage.ts` - Database storage layer with Drizzle ORM
- `server/routes.ts` - Express API routes
- `shared/schema.ts` - Drizzle database schema