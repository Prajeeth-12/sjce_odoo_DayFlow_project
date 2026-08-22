import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
  const [form, setForm] = useState({ company_name: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0e4ed 50%, #f8fafc 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        position: 'absolute', top: -200, right: -200,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(113,75,103,0.06) 0%, transparent 70%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <Paper sx={{ p: 5, width: 460, maxWidth: '90vw' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 0.5 }}>
              Dayflow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your admin account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Company Name" value={form.company_name} onChange={handleChange('company_name')} margin="dense" />
            <TextField fullWidth label="Full Name" value={form.name} onChange={handleChange('name')} margin="dense" required />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} margin="dense" required />
            <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} margin="dense" />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={handleChange('password')} margin="dense" required />
            <TextField fullWidth label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} margin="dense" required />

            <Button
              fullWidth type="submit" variant="contained" disabled={loading}
              sx={{ mt: 3, py: 1.5, fontSize: '0.9rem' }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
            Already have an account?{' '}
            <Link to="/signin" style={{ color: '#714B67', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
