const { runQuery, getOne, getAll } = require('../../database/db');

function checkIn(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const today = new Date().toISOString().split('T')[0];
  const existing = getOne(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [employee.id, today]
  );

  if (existing && existing.status === 'confirmed') {
    return res.status(400).json({ error: 'Attendance already confirmed for today' });
  }

  const now = new Date().toTimeString().slice(0, 5);

  if (existing) {
    runQuery('UPDATE attendance SET check_in = ?, status = ? WHERE id = ?', [now, 'present', existing.id]);
  } else {
    runQuery(
      'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)',
      [employee.id, today, now, 'present']
    );
  }

  res.json({ message: 'Checked in successfully', check_in: now });
}

function checkOut(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const today = new Date().toISOString().split('T')[0];
  const record = getOne(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [employee.id, today]
  );

  if (!record || !record.check_in) {
    return res.status(400).json({ error: 'No check-in found for today' });
  }
  if (record.status === 'confirmed') {
    return res.status(400).json({ error: 'Attendance already confirmed' });
  }

  const now = new Date().toTimeString().slice(0, 5);
  const [checkInH, checkInM] = record.check_in.split(':').map(Number);
  const [checkOutH, checkOutM] = now.split(':').map(Number);
  const totalMinutes = (checkOutH * 60 + checkOutM) - (checkInH * 60 + checkInM);

  const settings = getOne('SELECT break_time_hours FROM settings WHERE id = 1');
  const breakMinutes = (settings?.break_time_hours || 1) * 60;
  const workMinutes = Math.max(0, totalMinutes - breakMinutes);
  const workHours = Math.round((workMinutes / 60) * 100) / 100;

  const standardHours = 8;
  const extraHours = Math.max(0, Math.round((workHours - standardHours) * 100) / 100);

  runQuery(
    'UPDATE attendance SET check_out = ?, work_hours = ?, extra_hours = ? WHERE id = ?',
    [now, workHours, extraHours, record.id]
  );

  res.json({ message: 'Checked out successfully', check_out: now, work_hours: workHours, extra_hours: extraHours });
}

function confirmAttendance(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const today = new Date().toISOString().split('T')[0];
  const record = getOne(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [employee.id, today]
  );

  if (!record || !record.check_in || !record.check_out) {
    return res.status(400).json({ error: 'Complete check-in and check-out first' });
  }
  if (record.status === 'confirmed') {
    return res.status(400).json({ error: 'Already confirmed' });
  }

  runQuery('UPDATE attendance SET status = ? WHERE id = ?', ['confirmed', record.id]);
  res.json({ message: 'Attendance confirmed for today' });
}

function resetAttendance(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const today = new Date().toISOString().split('T')[0];
  const record = getOne(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [employee.id, today]
  );

  if (!record) {
    return res.status(400).json({ error: 'No attendance record for today' });
  }
  if (record.status === 'confirmed') {
    return res.status(400).json({ error: 'Cannot reset confirmed attendance' });
  }

  runQuery('UPDATE attendance SET check_in = NULL, check_out = NULL, work_hours = 0, extra_hours = 0, status = ? WHERE id = ?', ['present', record.id]);
  res.json({ message: 'Attendance reset. You can check in again.' });
}

function getMyAttendance(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const { month, year } = req.query;
  const m = month || (new Date().getMonth() + 1);
  const y = year || new Date().getFullYear();
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDate = `${y}-${String(m).padStart(2, '0')}-31`;

  const records = getAll(
    'SELECT * FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
    [employee.id, startDate, endDate]
  );

  res.json(records);
}

function getAllAttendance(req, res) {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const records = getAll(`
    SELECT a.*, e.first_name, e.last_name, e.profile_picture
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.date = ?
    ORDER BY e.first_name
  `, [targetDate]);

  res.json(records);
}

function getSummary(req, res) {
  const { employee_id, month, year } = req.query;
  const userId = req.user.id;

  let empId = employee_id;
  if (!empId) {
    const emp = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
    empId = emp?.id;
  } else {
    if (req.user.role !== 'admin') {
      const own = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
      if (own.id !== parseInt(employee_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
  }

  const m = month || (new Date().getMonth() + 1);
  const y = year || new Date().getFullYear();
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDate = `${y}-${String(m).padStart(2, '0')}-31`;

  const present = getOne(
    `SELECT COUNT(*) as count FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? AND (status = 'present' OR status = 'confirmed')`,
    [empId, startDate, endDate]
  );

  const leaves = getOne(
    `SELECT COUNT(*) as count FROM leave_requests WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?`,
    [empId, endDate, startDate]
  );

  const settings = getOne('SELECT working_days_per_week FROM settings WHERE id = 1');
  const totalWorkingDays = (settings?.working_days_per_week || 5) * 4;

  res.json({
    days_present: present?.count || 0,
    leaves_count: leaves?.count || 0,
    total_working_days: totalWorkingDays
  });
}

function getStatus(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.json({ state: 'idle' });

  const today = new Date().toISOString().split('T')[0];
  const record = getOne(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [employee.id, today]
  );

  if (!record || !record.check_in) {
    return res.json({ state: 'idle', check_in: null, check_out: null });
  }
  if (record.status === 'confirmed') {
    return res.json({ state: 'confirmed', check_in: record.check_in, check_out: record.check_out, work_hours: record.work_hours });
  }
  if (record.check_out) {
    return res.json({ state: 'checked_out', check_in: record.check_in, check_out: record.check_out, work_hours: record.work_hours });
  }
  return res.json({ state: 'checked_in', check_in: record.check_in, check_out: null });
}

module.exports = { checkIn, checkOut, confirmAttendance, resetAttendance, getMyAttendance, getAllAttendance, getSummary, getStatus };
