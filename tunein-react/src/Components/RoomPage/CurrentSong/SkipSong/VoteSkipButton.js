import React, { useState } from 'react';
import { Button, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const VoteSkipButton = ({ skipData, loading, error, onVote }) => {
  const [isVoting, setIsVoting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Mobile + Tablet
  
  const hasVoted = skipData?.hasUserVoted || false;
  const isDisabled = loading || isVoting || !skipData;

  const handleVote = async () => {
    if (isDisabled) return;
    
    setIsVoting(true);
    try {
      await onVote();
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <Button
        variant={hasVoted ? "outlined" : "contained"}
        color={hasVoted ? "warning" : "secondary"}
        startIcon={
          !isMobile && (
            isVoting ? <CircularProgress size={16} /> : hasVoted ? <RemoveCircleOutlineIcon /> : <HowToVoteIcon />
          )
        }
        onClick={handleVote}
        disabled={isDisabled}
        size="small"
        sx={{
          bgcolor: hasVoted ? 'transparent' : '#ff9800',
          borderColor: hasVoted ? '#ff9800' : 'transparent',
          color: hasVoted ? '#ff9800' : 'white',
          '&:hover': { 
            bgcolor: hasVoted ? 'rgba(255, 152, 0, 0.1)' : '#f57c00',
            borderColor: hasVoted ? '#ff9800' : 'transparent'
          },
          '&:disabled': {
            borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            color: 'rgba(255,255,255,0.3)',
          },
          textTransform: 'none',
          minWidth: isMobile ? '36px' : '120px',
          height: '36px',
          // Mobile/Tablet: Show only icon, no text, no startIcon
          ...(isMobile && {
            padding: '6px',
            '& .MuiButton-startIcon': {
              display: 'none' // Hide startIcon on mobile
            }
          })
        }}
      >
        {isMobile ? (
          isVoting ? (
            <CircularProgress size={16} sx={{ color: 'inherit' }} />
          ) : hasVoted ? (
            '✖' // X symbol for remove vote
          ) : (
            '⏭' // Skip symbol for vote
          )
        ) : (
          isVoting 
            ? 'Processing...' 
            : hasVoted 
              ? 'Remove Vote' 
              : 'Vote to Skip'
        )}
      </Button>

      {/* Show error below button (only on desktop to save space) */}
      {error && !isMobile && (
        <Alert severity="error" size="small" sx={{ mt: 1, maxWidth: '200px' }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default VoteSkipButton;