const { runQuery, getOne, getAll } = require('../../database/db');

function getTypes(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  const types = getAll('SELECT * FROM leave_types');
  const currentYear = String(new Date().getFullYear());

  const enriched = types.map(type => {
    if (!employee) return { ...type, used: 0, available: type.max_days_per_year };

    const used = getOne(
      `SELECT COALESCE(SUM(allocation_days), 0) as total FROM leave_requests WHERE employee_id = ? AND leave_type_id = ? AND status = 'approved' AND start_date LIKE ?`,
      [employee.id, type.id, `${currentYear}%`]
    );

    const available = type.max_days_per_year === 0
      ? 'Unlimited'
      : Math.max(0, type.max_days_per_year - (used?.total || 0));

    return { ...type, used: used?.total || 0, available };
  });

  res.json(enriched);
}

function createRequest(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const { leave_type_id, start_date, end_date, remarks, attachment } = req.body;
  if (!leave_type_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Leave type, start date, and end date are required' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  runQuery(
    'INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, allocation_days, remarks, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [employee.id, leave_type_id, start_date, end_date, diffDays, remarks || null, attachment || null]
  );

  res.status(201).json({ message: 'Leave request submitted' });
}

function getMyRequests(req, res) {
  const userId = req.user.id;
  const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const requests = getAll(`
    SELECT lr.*, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = ?
    ORDER BY lr.created_at DESC
  `, [employee.id]);

  res.json(requests);
}

function getAllRequests(req, res) {
  const requests = getAll(`
    SELECT lr.*, lt.name as leave_type_name, e.first_name, e.last_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    JOIN employees e ON lr.employee_id = e.id
    ORDER BY lr.created_at DESC
  `);

  res.json(requests);
}

function approve(req, res) {
  const { id } = req.params;
  const request = getOne('SELECT * FROM leave_requests WHERE id = ?', [parseInt(id)]);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  runQuery('UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?', ['approved', req.user.id, parseInt(id)]);

  const startDate = new Date(request.start_date);
  const endDate = new Date(request.end_date);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const existing = getOne(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [request.employee_id, dateStr]
    );

    if (existing) {
      runQuery('UPDATE attendance SET status = ? WHERE id = ?', ['leave', existing.id]);
    } else {
      runQuery(
        'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
        [request.employee_id, dateStr, 'leave']
      );
    }
  }

  res.json({ message: 'Leave approved' });
}

function reject(req, res) {
  const { id } = req.params;
  const request = getOne('SELECT * FROM leave_requests WHERE id = ?', [parseInt(id)]);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  runQuery('UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?', ['rejected', req.user.id, parseInt(id)]);
  res.json({ message: 'Leave rejected' });
}

function getCalendar(req, res) {
  const { employee_id, year } = req.query;
  const userId = req.user.id;

  let empId = employee_id;
  if (!empId) {
    const emp = getOne('SELECT id FROM employees WHERE user_id = ?', [userId]);
    empId = emp?.id;
  }

  const targetYear = year || String(new Date().getFullYear());
  const requests = getAll(`
    SELECT lr.*, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = ? AND lr.start_date LIKE ?
  `, [empId, `${targetYear}%`]);

  const settings = getOne('SELECT public_holidays FROM settings WHERE id = 1');
  const publicHolidays = JSON.parse(settings?.public_holidays || '[]');

  res.json({ requests, public_holidays: publicHolidays });
}

function getPublicHolidays(req, res) {
  const settings = getOne('SELECT public_holidays FROM settings WHERE id = 1');
  res.json(JSON.parse(settings?.public_holidays || '[]'));
}

module.exports = { getTypes, createRequest, getMyRequests, getAllRequests, approve, reject, getCalendar, getPublicHolidays };
