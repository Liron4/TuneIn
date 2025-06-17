import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const VotingWidget = ({ currentSong }) => {
  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 2, 
      bgcolor: 'rgba(33, 33, 33, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <HowToVoteIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 48, mb: 2 }} />
      <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
        Voting Widget
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
        Coming Soon...
      </Typography>
    </Paper>
  );
};

export default VotingWidget;