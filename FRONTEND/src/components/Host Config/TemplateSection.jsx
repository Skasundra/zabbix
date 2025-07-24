import React from 'react';
import { 
  Typography, Button, Box, Grid, Card, CardContent, 
  CircularProgress, Paper, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Description as TemplateIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: '300px',
  minHeight: '200px',
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

const TemplateSection = ({ templates, displayedTemplateCount, loading, onAddTemplateClick, onLoadMoreClick, hasMore }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TemplateIcon color="primary" />
          Templates ({templates.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddTemplateClick}
          size="medium"
          sx={{ 
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add New Template
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      <Grid container spacing={2}>
        {templates.slice(0, displayedTemplateCount).map(template => (
          <Grid item xs={12} sm={6} lg={4} key={template.templateid}>
            <StyledCard>
              <StyledCardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TemplateIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    {template.name}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NetworkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Template ID: <strong>{template.templateid}</strong>   
                  </Typography>
                </Box>
              </StyledCardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {hasMore && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onLoadMoreClick}
            size="medium"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {templates.length === 0 && !loading && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            mt: 2,
          }}
        >
          <TemplateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first template to define monitoring configurations
          </Typography>
        </Paper>
      )}
    </Box>  
  );
};

export default TemplateSection;