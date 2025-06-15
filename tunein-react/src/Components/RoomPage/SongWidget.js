import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled progress bar to look like YouTube
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    '& .MuiLinearProgress-bar': {
        borderRadius: 3,
        backgroundColor: '#ff0000', // YouTube red
    },
}));

const SongWidget = ({ currentSong, getElapsedSeconds }) => {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const intervalRef = useRef(null);

    // Format time in MM:SS format, with negative support
    const formatTime = (seconds) => {
        const isNegative = seconds < 0;
        const absSeconds = Math.abs(seconds);
        const mins = Math.floor(absSeconds / 60);
        const secs = Math.floor(absSeconds % 60);
        const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
        return isNegative ? `-${timeString}` : timeString;
    };

    // Update progress and current time
    const updateProgress = () => {
        if (!currentSong || !currentSong.duration) return;

        const elapsed = getElapsedSeconds();
        const songDuration = currentSong.duration;

        setCurrentTime(elapsed);
        setDuration(songDuration);

        // Calculate progress percentage (0-100), but cap at 100 even if song exceeds duration
        const progressPercentage = Math.min((elapsed / songDuration) * 100, 100);
        setProgress(progressPercentage);
    };

    // Initialize widget when currentSong changes
    useEffect(() => {
        if (!currentSong) {
            // Clear everything when no song
            setProgress(0);
            setCurrentTime(0);
            setDuration(0);

            // Clear existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // NEW: Add 0.5 second delay before starting the timer
        setTimeout(() => {
            // Initial update after delay
            updateProgress();

            // Set up interval to update progress every second
            intervalRef.current = setInterval(() => {
                updateProgress();
            }, 1000);
        }, 300); // 0.3 second delay

        // Cleanup interval when component unmounts or song changes
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [currentSong, getElapsedSeconds]);

    // Don't render if no current song
    if (!currentSong) {
        return null;
    }

    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Song Info */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Thumbnail as separate image */}
                {currentSong.thumbnail && (
                    <Box
                        component="img"
                        src={currentSong.thumbnail}
                        alt={currentSong.title}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            objectFit: 'cover',
                            flexShrink: 0
                        }}
                    />
                )}

                {/* Song title */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            lineHeight: 1.2
                        }}
                        noWrap
                    >
                        {currentSong.title}
                    </Typography>
                </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 1 }}>
                <StyledLinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ mb: 1 }}
                />

                {/* Time Display */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}
                    >
                        {formatTime(currentTime)}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}
                    >
                        {formatTime(duration)}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default SongWidget;