import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, IconButton, Tooltip, Badge
} from '@mui/material';
import {
  PeopleOutlined, AccessTimeOutlined, EventAvailableOutlined,
  PaymentsOutlined, SettingsOutlined, ChevronLeft, Menu,
  LogoutOutlined
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../tokens';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

const navItems = [
  { label: 'Employees', icon: PeopleOutlined, path: '/dashboard', group: 'main' },
  { label: 'Attendance', icon: AccessTimeOutlined, path: '/attendance', group: 'time' },
  { label: 'Time Off', icon: EventAvailableOutlined, path: '/timeoff', group: 'time' },
  { label: 'Settings', icon: SettingsOutlined, path: '/settings', group: 'admin', adminOnly: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { employee, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <Box
      sx={{
        width,
        minWidth: width,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1200,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
            Dayflow
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
          {collapsed ? <Menu fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {navItems
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 44,
                      px: collapsed ? 2 : 2,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: active ? 'rgba(113, 75, 103, 0.08)' : 'transparent',
                      borderLeft: active ? `3px solid ${colors.brand[500]}` : '3px solid transparent',
                      '&:hover': { bgcolor: 'rgba(113, 75, 103, 0.05)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: active ? 'primary.main' : 'text.secondary' }}>
                      <item.icon fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: active ? 600 : 400,
                          color: active ? 'primary.main' : 'text.primary',
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
      </List>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
          {employee?.first_name?.[0]}{employee?.last_name?.[0]}
        </Avatar>
        {!collapsed && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {employee?.first_name} {employee?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {isAdmin ? 'Admin' : 'Employee'}
            </Typography>
          </Box>
        )}
        {!collapsed && (
          <Tooltip title="Logout">
            <IconButton size="small" onClick={() => { logout(); navigate('/signin'); }}>
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED };
