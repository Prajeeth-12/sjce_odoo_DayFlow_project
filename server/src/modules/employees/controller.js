const bcrypt = require('bcryptjs');
const { runQuery, getOne, getAll } = require('../../database/db');
const { generateLoginId } = require('../../utils/generateLoginId');
const { generatePassword } = require('../../utils/generatePassword');

function list(req, res) {
  const employees = getAll(`
    SELECT e.*, u.login_id, u.role
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE u.is_active = 1 AND u.role = 'employee'
    ORDER BY e.first_name
  `);

  const today = new Date().toISOString().split('T')[0];

  const enriched = employees.map(emp => {
    const todayAttendance = getOne(
      'SELECT status FROM attendance WHERE employee_id = ? AND date = ?',
      [emp.id, today]
    );
    const leaveToday = getOne(`
      SELECT id FROM leave_requests
      WHERE employee_id = ? AND status = 'approved'
        AND ? BETWEEN start_date AND end_date
    `, [emp.id, today]);

    let attendance_status = 'absent';
    if (todayAttendance?.status === 'present') attendance_status = 'present';
    else if (leaveToday) attendance_status = 'leave';

    return { ...emp, attendance_status };
  });

  res.json(enriched);
}

function search(req, res) {
  const { q } = req.query;
  if (!q) return res.json([]);

  const employees = getAll(`
    SELECT e.*, u.login_id FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE u.is_active = 1
      AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR u.login_id LIKE ?)
    ORDER BY e.first_name
  `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

  res.json(employees);
}

function getById(req, res) {
  const { id } = req.params;
  const employee = getOne(`
    SELECT e.*, u.login_id, u.email as user_email, u.role
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE e.id = ?
  `, [parseInt(id)]);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const bankDetails = getOne('SELECT * FROM bank_details WHERE employee_id = ?', [parseInt(id)]);
  const skills = getAll('SELECT * FROM skills WHERE employee_id = ?', [parseInt(id)]);
  const certifications = getAll('SELECT * FROM certifications WHERE employee_id = ?', [parseInt(id)]);
  const salary = getOne('SELECT * FROM salary_structures WHERE employee_id = ?', [parseInt(id)]);

  res.json({ ...employee, bank_details: bankDetails, skills, certifications, salary });
}

async function create(req, res) {
  try {
    const {
      first_name, last_name, email, mobile, department, job_position,
      manager_id, company, location, date_of_joining
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const existing = getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const settings = getOne('SELECT company_name FROM settings WHERE id = 1');
    const companyName = company || settings?.company_name || 'OI';
    const joiningDate = date_of_joining || new Date().toISOString().split('T')[0];

    const loginId = generateLoginId(first_name, last_name, companyName, joiningDate);
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const userResult = runQuery(
      `INSERT INTO users (login_id, email, password_hash, role) VALUES (?, ?, ?, 'employee')`,
      [loginId, email, passwordHash]
    );

    const empResult = runQuery(
      `INSERT INTO employees (user_id, first_name, last_name, mobile, email, department, job_position, manager_id, company, location, date_of_joining) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userResult.lastInsertRowid, first_name, last_name, mobile || null, email, department || null, job_position || null, manager_id || null, companyName, location || null, joiningDate]
    );

    runQuery('INSERT INTO bank_details (employee_id) VALUES (?)', [empResult.lastInsertRowid]);
    runQuery('INSERT INTO salary_structures (employee_id) VALUES (?)', [empResult.lastInsertRowid]);

    res.status(201).json({
      message: 'Employee created successfully',
      employee_id: empResult.lastInsertRowid,
      login_id: loginId,
      temporary_password: tempPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
}

function update(req, res) {
  const { id } = req.params;
  const employee = getOne('SELECT * FROM employees WHERE id = ?', [parseInt(id)]);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const isOwner = employee.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Cannot edit this profile' });
  }

  const allowedFields = isAdmin
    ? ['first_name', 'last_name', 'mobile', 'email', 'personal_email', 'department',
       'job_position', 'manager_id', 'company', 'location', 'date_of_birth', 'address',
       'gender', 'nationality', 'marital_status', 'pan_no', 'uan_no', 'emp_code',
       'date_of_joining', 'about', 'job_love', 'hobbies']
    : ['mobile', 'address', 'personal_email', 'about', 'job_love', 'hobbies'];

  const updates = [];
  const values = [];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push('updated_at = datetime("now")');
  values.push(parseInt(id));

  runQuery(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, values);

  if (req.body.bank_details) {
    const bd = req.body.bank_details;
    runQuery(
      'UPDATE bank_details SET account_number = ?, bank_name = ?, ifsc_code = ? WHERE employee_id = ?',
      [bd.account_number || null, bd.bank_name || null, bd.ifsc_code || null, parseInt(id)]
    );
  }

  const updated = getOne('SELECT * FROM employees WHERE id = ?', [parseInt(id)]);
  res.json(updated);
}

function uploadAvatar(req, res) {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const avatarPath = `/uploads/${req.file.filename}`;
  runQuery('UPDATE employees SET profile_picture = ?, updated_at = datetime("now") WHERE id = ?', [avatarPath, parseInt(id)]);
  res.json({ profile_picture: avatarPath });
}

function addSkill(req, res) {
  const { id } = req.params;
  const { skill_name, proficiency } = req.body;
  if (!skill_name) return res.status(400).json({ error: 'Skill name required' });

  runQuery('INSERT INTO skills (employee_id, skill_name, proficiency) VALUES (?, ?, ?)',
    [parseInt(id), skill_name, proficiency || null]);
  res.status(201).json({ message: 'Skill added' });
}

function addCertification(req, res) {
  const { id } = req.params;
  const { name, issuer, date } = req.body;
  if (!name) return res.status(400).json({ error: 'Certification name required' });

  runQuery('INSERT INTO certifications (employee_id, name, issuer, date) VALUES (?, ?, ?, ?)',
    [parseInt(id), name, issuer || null, date || null]);
  res.status(201).json({ message: 'Certification added' });
}

function remove(req, res) {
  const { id } = req.params;
  const employee = getOne('SELECT user_id FROM employees WHERE id = ?', [parseInt(id)]);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  runQuery('UPDATE users SET is_active = 0, updated_at = datetime("now") WHERE id = ?', [employee.user_id]);
  res.json({ message: 'Employee deactivated' });
}

module.exports = { list, search, getById, create, update, uploadAvatar, addSkill, addCertification, remove };
