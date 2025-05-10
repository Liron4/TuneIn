import { Box } from '@mui/material';
import ProfileBar from '../Components/HomePage/ProfileBar';

const HomePage = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Left sidebar - ProfileBar */}
      <ProfileBar />
      
      {/* Main content area - will be replaced with RoomBrowser */}
      <Box sx={{ 
        flexGrow: 1, 
        ml: '100px', // Width of closed ProfileBar
        transition: 'margin-left 0.3s ease',
        padding: '20px'
      }}>
        <h1>Home Page Content</h1>
        <p>The Profile Bar should be visible on the left side.</p>
        <p>Click on the arrow button to expand/collapse it.</p>
      </Box>
    </Box>
  );
};

export default HomePage;