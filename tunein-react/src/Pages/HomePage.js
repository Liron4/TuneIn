import { Box } from '@mui/material';
import ProfileBar from '../Components/HomePage/ProfileBar';
import RoomBrowser from '../Components/HomePage/RoomBrowser';

const HomePage = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Left sidebar - ProfileBar */}
      <ProfileBar />
      
      {/* Main content area - RoomBrowser */}
      <Box sx={{ 
        flexGrow: 1, 
        ml: '100px', // Width of closed ProfileBar
        transition: 'margin-left 0.3s ease',
        padding: '20px',
        overflow: 'auto' // Allow scrolling if content is too long
      }}>
        <RoomBrowser />
      </Box>
    </Box>
  );
};

export default HomePage;