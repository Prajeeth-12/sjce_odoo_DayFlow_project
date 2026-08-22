const { runQuery, getOne } = require('../../database/db');

function get(req, res) {
  const settings = getOne('SELECT * FROM settings WHERE id = 1');
  if (settings && settings.public_holidays) {
    settings.public_holidays = JSON.parse(settings.public_holidays);
  }
  res.json(settings || {});
}

function update(req, res) {
  const { company_name, working_days_per_week, break_time_hours, public_holidays } = req.body;

  const updates = [];
  const values = [];

  if (company_name !== undefined) { updates.push('company_name = ?'); values.push(company_name); }
  if (working_days_per_week !== undefined) { updates.push('working_days_per_week = ?'); values.push(working_days_per_week); }
  if (break_time_hours !== undefined) { updates.push('break_time_hours = ?'); values.push(break_time_hours); }
  if (public_holidays !== undefined) { updates.push('public_holidays = ?'); values.push(JSON.stringify(public_holidays)); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  runQuery(`UPDATE settings SET ${updates.join(', ')} WHERE id = 1`, values);

  const settings = getOne('SELECT * FROM settings WHERE id = 1');
  if (settings.public_holidays) settings.public_holidays = JSON.parse(settings.public_holidays);
  res.json(settings);
}

function uploadLogo(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const logoPath = `/uploads/${req.file.filename}`;
  runQuery('UPDATE settings SET logo_path = ? WHERE id = 1', [logoPath]);

  res.json({ logo_path: logoPath });
}

module.exports = { get, update, uploadLogo };
