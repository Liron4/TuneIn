import React, { useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSocket } from '../../Context/SocketContext';
import { useLiveViewers } from './useLiveViewers';
import CreatorSkipButton from './CreatorSkipButton';
import VoteSkipButton from './VoteSkipButton';
import SkipVoteDisplay from './SkipVoteDisplay';

const SkipSong = ({ onSkip }) => {
  const { roomId, roomCreator } = useSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Mobile/Tablet

  // Check if user is room creator using context data
  const isCreator = useMemo(() => {
    const userId = localStorage.getItem('userId');
    return userId && roomCreator && roomCreator._id === userId;
  }, [roomCreator]);

  // Always use live viewers hook (creators need viewer data too)
  const { skipData, loading, error, submitSkipVote } = useLiveViewers(roomId, false);

  if (isCreator) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: { xs: 0.5, md: 1 }, // Reduced gap on mobile
        minWidth: isMobile ? 'auto' : '200px', // Auto width on mobile
        alignItems: 'flex-end',
        overflow: 'hidden', // Prevent overflow
        maxWidth: '100%' // Don't exceed container width
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: { xs: 0.5, md: 1 }, // Reduced gap on mobile
          overflow: 'hidden',
          maxWidth: '100%'
        }}>
          <CreatorSkipButton onSkip={onSkip} />
          <SkipVoteDisplay skipData={skipData} showCreatorMode={true} />
        </Box>
        {!isMobile && ( // Hide subtitle on mobile to save space
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Room Creator - Instant Skip
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: { xs: 0.5, md: 1 }, // Reduced gap on mobile
      minWidth: isMobile ? 'auto' : '200px', // Auto width on mobile
      alignItems: 'flex-end',
      overflow: 'hidden', // Prevent overflow
      maxWidth: '100%' // Don't exceed container width
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: { xs: 0.5, md: 1 }, // Reduced gap on mobile
        overflow: 'hidden',
        maxWidth: '100%'
      }}>
        <VoteSkipButton
          skipData={skipData}
          loading={loading}
          error={error}
          onVote={submitSkipVote}
        />
        <SkipVoteDisplay skipData={skipData} showCreatorMode={false} />
      </Box>
    </Box>
  );
};

export default SkipSong;