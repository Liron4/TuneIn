import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

const CountDownMessage = ({ countdownData }) => {
  const [countdown, setCountdown] = useState(null);
  const [nextSongInfo, setNextSongInfo] = useState(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    // When new countdown data arrives
    if (countdownData) {
      console.log('CountDownMessage: Received countdown data:', countdownData);
      
      // **BUG FIX #1**: Check if this is a clear signal
      if (countdownData.clear || countdownData.countdown <= 0) {
        console.log('CountDownMessage: Clearing countdown');
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setCountdown(null);
        setNextSongInfo(null);
        return;
      }

      setCountdown(countdownData.countdown);
      setNextSongInfo(countdownData.nextSong);

      // Clear any existing countdown interval
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

      // Start countdown interval
      let secondsLeft = countdownData.countdown;
      countdownRef.current = setInterval(() => {
        secondsLeft -= 1;
        setCountdown(secondsLeft);

        if (secondsLeft <= 0) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCountdown(null);
          setNextSongInfo(null);
        }
      }, 1000);
    }

    // Cleanup interval on unmount
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [countdownData]);

  // Don't render if no countdown active
  if (countdown === null || countdown <= 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        textAlign: 'center', 
        bgcolor: 'rgba(29, 185, 84, 0.2)', 
        borderRadius: 2, 
        mb: 2 
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white', 
          fontSize: { xs: '1rem', md: '1.25rem' } 
        }}
      >
        Next song in {countdown}...
      </Typography>
      {nextSongInfo && (
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            mt: 1, 
            fontSize: { xs: '0.875rem', md: '1rem' } 
          }}
        >
          Coming up: {nextSongInfo.title}
        </Typography>
      )}
    </Box>
  );
};

export default CountDownMessage;
