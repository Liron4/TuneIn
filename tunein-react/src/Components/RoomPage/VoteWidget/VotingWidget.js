import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { useSocket } from '../Context/SocketContext';
import { useUserProfile } from './hooks/useUserProfile'; // Fixed: lowercase 'hooks'
import { useVotingData } from './hooks/useVotingData';   // Fixed: lowercase 'hooks'
import ViewerCount from './ViewerCount';
import VoteButtons from './VoteButtons';
import VoteStatus from './VoteStatus';

const VotingWidget = () => { // No props needed anymore!
  const { isConnected } = useSocket();
  const { userProfile, isLoading } = useUserProfile();
  const { votingData, submitVote, getCurrentSong } = useVotingData(userProfile);

  // Get current song from global function
  const currentSong = getCurrentSong();

  // Voting logic
  const handleVote = async (voteType) => {
    if (!currentSong || !userProfile || !isConnected) {
      console.log('Cannot vote: missing requirements', {
        hasSong: !!currentSong,
        hasProfile: !!userProfile,
        isConnected
      });
      return;
    }

    // Prevent voting on own song
    if (currentSong.addedBy === userProfile.username) {
      console.log('Cannot vote on own song');
      return;
    }

    await submitVote(voteType); // No need to pass currentSong anymore
  };

  // Check if voting should be disabled
  const isVotingDisabled = () => {
    if (!currentSong) return true; // No song playing
    if (!userProfile) return true; // User not loaded
    if (currentSong.addedBy === userProfile.username) return true; // User's own song
    return false;
  };

  if (isLoading) {
    return (
      <Paper sx={{ 
        p: 2, 
        borderRadius: 2, 
        bgcolor: 'rgba(33, 33, 33, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Loading...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 2, 
      bgcolor: 'rgba(33, 33, 33, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      minHeight: '200px'
    }}>
      {/* Viewer Count Component */}
      <ViewerCount currentViewers={votingData.currentViewers} />
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

      {/* Voting Section */}
      {currentSong ? (
        <Box>
          {/* Vote Buttons Component */}
          <VoteButtons
            votingData={votingData}
            onVote={handleVote}
            isVotingDisabled={isVotingDisabled()}
          />

          {/* Vote Status Component */}
          <VoteStatus
            currentSong={currentSong}
            userProfile={userProfile}
            votingData={votingData}
            isVotingDisabled={isVotingDisabled()}
          />
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            No song playing
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Voting will be available when music starts
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VotingWidget;