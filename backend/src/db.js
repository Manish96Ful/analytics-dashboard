const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('[DB] ERROR: DATABASE_URL environment variable is not set.');
  console.error('[DB] Please create a .env file with DATABASE_URL=postgresql://...');
  process.exit(1);
}

console.log('[DB] Connecting to PostgreSQL...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection and create tables
async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female', 'Other'))
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS feature_clicks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        feature_name TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_fc_user_id ON feature_clicks(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_fc_timestamp ON feature_clicks(timestamp)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_fc_feature_name ON feature_clicks(feature_name)`);
    console.log('[DB] PostgreSQL connected and tables ready');
  } finally {
    client.release();
  }
}

init().catch((err) => {
  console.error('[DB] Connection failed:', err.message);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
