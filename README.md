# 🇳🇱 Dutch Learning App — SRH Haarlem

Interactive Dutch language learning platform for international students at SRH Haarlem university. Targets **A1 NT2** level through games, puzzles, and spaced repetition.

## 🏗️ Architecture

```
dutch-app/
├── backend/          # Rust/Axum API server
│   ├── src/          # Source code (routes, models, middleware)
│   ├── migrations/   # PostgreSQL migrations (SQLx)
│   └── Dockerfile    # Production Docker image
├── frontend/         # React/TypeScript SPA
│   ├── src/          # Components, pages, games, stores
│   ├── public/       # PWA manifest, service worker
│   ├── nginx.conf    # Production nginx config
│   └── Dockerfile    # Production Docker image
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🎮 Features

| Feature | Description |
|---------|-------------|
| **6 Game Types** | Flashcards, matching, fill-in-blank, timed quiz, drag & drop, clock game |
| **3 Lessons** | Basics & Environment, The Person, Time & Elements |
| **Spaced Repetition** | SM-2 algorithm for optimal review scheduling |
| **Leaderboard** | Materialized view with XP ranking |
| **Word of the Day** | Daily vocabulary challenge |
| **PWA Support** | Installable, offline-capable progressive web app |
| **i18n** | English + Farsi/Persian support |
| **Demo Mode** | Full app experience without backend |

## 🚀 Quick Start

### Demo Mode (no backend needed)

```bash
cd dutch-app
npm install
# Start frontend only with mock data
node node_modules/vite/bin/vite.js frontend --host 0.0.0.0 --port 5173
```

Login: any email/password works in demo mode.

### Full Stack (Docker)

```bash
cd dutch-app
docker compose up -d
```

Open http://localhost — frontend (port 80), API (port 3000), PostgreSQL (port 5432).

### Development

```bash
# Terminal 1: Backend (requires PostgreSQL)
cp .env.example .env  # Edit DATABASE_URL, JWT_SECRET
cargo run --manifest-path backend/Cargo.toml

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🔒 Security

- **JWT authentication** (HS256) with configurable expiry
- **bcrypt password hashing** (cost 12)
- **Account lockout** after 5 failed login attempts (15 min)
- **Password complexity** enforcement (uppercase + lowercase + digit)
- **Input validation** via `validator` crate
- **Security headers**: X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy
- **CORS** restricted to configured frontend origin
- **Audit logging** for security events
- **Rate limiting** configuration ready

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State | Zustand (persisted) |
| Routing | React Router v6 |
| DnD | @dnd-kit (drag & drop) |
| Backend | Rust, Axum 0.8, Tokio |
| Database | PostgreSQL 16, SQLx 0.8 |
| Auth | jsonwebtoken, bcrypt |
| Deploy | Docker, Nginx, GitHub Actions CI/CD |

## 🗃️ Database Schema

- **users** — accounts with email/password, lockout fields
- **lessons** — 8 week curriculum (3 published)
- **exercises** — 85+ exercises across 8 types
- **user_progress** — per-lesson completion tracking
- **user_stats** — XP, streaks, badges (JSONB)
- **exercise_attempts** — detailed attempt history
- **spaced_repetition** — SM-2 algorithm state per user/exercise
- **daily_challenges** — word of the day
- **audit_log** — security event tracking
- **login_attempts** — brute force protection
- **leaderboard** — materialized view for fast ranking

## 📊 Scaling Optimizations

- Composite & partial indexes on all hot query paths
- GIN indexes on JSONB columns (badges, options)
- Materialized view for leaderboard (refreshable)
- Configurable connection pooling (min/max/idle/lifetime)
- Partition-ready exercise_attempts table
- Automatic `updated_at` triggers
- Statistics tuning for query planner

## 🏗️ Environment Variables

See [`.env.example`](.env.example) for all configuration options.

## 📄 License

© 2024 Learn & Earn — De Koepel, Haarlem
