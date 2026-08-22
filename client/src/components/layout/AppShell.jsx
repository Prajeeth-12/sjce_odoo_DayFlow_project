import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Avatar, Menu, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Circle, CheckCircle, RestartAlt, PlayArrow, Stop, Coffee, PlayCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { SIDEBAR_WIDTH } from '../../design/components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { brandPulse } from '../../design/animations';
import { colors } from '../../design/tokens';
import api from '../../services/api';

export default function AppShell() {
  const { user, employee, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ state: 'idle' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);

  useEffect(() => { if (user) fetchStatus(); }, [user]);

  async function fetchStatus() {
    try { const { data } = await api.get('/attendance/status'); setStatus(data); } catch {}
  }

  async function handleCheckIn() {
    try { await api.post('/attendance/check-in'); fetchStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  async function handleCheckOut() {
    try { await api.post('/attendance/check-out'); fetchStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  async function handleStartBreak() {
    try { await api.post('/attendance/break/start'); fetchStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  async function handleEndBreak() {
    try { await api.post('/attendance/break/end'); fetchStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  async function handleConfirm() {
    try { await api.post('/attendance/confirm'); setConfirmDialog(false); fetchStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  async function handleReset(mode) {
    try { await api.post('/attendance/reset', { mode }); setResetDialog(false); fetchStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.neutral[50] }}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, animation: `${brandPulse} 1.5s infinite ease-in-out` }}>Dayflow</Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/signin" />;

  function formatBreak(mins) {
    if (!mins) return '';
    if (mins < 60) return `${mins}m break`;
    return `${Math.floor(mins/60)}h ${mins%60}m break`;
  }

  function renderAttendanceControl() {
    switch (status.state) {
      case 'idle':
        return <Button variant="outlined" onClick={handleCheckIn} size="small" startIcon={<PlayArrow />} sx={{ borderRadius: 2 }}>Check In</Button>;

      case 'checked_in':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`In since ${status.check_in}`} size="small" color="success" variant="outlined" />
            {status.break_minutes > 0 && <Chip label={formatBreak(status.break_minutes)} size="small" variant="outlined" />}
            <Button variant="outlined" onClick={handleStartBreak} size="small" startIcon={<Coffee />} sx={{ borderRadius: 2 }}>Break</Button>
            <Button variant="contained" onClick={handleCheckOut} size="small" startIcon={<Stop />} sx={{ borderRadius: 2 }}>End Day</Button>
          </Box>
        );

      case 'on_break':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`On break since ${status.break_start}`} size="small" color="warning" variant="outlined" icon={<Coffee sx={{ fontSize: 14 }} />} />
            <Button variant="contained" color="warning" onClick={handleEndBreak} size="small" startIcon={<PlayCircle />} sx={{ borderRadius: 2 }}>Resume Work</Button>
          </Box>
        );

      case 'checked_out':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`${status.check_in} — ${status.check_out} | ${status.work_hours}h`} size="small" variant="outlined" />
            {status.break_minutes > 0 && <Chip label={formatBreak(status.break_minutes)} size="small" variant="outlined" />}
            <Button variant="contained" color="success" onClick={() => setConfirmDialog(true)} size="small" sx={{ borderRadius: 2 }}>Confirm</Button>
            <IconButton size="small" onClick={() => setResetDialog(true)} title="Redo" sx={{ color: 'text.secondary' }}><RestartAlt fontSize="small" /></IconButton>
          </Box>
        );

      case 'confirmed':
        return <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />} label={`Done (${status.check_in} — ${status.check_out} | ${status.work_hours}h)`} color="success" variant="outlined" size="small" />;

      default: return null;
    }
  }

  const dotColor = {
    idle: colors.error.main,
    checked_in: colors.success.main,
    on_break: colors.warning.main,
    checked_out: colors.warning.main,
    confirmed: colors.success.main,
  }[status.state] || colors.error.main;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.neutral[50] }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: `${SIDEBAR_WIDTH}px`, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 3, gap: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 1100 }}>
          {renderAttendanceControl()}
          <Circle sx={{ color: dotColor, fontSize: 12 }} />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>{employee?.first_name?.[0]}{employee?.last_name?.[0]}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>My Profile</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/signin'); }}>Log Out</MenuItem>
          </Menu>
        </Box>

        <Box sx={{ flex: 1, p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Today's Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5 }}>Review your attendance:</Typography>
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
            <Typography variant="body2"><strong>Check In:</strong> {status.check_in}</Typography>
            <Typography variant="body2"><strong>Check Out:</strong> {status.check_out}</Typography>
            <Typography variant="body2"><strong>Break:</strong> {status.break_minutes ? formatBreak(status.break_minutes) : 'None'}</Typography>
            <Typography variant="body2"><strong>Work Hours:</strong> {status.work_hours}h</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Once confirmed, this cannot be changed for today.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="success" onClick={handleConfirm}>Confirm & Lock</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Redo Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>How would you like to redo?</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => handleReset('continue')} fullWidth sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5, px: 2 }}>
              <Box>
                <Typography variant="subtitle2">Continue from check-in</Typography>
                <Typography variant="caption" color="text.secondary">Keep original check-in time ({status.check_in}), just redo check-out</Typography>
              </Box>
            </Button>
            <Button variant="outlined" color="error" onClick={() => handleReset('fresh')} fullWidth sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5, px: 2 }}>
              <Box>
                <Typography variant="subtitle2">Start completely fresh</Typography>
                <Typography variant="caption" color="text.secondary">Clear everything and check in again from now</Typography>
              </Box>
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)} color="inherit">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
