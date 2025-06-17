import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import LeftBar from '../Components/RoomPage/LeftBar';
import { useNavigate } from 'react-router-dom';
import CurrentSong from '../Components/RoomPage/CurrentSong';
import RightBar from '../Components/RoomPage/RightBar';
import { SocketProvider } from '../Components/RoomPage/Context/SocketContext';
import io from 'socket.io-client';



const RoomPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomSocket, setRoomSocket] = useState(null);
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

    // Create socket when RoomPage mounts
  useEffect(() => {
    if (!roomId) {
      console.error('No roomId provided for socket connection');
      return;
    }

    console.log('RoomPage: Creating socket connection for room:', roomId);
    
    const token = localStorage.getItem('authToken');
    const newSocket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      transports: ['websocket']
    });

    // Socket connection events
    newSocket.on('connect', () => {
      console.log('RoomPage socket connected successfully');
      newSocket.emit('joinRoom', roomId);
    });

    newSocket.on('disconnect', () => {
      console.log('RoomPage socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('RoomPage socket connection error:', error);
    });

    // Set socket state to provide to context
    setRoomSocket(newSocket);

    // CLEANUP: Destroy socket when RoomPage unmounts or roomId changes
    return () => {
      console.log('RoomPage: Cleaning up socket connection');
      newSocket.disconnect();
      setRoomSocket(null);
    };
  }, [roomId]);

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
    <SocketProvider newSocket={roomSocket} roomId={roomId}>
    <Box sx={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      overflow: 'hidden' // Prevent page scroll
    }}>
      {/* Left Sidebar */}
      <LeftBar roomName={room?.name} />

      {/* Right Sidebar */}
      <RightBar roomId={roomId} />

      {/* Main content area - responsive */}
      <Box sx={{
        flexGrow: 1,
        padding: {
          xs: '15px 60px 15px 60px', // UPDATED: Space for both left AND right menu buttons
          md: '20px'                 // Normal padding on desktop
        },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}>

        {/* Current Song Section - UPDATED: Align with menu icon */}
        <Box sx={{
          width: '100%',
          maxWidth: {
            xs: '100%',   // Full available width on mobile
            sm: '600px',  // Medium screens
            md: '700px',  // Desktop
            lg: '800px'   // Large screens
          },
          margin: '0 auto',   // Center horizontally
          mt: {
            xs: 0.5,  // CHANGED: Minimal top margin to align with menu icon (15px)
            md: 1     // CHANGED: Reduced margin on desktop
          },
          mb: {
            xs: 2,  // Bottom margin on mobile
            md: 4   // More bottom margin on laptop/desktop
          },
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
          },
        }}>
          <CurrentSong />
        </Box>
      </Box>
    </Box>
    </SocketProvider>
  );
};

export default RoomPage;