import React from 'react';
import { 
  Typography, Button, Box, Grid, Card, CardContent, 
  CircularProgress, Paper, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Groups as GroupsIcon,
  NetworkCheck as NetworkIcon
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

const HostGroupSection = ({ hostGroups, loading, onAddGroupClick }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupsIcon color="primary" />
          Host Groups ({hostGroups.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddGroupClick}
          size="medium"
          sx={{ 
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add New Group
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      <Grid container spacing={2}>
        {hostGroups.map(group => (
          <Grid item xs={12} sm={6} lg={4} key={group.groupid}>
            <StyledCard>
              <StyledCardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <GroupsIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    {group.name}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NetworkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Group ID: <strong>{group.groupid}</strong>   
                  </Typography>
                </Box>
              </StyledCardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {hostGroups.length === 0 && !loading && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            mt: 2,
          }}
        >
          <GroupsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No host groups found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first host group to organize your hosts
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default HostGroupSection;