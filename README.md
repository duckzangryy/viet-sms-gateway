# Vietnamese SMS / OTP API

Monorepo SMS gateway aimed at **Vietnamese carriers**, with a Node API and a Next.js operator dashboard.

## Architecture

```
Vietnamese-SMS-OTP/
├── apps/
│   ├── api/          # Express SMS API (JWT + API keys)
│   └── web/          # Next.js dashboard
├── packages/
│   └── shared/       # Shared types / utils
├── docker/           # Container assets
├── docs/             # API reference
└── docker-compose.yml
```

npm **workspaces** orchestrate `apps/*` and `packages/*`.

## Features

### API (`apps/api`)

- OTP / transactional SMS flows tuned for VN networks
- Multi-provider routing with failover hooks
- Bulk send, delivery webhooks, rate limits
- API key + JWT auth
- Payment hooks (Stripe / MoMo style integrations in services layer)

### Dashboard (`apps/web`)

- Client & API key management
- Usage / delivery analytics
- Deposit & transaction views
- TypeScript + Tailwind UI

## Tech stack

| Layer | Tech |
|-------|------|
| API | Node 18+ · Express · MongoDB · Redis · Winston |
| Web | Next.js (App Router) · React · Tailwind · Framer Motion |
| Ops | Docker Compose · PM2-ready · GitHub Actions friendly |

## Prerequisites

- Node.js **≥ 18**
- MongoDB **≥ 6**
- Redis **≥ 7**
- Docker (optional)

## Quick start

```bash
git clone https://github.com/duckzangryy/Vietnamese-SMS-OTP.git
cd Vietnamese-SMS-OTP
npm install
```

Create env files for each app (see `apps/api` / `apps/web` for expected keys — typically `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, provider credentials, `NEXT_PUBLIC_API_URL`).

```bash
# API + web together
npm run dev

# or separately
npm run dev:api
npm run dev:web
```

### Docker

```bash
npm run docker:build
npm run docker:up
# npm run docker:down
```

## Scripts (root)

| Script | Description |
|--------|-------------|
| `npm run dev` | API + web concurrent |
| `npm run build` | Build all workspaces |
| `npm run test` | Workspace tests |
| `npm run lint` | Lint all packages |
| `npm run start` | Production start (both) |

## API docs

See [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) for endpoints, auth headers, and payload shapes.

Typical patterns:

- `Authorization: Bearer <jwt>` or `X-API-Key: <key>`
- POST send OTP / SMS
- Webhook callbacks for DLR

## Security

- Never commit real provider keys or Mongo URIs
- Rotate API keys from the dashboard
- Rate-limit per client in production
- Use HTTPS termination in front of the API

## Status

Active scaffold / product repo. Wire real VN provider credentials and harden webhooks before production traffic.

## Author

Viet Anh · [duckzangryy](https://github.com/duckzangryy)

## License

MIT
