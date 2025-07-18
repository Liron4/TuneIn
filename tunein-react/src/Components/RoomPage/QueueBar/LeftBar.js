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
      {/* Fixed Toggle Button - FIXED: Always visible, positioned correctly */}
      <IconButton
        onClick={() => setVisible(v => !v)}
        sx={{
          position: 'fixed',
          left: visible ? { 
            xs: '240px',  // Top right of mobile sidebar
            md: '260px'   // Top right of desktop sidebar
          } : '10px',     // Left edge when closed
          top: '15px',
          backgroundColor: 'rgba(33,33,33,0.97)',
          color: 'white',
          zIndex: 1300,   // Higher z-index to stay above sidebar
          borderRadius: '50%',
          boxShadow: 2,
          transition: 'left 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(33,33,33,1)',
          }
        }}
        size="small"
      >
        {visible ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      {/* Sidebar - responsive behavior */}
      <Box sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: { 
          xs: '280px', // Mobile width
          md: '300px'  // Desktop width
        },
        backgroundColor: 'rgba(33, 33, 33, 0.97)',
        color: 'white',
        padding: { 
          xs: '15px',
          md: '20px'
        },
        overflow: 'hidden',
        boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.5)',
        zIndex: { 
          xs: 1200, // High z-index on mobile to overlay content
          md: 1000   // Normal z-index on desktop
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transition: 'transform 0.3s ease-in-out',
        transform: visible ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        
        {/* FIXED: Room Name Header - now inside the sidebar */}
        <Box sx={{ 
          width: '100%', 
          pt: 0, 
          pb: 2, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          mb: 2
        }}>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: { 
                xs: '1rem',    // Smaller font on mobile
                md: '1.25rem'  // Normal font on desktop
              },
              // Add some padding to avoid overlap with close button
              pr: 4
            }}
          >
            {roomName || 'Loading...'}
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: 'calc(100% - 80px)', // Account for header space
            overflow: 'hidden'
          }}
        >
          <Typography variant="h6" sx={{ 
            mb: 1, 
            textAlign: 'center',
            fontSize: { 
              xs: '0.9rem',   // Smaller on mobile
              md: '1.1rem'    // Normal on desktop
            },
            color: 'rgba(255,255,255,0.8)'
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