import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import LeftBar from '../Components/RoomPage/QueueBar/LeftBar';
import { useNavigate } from 'react-router-dom';
import CurrentSong from '../Components/RoomPage/CurrentSong/CurrentSong';
import ChatPanel from '../Components/RoomPage/ChatPanel/ChatPanel';
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
    console.log('Creator of the room:', room?.creator);
    

    const token = localStorage.getItem('authToken');
    const newSocket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      transports: ['websocket']
    });

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

    setRoomSocket(newSocket);

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
    <SocketProvider newSocket={roomSocket} roomId={roomId} roomCreator={room?.creator}>
      <Box sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#121212',
        color: 'white',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        {/* Left Sidebar */}
        <LeftBar roomName={room?.name} />

        {/* Main content area */}
        <Box sx={{
          width: '100%',
          height: '100vh',
          padding: {
            xs: '6px 6px 6px 50px',    // Mobile: Space only for toggle button
            sm: '8px 8px 8px 50px',    // Small: Space only for toggle button
            md: '12px',                // Medium: No reserved space
            lg: '16px',                // Large: No reserved space
            xl: '20px 40px 20px 20px'  // XL: Extra right padding for ChatPanel spacing
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: {
            xs: 'center',   // Center on mobile
            sm: 'center',   // Center on small tablets
            md: 'center',   // Center on medium tablets
            lg: 'stretch',  // Normal alignment on desktop
            xl: 'stretch'   // Normal alignment on large desktop
          },
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>

          {/* Content Container */}
          <Box sx={{
            width: {
              xs: '100%',     // Full width on mobile
              sm: '100%',     // Full width on small tablets
              md: '95%',      // Slightly narrower on medium tablets
              lg: '90%',      // Constrained width on desktop
              xl: '90%'       // Constrained width on XL (with right padding creating more space)
            },
            maxWidth: {
              lg: '1400px',   // Maximum width on large screens
              xl: '1600px'    // Maximum width on extra large screens
            },
            height: '100%',
            display: 'flex',
            flexDirection: {
              xs: 'column',    // Mobile: Stack vertically
              sm: 'column',    // Small tablets: Stack vertically  
              md: 'column',    // Medium tablets: Stack vertically
              lg: 'row',       // Laptops: Side by side
              xl: 'row'        // Desktops: Side by side
            },
            gap: { // Gap between components
              xs: 0.5,   
              sm: 0.75,  
              md: 1,    
              lg: 4,     
              xl: 5      
            },
            overflow: 'hidden',
            boxSizing: 'border-box',
            margin: '0 auto'
          }}>

            {/* Current Song Section */}
            <Box sx={{
              flex: {
                xs: '1 1 auto',        // Mobile: Take available space
                sm: '1 1 auto',        // Small: Take available space
                md: '1 1 auto',        // Medium: Take available space  
                lg: '1 1 60%',         // Large: 60% width
                xl: '1 1 65%'          // XL: 65% width
              },
              minHeight: 0,
              height: {
                xs: '62%',             // Mobile: Slightly more space
                sm: '65%',             // Small: 65% of container height
                md: '70%',             // Medium: 70% of container height
                lg: '100%',            // Large: Full height (side by side)
                xl: '100%'             // XL: Full height (side by side)
              },
              maxHeight: {
                lg: 'calc(100vh - 32px)',  // Account for padding on desktop
                xl: 'calc(100vh - 40px)'   // Account for padding on large desktop
              },
              display: 'flex',
              flexDirection: 'column',
              // **FIX**: Disable scroll on XL, keep for other sizes
              overflow: {
                xs: 'auto',    // Allow scrolling on mobile
                sm: 'auto',    // Allow scrolling on small devices
                md: 'auto',    // Allow scrolling on medium devices
                lg: 'auto',    // Allow scrolling on large devices
                xl: 'hidden'   // **DISABLE scroll on XL screens**
              },
              boxSizing: 'border-box',
              // Custom scrollbar styling (for non-XL screens)
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.5)',
                }
              },
            }}>
              <CurrentSong />
            </Box>

            {/* Chat Panel Section - With extra right spacing on XL */}
            <Box sx={{
              flex: {
                xs: '1 1 auto',        // Mobile: Take remaining space
                sm: '1 1 auto',        // Small: Take remaining space
                md: '1 1 auto',        // Medium: Take remaining space
                lg: '0 0 40%',         // Large: 40% width
                xl: '0 0 35%'          // XL: 35% width
              },
              minHeight: 0,
              height: {
                xs: '38%',             // Mobile: Adjusted for gap reduction
                sm: '35%',             // Small: 35% of container height  
                md: '30%',             // Medium: 30% of container height
                lg: '100%',            // Large: Full height (side by side)
                xl: '100%'             // XL: Full height (side by side)
              },
              maxHeight: {
                lg: 'calc(100vh - 32px)',  // Account for padding on desktop
                xl: 'calc(100vh - 40px)'   // Account for padding on large desktop
              },
              // **FIX**: Extra right margin on XL for better spacing
              marginRight: {
                xs: 0,       // No extra margin on mobile
                sm: 0,       // No extra margin on small
                md: 0,       // No extra margin on medium
                lg: 0,       // No extra margin on large
                xl: '20px'   // **EXTRA 20px right margin on XL screens**
              },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}>
              <ChatPanel roomId={roomId} />
            </Box>

          </Box>
        </Box>
      </Box>
    </SocketProvider>
  );
};

export default RoomPage;