import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import RoomCard from './RoomCard';
import CreateRoomModal from './CreateRoomModal';

const RoomBrowser = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/rooms');
      setRooms(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

// In RoomBrowser.js where handleCreateRoom is defined
const handleCreateRoom = async (roomData) => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No authentication token found');
      // Handle missing token (redirect to login, show error, etc)
      return;
    }

    // Include the token in request headers
    const response = await axios.post('http://localhost:5000/api/rooms', roomData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // No need to set Content-Type with FormData - axios sets it automatically with boundary
      }
    });

    // Handle successful response
    console.log('Room created:', response.data);
    // Update your rooms state or whatever you need to do
    
  } catch (error) {
    console.error('Error creating room:', error);
    // Handle error
  }
};

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, position: 'relative' }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1, textAlign: 'center' }}>
          Music Rooms
        </Typography>
        <Box sx={{ position: 'absolute', right: 0 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
          >
            Create Room
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <RoomCard room={room} />
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', my: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No rooms available. Create one to get started!
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      <CreateRoomModal 
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
    </Box>
  );
};

export default RoomBrowser;