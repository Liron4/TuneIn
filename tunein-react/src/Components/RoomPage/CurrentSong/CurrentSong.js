import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
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

      {currentSong ? (
        <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.4)', maxWidth: '100%', overflow: 'hidden' }}>
          <MediaPlayer
            key={`${currentSong.id}-${currentSong.startTime}`} // **BUG FIX #1**: Use combined key to only remount when song actually changes
            videoId={currentSong.id}
            startTime={initialStartTimeRef.current} // **BUG FIX #2**: Use stable initial start time
            songData={currentSong}
          />

          <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.3 }}>
              {currentSong.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Added by: {currentSong.addedby}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.9rem', md: '1rem' } }}>
            No song is currently playing.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            Add songs to the queue to get started!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CurrentSong;