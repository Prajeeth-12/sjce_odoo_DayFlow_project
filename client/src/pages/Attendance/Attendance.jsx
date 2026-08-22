import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, TextField, Grid
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../design/components/PageHeader';
import StatCard from '../../design/components/StatCard';
import StatusBadge from '../../design/components/StatusBadge';
import { TableSkeleton } from '../../design/components/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../design/animations';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function EmployeeView() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [month, year]);

  async function fetchData() {
    setLoading(true);
    try {
      const [att, sum] = await Promise.all([
        api.get(`/attendance/my?month=${month}&year=${year}`),
        api.get(`/attendance/summary?month=${month}&year=${year}`)
      ]);
      setRecords(att.data);
      setSummary(sum.data);
    } catch {} finally { setLoading(false); }
  }

  function prevMonth() { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton size="small" onClick={prevMonth}><ChevronLeft /></IconButton>
        <Typography variant="subtitle1" sx={{ minWidth: 160, textAlign: 'center' }}>
          {MONTHS[month - 1]} {year}
        </Typography>
        <IconButton size="small" onClick={nextMonth}><ChevronRight /></IconButton>
      </Box>

      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={4}>
            <StatCard title="Days Present" value={summary.days_present || 0} color="success" />
          </Grid>
          <Grid size={4}>
            <StatCard title="Leaves" value={summary.leaves_count || 0} color="info" />
          </Grid>
          <Grid size={4}>
            <StatCard title="Working Days" value={summary.total_working_days || 0} color="primary" />
          </Grid>
        </Grid>
      </motion.div>

      {loading ? <TableSkeleton /> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Work Hours</TableCell>
                <TableCell>Extra Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{r.date}</TableCell>
                  <TableCell>{r.check_in || '—'}</TableCell>
                  <TableCell>{r.check_out || '—'}</TableCell>
                  <TableCell>{r.work_hours ? `${r.work_hours.toFixed(1)}h` : '—'}</TableCell>
                  <TableCell sx={{ color: r.extra_hours > 0 ? 'success.main' : 'text.secondary' }}>
                    {r.extra_hours ? `+${r.extra_hours.toFixed(1)}h` : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No records for this month</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function AdminView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, [date]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/all?date=${date}`);
      setRecords(data);
    } catch {} finally { setLoading(false); }
  }

  const filtered = search
    ? records.filter(r => `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase()))
    : records;

  function changeDate(offset) {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton size="small" onClick={() => changeDate(-1)}><ChevronLeft /></IconButton>
        <TextField type="date" size="small" value={date} onChange={e => setDate(e.target.value)} sx={{ width: 180 }} />
        <IconButton size="small" onClick={() => changeDate(1)}><ChevronRight /></IconButton>
        <Box sx={{ flex: 1 }} />
        <TextField size="small" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 240 }} />
      </Box>

      {loading ? <TableSkeleton /> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Work Hours</TableCell>
                <TableCell>Extra Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{r.first_name} {r.last_name}</TableCell>
                  <TableCell>{r.check_in || '—'}</TableCell>
                  <TableCell>{r.check_out || '—'}</TableCell>
                  <TableCell>{r.work_hours ? `${r.work_hours.toFixed(1)}h` : '—'}</TableCell>
                  <TableCell sx={{ color: r.extra_hours > 0 ? 'success.main' : 'text.secondary' }}>
                    {r.extra_hours ? `+${r.extra_hours.toFixed(1)}h` : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No attendance records</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default function Attendance() {
  const { isAdmin } = useAuth();
  return (
    <Box>
      <PageHeader title="Attendance" subtitle={isAdmin ? "View all employee attendance" : "Your attendance records"} />
      {isAdmin ? <AdminView /> : <EmployeeView />}
    </Box>
  );
}
