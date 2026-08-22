import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../services/api';
import PageHeader from '../../design/components/PageHeader';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try { const { data } = await api.get('/settings'); setSettings(data); } catch {}
  }

  async function handleSave() {
    try {
      await api.put('/settings', {
        company_name: settings.company_name,
        working_days_per_week: settings.working_days_per_week,
        break_time_hours: settings.break_time_hours
      });
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Failed to save'); }
  }

  if (!settings) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Settings" subtitle="Configure your workspace" />

      {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Company Information</Typography>
        <TextField
          fullWidth label="Company Name" value={settings.company_name}
          onChange={e => setSettings({ ...settings, company_name: e.target.value })}
          margin="dense"
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Work Schedule</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Working Days per Week" type="number"
            value={settings.working_days_per_week}
            onChange={e => setSettings({ ...settings, working_days_per_week: parseInt(e.target.value) })}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Break Time (hours)" type="number" inputProps={{ step: 0.5 }}
            value={settings.break_time_hours}
            onChange={e => setSettings({ ...settings, break_time_hours: parseFloat(e.target.value) })}
            sx={{ flex: 1 }}
          />
        </Box>
      </Paper>

      <Button variant="contained" onClick={handleSave} sx={{ px: 4 }}>
        Save Changes
      </Button>
    </motion.div>
  );
}
