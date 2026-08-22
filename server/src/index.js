const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initializeDatabase } = require('./database/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

async function start() {
  await initializeDatabase();

  const authRoutes = require('./modules/auth/routes');
  const employeesRoutes = require('./modules/employees/routes');
  const attendanceRoutes = require('./modules/attendance/routes');
  const leaveRoutes = require('./modules/leave/routes');
  const payrollRoutes = require('./modules/payroll/routes');
  const settingsRoutes = require('./modules/settings/routes');

  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeesRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/leave', leaveRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/settings', settingsRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Dayflow server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
