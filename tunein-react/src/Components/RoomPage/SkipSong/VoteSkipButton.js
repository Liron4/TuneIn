import React from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const VoteSkipButton = ({ skipData, loading, error, onVote }) => {
  const { hasUserVoted } = skipData;

  return (
    <>
      <Button
        variant={hasUserVoted ? "outlined" : "contained"}
        color={hasUserVoted ? "warning" : "secondary"}
        startIcon={loading ? <CircularProgress size={20} /> : <HowToVoteIcon />}
        onClick={onVote}
        disabled={loading}
        sx={{
          bgcolor: hasUserVoted ? 'transparent' : '#ff9800',
          borderColor: hasUserVoted ? '#ff9800' : 'transparent',
          '&:hover': { 
            bgcolor: hasUserVoted ? 'rgba(255, 152, 0, 0.1)' : '#f57c00' 
          },
          minWidth: '120px'
        }}
      >
        {loading 
          ? 'Processing...' 
          : hasUserVoted 
            ? 'Remove Vote' 
            : 'Vote to Skip'
        }
      </Button>

      {error && (
        <Alert severity="error" size="small" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default VoteSkipButton;