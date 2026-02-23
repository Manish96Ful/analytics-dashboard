require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const FEATURES = ['date_filter', 'age_filter', 'gender_filter', 'bar_chart_zoom'];

const users = [
  { username: 'demo',  password: 'demo123',  age: 28, gender: 'Male'   },
  { username: 'alice', password: 'alice123', age: 24, gender: 'Female' },
  { username: 'bob',   password: 'bob123',   age: 35, gender: 'Male'   },
  { username: 'carol', password: 'carol123', age: 45, gender: 'Female' },
  { username: 'dave',  password: 'dave123',  age: 16, gender: 'Male'   },
  { username: 'eve',   password: 'eve123',   age: 52, gender: 'Other'  },
  { username: 'frank', password: 'frank123', age: 30, gender: 'Male'   },
  { username: 'grace', password: 'grace123', age: 22, gender: 'Female' },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString();
}

async function seed() {
  console.log('🌱 Seeding PostgreSQL...');

  await new Promise((r) => setTimeout(r, 1000));

  // Clear existing data
  await db.query('DELETE FROM feature_clicks');
  await db.query('DELETE FROM users');
  await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await db.query('ALTER SEQUENCE feature_clicks_id_seq RESTART WITH 1');

  // Create users
  const userIds = [];
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, age, gender) VALUES ($1, $2, $3, $4) RETURNING id',
      [user.username, hashed, user.age, user.gender]
    );
    userIds.push(result.rows[0].id);
    console.log(`  ✅ Created user: ${user.username} (age: ${user.age}, gender: ${user.gender})`);
  }

  // Seed 100 click records across last 60 days
  console.log('\n🖱️  Seeding 100 click events...');
  for (let i = 0; i < 100; i++) {
    const user_id = randomChoice(userIds);
    const feature_name = randomChoice(FEATURES);
    const timestamp = randomDate(60);
    await db.query(
      'INSERT INTO feature_clicks (user_id, feature_name, timestamp) VALUES ($1, $2, $3)',
      [user_id, feature_name, timestamp]
    );
  }
  console.log('  ✅ 100 click events created');

  console.log('\n📋 Demo credentials:');
  console.log('  username: demo  | password: demo123');
  console.log('  username: alice | password: alice123');
  console.log('\n🎉 Done! Dashboard will show data on first open.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
