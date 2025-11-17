import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import RadioIcon from '@mui/icons-material/Radio';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import axios from 'axios';
import MediaPlayer from './MediaPlayer';
import SongWidget from './SongWidget';
import { useSocket } from '../Context/SocketContext';
import SkipSong from './SkipSong/SkipSong';
import CountDownMessage from './CountDownMessage';



const CurrentSong = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [serverTimeDiff, setServerTimeDiff] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdownData, setCountdownData] = useState(null);
  const initialStartTimeRef = useRef(0); // **BUG FIX #2**: Store initial start time
  const { newSocket, roomId, isConnected } = useSocket();
  
  // **RADIO MODE**: Lift state up so it persists when MediaPlayer unmounts
  const [isRadioMode, setIsRadioMode] = useState(false);
  const audioContextRef = useRef(null); // Persist AudioContext across song changes

  useEffect(() => {
    if (!newSocket || !roomId) {
      console.log('CurrentSong: Waiting for socket connection...');
      return;
    }

    console.log('CurrentSong: Setting up socket listeners');

    // Listen for current song updates
    newSocket.on('currentSongUpdated', (data) => {
      setLoading(false);
      console.log('Received currentSongUpdated event:', data);

      if (data.currentSong) {
        const serverTime = data.serverTime;
        const clientTime = Date.now();
        const diff = serverTime - clientTime;
        setServerTimeDiff(diff);

        // **BUG FIX #2**: Calculate and store initial elapsed time
        const now = Date.now() + diff;
        const elapsed = Math.floor((now - data.currentSong.startTime) / 1000);
        initialStartTimeRef.current = elapsed;

        setCurrentSong(data.currentSong);
        // **BUG FIX #1**: Clear countdown with explicit null timestamp to force update
        setCountdownData({ countdown: 0, nextSong: null, clear: Date.now() });
      } else {
        setCurrentSong(null);
      }
    });

    // Listen for countdown updates
    newSocket.on('nextSongCountdown', (data) => {
      console.log('Received countdown event:', data);
      // **BUG FIX #1**: Pass countdown data to separate component
      // This prevents re-rendering CurrentSong and MediaPlayer
      setCountdownData({
        countdown: data.countdown,
        nextSong: data.nextSong
      });
    });

    // Cleanup listeners
    return () => {
      if (newSocket) {
        newSocket.off('currentSongUpdated');
        newSocket.off('nextSongCountdown');
      }
    };
  }, [newSocket, roomId]); // Dependencies: re-run when socket or roomId changes

  //***** Fetch current song on initial load - auto-start *****
  useEffect(() => {
    if (!roomId) return;

    const fetchCurrentSong = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;

        console.log('Fetching current song for room:', roomId);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/song/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Current song response:', response.data);

        if (response.data.currentSong) {
          // Calculate server-client time difference
          const serverTime = response.data.serverTime;
          const clientTime = Date.now();
          const diff = serverTime - clientTime;
          setServerTimeDiff(diff);

          // **BUG FIX #2**: Calculate and store initial elapsed time
          const now = Date.now() + diff;
          const elapsed = Math.floor((now - response.data.currentSong.startTime) / 1000);
          initialStartTimeRef.current = elapsed;

          setCurrentSong(response.data.currentSong);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching current song:', err);
        setError('Failed to load the current song');
        setLoading(false);
      }
    };

    fetchCurrentSong();
  }, [roomId]);

  // Calculate elapsed time since song started
  const getElapsedSeconds = () => {
    if (!currentSong || !currentSong.startTime) return 0;

    // Use server-adjusted time
    const now = Date.now() + serverTimeDiff;
    return Math.floor((now - currentSong.startTime) / 1000);
  };

  const handleSkipSuccess = () => {
    console.log('Song skipped successfully from SkipSong component');
    setError(null); // Clear any previous errors
  };

  // Toggle Radio Mode
  const toggleRadioMode = () => {
    // Create AudioContext on first click (if not already created)
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      console.log('🔊 AudioContext created and unlocked!');
    }
    
    setIsRadioMode(prev => {
      const newMode = !prev;
      console.log(`📻 Radio Mode ${newMode ? 'ENABLED' : 'DISABLED'}`);
      return newMode;
    });
  };


  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            mb: 2,
            fontWeight: 600
          }}
        >
          Now Playing
        </Typography>
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      mb: { xs: 2, md: 4 },
      width: '100%',
      minHeight: 'fit-content'
    }}>

      {/* Header section with SkipSong integration */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Change from 'center' to 'flex-start'
        mb: { xs: 1.5, md: 2 },
        minHeight: { xs: '32px', md: '36px' }, // Ensure consistent height
        gap: 1
      }}>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: {
              xs: '1.1rem',
              md: '1.25rem'
            },
            lineHeight: { xs: '32px', md: '36px' }, // Match the minHeight
            display: 'flex',
            alignItems: 'center' // Center the text vertically within its line height
          }}
        >
          Now Playing
        </Typography>

        {currentSong && (
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start', // Align to top to match Typography
            height: { xs: '32px', md: '36px' }, // Match the minHeight
            justifyContent: 'flex-end'
          }}>
            <SkipSong onSkip={handleSkipSuccess} />
          </Box>
        )}
      </Box>

      {error && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {/* Song progress widget */}
      <SongWidget
        key={currentSong?.startTime || 'no-song'} // Force re-mount for duplicate songs
        currentSong={currentSong}
        getElapsedSeconds={getElapsedSeconds}
      />

      {/* **BUG FIX #1**: Isolated countdown component prevents parent re-renders */}
      <CountDownMessage countdownData={countdownData} />

      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 2,
          bgcolor: 'rgba(0,0,0,0.4)',
          maxWidth: '100%',
          overflow: 'hidden',
          display: currentSong ? 'block' : 'none'
        }}
      >
        <MediaPlayer
          videoId={currentSong?.id || null}
          startTime={currentSong ? initialStartTimeRef.current : 0}
          songData={currentSong}
          isRadioMode={isRadioMode}
          setIsRadioMode={setIsRadioMode}
          audioContextRef={audioContextRef}
        />

        {currentSong && (
          <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'white',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: 1.3
                  }}
                >
                  {currentSong.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  Added by: {currentSong.addedby}
                </Typography>
              </Box>

              {/* Radio Mode Toggle - Elegant Chip Style */}
              <Chip
                icon={isRadioMode ? <RadioButtonCheckedIcon /> : <RadioIcon />}
                label={isRadioMode ? 'Radio Mode' : 'Radio Mode'}
                onClick={toggleRadioMode}
                size="small"
                sx={{
                  bgcolor: isRadioMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                  color: isRadioMode ? '#4caf50' : 'rgba(255,255,255,0.7)',
                  border: isRadioMode ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                  height: { xs: '24px', md: '28px' },
                  fontWeight: isRadioMode ? 600 : 400,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isRadioMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.15)',
                    transform: 'scale(1.05)'
                  },
                  '& .MuiChip-icon': {
                    color: isRadioMode ? '#4caf50' : 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  },
                  flexShrink: 0
                }}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {!currentSong && (
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            No song is currently playing.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              mt: 1,
              fontSize: { xs: '0.8rem', md: '0.875rem' }
            }}
          >
            Add songs to the queue to get started!
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Chip
              icon={isRadioMode ? <RadioButtonCheckedIcon /> : <RadioIcon />}
              label={isRadioMode ? 'Radio Mode' : 'Radio Mode'}
              onClick={toggleRadioMode}
              size="small"
              sx={{
                bgcolor: isRadioMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                color: isRadioMode ? '#4caf50' : 'rgba(255,255,255,0.7)',
                border: isRadioMode ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                height: { xs: '24px', md: '28px' },
                fontWeight: isRadioMode ? 600 : 400,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isRadioMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.05)'
                },
                '& .MuiChip-icon': {
                  color: isRadioMode ? '#4caf50' : 'rgba(255,255,255,0.7)',
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }
              }}
            />
          </Box>
          {isRadioMode && (
            <Box
              sx={{
                mt: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: 'rgba(76, 175, 80, 0.15)',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}
            >
              <RadioButtonCheckedIcon sx={{ color: '#4caf50', fontSize: '1rem' }} />
              <Typography
                variant="body2"
                sx={{ color: '#4caf50', fontSize: { xs: '0.8rem', md: '0.875rem' }, fontWeight: 600 }}
              >
                Radio Mode Active - Ready for next song
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CurrentSong;