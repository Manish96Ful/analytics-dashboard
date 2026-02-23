# Analytics Dashboard — Backend

A REST API built with **Node.js + Express + PostgreSQL** for the Interactive Product Analytics Dashboard.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| PostgreSQL | Database |
| pg | PostgreSQL client |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment variables |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js              # Express server entry point
│   ├── db.js                 # PostgreSQL connection & table init
│   ├── seed.js               # Database seeder script
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # POST /register, POST /login
│       └── analytics.js      # POST /track, GET /analytics
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running

### Step 1 — Clone & Install

```bash
cd backend
npm install
```

### Step 2 — Create Database

Open pgAdmin or psql and create a database:

```sql
CREATE DATABASE analytics;
```

### Step 3 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:

```env
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/analytics
```

### Step 4 — Seed Database

```bash
npm run seed
```

This will:
- Create 8 demo users
- Insert 100 random click events across last 60 days
- Print demo credentials to console

### Step 5 — Start Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## 🔌 API Endpoints

### Authentication

#### POST /register
Create a new user account.

**Request Body:**
```json
{
  "username": "john",
  "password": "john123",
  "age": 25,
  "gender": "Male"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "user": { "id": 1, "username": "john", "age": 25, "gender": "Male" }
}
```

---

#### POST /login
Login with existing credentials.

**Request Body:**
```json
{
  "username": "demo",
  "password": "demo123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": 1, "username": "demo", "age": 28, "gender": "Male" }
}
```

---

### Analytics (JWT Required)

All analytics routes require `Authorization: Bearer <token>` header.

#### POST /track
Record a user interaction/feature click.

**Request Body:**
```json
{
  "feature_name": "date_filter"
}
```

**Allowed feature names:**
- `date_filter`
- `age_filter`
- `gender_filter`
- `bar_chart_zoom`

**Response:**
```json
{
  "message": "Interaction tracked",
  "id": 42
}
```

---

#### GET /analytics
Get aggregated data for charts and summary stats.

**Query Parameters:**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| start_date | string | `2024-01-01` | Filter from date |
| end_date | string | `2024-12-31` | Filter to date |
| age | string | `18-40` | Age group: `<18`, `18-40`, `>40` |
| gender | string | `Male` | `Male`, `Female`, `Other` |
| feature | string | `date_filter` | Filter line chart by feature |

**Example Request:**
```
GET /analytics?start_date=2024-01-01&end_date=2024-12-31&age=18-40&gender=Male
```

**Response:**
```json
{
  "barChart": [
    { "feature_name": "date_filter", "total_clicks": 45 },
    { "feature_name": "age_filter", "total_clicks": 32 }
  ],
  "lineChart": [
    { "date": "2024-01-15", "clicks": 5 },
    { "date": "2024-01-16", "clicks": 8 }
  ],
  "summary": {
    "totalClicks": 120,
    "uniqueUsers": 6
  }
}
```

---

#### DELETE /analytics/cleanup
Remove any invalid feature_name records from the database (run once if needed).

**Response:**
```json
{
  "message": "Deleted 23 invalid records"
}
```

---

## 🗄 Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto increment |
| username | TEXT UNIQUE | Unique username |
| password | TEXT | Bcrypt hashed |
| age | INTEGER | User age |
| gender | TEXT | Male / Female / Other |

### feature_clicks
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto increment |
| user_id | INTEGER FK | References users(id) |
| feature_name | TEXT | Interaction type |
| timestamp | TIMESTAMPTZ | Auto set to NOW() |

---

## 🌱 Demo Credentials

After running `npm run seed`:

| Username | Password |
|----------|----------|
| demo | demo123 |
| alice | alice123 |
| bob | bob123 |
| carol | carol123 |
| dave | dave123 |
| eve | eve123 |
| frank | frank123 |
| grace | grace123 |

---

## 📈 Scaling to 1M Writes/Minute

Current architecture handles small to medium traffic. For 1M writes/minute:

- **Message Queue** — Use Kafka/SQS to decouple writes. API returns instantly, consumers batch-insert to DB
- **PostgreSQL + PgBouncer** — Connection pooling to handle concurrent connections
- **ClickHouse / TimescaleDB** — For analytics read queries at scale
- **Redis Cache** — Cache `/analytics` results with 30s TTL
- **Horizontal Scaling** — Multiple API instances behind a load balancer (JWT is stateless)
