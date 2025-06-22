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
    const timeoutRef = useRef(null); // NEW: Track the setTimeout

    // Format time in MM:SS format
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Update progress and current time
    const updateProgress = () => {
        if (!currentSong || !currentSong.duration) return;

        const elapsed = getElapsedSeconds();
        const songDuration = currentSong.duration;

        // Cap elapsed time at duration (no negative values)
        const cappedElapsed = Math.min(Math.max(elapsed, 0), songDuration);

        setCurrentTime(cappedElapsed);
        setDuration(songDuration);

        // Calculate progress percentage (0-100)
        const progressPercentage = (cappedElapsed / songDuration) * 100;
        setProgress(progressPercentage);

        // Stop the timer when song is finished
        if (elapsed >= songDuration) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    };

    // Initialize widget when currentSong changes
    useEffect(() => {
        // FIXED: Clear both interval and timeout
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (!currentSong) {
            // Reset everything when no song
            setProgress(0);
            setCurrentTime(0);
            setDuration(0);
            return;
        }

        // Reset state for new song
        setProgress(0);
        setCurrentTime(0);
        setDuration(currentSong.duration || 0);

        // FIXED: Store timeout reference for cleanup
        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null; // Clear reference once timeout fires
            
            // Initial update
            updateProgress();

            // Set up interval to update every second
            intervalRef.current = setInterval(() => {
                updateProgress();
            }, 1000);
        }, 500);

        // FIXED: Cleanup both interval and timeout
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [currentSong?.id]); // Only depend on song ID to ensure proper reset

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
                {/* Thumbnail */}
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