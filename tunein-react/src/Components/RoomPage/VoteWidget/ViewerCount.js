import React from 'react';
import { Box, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useSocket } from '../Context/SocketContext';

const ViewerCount = ({ currentViewers }) => {
  const { isConnected } = useSocket();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <PeopleIcon sx={{ color: isConnected ? '#4caf50' : '#f44336', mr: 1 }} />
      <Typography variant="body2" sx={{ color: 'white' }}>
        {currentViewers} viewer{currentViewers !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};

export default ViewerCount;