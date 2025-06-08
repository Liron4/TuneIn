import { Box, Typography } from '@mui/material';
import SearchSong from './SearchSong';
import SongQueue from './SongQueue';

const LeftBar = () => {
  return (
    <Box sx={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '300px',  // Fixed width, always visible
      backgroundColor: 'rgba(33, 33, 33, 0.97)',
      color: 'white',
      padding: '20px',
      overflow: 'hidden',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Music Controls
        </Typography>

        {/* Search component handles its own logic and results */}
        <SearchSong />
        
        {/* Song queue */}
        <Box sx={{ mt: 2, flexGrow: 1, overflow: 'auto', width: '100%' }}>
          <SongQueue />
        </Box>
      </Box>
    </Box>
  );
};

export default LeftBar;