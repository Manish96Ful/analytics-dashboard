# Interactive Product Analytics Dashboard

A full-stack analytics dashboard that **visualizes its own usage** — every filter change and chart click is tracked and fed back into the visualization.

---

## 🗂 Project Structure

```
analytics-dashboard/
├── backend/          # Node.js + Express + SQLite API
│   ├── src/
│   │   ├── index.js           # Express server entry
│   │   ├── db.js              # SQLite init & schema
│   │   ├── seed.js            # Data seeding script
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT middleware
│   │   └── routes/
│   │       ├── auth.js        # POST /register, POST /login
│   │       └── analytics.js   # POST /track, GET /analytics
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/client.js          # Axios client with JWT interceptors
    │   ├── context/AuthContext.jsx
    │   ├── hooks/useFilters.js    # Cookie-persisted filter state
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FiltersPanel.jsx
    │   │   ├── BarChartComponent.jsx
    │   │   ├── LineChartComponent.jsx
    │   │   └── StatsCards.jsx
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       └── DashboardPage.jsx
    └── package.json
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # Edit JWT_SECRET if desired
npm run seed                  # Seed 200+ dummy records
npm run dev                   # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # No changes needed for local dev
npm run dev                   # Starts on http://localhost:3000
```

The Vite dev server proxies `/api/*` → `http://localhost:5000`, so no CORS issues locally.

### 3. Demo Login Credentials
| Username | Password  |
|----------|-----------|
| demo     | demo123   |
| alice    | alice123  |
| bob      | bob123    |

---

## 🌱 Seed Instructions

```bash
cd backend
npm run seed
```

This will:
- Clear existing data
- Create 8 named demo users + 10 random users
- Insert 200 randomized `feature_click` events spread across the last 3 months
- Print all demo credentials to the console

---

## 🔌 API Endpoints

| Method | Endpoint    | Auth | Description                        |
|--------|-------------|------|------------------------------------|
| POST   | /register   | No   | Create account (username, password, age, gender) |
| POST   | /login      | No   | Authenticate, returns JWT           |
| POST   | /track      | JWT  | Record a feature interaction        |
| GET    | /analytics  | JWT  | Aggregated bar + line chart data    |

### GET /analytics query params
| Param       | Example       | Description              |
|-------------|---------------|--------------------------|
| start_date  | 2024-01-01    | Filter from date         |
| end_date    | 2024-12-31    | Filter to date           |
| age         | 18-40         | `<18`, `18-40`, `>40`    |
| gender      | Female        | `Male`, `Female`, `Other`|
| feature     | date_filter   | Filter line chart by feature |

---

## 🏗 Architectural Choices

**Backend — Node.js + Express + SQLite (via better-sqlite3)**
- Express is minimal and fast for REST APIs. Synchronous `better-sqlite3` keeps the code clean without callback/promise overhead for SQLite.
- SQLite is sufficient for local dev and small-scale deployments. The schema and queries are written to be easily portable to PostgreSQL (standard SQL, no SQLite-specific syntax).
- JWT stored in `localStorage` on the client; the backend validates it as a `Bearer` token on protected routes.
- Passwords hashed with `bcryptjs` (salt rounds: 10).

**Frontend — React + Vite + Tailwind CSS + Recharts**
- Vite provides fast HMR and simple proxy config for local development.
- Recharts handles the bar and line charts with clean, composable components.
- `useFilters` hook manages filter state and persists it to cookies via `js-cookie`, so filters survive page refreshes.
- `AuthContext` stores the JWT and user object in `localStorage`; an Axios interceptor attaches it automatically to every request.

---

## 📈 Scaling to 1 Million Write-Events Per Minute

The current single-server SQLite setup would collapse under 1M writes/min (~16,666 writes/sec). Here's how I'd redesign the backend:

**1. Decouple writes with a message queue.** Instead of writing directly to the database on each `POST /track`, publish events to a high-throughput queue like **Apache Kafka** or **AWS SQS**. The HTTP response returns immediately (low latency), and a pool of consumer workers drains the queue and batch-inserts into the DB. Kafka can handle millions of events/sec with horizontal consumer scaling.

**2. Switch to PostgreSQL with connection pooling.** Replace SQLite with a managed PostgreSQL instance (e.g., AWS RDS or PlanetScale). Use **PgBouncer** for connection pooling to avoid exhausting DB connections under high concurrency. Batch inserts (inserting 500–1000 rows at once from the consumer) are far more efficient than single-row inserts.

**3. Add a time-series or OLAP layer for analytics reads.** For the `GET /analytics` aggregation queries, PostgreSQL will struggle at billions of rows. Route read queries to **ClickHouse** or **TimescaleDB** (a PostgreSQL extension for time-series data). These are optimized for `GROUP BY time` style aggregations — queries that would take seconds in PostgreSQL run in milliseconds.

**4. Cache hot aggregations.** Use **Redis** to cache the `GET /analytics` result for each filter combination with a short TTL (e.g., 30 seconds). This absorbs read spikes and reduces DB pressure significantly since many users will query the same date ranges.

**5. Horizontal scaling behind a load balancer.** Deploy multiple instances of the API server behind an **AWS ALB** or **nginx** load balancer. Since JWT auth is stateless, any node can handle any request.

---

## 📦 Deployment

### Backend (Render / Railway)
1. Push to GitHub
2. Create a new Web Service pointing to the `/backend` folder
3. Set env vars: `JWT_SECRET`, `PORT`, optionally `FRONTEND_URL`
4. Set build command: `npm install && npm run seed`
5. Set start command: `npm start`

### Frontend (Vercel / Netlify)
1. Push to GitHub
2. Create project pointing to `/frontend`
3. Set env var: `VITE_API_URL=https://your-backend.onrender.com`
4. Build command: `npm run build` | Output dir: `dist`

---

## ✅ Features Checklist

- [x] JWT Authentication (register / login)
- [x] Hashed passwords (bcrypt)
- [x] Cookie-persisted filters (survive page refresh)
- [x] Date range picker
- [x] Age group filter (`<18`, `18-40`, `>40`)
- [x] Gender filter
- [x] Horizontal bar chart with feature click counts
- [x] Line chart (time trend) — drills down on bar click
- [x] Every UI interaction fires `POST /track`
- [x] 200+ seeded dummy records
- [x] Responsive dark-mode UI
- [x] Summary stats cards (total clicks, unique users, avg/user)
