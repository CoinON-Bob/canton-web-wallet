# Canton Wallet API - Local Setup

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- (Optional) Redis, for future cache/sessions

## 1. Install dependencies

From project root, backend lives in `api/`:

```bash
cd api
npm install
```

## 2. Environment variables

Copy the example env and set required values:

```bash
cp .env.example .env
```

Edit `.env`:

- **DATABASE_URL** (required): e.g. `postgresql://user:password@localhost:5432/canton_wallet`
- **JWT_SECRET** (required): at least 16 characters
- **REDIS_*** (optional): only if you enable Redis later

## 3. Database

Create the DB (if not exists), then run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Optional: open Prisma Studio to inspect data:

```bash
npx prisma studio
```

## 4. Run the API

Development (watch mode):

```bash
npm run start:dev
```

One-off run:

```bash
npm run start
```

Production build:

```bash
npm run build
npm run start:prod
```

Default port: **3000** (override with `PORT` in `.env`).

## 5. Verify

- Health: [http://localhost:3000/health](http://localhost:3000/health)
- DB health: [http://localhost:3000/health/db](http://localhost:3000/health/db)
- Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Scripts (from `api/`)

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start with watch |
| `npm run build` | Build for production |
| `npm run start:prod` | Run built app |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio |

## Troubleshooting

- **Env validation error on start**: Ensure `DATABASE_URL` and `JWT_SECRET` are set in `.env` and valid (JWT_SECRET ≥ 16 chars).
- **Prisma migrate fails**: Check PostgreSQL is running and `DATABASE_URL` is correct.
- **Port in use**: Set `PORT` in `.env` to another port (e.g. 3001).
