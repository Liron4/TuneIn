import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import LeftBar from '../Components/RoomPage/LeftBar';
import { useNavigate } from 'react-router-dom';


const RoomPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeftBarOpen, setIsLeftBarOpen] = useState(false);
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

  const handleToggleLeftBar = () => {
    setIsLeftBarOpen(!isLeftBarOpen);
  };

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
      backgroundColor: '#121212', // Dark theme for music app
      color: 'white'
    }}>
      {/* Left sidebar for song search and queue */}
      <LeftBar 
        isOpen={isLeftBarOpen} 
        onToggle={handleToggleLeftBar}
      />
      
      {/* Main content area - will contain player and chat later */}
      <Box sx={{ 
        flexGrow: 1, 
        ml: isLeftBarOpen ? '300px' : '48px',
        transition: 'margin-left 0.3s ease',
        padding: '20px',
        overflow: 'auto'
      }}>
        <Typography variant="h4" gutterBottom>
          {room?.name || 'Music Room'}
        </Typography>
        {/* Content will be expanded in future updates */}
      </Box>
    </Box>
  );
};

export default RoomPage;