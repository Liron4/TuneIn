import React from 'react';
import { Box, Typography } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';

const VoteStatus = ({ 
  currentSong, 
  userProfile, 
  votingData, 
  isVotingDisabled 
}) => {
  // Check if auto-skip threshold reached
  const shouldShowSkipWarning = () => {
    if (votingData.currentViewers === 0) return false;
    const dislikePercentage = (votingData.dislikeVotes / votingData.currentViewers) * 100;
    return dislikePercentage > 40; // Show warning at 40%, backend skips at 50%
  };

  return (
    <>
      {/* Status Messages */}
      {isVotingDisabled && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.5)', 
            textAlign: 'center', 
            display: 'block',
            mt: 1 
          }}
        >
          {currentSong?.addedBy === userProfile?.username 
            ? "Can't vote on your own song" 
            : "Voting unavailable"
          }
        </Typography>
      )}

      {/* Auto-skip warning */}
      {shouldShowSkipWarning() && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mt: 2,
          p: 1,
          bgcolor: 'rgba(244, 67, 54, 0.1)',
          borderRadius: 1 
        }}>
          <SkipNextIcon sx={{ color: '#f44336', mr: 1, fontSize: 16 }} />
          <Typography variant="caption" sx={{ color: '#f44336' }}>
            High dislike ratio - song may be skipped
          </Typography>
        </Box>
      )}
    </>
  );
};

export default VoteStatus;