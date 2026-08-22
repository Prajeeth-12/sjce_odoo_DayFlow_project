import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Grid, LinearProgress, Chip
} from '@mui/material';
import { Add, Close, Check, AttachFile } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../design/components/PageHeader';
import StatusBadge from '../../design/components/StatusBadge';
import EmptyState from '../../design/components/EmptyState';
import { staggerContainer, staggerItem } from '../../design/animations';
import { colors } from '../../design/tokens';

function LeaveBalanceCards({ types }) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {types.map(t => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
            <motion.div variants={staggerItem}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {t.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 1.5 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {t.available === 'Unlimited' ? '∞' : t.available}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t.available === 'Unlimited' ? '' : `/ ${t.max_days_per_year} days`}
                  </Typography>
                </Box>
                {t.available !== 'Unlimited' && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (t.used / t.max_days_per_year) * 100)}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                  />
                )}
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

function MiniCalendar({ year, leaveRequests, publicHolidays }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function getDaysInMonth(month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDay(month) {
    return new Date(year, month, 1).getDay();
  }

  function getDayStatus(dateStr) {
    for (const req of leaveRequests) {
      if (dateStr >= req.start_date && dateStr <= req.end_date) {
        return req.status;
      }
    }
    for (const h of publicHolidays) {
      if (h.date === dateStr) return 'holiday';
    }
    return null;
  }

  const statusColors = {
    approved: colors.success.main,
    pending: colors.warning.main,
    rejected: colors.error.main,
    holiday: colors.info.main,
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">Calendar {year}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.success.main }} /><Typography variant="caption">Approved</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.warning.main }} /><Typography variant="caption">Pending</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.error.main }} /><Typography variant="caption">Rejected</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.info.main }} /><Typography variant="caption">Holiday</Typography></Box>
        </Box>
      </Box>
      <Grid container spacing={1}>
        {months.map((monthName, monthIdx) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={monthIdx}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>{monthName}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
              {['S','M','T','W','T','F','S'].map((d,i) => (
                <Typography key={i} variant="caption" sx={{ fontSize: '0.6rem', textAlign: 'center', color: 'text.secondary' }}>{d}</Typography>
              ))}
              {Array.from({ length: getFirstDay(monthIdx) }).map((_, i) => <Box key={`e-${i}`} />)}
              {Array.from({ length: getDaysInMonth(monthIdx) }).map((_, day) => {
                const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                const status = getDayStatus(dateStr);
                return (
                  <Box
                    key={day}
                    sx={{
                      width: 16, height: 16, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem',
                      bgcolor: status ? statusColors[status] : 'transparent',
                      color: status ? '#fff' : 'text.primary',
                      mx: 'auto',
                    }}
                  >
                    {day + 1}
                  </Box>
                );
              })}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

function PublicHolidaysSidebar({ holidays }) {
  if (!holidays || holidays.length === 0) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Public Holidays</Typography>
      {holidays.map((h, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="caption">{h.name}</Typography>
          <Typography variant="caption" color="text.secondary">{h.date}</Typography>
        </Box>
      ))}
    </Paper>
  );
}

function RequestDialog({ open, onClose, types, onSubmit }) {
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', remarks: '' });

  function handleSubmit() {
    onSubmit(form);
    onClose();
    setForm({ leave_type_id: '', start_date: '', end_date: '', remarks: '' });
  }

  const days = form.start_date && form.end_date
    ? Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000*60*60*24)) + 1)
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>New Leave Request</DialogTitle>
      <DialogContent>
        <TextField select fullWidth label="Leave Type" value={form.leave_type_id} onChange={e => setForm({ ...form, leave_type_id: e.target.value })} margin="normal">
          {types.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
        </TextField>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={6}>
            <TextField fullWidth label="From" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="To" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
        </Grid>
        {days > 0 && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            Allocation: {days} day{days > 1 ? 's' : ''}
          </Typography>
        )}
        <TextField fullWidth label="Remarks (optional)" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} margin="normal" multiline rows={2} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Discard</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.leave_type_id || !form.start_date || !form.end_date}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmployeeTimeOff() {
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [calendar, setCalendar] = useState({ requests: [], public_holidays: [] });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [t, r, c] = await Promise.all([
        api.get('/leave/types'),
        api.get('/leave/my'),
        api.get(`/leave/calendar?year=${new Date().getFullYear()}`)
      ]);
      setTypes(t.data);
      setRequests(r.data);
      setCalendar(c.data);
    } catch {}
  }

  async function handleSubmit(form) {
    try { await api.post('/leave/request', form); fetchData(); } catch {}
  }

  return (
    <Box>
      <PageHeader
        title="Time Off"
        subtitle="Manage your leave requests"
        action={<Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>New Request</Button>}
      />

      <LeaveBalanceCards types={types} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 9 }}>
          <MiniCalendar
            year={new Date().getFullYear()}
            leaveRequests={calendar.requests}
            publicHolidays={calendar.public_holidays}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <PublicHolidaysSidebar holidays={calendar.public_holidays} />
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map(r => (
              <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.leave_type_name}</TableCell>
                <TableCell>{r.allocation_days}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow><TableCell colSpan={5}><EmptyState title="No leave requests" description="Submit your first time off request" /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RequestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} types={types} onSubmit={handleSubmit} />
    </Box>
  );
}

function AdminTimeOff() {
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [t, r] = await Promise.all([api.get('/leave/types'), api.get('/leave/all')]);
      setTypes(t.data);
      setRequests(r.data);
    } catch {}
  }

  async function handleApprove(id) { await api.put(`/leave/${id}/approve`); fetchData(); }
  async function handleReject(id) { await api.put(`/leave/${id}/reject`); fetchData(); }

  const filtered = search
    ? requests.filter(r => `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase()))
    : requests;

  return (
    <Box>
      <PageHeader
        title="Time Off"
        subtitle="Review and manage leave requests"
        action={<TextField size="small" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 240 }} />}
      />

      <LeaveBalanceCards types={types} />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{r.first_name} {r.last_name}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.leave_type_name}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell align="right">
                  {r.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => handleApprove(r.id)} sx={{ color: 'success.main', bgcolor: 'success.light', '&:hover': { bgcolor: 'success.light' } }}>
                        <Check fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleReject(r.id)} sx={{ color: 'error.main', bgcolor: 'error.light', '&:hover': { bgcolor: 'error.light' } }}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6}><EmptyState title="No leave requests" /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default function TimeOff() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminTimeOff /> : <EmployeeTimeOff />;
}
