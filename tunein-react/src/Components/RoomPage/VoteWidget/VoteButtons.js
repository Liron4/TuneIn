import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const VoteButtons = ({ 
  votingData, 
  onVote, 
  isVotingDisabled 
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
        Vote on Current Song
      </Typography>

      {/* Vote Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={() => onVote('like')}
            disabled={isVotingDisabled}
            sx={{
              color: votingData.userVote === 'like' ? '#4caf50' : 'rgba(255,255,255,0.7)',
              bgcolor: votingData.userVote === 'like' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: isVotingDisabled ? 'transparent' : 'rgba(76, 175, 80, 0.1)',
              },
              '&:disabled': {
                color: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            <ThumbUpIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {votingData.likeVotes}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={() => onVote('dislike')}
            disabled={isVotingDisabled}
            sx={{
              color: votingData.userVote === 'dislike' ? '#f44336' : 'rgba(255,255,255,0.7)',
              bgcolor: votingData.userVote === 'dislike' ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: isVotingDisabled ? 'transparent' : 'rgba(244, 67, 54, 0.1)',
              },
              '&:disabled': {
                color: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            <ThumbDownIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {votingData.dislikeVotes}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default VoteButtons;