const { runQuery, getOne, getAll } = require('../../database/db');

function getEmployeeId(userId) {
  const emp = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  return emp?.id;
}

function getTodayRecord(employeeId) {
  const today = new Date().toISOString().split('T')[0];
  return getOne('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employeeId, today]);
}

function now() {
  return new Date().toTimeString().slice(0, 5);
}

function checkIn(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const today = new Date().toISOString().split('T')[0];
  const record = getTodayRecord(empId);

  if (record && record.status === 'confirmed') {
    return res.status(400).json({ error: 'Attendance already confirmed for today' });
  }

  const currentTime = now();

  if (record) {
    runQuery('UPDATE attendance SET check_in = ?, check_out = NULL, work_hours = 0, extra_hours = 0, break_minutes = 0, status = ? WHERE id = ?',
      [currentTime, 'present', record.id]);
  } else {
    runQuery('INSERT INTO attendance (employee_id, date, check_in, break_minutes, status) VALUES (?, ?, ?, ?, ?)',
      [empId, today, currentTime, 0, 'present']);
  }

  res.json({ message: 'Checked in', check_in: currentTime });
}

function startBreak(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const record = getTodayRecord(empId);
  if (!record || !record.check_in) return res.status(400).json({ error: 'Not checked in' });
  if (record.status === 'on_break') return res.status(400).json({ error: 'Already on break' });
  if (record.status === 'confirmed') return res.status(400).json({ error: 'Attendance confirmed' });
  if (record.check_out) return res.status(400).json({ error: 'Already checked out' });

  const currentTime = now();
  runQuery('UPDATE attendance SET break_start = ?, status = ? WHERE id = ?', [currentTime, 'on_break', record.id]);
  res.json({ message: 'Break started', break_start: currentTime });
}

function endBreak(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const record = getTodayRecord(empId);
  if (!record || record.status !== 'on_break') return res.status(400).json({ error: 'Not on break' });

  const currentTime = now();
  const [bsH, bsM] = record.break_start.split(':').map(Number);
  const [beH, beM] = currentTime.split(':').map(Number);
  const breakDuration = (beH * 60 + beM) - (bsH * 60 + bsM);
  const totalBreak = (record.break_minutes || 0) + breakDuration;

  runQuery('UPDATE attendance SET break_start = NULL, break_minutes = ?, status = ? WHERE id = ?',
    [totalBreak, 'present', record.id]);
  res.json({ message: 'Break ended', break_minutes: totalBreak });
}

function checkOut(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const record = getTodayRecord(empId);
  if (!record || !record.check_in) return res.status(400).json({ error: 'Not checked in' });
  if (record.status === 'on_break') return res.status(400).json({ error: 'End your break first' });
  if (record.status === 'confirmed') return res.status(400).json({ error: 'Already confirmed' });
  if (record.check_out) return res.status(400).json({ error: 'Already checked out' });

  const currentTime = now();
  const [ciH, ciM] = record.check_in.split(':').map(Number);
  const [coH, coM] = currentTime.split(':').map(Number);
  const totalMinutes = (coH * 60 + coM) - (ciH * 60 + ciM);
  const workMinutes = Math.max(0, totalMinutes - (record.break_minutes || 0));
  const workHours = Math.round((workMinutes / 60) * 100) / 100;
  const extraHours = Math.max(0, Math.round((workHours - 8) * 100) / 100);

  runQuery('UPDATE attendance SET check_out = ?, work_hours = ?, extra_hours = ? WHERE id = ?',
    [currentTime, workHours, extraHours, record.id]);

  res.json({ message: 'Checked out', check_out: currentTime, work_hours: workHours, extra_hours: extraHours, break_minutes: record.break_minutes || 0 });
}

function confirmAttendance(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const record = getTodayRecord(empId);
  if (!record || !record.check_in || !record.check_out) return res.status(400).json({ error: 'Complete check-in and check-out first' });
  if (record.status === 'confirmed') return res.status(400).json({ error: 'Already confirmed' });

  runQuery('UPDATE attendance SET status = ? WHERE id = ?', ['confirmed', record.id]);
  res.json({ message: 'Attendance confirmed' });
}

function resetAttendance(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const { mode } = req.body;
  const record = getTodayRecord(empId);
  if (!record) return res.status(400).json({ error: 'No record today' });
  if (record.status === 'confirmed') return res.status(400).json({ error: 'Cannot reset confirmed attendance' });

  if (mode === 'continue') {
    runQuery('UPDATE attendance SET check_out = NULL, work_hours = 0, extra_hours = 0, status = ? WHERE id = ?', ['present', record.id]);
    res.json({ message: 'Resumed — check-in time kept, check out when ready' });
  } else {
    runQuery('UPDATE attendance SET check_in = NULL, check_out = NULL, work_hours = 0, extra_hours = 0, break_minutes = 0, break_start = NULL, status = ? WHERE id = ?', ['present', record.id]);
    res.json({ message: 'Reset — start fresh' });
  }
}

function getStatus(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.json({ state: 'idle' });

  const record = getTodayRecord(empId);
  if (!record || !record.check_in) return res.json({ state: 'idle' });

  if (record.status === 'confirmed') {
    return res.json({ state: 'confirmed', check_in: record.check_in, check_out: record.check_out, work_hours: record.work_hours, break_minutes: record.break_minutes || 0 });
  }
  if (record.status === 'on_break') {
    return res.json({ state: 'on_break', check_in: record.check_in, break_start: record.break_start, break_minutes: record.break_minutes || 0 });
  }
  if (record.check_out) {
    return res.json({ state: 'checked_out', check_in: record.check_in, check_out: record.check_out, work_hours: record.work_hours, break_minutes: record.break_minutes || 0 });
  }
  return res.json({ state: 'checked_in', check_in: record.check_in, break_minutes: record.break_minutes || 0 });
}

function getMyAttendance(req, res) {
  const empId = getEmployeeId(req.user.id);
  if (!empId) return res.status(404).json({ error: 'Employee not found' });

  const { month, year } = req.query;
  const m = month || (new Date().getMonth() + 1);
  const y = year || new Date().getFullYear();
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDate = `${y}-${String(m).padStart(2, '0')}-31`;

  const records = getAll(
    'SELECT * FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
    [empId, startDate, endDate]
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
  let empId = employee_id;
  if (!empId) {
    empId = getEmployeeId(req.user.id);
  } else if (req.user.role !== 'admin') {
    const own = getEmployeeId(req.user.id);
    if (own !== parseInt(employee_id)) return res.status(403).json({ error: 'Access denied' });
  }

  const m = month || (new Date().getMonth() + 1);
  const y = year || new Date().getFullYear();
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDate = `${y}-${String(m).padStart(2, '0')}-31`;

  const present = getOne(
    `SELECT COUNT(*) as count FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? AND status IN ('present', 'confirmed')`,
    [empId, startDate, endDate]
  );
  const leaves = getOne(
    `SELECT COUNT(*) as count FROM leave_requests WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?`,
    [empId, endDate, startDate]
  );
  const settings = getOne('SELECT working_days_per_week FROM settings WHERE id = 1');

  res.json({
    days_present: present?.count || 0,
    leaves_count: leaves?.count || 0,
    total_working_days: (settings?.working_days_per_week || 5) * 4
  });
}

module.exports = { checkIn, checkOut, startBreak, endBreak, confirmAttendance, resetAttendance, getMyAttendance, getAllAttendance, getSummary, getStatus };
