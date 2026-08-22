const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getOne, getAll } = require('../../database/db');
const { generateLoginId } = require('../../utils/generateLoginId');
const { generatePassword } = require('../../utils/generatePassword');
require('dotenv').config();

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, login_id: user.login_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

async function signup(req, res) {
  try {
    const { company_name, name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const [firstName, ...lastParts] = name.trim().split(' ');
    const lastName = lastParts.join(' ') || firstName;

    const passwordHash = await bcrypt.hash(password, 12);
    const loginId = generateLoginId(firstName, lastName, company_name, new Date().toISOString());

    const userResult = runQuery(
      `INSERT INTO users (login_id, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
      [loginId, email, passwordHash]
    );

    runQuery(
      `INSERT INTO employees (user_id, first_name, last_name, mobile, email, company, date_of_joining) VALUES (?, ?, ?, ?, ?, ?, date('now'))`,
      [userResult.lastInsertRowid, firstName, lastName, phone || null, email, company_name || 'Dayflow']
    );

    const user = getOne('SELECT * FROM users WHERE id = ?', [userResult.lastInsertRowid]);
    const tokens = generateTokens(user);

    if (company_name) {
      runQuery('UPDATE settings SET company_name = ? WHERE id = 1', [company_name]);
    }

    res.status(201).json({
      message: 'Admin registered successfully',
      user: { id: user.id, login_id: user.login_id, email: user.email, role: user.role },
      ...tokens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function signin(req, res) {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login ID/email and password are required' });
    }

    const user = getOne(
      'SELECT * FROM users WHERE (email = ? OR login_id = ?) AND is_active = 1',
      [login, login]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);
    const employee = getOne('SELECT id FROM employees WHERE user_id = ?', [user.id]);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        login_id: user.login_id,
        email: user.email,
        role: user.role,
        employee_id: employee?.id
      },
      ...tokens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = getOne('SELECT * FROM users WHERE id = ? AND is_active = 1', [decoded.id]);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const user = getOne('SELECT * FROM users WHERE id = ?', [userId]);
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    runQuery('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [newHash, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Password change failed' });
  }
}

function getMe(req, res) {
  const user = getOne('SELECT id, login_id, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  const employee = getOne('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
  res.json({ user, employee });
}

module.exports = { signup, signin, refresh, changePassword, getMe };
