import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Paper, 
  Chip, 
  CircularProgress,
  Fade,
  Backdrop
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from 'axios';
import { useSocket } from '../Context/SocketContext';

const UserProfilePopup = ({ username, onClose }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { roomCreator } = useSocket(); // Get room creator from context

    useEffect(() => {
        if (username) {
            fetchUserProfile();
        }
    }, [username]);

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile/${username}`);
            setProfileData(response.data);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            if (err.response?.status === 404) {
                setError('User not found');
            } else {
                setError('Failed to load user profile');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!username) return null;

    // Check if this user is the room creator
    const isRoomCreator = profileData && roomCreator && profileData.userId === roomCreator._id;

    return (
        <Backdrop
            open={true}
            onClick={onClose}
            sx={{
                zIndex: 1300,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
        >
            <Fade in={true}>
                <Paper
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    elevation={8}
                    sx={{
                        position: 'relative',
                        p: 3,
                        minWidth: 300,
                        maxWidth: 400,
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        color: 'white'
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress size={40} sx={{ color: '#FF0000' }} />
                        </Box>
                    ) : error ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="h6" sx={{ color: '#fff' }} gutterBottom>
                                {error}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                Could not load profile for "{username}"
                            </Typography>
                        </Box>
                    ) : profileData ? (
                        <Box>
                            {/* Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pr: 4 }}>
                                {profileData.profilePic ? (
                                    <Avatar
                                        src={profileData.profilePic}
                                        alt={profileData.nickname}
                                        sx={{ width: 60, height: 60, mr: 2 }}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            mr: 2,
                                            backgroundColor: `hsl(${profileData.nickname.charCodeAt(0) * 10}, 60%, 50%)`,
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        {profileData.nickname.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {profileData.nickname}
                                        {isRoomCreator && (
                                            <VerifiedIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                                        )}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <StarIcon sx={{ color: '#FFD700', fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                            {profileData.points} points
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Genres */}
                            {profileData.genres && profileData.genres.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#b0b0b0' }}>
                                        Favorite Genres
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                        {profileData.genres.map((genre, index) => (
                                            <Chip
                                                key={index}
                                                label={genre}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#FF0000',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    '&:hover': {
                                                        backgroundColor: '#cc0000'
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Stats */}
                            <Box 
                                sx={{ 
                                    mt: 3, 
                                    pt: 2, 
                                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: '#b0b0b0' }} />
                                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                        {isRoomCreator ? 'Room Creator' : 'Music Lover'}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                    {profileData.genres?.length || 0} genres
                                </Typography>
                            </Box>
                        </Box>
                    ) : null}
                </Paper>
            </Fade>
        </Backdrop>
    );
};

export default UserProfilePopup;
