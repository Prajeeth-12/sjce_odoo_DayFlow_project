import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { staggerItem } from '../animations';

export default function StatCard({ title, value, icon, color = 'primary', trend }) {
  const colorMap = {
    primary: { bg: 'rgba(113, 75, 103, 0.08)', text: '#714B67' },
    success: { bg: 'rgba(16, 185, 129, 0.08)', text: '#047857' },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', text: '#b45309' },
    error: { bg: 'rgba(239, 68, 68, 0.08)', text: '#b91c1c' },
    info: { bg: 'rgba(59, 130, 246, 0.08)', text: '#1d4ed8' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div variants={staggerItem}>
      <Paper
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { borderColor: c.text, borderColorOpacity: 0.2 },
        }}
      >
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: c.bg,
              color: c.text,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ color: c.text, mt: 0.25 }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </Typography>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
}
