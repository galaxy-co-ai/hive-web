# Hive Web - Project Instructions

## What Is This?

Web app for browsing and building Hive navigation graphs. Two main features:
1. **Viewer** - Browse hexes, search by intent, view contents, navigate edges
2. **Builder** - Create/edit hexes with 4-step guided wizard

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- shadcn/ui components
- Upstash Redis for storage
- Zod for validation

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── hexes/          # CRUD routes
│   │   ├── query/          # Semantic search
│   │   └── seed/           # Import constitution hexes
│   ├── viewer/             # Browse hexes
│   └── builder/            # Create/edit hexes
├── components/
│   ├── ui/                 # shadcn components
│   ├── viewer/             # HexGrid, HexCard, etc.
│   └── builder/            # Wizard steps
└── lib/
    ├── kv.ts               # Upstash Redis wrapper
    ├── hive-query.ts       # Query logic (ported from hive)
    └── schemas.ts          # Zod schemas
```

## Commands

```bash
pnpm dev       # Start dev server
pnpm build     # Build for production
pnpm lint      # Run ESLint
```

## Environment Variables

Required:
- `UPSTASH_REDIS_REST_URL` - Redis URL from Upstash
- `UPSTASH_REDIS_REST_TOKEN` - Redis token from Upstash

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/hexes` | GET | List all hexes |
| `/api/hexes` | POST | Create hex |
| `/api/hexes/[id]` | GET | Get hex |
| `/api/hexes/[id]` | PUT | Update hex |
| `/api/hexes/[id]` | DELETE | Delete hex |
| `/api/query` | POST | Semantic search |
| `/api/seed` | POST | Import constitution hexes |
| `/api/seed?clear=true` | POST | Clear and reimport |

## First-Time Setup

1. Create Upstash Redis database
2. Copy `.env.example` to `.env.local` and fill in values
3. Run `pnpm dev`
4. Visit `http://localhost:3000/api/seed` to import hexes
5. Browse at `http://localhost:3000/viewer`

## Constitution Integration

The seed data contains all 19 engineering constitution hexes from the hive package. Query with intents like "button styling" or "database schema" to test semantic matching.

## Gotchas

- Vercel KV was deprecated; we use Upstash Redis directly
- API routes fetch their own base URL which differs between local and Vercel
- SearchBar uses debounced updates to avoid spamming queries
