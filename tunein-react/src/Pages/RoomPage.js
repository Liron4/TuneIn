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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`, {
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
      color: 'white',
      overflow: 'hidden' // Prevent page scroll
    }}>
      {/* Left Sidebar */}
      <LeftBar roomName={room?.name} />
      
      {/* Main content area - responsive */}
      <Box sx={{ 
        flexGrow: 1,
        marginLeft: { 
          xs: 0,      // No margin on mobile (sidebar will overlay)
          md: '300px' // Desktop margin for sidebar
        },
        padding: { 
          xs: '10px', // Smaller padding on mobile
          md: '20px'  // Normal padding on desktop
        },
        overflow: 'hidden', // No scrollbar
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        
        {/* Current Song Section - aligned with LeftBar title */}
        <Box sx={{ 
          width: '100%', 
          maxWidth: { 
            xs: '100%',  // Full width on mobile
            md: '800px'  // Max width on desktop
          },
          margin: '0 auto',
          mt: { 
            xs: 1,  // Minimal top margin on mobile
            md: 2   // Normal margin on desktop
          },
          flex: '1 1 auto', // Take available space but allow shrinking
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <CurrentSong />
        </Box>
        
        
      </Box>
    </Box>
  );
};

export default RoomPage;