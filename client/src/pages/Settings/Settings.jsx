import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../services/api';
import PageHeader from '../../design/components/PageHeader';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try { const { data } = await api.get('/settings'); setSettings(data); } catch {}
  }

  async function handleSave() {
    try {
      await api.put('/settings', {
        company_name: settings.company_name,
        working_days_per_week: settings.working_days_per_week,
        break_time_hours: settings.break_time_hours,
        public_holidays: settings.public_holidays
      });
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Failed to save'); }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await api.post('/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings({ ...settings, logo_path: data.logo_path });
      setMessage('Logo uploaded');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Logo upload failed'); }
  }

  function addHoliday() {
    if (!newHoliday.date || !newHoliday.name) return;
    const holidays = [...(settings.public_holidays || []), newHoliday];
    holidays.sort((a, b) => a.date.localeCompare(b.date));
    setSettings({ ...settings, public_holidays: holidays });
    setNewHoliday({ date: '', name: '' });
  }

  function removeHoliday(idx) {
    const holidays = settings.public_holidays.filter((_, i) => i !== idx);
    setSettings({ ...settings, public_holidays: holidays });
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
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          {settings.logo_path && (
            <Box component="img" src={`http://localhost:3000${settings.logo_path}`} sx={{ height: 40, borderRadius: 1 }} />
          )}
          <Button variant="outlined" component="label" size="small">
            Upload Logo
            <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
          </Button>
        </Box>
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
            label="Break Time (hours)" type="number" slotProps={{ htmlInput: { step: 0.5 } }}
            value={settings.break_time_hours}
            onChange={e => setSettings({ ...settings, break_time_hours: parseFloat(e.target.value) })}
            sx={{ flex: 1 }}
          />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Public Holidays</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField size="small" label="Date" type="date" value={newHoliday.date} onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField size="small" label="Holiday Name" value={newHoliday.name} onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })} sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" onClick={addHoliday} startIcon={<Add />}>Add</Button>
        </Box>
        <List dense>
          {(settings.public_holidays || []).map((h, i) => (
            <ListItem key={i} secondaryAction={<IconButton size="small" onClick={() => removeHoliday(i)}><Delete fontSize="small" /></IconButton>}>
              <ListItemText primary={h.name} secondary={h.date} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Button variant="contained" onClick={handleSave} sx={{ px: 4 }}>
        Save Changes
      </Button>
    </motion.div>
  );
}
