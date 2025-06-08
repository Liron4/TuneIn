import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import axios from 'axios';
import io from 'socket.io-client';
import MediaPlayer from './MediaPlayer';

const CurrentSong = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [serverTimeDiff, setServerTimeDiff] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [nextSongInfo, setNextSongInfo] = useState(null);
  const countdownRef = useRef(null);

  // Extract room ID from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.indexOf('room') + 1];
    setRoomId(id);
  }, []);

  // Setup Socket.IO connection
  useEffect(() => {
    if (!roomId) return;

    console.log('Setting up socket connection for room:', roomId);
    const newSocket = io('http://localhost:5000');
    
    // Join the room
    newSocket.emit('joinRoom', roomId);
    
    // Listen for current song updates
    newSocket.on('currentSongUpdated', (data) => {
      setLoading(false);
      console.log('Received currentSongUpdated event:', data);
      
      if (data.currentSong) {
        // Calculate time difference between server and client
        const serverTime = data.serverTime;
        const clientTime = Date.now();
        const diff = serverTime - clientTime;
        setServerTimeDiff(diff);
        
        setCurrentSong(data.currentSong);
        // Clear countdown when a new song starts
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
      
      // Clear any existing interval
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      
      // Set up countdown timer
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

    setSocket(newSocket);

    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [roomId]);

  // Fetch current song on initial load - auto-start
  useEffect(() => {
    if (!roomId) return;
    
    const fetchCurrentSong = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;

        console.log('Fetching current song for room:', roomId);
        const response = await axios.get(`http://localhost:5000/api/song/${roomId}`, {
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

  // Skip current song
  const handleSkipSong = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !roomId) return;

      await axios.post(`http://localhost:5000/api/song/${roomId}/skip`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error skipping song:', err);
      setError('Failed to skip song');
    }
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
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            fontWeight: 600 
          }}
        >
          Now Playing
        </Typography>
        
        {currentSong && (
          <Button 
            variant="contained" 
            size="small"
            startIcon={<SkipNextIcon />}
            onClick={handleSkipSong}
            sx={{ bgcolor: 'rgba(29, 185, 84, 0.8)', '&:hover': { bgcolor: 'rgba(29, 185, 84, 1)' } }}
          >
            Skip
          </Button>
        )}
      </Box>
      
      {error && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}
      
      {countdown !== null && countdown > 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'rgba(29, 185, 84, 0.2)',
            borderRadius: 2,
            mb: 2
          }}
        >
          <Typography variant="h6" sx={{ color: 'white' }}>
            Next song in {countdown}...
          </Typography>
          {nextSongInfo && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
              Coming up: {nextSongInfo.title}
            </Typography>
          )}
        </Box>
      )}
      
      {currentSong ? (
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
          <MediaPlayer 
            videoId={currentSong.id} 
            startTime={getElapsedSeconds()} 
            songData={currentSong}
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
              {currentSong.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Added by: {currentSong.addedby}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            No song is currently playing.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
            Add songs to the queue to get started!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CurrentSong;