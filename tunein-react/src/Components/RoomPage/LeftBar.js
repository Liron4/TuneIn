import { Box, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import SearchSong from './SearchSong';
import SongQueue from './SongQueue';

const LeftBar = () => {
  const [visible, setVisible] = useState(true);

  return (
    <>
      {/* Fixed Toggle Button */}
      <IconButton
        onClick={() => setVisible(v => !v)}
        sx={{
          position: 'fixed',
          left: visible ? '270px' : '10px',
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

      {/* Sidebar */}
      <Box sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '300px',
        backgroundColor: 'rgba(33, 33, 33, 0.97)',
        color: 'white',
        padding: '20px',
        overflow: 'hidden',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
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
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Music Controls
          </Typography>
          <SearchSong />
          <Box sx={{ mt: 2, flexGrow: 1, overflow: 'auto', width: '100%' }}>
            <SongQueue />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LeftBar;