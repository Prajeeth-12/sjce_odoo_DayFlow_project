import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Avatar, Menu, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Circle, CheckCircle, RestartAlt, PlayArrow, Stop } from '@mui/icons-material';
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

  useEffect(() => {
    if (user) fetchStatus();
  }, [user]);

  async function fetchStatus() {
    try {
      const { data } = await api.get('/attendance/status');
      setStatus(data);
    } catch {}
  }

  async function handleCheckIn() {
    try {
      await api.post('/attendance/check-in');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    }
  }

  async function handleCheckOut() {
    try {
      await api.post('/attendance/check-out');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
  }

  async function handleConfirm() {
    try {
      await api.post('/attendance/confirm');
      setConfirmDialog(false);
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Confirm failed');
    }
  }

  async function handleReset() {
    try {
      await api.post('/attendance/reset');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Reset failed');
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.neutral[50] }}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, animation: `${brandPulse} 1.5s infinite ease-in-out` }}>
          Dayflow
        </Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/signin" />;

  function renderAttendanceControl() {
    switch (status.state) {
      case 'idle':
        return (
          <Button variant="outlined" onClick={handleCheckIn} size="small" startIcon={<PlayArrow />} sx={{ borderRadius: 2 }}>
            Check In
          </Button>
        );
      case 'checked_in':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip label={`In since ${status.check_in}`} size="small" color="success" variant="outlined" />
            <Button variant="contained" onClick={handleCheckOut} size="small" startIcon={<Stop />} sx={{ borderRadius: 2 }}>
              Check Out
            </Button>
          </Box>
        );
      case 'checked_out':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`${status.check_in} — ${status.check_out} (${status.work_hours}h)`} size="small" variant="outlined" />
            <Button variant="contained" color="success" onClick={() => setConfirmDialog(true)} size="small" sx={{ borderRadius: 2 }}>
              Confirm
            </Button>
            <IconButton size="small" onClick={handleReset} title="Reset & redo" sx={{ color: 'text.secondary' }}>
              <RestartAlt fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'confirmed':
        return (
          <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />} label={`Done (${status.check_in} — ${status.check_out})`} color="success" variant="outlined" size="small" />
        );
      default:
        return null;
    }
  }

  const dotColor = status.state === 'checked_in' || status.state === 'confirmed' ? colors.success.main : status.state === 'checked_out' ? colors.warning.main : colors.error.main;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.neutral[50] }}>
      <Sidebar />

      <Box sx={{ flex: 1, ml: `${SIDEBAR_WIDTH}px`, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: 3,
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
          }}
        >
          {renderAttendanceControl()}
          <Circle sx={{ color: dotColor, fontSize: 12 }} />

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
              {employee?.first_name?.[0]}{employee?.last_name?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>My Profile</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/signin'); }}>Log Out</MenuItem>
          </Menu>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Please review your attendance for today:
          </Typography>
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
            <Typography variant="body2"><strong>Check In:</strong> {status.check_in}</Typography>
            <Typography variant="body2"><strong>Check Out:</strong> {status.check_out}</Typography>
            <Typography variant="body2"><strong>Work Hours:</strong> {status.work_hours}h</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Once confirmed, this cannot be changed. If times are wrong, click Cancel and use the reset button to redo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="success" onClick={handleConfirm}>Confirm & Lock</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
