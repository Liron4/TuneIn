import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Button, Typography, Avatar, Chip, TextField, 
  IconButton, CircularProgress 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';

const ProfileBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    profilePic: '',
    genres: [],
    points: 0
  });
  const [newGenre, setNewGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // React Router navigation hook

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, navigate]); // Changed from router to navigate

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleAddGenre = async () => {
    if (!newGenre.trim() || profile.genres.length >= 5) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const updatedGenres = [...profile.genres, newGenre];
      
      await axios.put('http://localhost:5000/api/user/profile/genres', 
        { genres: updatedGenres },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setProfile(prev => ({
        ...prev,
        genres: updatedGenres
      }));
      setNewGenre('');
    } catch (err) {
      setError('Failed to add genre');
      console.error(err);
    }
  };

  const handleDeleteGenre = async (genreToDelete) => {
    try {
      const token = localStorage.getItem('authToken');
      const updatedGenres = profile.genres.filter(genre => genre !== genreToDelete);
      
      await axios.put('http://localhost:5000/api/user/profile/genres', 
        { genres: updatedGenres },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setProfile(prev => ({
        ...prev,
        genres: updatedGenres
      }));
    } catch (err) {
      setError('Failed to delete genre');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: isOpen ? '300px' : '30px',
      backgroundColor: 'black',
      color: 'white',
      padding: '20px',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      boxShadow: '0px 0px 10px rgba(3, 3, 3, 0.5)',
      zIndex: 1000
    }}>
      <Button 
        onClick={handleToggleOpen} 
        variant="contained"
        color="primary"
        sx={{ 
          minWidth: '30px',
          position: 'absolute',
          right: '10px',
          top: '10px'
        }}
      >
        {isOpen ? '←' : '→'}
      </Button>

      {isOpen && (
        <Box sx={{ mt: 5 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
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

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Genres ({profile.genres.length}/5):
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {profile.genres.map((genre, index) => (
                  <Chip 
                    key={index} 
                    label={genre}
                    onDelete={() => handleDeleteGenre(genre)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ 
                      backgroundColor: '#2a2a2a',
                      color: 'white',
                      '&:hover': { backgroundColor: '#3a3a3a' }
                    }}
                  />
                ))}
              </Box>

              {profile.genres.length < 5 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add genre"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    variant="outlined"
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'gray',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'gray',
                      }
                    }}
                  />
                  <IconButton onClick={handleAddGenre} color="primary">
                    <AddIcon />
                  </IconButton>
                </Box>
              )}

              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ mt: 4, width: '100%' }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProfileBar;