# TNDiary – Smart Finance Tracker 💸

A mobile-first personal finance tracker for TND (Tunisian dinar) expenses.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React + TypeScript + TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (via Docker Compose) |
| Auth | Session cookies (dev-login now; Google OAuth scaffold ready) |
| Charts | Recharts |

## Ports

| Service | URL |
|---|---|
| Web (frontend) | http://localhost:5173 |
| API (backend) | http://localhost:4000 |
| Adminer (DB UI) | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

## Quick Start

### 1. Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker + Docker Compose](https://docs.docker.com/compose/)

### 2. Clone & install

```bash
git clone https://github.com/RouaSmida/TNDiary.git
cd TNDiary
npm install
```

### 3. Environment

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and set a strong `SESSION_SECRET`.

### 4. Start Postgres

```bash
docker compose up -d
```

### 5. Run migrations

```bash
npm run migrate
```

### 6. Start both apps

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Free Deployment (No Render, No Card) via Cloudflare Tunnel

This option is free and secure for personal use.

### Security notes

- Public traffic uses HTTPS to Cloudflare.
- Your app still runs only on your machine (`localhost`).
- Sessions use secure, httpOnly cookies in production mode.
- You should set a strong `SESSION_SECRET` in `apps/api/.env`.

### 1. Prepare environment

Set in `apps/api/.env`:

```
NODE_ENV=production
SESSION_SECRET=replace_with_a_long_random_secret
```

### 2. Start database

```bash
docker compose up -d
```

### 3. Build + migrate + run API (serves frontend too)

```bash
npm run build
npm run migrate
npm run start
```

### 4. Install Cloudflare Tunnel client

```bash
winget install Cloudflare.cloudflared
```

### 5. Expose your app

```bash
cloudflared tunnel --url http://localhost:4000
```

Cloudflared will print a public `https://...trycloudflare.com` URL.

### Important limitations

- This is live only while your computer is on and the commands are running.
- For always-on hosting without your PC, you need a cloud VM/service.

---

## Folder Structure

```
TNDiary/
├── docker-compose.yml
├── package.json               # root (workspaces + concurrently)
├── apps/
│   ├── api/                   # Express backend
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── db.ts
│   │   │   ├── categories.ts
│   │   │   ├── types.ts
│   │   │   ├── middleware/
│   │   │   │   └── requireAuth.ts
│   │   │   └── routes/
│   │   │       ├── auth.ts
│   │   │       ├── expenses.ts
│   │   │       └── summary.ts
│   │   └── migrations/
│   │       ├── runner.ts
│   │       ├── 001_create_users.sql
│   │       └── 002_create_expenses.sql
│   └── web/                   # React frontend
│       └── src/
│           ├── App.tsx
│           ├── api.ts
│           ├── categories.ts
│           ├── components/
│           │   ├── AuthProvider.tsx
│           │   ├── BottomNav.tsx
│           │   ├── Layout.tsx
│           │   └── LoginScreen.tsx
│           └── pages/
│               ├── Dashboard.tsx
│               ├── AddExpense.tsx
│               ├── ExpensesList.tsx
│               └── Analytics.tsx
```

## API Reference

### Auth

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/auth/dev-login` | `{ email, displayName? }` | Create/find user, set session |
| `POST` | `/auth/logout` | — | Destroy session |
| `GET` | `/auth/me` | — | Return current user |
| `GET` | `/auth/google` | — | **Placeholder** – returns 501 until configured |
| `GET` | `/auth/google/callback` | — | **Placeholder** – returns 501 until configured |

### Expenses

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/expenses` | Create expense |
| `GET` | `/api/expenses?from=&to=&category=&subcategory=` | List with filters |
| `DELETE` | `/api/expenses/:id` | Delete expense |

### Summary

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/summary/month?year=YYYY&month=MM` | Monthly total + category breakdown |

## Categories

| Category | Subcategories |
|---|---|
| groceries | food_supplies, snacks, hygiene, cleaning |
| bills | electricity, water, internet, subscriptions |
| transport | public_transport, taxi |
| health | pharmacy, doctor |
| eating_out | restaurant, coffeeshop, fast_food, desserts |
| shopping | clothes, shoes, accessories, makeup |
| entertainment | cinema, events, fun_activities |
| savings | emergency_fund, short_term_goal, long_term_goal |
| family_friends | parents, siblings, partner, friends |
| other | other |

## Adding Google OAuth (TODO)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **OAuth 2.0** and create credentials
3. Set in `apps/api/.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
   ```
4. Install passport:
   ```bash
   npm install passport passport-google-oauth20 --workspace=apps/api
   npm install @types/passport @types/passport-google-oauth20 --workspace=apps/api -D
   ```
5. Wire `passport.authenticate('google', ...)` in `apps/api/src/routes/auth.ts`
   (look for the `TODO` comments)
6. Replace the `LoginScreen` dev form with a "Continue with Google" button

## License

MIT