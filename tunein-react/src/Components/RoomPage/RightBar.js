import { Box, Typography, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import ChatPanel from './ChatPanel/ChatPanel';
import VotingWidget from './VoteWidget/VotingWidget';

const RightBar = ({ roomId }) => {
  const [visible, setVisible] = useState(false); // Start hidden on mobile

  return (
    <>
      {/* Fixed Toggle Button - Top Right */}
      <IconButton
        onClick={() => setVisible(v => !v)}
        sx={{
          position: 'fixed',
          right: visible ? {
            xs: '280px',  // Top left of mobile sidebar when open
            md: '300px'   // Top left of desktop sidebar when open
          } : '10px',     // Right edge when closed
          top: '15px',
          backgroundColor: 'rgba(33,33,33,0.97)',
          color: 'white',
          zIndex: 1300,   // Higher z-index to stay above sidebar
          borderRadius: '50%',
          boxShadow: 2,
          transition: 'right 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(33,33,33,1)',
          }
        }}
        size="small"
      >
        {visible ? <CloseIcon /> : <ChatIcon />}
      </IconButton>

      {/* Right Sidebar - responsive behavior */}
      <Box sx={{
        position: 'fixed',
        right: 0,
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
        boxShadow: '-2px 0px 10px rgba(0, 0, 0, 0.5)', // Left shadow instead of right
        zIndex: {
          xs: 1200, // High z-index on mobile to overlay content
          md: 1000   // Normal z-index on desktop
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transition: 'transform 0.3s ease-in-out',
        transform: visible ? 'translateX(0)' : 'translateX(100%)', // Slide from right
      }}>

        {/* Header */}
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
              pl: 4
            }}
          >
            Room Activity
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
          {/* Voting Widget */}
          <VotingWidget />

          {/* Chat Panel */}
          <Box sx={{
            flex: '1 1 auto',
            minHeight: 0,
            width: '100%',
            overflow: 'hidden'
          }}>
            <ChatPanel roomId={roomId} />
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

export default RightBar;