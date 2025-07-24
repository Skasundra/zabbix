import React from 'react';
import { 
  Typography, Button, Box, Grid, Card, CardContent, 
  CircularProgress, Paper, Divider, Stack, Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Computer as ComputerIcon,
  NetworkCheck as NetworkIcon,
  CheckCircle as EnabledIcon,
  Cancel as DisabledIcon,
  Inventory as InventoryIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: '300px', // Fixed width for all cards
  minHeight: '200px', // Fixed height for all cards
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'enabled' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(status === 'disabled' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
}));

const HostSection = ({ hosts, loading, onAddHostClick, getInventoryModeLabel, getInventoryModeColor }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ComputerIcon color="primary" />
          Hosts ({hosts.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddHostClick}
          size="medium"
          sx={{ 
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add New Host
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      <Grid container spacing={2}>
        {hosts.map(host => (
          <Grid item xs={12} sm={6} lg={4} key={host.hostid}>
            <StyledCard>
              <StyledCardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    {host.host}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NetworkIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Host ID: <strong>{host.hostid}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {host.status === "0" ? (
                      <EnabledIcon fontSize="small" color="success" />
                    ) : (
                      <DisabledIcon fontSize="small" color="error" />
                    )}
                    <StatusChip
                      label={host.status === "0" ? "Enabled" : "Disabled"}
                      status={host.status === "0" ? "enabled" : "disabled"}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon fontSize="small" color="action" />
                    <Chip
                      label={getInventoryModeLabel(host.inventory_mode)}
                      color={getInventoryModeColor(host.inventory_mode)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </StyledCardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {hosts.length === 0 && !loading && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            mt: 2,
          }}
        >
          <ComputerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hosts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by adding your first host to the system
          </Typography>
        </Paper>
      )}
    </Box> 
  );
};

export default HostSection;