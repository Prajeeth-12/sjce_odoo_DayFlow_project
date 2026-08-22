import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

export default function EmptyState({ title, description, action, icon: Icon = InboxOutlined }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'rgba(113, 75, 103, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 32, color: 'primary.main', opacity: 0.7 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mb: 2 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="contained" color="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
