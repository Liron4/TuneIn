import { Box, useTheme } from '@mui/material';
import ProfileBar from '../Components/HomePage/ProfileBar';
import RoomBrowser from '../Components/HomePage/RoomBrowser';
import DarkModeToggle from '../Components/.reusable/DarkModeToggle';
import { ThemeProvider } from '../Components/.reusable/ThemeContext';

const HomePageContent = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <DarkModeToggle />
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

const HomePage = () => {
  return (
    <ThemeProvider>
      <HomePageContent />
    </ThemeProvider>
  );
};

export default HomePage;