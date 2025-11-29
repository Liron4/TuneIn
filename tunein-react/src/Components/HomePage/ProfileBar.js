import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthPage/AuthContext.js';
import axios from 'axios';
import {
  Box, Button, Typography, Avatar,
  IconButton, CircularProgress, useTheme
} from '@mui/material';
// Removed Chip, TextField, AddIcon, DeleteIcon as they are now in GenrePicker
import LogoutIcon from '@mui/icons-material/Logout';
import GenrePicker from '../.reusable/GenrePicker'; // Import the new component

const ProfileBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    profilePic: '',
    genres: [],
    points: 0
  });
  // Removed newGenre state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For profile loading errors
  const [genreUpdateError, setGenreUpdateError] = useState(null); // Specific for genre updates
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        setGenreUpdateError(null);
        const token = localStorage.getItem('authToken');

        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          logout(); // Log out if no token
          navigate('/auth');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, navigate, logout]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // This function will be called by GenrePicker when genres are changed locally
  const handleGenresUpdatedByPicker = async (updatedGenres) => {
    try {
      setGenreUpdateError(null); // Clear previous genre update error
      const token = localStorage.getItem('authToken');
      if (!token) {
        setGenreUpdateError('Authentication token not found. Please log in again.');
        logout();
        navigate('/auth');
        return;
      }

      // API call to update genres on the server
      await axios.put(`${process.env.REACT_APP_API_URL}/api/user/profile/genres`,
        { genres: updatedGenres },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Update local profile state upon successful API call
      setProfile(prev => ({
        ...prev,
        genres: updatedGenres
      }));
    } catch (err) {
      console.error('Failed to update genres:', err);
      setGenreUpdateError('Failed to update genres. Please try again.');
      // Optionally, you might want to revert genres in GenrePicker
      // by re-fetching profile or passing the old genres back,
      // but for now, we'll just show an error.
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth'); // Redirect to auth page after logout
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

return (
  <Box sx={{
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: isOpen ? '300px' : '48px', // Slightly wider for button
    backgroundColor: isOpen ? (isDark ? 'rgba(30, 30, 30, 0.98)' : 'rgba(0, 0, 0, 0.97)') : 'transparent',
    color: 'white',
    padding: isOpen ? '20px' : '20px 0',
    transition: 'width 0.3s ease, background-color 0.3s ease, padding 0.3s ease',
    overflow: 'hidden',
    boxShadow: isOpen ? '0px 0px 10px rgba(33, 150, 243, 0.3)' : 'none',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: isOpen ? 'flex-start' : 'center',
  }}>
    <IconButton
      onClick={handleToggleOpen}
      color="primary"
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: '#1976d2', // Material blue 700
        color: 'white',
        position: 'absolute',
        left: isOpen ? '250px' : '2px', // Adjust for new width
        top: '20px',
        zIndex: 1001,
        boxShadow: 3,
        border: '2px solid #fff',
        transition: 'left 0.3s, background-color 0.3s',
        '&:hover': {
          backgroundColor: '#1565c0', // Material blue 800
        },
      }}
    >
  {isOpen ? <span style={{fontSize: 20}}>←</span> : <span style={{fontSize: 20}}>→</span>}
</IconButton>

      {isOpen && (
        <Box sx={{ mt: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', p:2 }}>{error}</Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={profile.profilePic}
                  alt={profile.nickname}
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  <Typography variant="h6">{profile.nickname}</Typography>
                  <Typography variant="body2" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'gold'
                  }}>
                    Points: {profile.points}
                  </Typography>
                </Box>
              </Box>

              {/* Use the GenrePicker component */}
              <GenrePicker
                currentGenres={profile.genres}
                onGenresUpdated={handleGenresUpdatedByPicker}
                maxGenres={5}
                disabled={loading} // Disable while loading profile or updating genres
                textFieldStyles={{ // Custom styles for TextField in ProfileBar context
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'gray' },
                    '&:hover fieldset': { borderColor: 'lightgray' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                  '& .MuiInputLabel-root': { color: 'gray' },
                  '& .MuiFormHelperText-root': { color: 'error.main' }, // For local errors in picker
                }}
              />
              {genreUpdateError && <Typography color="error" variant="caption" sx={{mt:1}}>{genreUpdateError}</Typography>}


              <Box sx={{ marginTop: 'auto', pt: 2 }}> {/* Pushes logout to bottom */}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ width: '100%' }}
                >
                  Logout
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProfileBar;