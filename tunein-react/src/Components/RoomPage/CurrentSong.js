import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import axios from 'axios';
import MediaPlayer from './MediaPlayer';
import SongWidget from './SongWidget';
import { useSocket } from './Context/SocketContext';
import SkipSong from './SkipSong/SkipSong';



const CurrentSong = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [serverTimeDiff, setServerTimeDiff] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [nextSongInfo, setNextSongInfo] = useState(null);
  const countdownRef = useRef(null);
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

        setCurrentSong(data.currentSong);
        setCountdown(null);
      } else {
        setCurrentSong(null);
      }
    });

    // Listen for countdown updates
    newSocket.on('nextSongCountdown', (data) => {
      console.log('Received countdown event:', data);
      setCountdown(data.countdown);
      setNextSongInfo(data.nextSong);

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

      let secondsLeft = data.countdown;
      countdownRef.current = setInterval(() => {
        secondsLeft -= 1;
        setCountdown(secondsLeft);

        if (secondsLeft <= 0) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }, 1000);
    });

    // Cleanup listeners
    return () => {
      if (newSocket) {
        newSocket.off('currentSongUpdated');
        newSocket.off('nextSongCountdown');
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [newSocket, roomId]); // Dependencies: re-run when socket or roomId changes

  // Fetch current song on initial load - auto-start
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
        alignItems: 'center',
        mb: { xs: 1.5, md: 2 },
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
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
            }
          }}
        >
          Now Playing
        </Typography>

        {/* Replace old skip button with SkipSong component */}
        {currentSong && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: { xs: 'auto', sm: '200px' }, // Give SkipSong enough space
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

      {/* Rest of the component remains the same */}
      <SongWidget
        currentSong={currentSong}
        getElapsedSeconds={getElapsedSeconds}
      />

      {countdown !== null && countdown > 0 && (
        <Box sx={{ p: { xs: 2, md: 3 }, textAlign: 'center', bgcolor: 'rgba(29, 185, 84, 0.2)', borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Next song in {countdown}...
          </Typography>
          {nextSongInfo && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Coming up: {nextSongInfo.title}
            </Typography>
          )}
        </Box>
      )}

      {currentSong ? (
        <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.4)', maxWidth: '100%', overflow: 'hidden' }}>
          <MediaPlayer
            videoId={currentSong.id}
            startTime={getElapsedSeconds()}
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