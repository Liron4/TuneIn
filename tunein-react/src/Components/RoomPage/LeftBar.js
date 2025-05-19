import { Box, IconButton, Typography } from '@mui/material';
import SearchSong from './SearchSong';
import SongQueue from './SongQueue';

const LeftBar = ({ isOpen, onToggle }) => {
  return (
    <Box sx={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: isOpen ? '300px' : '48px',
      backgroundColor: isOpen ? 'rgba(33, 33, 33, 0.97)' : 'transparent',
      color: 'white',
      padding: isOpen ? '20px' : '20px 0',
      transition: 'width 0.3s ease, background-color 0.3s ease, padding 0.3s ease',
      overflow: 'hidden',
      boxShadow: isOpen ? '0px 0px 10px rgba(0, 0, 0, 0.5)' : 'none',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOpen ? 'flex-start' : 'center',
    }}>
      <IconButton
        onClick={onToggle}
        color="primary"
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#1DB954', // Spotify-like green
          color: 'white',
          position: 'absolute',
          left: isOpen ? '270px' : '2px',
          top: '20px',
          zIndex: 1001,
          boxShadow: 3,
          border: '2px solid #fff',
          transition: 'left 0.3s, background-color 0.3s',
          '&:hover': {
            backgroundColor: '#1AA34A',
          },
        }}
      >
        {isOpen ? <span style={{fontSize: 20}}>←</span> : <span style={{fontSize: 20}}>→</span>}
      </IconButton>

      {isOpen && (
        <Box sx={{ mt: 5, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Music Controls
          </Typography>

          {/* Search component handles its own logic and results */}
          <SearchSong />
          
          {/* Song queue to be implemented later */}
          <Box sx={{ mt: 2, flexGrow: 1, overflow: 'auto' }}>
            <SongQueue />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LeftBar;