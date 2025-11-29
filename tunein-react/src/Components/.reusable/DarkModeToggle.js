import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from './ThemeContext';

const DarkModeToggle = ({ sx = {} }) => {
  const { darkMode, toggleDarkMode } = useThemeMode();

  return (
    <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton
        onClick={toggleDarkMode}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1200,
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          },
          ...sx,
        }}
      >
        {darkMode ? <LightModeIcon sx={{ color: '#ffc107' }} /> : <DarkModeIcon sx={{ color: '#5c6bc0' }} />}
      </IconButton>
    </Tooltip>
  );
};

export default DarkModeToggle;
