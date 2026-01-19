import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

const CountDownMessage = ({ countdownData }) => {
  const [countdown, setCountdown] = useState(null);
  const [nextSongInfo, setNextSongInfo] = useState(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (countdownData) {
      // Clear signal received
      if (countdownData.clear || countdownData.countdown <= 0) {
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

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

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
