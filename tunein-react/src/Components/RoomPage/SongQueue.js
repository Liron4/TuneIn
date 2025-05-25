import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';
import SongCard from './SongCard';

const SongQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [socket, setSocket] = useState(null);

  // Get current user's username
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUsername(response.data.nickname);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Setup Socket.IO connection for real-time updates
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const roomId = pathParts[pathParts.indexOf('room') + 1];
    
    if (!roomId) return;

    const newSocket = io('http://localhost:5000');
    
    // Join the room
    newSocket.emit('joinRoom', roomId);
    
    // Listen for queue updates
    newSocket.on('queueUpdated', (data) => {
      setQueue(data.queue || []);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch queue data (initial load)
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const pathParts = window.location.pathname.split('/');
      const roomId = pathParts[pathParts.indexOf('room') + 1];
      
      if (!roomId || !token) return;

      const response = await axios.get(`http://localhost:5000/api/queue/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQueue(response.data.queue || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  // Load queue on component mount
  useEffect(() => {
    fetchQueue();
  }, []);

  // Handle removing song from queue
  const handleRemoveSong = async (song, index) => {
    try {
      const token = localStorage.getItem('authToken');
      const pathParts = window.location.pathname.split('/');
      const roomId = pathParts[pathParts.indexOf('room') + 1];

      await axios.delete(`http://localhost:5000/api/queue/${roomId}/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // No need to manually refresh - socket will handle the update
    } catch (err) {
      console.error('Error removing song:', err);
    }
  };

  // Format song data for SongCard (replace artist with username)
  const formatSongForQueue = (song) => {
    return {
      ...song,
      artist: song.addedby,
      channelTitle: song.addedby
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
  <Box sx={{ width: '100%' }}>
    <Typography 
      variant="h6" 
      sx={{ 
        color: 'white', 
        mb: 2,
        fontWeight: 600 
      }}
    >
      Song Queue ({queue.length})
    </Typography>

    {error && (
      <Typography 
        color="error" 
        variant="caption" 
        sx={{ mt: 1 }}
      >
        {error}
      </Typography>
    )}

    {queue.length === 0 ? (
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          py: 4
        }}
      >
        No songs in queue. Add some songs to get started!
      </Typography>
    ) : (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)' }}>
          Current Queue:
        </Typography>
        <List sx={{ p: 0 }}>
          {queue.map((song, index) => {
            const canRemove = currentUsername === song.addedby;
            
            return (
              <SongCard
                key={`${song.id}-${index}`}
                song={formatSongForQueue(song)}
                context={canRemove ? 'queue' : 'display'}
                onAction={canRemove ? (s) => handleRemoveSong(s, index) : null}
                disabled={false}
              />
            );
          })}
        </List>
      </Box>
    )}
  </Box>
);
};

export default SongQueue;