import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert, Grid } from '@mui/material';
import api from '../../services/api';

export default function CreateEmployee() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', mobile: '',
    department: '', job_position: '', location: '', date_of_joining: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/employees', form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    }
  }

  if (result) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>Employee created successfully!</Alert>
          <Typography variant="body1"><strong>Login ID:</strong> {result.login_id}</Typography>
          <Typography variant="body1"><strong>Temporary Password:</strong> {result.temporary_password}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Share these credentials with the employee. They can change the password after first login.
          </Typography>
          <Button variant="contained" sx={{ mt: 3, bgcolor: '#714B67' }} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>New Employee</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <TextField fullWidth label="First Name" value={form.first_name} onChange={handleChange('first_name')} margin="dense" required />
            <TextField fullWidth label="Last Name" value={form.last_name} onChange={handleChange('last_name')} margin="dense" required />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} margin="dense" required />
            <TextField fullWidth label="Mobile" value={form.mobile} onChange={handleChange('mobile')} margin="dense" />
            <TextField fullWidth label="Department" value={form.department} onChange={handleChange('department')} margin="dense" />
            <TextField fullWidth label="Job Position" value={form.job_position} onChange={handleChange('job_position')} margin="dense" />
            <TextField fullWidth label="Location" value={form.location} onChange={handleChange('location')} margin="dense" />
            <TextField fullWidth label="Date of Joining" type="date" value={form.date_of_joining} onChange={handleChange('date_of_joining')} margin="dense" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#714B67' }}>Create Employee</Button>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
