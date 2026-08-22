import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Avatar, Menu, MenuItem, Chip } from '@mui/material';
import { Circle, CheckCircle } from '@mui/icons-material';
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
  const [attendanceStatus, setAttendanceStatus] = useState({ checked_in: false, completed: false });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (user) fetchStatus();
  }, [user]);

  async function fetchStatus() {
    try {
      const { data } = await api.get('/attendance/status');
      setAttendanceStatus(data);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.neutral[50] }}>
        <Typography
          variant="h4"
          sx={{ color: 'primary.main', fontWeight: 700, animation: `${brandPulse} 1.5s infinite ease-in-out` }}
        >
          Dayflow
        </Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/signin" />;

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
          {/* Check-in/out control */}
          {attendanceStatus.completed ? (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label={`Done (${attendanceStatus.check_in} - ${attendanceStatus.check_out})`}
              color="success"
              variant="outlined"
              size="small"
            />
          ) : !attendanceStatus.checked_in ? (
            <Button variant="outlined" onClick={handleCheckIn} size="small" sx={{ borderRadius: 2 }}>
              Check In →
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Since {attendanceStatus.check_in}
              </Typography>
              <Button variant="contained" onClick={handleCheckOut} size="small" sx={{ borderRadius: 2 }}>
                Check Out →
              </Button>
            </Box>
          )}

          <Circle
            sx={{
              color: attendanceStatus.checked_in ? colors.success.main : attendanceStatus.completed ? colors.success.main : colors.error.main,
              fontSize: 12
            }}
          />

          {/* Avatar dropdown */}
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
    </Box>
  );
}
