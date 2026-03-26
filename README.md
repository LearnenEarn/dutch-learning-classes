# 🇳🇱 Learn Dutch — SRH Haarlem

> A full-stack Dutch language learning app for international students at SRH Haarlem.  
> Built with **React + TypeScript** (frontend) and **Rust + Axum + PostgreSQL** (backend).

---

## Features

- 8-week structured A1 NT2 Dutch curriculum
- Interactive mini-games: flashcards, drag-and-drop, fill-in-the-blank, timed quizzes, matching, clock game
- English + Farsi (Persian) translation toggle
- User accounts with progress tracking, XP, streaks, and badges
- Lessons 1–3 fully interactive (Weeks 4–8 coming soon)

---

## Project Structure

```
dutch-app/
├── frontend/         React + TypeScript + Vite + Tailwind CSS
├── backend/          Rust + Axum + SQLx + PostgreSQL
│   └── migrations/   SQL migration files
├── .env.example      Environment variable template
└── README.md
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Rust | ≥ 1.78 (stable) |
| PostgreSQL | ≥ 15 |
| sqlx-cli | latest |

Install `sqlx-cli`:
```bash
cargo install sqlx-cli --no-default-features --features rustls,postgres
```

---

## Setup

### 1. Clone and configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
```

### 2. Create the PostgreSQL database

```bash
createdb dutch_app
```

### 3. Run migrations

```bash
cd backend
sqlx migrate run
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## Development

### Run both frontend and backend together

```bash
# From dutch-app/ root
npm install          # installs concurrently
npm run dev          # starts Vite (port 5173) + Axum (port 3000)
```

### Or run separately

```bash
# Terminal 1: Backend
cd backend && cargo run

# Terminal 2: Frontend
cd frontend && npm run dev
```

The frontend dev server proxies `/api/*` requests to `http://localhost:3000`.

---

## API Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | No | Health check |
| `/api/auth/register` | POST | No | Create account |
| `/api/auth/login` | POST | No | Login, returns JWT |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/language` | PUT | Yes | Update language preference |
| `/api/lessons` | GET | No | List all lessons |
| `/api/lessons/:id` | GET | No | Get lesson + exercises |
| `/api/progress` | GET | Yes | Get all user progress |
| `/api/progress/:id` | POST | Yes | Update lesson progress |
| `/api/stats` | GET | Yes | Get XP, streak, badges |
| `/api/exercises/:id/attempt` | POST | Yes | Submit exercise attempt |

---

## Lesson Content

| Week | Theme | Status |
|---|---|---|
| 1 | De Basis & De Omgeving | ✅ Published |
| 2 | De Mens Centraal | ✅ Published |
| 3 | Tijd & Elementen | ✅ Published |
| 4 | Eten & Winkelen | 🔒 Coming soon |
| 5 | Werk & School | 🔒 Coming soon |
| 6 | Reizen & Vervoer | 🔒 Coming soon |
| 7 | Sociale Situaties | 🔒 Coming soon |
| 8 | Eindtoets & NT2 | 🔒 Coming soon |

---

## Built by

**Learn & Earn · De Koepel Haarlem**  
*Donny Ruinard, 2025–2026*
