import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import LeftBar from '../Components/RoomPage/LeftBar';
import { useNavigate } from 'react-router-dom';
import CurrentSong from '../Components/RoomPage/CurrentSong';

const RoomPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching room data:", err);
        if (err.response && err.response.status === 404) {
          alert("There's no such room.");
          navigate('/home');
        } else {
          setError("Failed to load the room. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, navigate]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress color="primary" />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'error.main' }}>
      <Typography variant="h6">{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#121212',
      color: 'white'
    }}>
      {/* Static left sidebar */}
      <LeftBar />
      
      {/* Main content area with fixed margin */}
      <Box sx={{ 
        flexGrow: 1, 
        marginLeft: '300px',  // Fixed margin to account for sidebar
        padding: '20px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h4" gutterBottom>
          {room?.name || 'Music Room'}
        </Typography>
        
        {/* Media Player Section */}
        <Box sx={{ 
          width: '100%', 
          maxWidth: '800px', 
          margin: '0 auto',
          mt: 4 
        }}>
          <CurrentSong />
        </Box>
        
        {/* Space for future components */}
        <Box sx={{ mt: 4 }}>
          {/* Future components */}
        </Box>
      </Box>
    </Box>
  );
};

export default RoomPage;