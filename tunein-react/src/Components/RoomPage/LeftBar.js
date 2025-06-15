import { Box, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import SearchSong from './SearchSong';
import SongQueue from './SongQueue';

const LeftBar = ({ roomName }) => {
  const [visible, setVisible] = useState(false); // Start hidden on mobile

  return (
    <>
      {/* Fixed Toggle Button - responsive positioning */}
      <IconButton
        onClick={() => setVisible(v => !v)}
        sx={{
          position: 'fixed',
          left: { 
            xs: '10px',                    // Always left on mobile
            md: visible ? '270px' : '10px' // Responsive on desktop
          },
          top: '20px',
          backgroundColor: 'rgba(33,33,33,0.97)',
          color: 'white',
          zIndex: 1100,
          borderRadius: '50%',
          boxShadow: 1,
          transition: 'left 0.3s',
        }}
        size="small"
      >
        {visible ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      {/* Room Name - responsive positioning */}
      <Typography
        variant="h6"
        sx={{
          position: 'fixed',
          left: { 
            xs: '60px',                     // Fixed position on mobile
            md: visible ? '350px' : '60px'  // Responsive on desktop
          },
          top: '22px',
          color: 'white',
          zIndex: 1100,
          fontWeight: 'bold',
          transition: 'left 0.3s',
          fontSize: { 
            xs: '1rem',    // Smaller font on mobile
            md: '1.25rem'  // Normal font on desktop
          }
        }}
      >
        {roomName}
      </Typography>

      {/* Sidebar - responsive behavior */}
      <Box sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: { 
          xs: '280px', // Slightly smaller on mobile
          md: '300px'  // Full width on desktop
        },
        backgroundColor: 'rgba(33, 33, 33, 0.97)',
        color: 'white',
        padding: { 
          xs: '15px', // Less padding on mobile
          md: '20px'  // Normal padding on desktop
        },
        overflow: 'hidden',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
        zIndex: { 
          xs: 1200, // Higher z-index on mobile to overlay content
          md: 1000  // Normal z-index on desktop
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transition: 'transform 0.3s',
        transform: visible ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        {/* Content */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 6, // Add margin to avoid overlap with button
            height: 'calc(100% - 48px)', // Take remaining height
            overflow: 'hidden'
          }}
        >
          <Typography variant="h6" sx={{ 
            mb: 2, 
            textAlign: 'center',
            fontSize: { 
              xs: '1rem',    // Smaller on mobile
              md: '1.25rem'  // Normal on desktop
            }
          }}>
            Music Controls
          </Typography>
          <SearchSong />
          <Box sx={{ 
            mt: 2, 
            flexGrow: 1, 
            overflow: 'auto', 
            width: '100%',
            // Custom scrollbar for better mobile experience
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
            <SongQueue />
          </Box>
        </Box>
      </Box>

      {/* Backdrop for mobile - close sidebar when clicking outside */}
      {visible && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: { xs: 'block', md: 'none' }, // Only show on mobile
          }}
          onClick={() => setVisible(false)}
        />
      )}
    </>
  );
};

export default LeftBar;