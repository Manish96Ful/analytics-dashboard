const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /track
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { feature_name } = req.body;
    const user_id = req.user.id;

    if (!feature_name) {
      return res.status(400).json({ error: 'feature_name is required' });
    }

    const result = await db.query(
      'INSERT INTO feature_clicks (user_id, feature_name) VALUES ($1, $2) RETURNING id',
      [user_id, feature_name]
    );

    res.status(201).json({ message: 'Interaction tracked', id: result.rows[0].id });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, age, gender, feature } = req.query;

    const conditions = [];
    const params = [];
    let i = 1;

    if (start_date) { conditions.push(`fc.timestamp >= $${i++}`); params.push(start_date); }
    if (end_date)   { conditions.push(`fc.timestamp <= $${i++}`); params.push(end_date + ' 23:59:59'); }
    if (gender && gender !== 'all') { conditions.push(`u.gender = $${i++}`); params.push(gender); }
    if (age && age !== 'all') {
      if (age === '<18')        conditions.push('u.age < 18');
      else if (age === '18-40') conditions.push('u.age >= 18 AND u.age <= 40');
      else if (age === '>40')   conditions.push('u.age > 40');
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Bar chart
    const barResult = await db.query(`
      SELECT fc.feature_name, COUNT(*) AS total_clicks
      FROM feature_clicks fc
      JOIN users u ON fc.user_id = u.id
      ${where}
      GROUP BY fc.feature_name
      ORDER BY total_clicks DESC
    `, params);

    // Line chart
    const lineConditions = [...conditions];
    const lineParams = [...params];
    if (feature && feature !== 'all') {
      lineConditions.push(`fc.feature_name = $${lineParams.length + 1}`);
      lineParams.push(feature);
    }
    const lineWhere = lineConditions.length > 0 ? 'WHERE ' + lineConditions.join(' AND ') : '';

    const lineResult = await db.query(`
      SELECT DATE(fc.timestamp) AS date, COUNT(*) AS clicks
      FROM feature_clicks fc
      JOIN users u ON fc.user_id = u.id
      ${lineWhere}
      GROUP BY DATE(fc.timestamp)
      ORDER BY date ASC
    `, lineParams);

    // Summary stats
    const totalResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM feature_clicks fc
      JOIN users u ON fc.user_id = u.id
      ${where}
    `, params);

    const uniqueResult = await db.query(`
      SELECT COUNT(DISTINCT fc.user_id) AS count
      FROM feature_clicks fc
      JOIN users u ON fc.user_id = u.id
      ${where}
    `, params);

    // parseInt fixes decimal issue — PostgreSQL COUNT returns string/bigint
    res.json({
      barChart: barResult.rows.map(r => ({
        feature_name: r.feature_name,
        total_clicks: parseInt(r.total_clicks),
      })),
      lineChart: lineResult.rows.map(r => ({
        date: r.date,
        clicks: parseInt(r.clicks),
      })),
      summary: {
        totalClicks: parseInt(totalResult.rows[0].count),
        uniqueUsers: parseInt(uniqueResult.rows[0].count),
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /analytics/cleanup - Remove invalid feature names
router.delete('/analytics/cleanup', authenticateToken, async (req, res) => {
  try {
    const allowed = ['date_filter', 'age_filter', 'gender_filter', 'bar_chart_zoom'];
    const placeholders = allowed.map((_, i) => `$${i + 1}`).join(', ');
    const result = await db.query(
      `DELETE FROM feature_clicks WHERE feature_name NOT IN (${placeholders})`,
      allowed
    );
    res.json({ message: `Deleted ${result.rowCount} invalid records` });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;