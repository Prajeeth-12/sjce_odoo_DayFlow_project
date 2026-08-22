import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, CardActionArea, Typography, Avatar,
  Button, TextField, InputAdornment
} from '@mui/material';
import { Search, Add, PeopleOutlined, CheckCircleOutlined, FlightTakeoff, WarningAmber } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../design/components/StatCard';
import PageHeader from '../../design/components/PageHeader';
import EmptyState from '../../design/components/EmptyState';
import { CardSkeleton, StatCardSkeleton } from '../../design/components/SkeletonLoader';
import { staggerContainer, staggerItem, pulseGreen } from '../../design/animations';
import { colors } from '../../design/tokens';

function StatusDot({ status }) {
  if (status === 'present') return (
    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.success.main, animation: `${pulseGreen} 2s infinite` }} />
  );
  if (status === 'leave') return <FlightTakeoff sx={{ color: colors.info.main, fontSize: 14 }} />;
  return <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.warning.main }} />;
}

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSearch(value) {
    setSearch(value);
    if (value.trim()) {
      const { data } = await api.get(`/employees/search?q=${value}`);
      setEmployees(data);
    } else {
      fetchEmployees();
    }
  }

  const present = employees.filter(e => e.attendance_status === 'present').length;
  const onLeave = employees.filter(e => e.attendance_status === 'leave').length;
  const absent = employees.filter(e => e.attendance_status === 'absent').length;

  return (
    <Box>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} team members`}
        action={
          isAdmin && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employees/new')}>
              New Employee
            </Button>
          )
        }
      />

      {/* Stat Cards */}
      {loading ? <StatCardSkeleton /> : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard title="Total" value={employees.length} icon={<PeopleOutlined />} color="primary" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard title="Present" value={present} icon={<CheckCircleOutlined />} color="success" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard title="On Leave" value={onLeave} icon={<FlightTakeoff />} color="info" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard title="Absent" value={absent} icon={<WarningAmber />} color="warning" />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
          sx={{ width: 320 }}
        />
      </Box>

      {/* Employee Grid */}
      {loading ? <CardSkeleton /> : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description={isAdmin ? "Add your first team member to get started." : "No employees match your search."}
          action={isAdmin ? { label: 'Add Employee', onClick: () => navigate('/employees/new') } : undefined}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <Grid container spacing={2}>
            {employees.map(emp => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={emp.id}>
                <motion.div variants={staggerItem}>
                  <Card sx={{ '&:hover': { transform: 'translateY(-3px)' } }}>
                    <CardActionArea onClick={() => navigate(`/employees/${emp.id}`)}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, position: 'relative' }}>
                        <Avatar
                          src={emp.profile_picture ? `http://localhost:3000${emp.profile_picture}` : undefined}
                          sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '0.9rem' }}
                        >
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" noWrap>
                            {emp.first_name} {emp.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {emp.job_position || emp.department || 'No role assigned'}
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'absolute', top: 12, right: 16 }}>
                          <StatusDot status={emp.attendance_status} />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </Box>
  );
}
