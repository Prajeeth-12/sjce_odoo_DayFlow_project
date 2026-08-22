import { Chip } from '@mui/material';

const variants = {
  present: { label: 'Present', color: 'success', sx: { bgcolor: 'success.light', color: 'success.dark' } },
  absent: { label: 'Absent', color: 'error', sx: { bgcolor: 'error.light', color: 'error.dark' } },
  leave: { label: 'On Leave', color: 'info', sx: { bgcolor: 'info.light', color: 'info.dark' } },
  'half-day': { label: 'Half Day', color: 'warning', sx: { bgcolor: 'warning.light', color: 'warning.dark' } },
  pending: { label: 'Pending', color: 'warning', sx: { bgcolor: 'warning.light', color: 'warning.dark' } },
  approved: { label: 'Approved', color: 'success', sx: { bgcolor: 'success.light', color: 'success.dark' } },
  rejected: { label: 'Rejected', color: 'error', sx: { bgcolor: 'error.light', color: 'error.dark' } },
};

export default function StatusBadge({ status, size = 'small' }) {
  const v = variants[status] || { label: status, sx: {} };
  return (
    <Chip
      label={v.label}
      size={size}
      sx={{ fontWeight: 600, fontSize: '0.7rem', ...v.sx, border: 'none' }}
    />
  );
}
