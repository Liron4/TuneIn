import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useSocket } from '../Context/SocketContext';
import { useLiveViewers } from './useLiveViewers';
import CreatorSkipButton from './CreatorSkipButton';
import VoteSkipButton from './VoteSkipButton';
import SkipVoteDisplay from './SkipVoteDisplay';

const SkipSong = ({ onSkip }) => {
  const { roomId } = useSocket();
  const [isCreator, setIsCreator] = useState(false);

  // Check if user is room creator
  useEffect(() => {
    const checkCreator = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        
        if (!token || !roomId || !userId) return;

        const roomResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setIsCreator(roomResponse.data.creator === userId);
      } catch (err) {
        console.error('Error checking creator status:', err);
      }
    };

    checkCreator();
  }, [roomId]);

  // **FIX**: Always use live viewers hook (creators need viewer data too)
  const { skipData, loading, error, submitSkipVote } = useLiveViewers(roomId, false); // Pass false to always get data

  if (isCreator) {
    // **ENHANCED**: Creator sees viewer data + their special skip button
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: '200px' }}>
        <CreatorSkipButton onSkip={onSkip} />
        
        {/* Creator also sees viewer tracking */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Room Creator - Instant Skip
          </Typography>
          <SkipVoteDisplay skipData={skipData} showCreatorMode={true} />
        </Box>
      </Box>
    );
  }

  // Regular user voting system
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: '200px' }}>
      <VoteSkipButton
        skipData={skipData}
        loading={loading}
        error={error}
        onVote={submitSkipVote}
      />
      <SkipVoteDisplay skipData={skipData} showCreatorMode={false} />
    </Box>
  );
};

export default SkipSong;