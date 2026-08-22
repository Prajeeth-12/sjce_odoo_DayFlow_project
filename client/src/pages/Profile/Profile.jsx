import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Paper, Avatar, Typography, Tabs, Tab, Grid, TextField, Button, Chip
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function ResumeTab({ data, editable, onSave }) {
  const [form, setForm] = useState({ about: data.about || '', job_love: data.job_love || '', hobbies: data.hobbies || '' });
  const [skills, setSkills] = useState(data.skills || []);
  const [newSkill, setNewSkill] = useState('');

  async function handleSave() {
    await onSave(form);
  }

  async function addSkill() {
    if (!newSkill.trim()) return;
    try {
      await api.post(`/employees/${data.id}/skills`, { skill_name: newSkill });
      setSkills([...skills, { skill_name: newSkill }]);
      setNewSkill('');
    } catch {}
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom>About</Typography>
          <TextField fullWidth multiline rows={3} value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} disabled={!editable} />

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>What I love about my job</Typography>
          <TextField fullWidth multiline rows={3} value={form.job_love} onChange={e => setForm({ ...form, job_love: e.target.value })} disabled={!editable} />

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>My interests and hobbies</Typography>
          <TextField fullWidth multiline rows={3} value={form.hobbies} onChange={e => setForm({ ...form, hobbies: e.target.value })} disabled={!editable} />

          {editable && <Button variant="outlined" sx={{ mt: 2 }} onClick={handleSave}>Save</Button>}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom>Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {skills.map((s, i) => <Chip key={i} label={s.skill_name} />)}
          </Box>
          {editable && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add skill" />
              <Button variant="outlined" size="small" onClick={addSkill}>+ Add</Button>
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Certifications</Typography>
          {(data.certifications || []).map((c, i) => (
            <Typography key={i} variant="body2">{c.name} - {c.issuer}</Typography>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

function PrivateInfoTab({ data, editable, onSave }) {
  const [form, setForm] = useState({
    date_of_birth: data.date_of_birth || '', address: data.address || '',
    nationality: data.nationality || '', personal_email: data.personal_email || '',
    gender: data.gender || '', marital_status: data.marital_status || '',
    date_of_joining: data.date_of_joining || ''
  });
  const [bank, setBank] = useState(data.bank_details || {});

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Date of Birth" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} margin="dense" disabled={!editable} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField fullWidth label="Residing Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="Nationality" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="Personal Email" value={form.personal_email} onChange={e => setForm({ ...form, personal_email: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="Marital Status" value={form.marital_status} onChange={e => setForm({ ...form, marital_status: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="Date of Joining" type="date" value={form.date_of_joining} onChange={e => setForm({ ...form, date_of_joining: e.target.value })} margin="dense" disabled={!editable} slotProps={{ inputLabel: { shrink: true } }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Bank Details</Typography>
        <TextField fullWidth label="Account Number" value={bank.account_number || ''} onChange={e => setBank({ ...bank, account_number: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="Bank Name" value={bank.bank_name || ''} onChange={e => setBank({ ...bank, bank_name: e.target.value })} margin="dense" disabled={!editable} />
        <TextField fullWidth label="IFSC Code" value={bank.ifsc_code || ''} onChange={e => setBank({ ...bank, ifsc_code: e.target.value })} margin="dense" disabled={!editable} />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Identity</Typography>
        <TextField fullWidth label="PAN No" value={data.pan_no || ''} margin="dense" disabled />
        <TextField fullWidth label="UAN NO" value={data.uan_no || ''} margin="dense" disabled />
        <TextField fullWidth label="Emp Code" value={data.emp_code || ''} margin="dense" disabled />
      </Grid>
      {editable && (
        <Grid size={12}>
          <Button variant="outlined" onClick={() => onSave({ ...form, bank_details: bank })}>Save</Button>
        </Grid>
      )}
    </Grid>
  );
}

function SalaryInfoTab({ employeeId }) {
  const [salary, setSalary] = useState(null);

  useEffect(() => {
    api.get(`/payroll/${employeeId}`).then(({ data }) => setSalary(data)).catch(() => {});
  }, [employeeId]);

  if (!salary) return <Typography>No salary data</Typography>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="caption">Month Wage</Typography>
          <Typography variant="h6">₹{salary.monthly_wage?.toLocaleString()}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="caption">Yearly Wage</Typography>
          <Typography variant="h6">₹{salary.yearly_wage?.toLocaleString()}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="caption">Working Days/Week</Typography>
          <Typography variant="h6">{salary.working_days_per_week}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="caption">Break Time</Typography>
          <Typography variant="h6">{salary.break_time_hours} hrs</Typography>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Salary Components</Typography>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& td, & th': { p: 1, borderBottom: '1px solid #eee', textAlign: 'left' } }}>
        <thead>
          <tr><th>Component</th><th>Amount (₹/month)</th><th>%</th></tr>
        </thead>
        <tbody>
          <tr><td>Basic Salary</td><td>₹{salary.components.basic_salary.toLocaleString()}</td><td>{salary.percentages.basic_salary_pct}%</td></tr>
          <tr><td>House Rent Allowance</td><td>₹{salary.components.hra.toLocaleString()}</td><td>{salary.percentages.hra_pct}% of Basic</td></tr>
          <tr><td>Standard Allowance</td><td>₹{salary.components.standard_allowance.toLocaleString()}</td><td>{salary.percentages.standard_allowance_pct}%</td></tr>
          <tr><td>Performance Bonus</td><td>₹{salary.components.performance_bonus.toLocaleString()}</td><td>{salary.percentages.performance_bonus_pct}%</td></tr>
          <tr><td>Leave Travel Allowance</td><td>₹{salary.components.lta.toLocaleString()}</td><td>{salary.percentages.lta_pct}%</td></tr>
          <tr><td>Fixed Allowance</td><td>₹{salary.components.fixed_allowance.toLocaleString()}</td><td>Remainder</td></tr>
        </tbody>
      </Box>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>Provident Fund (PF)</Typography>
      <Typography variant="body2">Employee: ₹{salary.deductions.pf_employee.toLocaleString()} ({salary.percentages.pf_employee_pct}% of Basic)</Typography>
      <Typography variant="body2">Employer: ₹{salary.deductions.pf_employer.toLocaleString()} ({salary.percentages.pf_employer_pct}% of Basic)</Typography>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>Tax Deductions</Typography>
      <Typography variant="body2">Professional Tax: ₹{salary.deductions.professional_tax}/month</Typography>
    </Box>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setMessage('Passwords do not match');
    }
    try {
      await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  }

  return (
    <Box sx={{ maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Current Password" type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} margin="dense" required />
        <TextField fullWidth label="New Password" type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} margin="dense" required />
        <TextField fullWidth label="Confirm New Password" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} margin="dense" required />
        <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#714B67' }}>Change Password</Button>
      </form>
      {message && <Typography color="primary" sx={{ mt: 1 }}>{message}</Typography>}
    </Box>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user, employee: currentEmployee, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(0);

  const isOwnProfile = !id || (currentEmployee && parseInt(id) === currentEmployee.id);
  const targetId = id || currentEmployee?.id;

  useEffect(() => {
    if (targetId) fetchProfile();
  }, [targetId]);

  async function fetchProfile() {
    try {
      const { data } = await api.get(`/employees/${targetId}`);
      setData(data);
    } catch {}
  }

  async function handleSave(updates) {
    try {
      await api.put(`/employees/${targetId}`, updates);
      fetchProfile();
    } catch {}
  }

  if (!data) return null;

  const editable = isOwnProfile || isAdmin;
  const showSalary = isAdmin;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#714B67', fontSize: 28 }}>
            {data.first_name?.[0]}{data.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>{data.first_name} {data.last_name}</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6, md: 3 }}><Typography variant="caption">Login ID</Typography><Typography variant="body2">{data.login_id}</Typography></Grid>
              <Grid size={{ xs: 6, md: 3 }}><Typography variant="caption">Email</Typography><Typography variant="body2">{data.email}</Typography></Grid>
              <Grid size={{ xs: 6, md: 3 }}><Typography variant="caption">Mobile</Typography><Typography variant="body2">{data.mobile || '-'}</Typography></Grid>
              <Grid size={{ xs: 6, md: 3 }}><Typography variant="caption">Job Position</Typography><Typography variant="body2">{data.job_position || '-'}</Typography></Grid>
            </Grid>
          </Box>
          <Box>
            <Grid container spacing={1}>
              <Grid size={12}><Typography variant="caption">Company</Typography><Typography variant="body2">{data.company || '-'}</Typography></Grid>
              <Grid size={12}><Typography variant="caption">Department</Typography><Typography variant="body2">{data.department || '-'}</Typography></Grid>
              <Grid size={12}><Typography variant="caption">Location</Typography><Typography variant="body2">{data.location || '-'}</Typography></Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Resume" />
          <Tab label="Private Info" />
          {showSalary && <Tab label="Salary Info" />}
          {isOwnProfile && <Tab label="Security" />}
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3, mt: 1 }}>
        {tab === 0 && <ResumeTab data={data} editable={editable} onSave={handleSave} />}
        {tab === 1 && <PrivateInfoTab data={data} editable={editable} onSave={handleSave} />}
        {tab === 2 && showSalary && <SalaryInfoTab employeeId={targetId} />}
        {tab === (showSalary ? 3 : 2) && isOwnProfile && <SecurityTab />}
      </Paper>
    </Box>
  );
}
