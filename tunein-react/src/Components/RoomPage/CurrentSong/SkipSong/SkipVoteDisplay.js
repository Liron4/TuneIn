import React from 'react';
import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const SkipVoteDisplay = ({ skipData, showCreatorMode = false }) => {
    const { liveViewers, skipCount, threshold } = skipData;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Mobile/Tablet
    const isSmall = useMediaQuery(theme.breakpoints.down('sm')); // Very small screens

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1, md: 2 }, // Reduced gap on small screens
            minWidth: 0,
            overflow: 'hidden' // Prevent overflow
        }}>
            {/* Vote Status Chips */}
            <Box sx={{ 
                display: 'flex', 
                gap: { xs: 0.5, sm: 0.75, md: 1 }, // Reduced gap on small screens
                alignItems: 'center', 
                flexWrap: 'nowrap', // Prevent wrapping on small screens
                minWidth: 0,
                overflow: 'hidden'
            }}>
                {/* Hide Creator chip on mobile to save space */}
                {showCreatorMode && !isMobile && (
                    <Chip
                        icon={<AdminPanelSettingsIcon />}
                        label="Creator"
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ 
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: '24px', sm: '28px' },
                            '& .MuiChip-icon': {
                                fontSize: { xs: '14px', sm: '16px' }
                            }
                        }}
                    />
                )}
                
                <Chip
                    icon={<HowToVoteIcon />}
                    label={`${skipCount}/${threshold}`} // Shortened on all screens
                    size="small"
                    color={skipCount >= threshold ? "success" : "default"}
                    variant="outlined"
                    sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.3)', 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: '24px', sm: '28px' }, // Smaller on mobile
                        '& .MuiChip-icon': {
                            fontSize: { xs: '14px', sm: '16px' }
                        }
                    }}
                />
                
                {/* ALWAYS show viewers chip - it's critical */}
                <Chip
                    icon={<PeopleIcon />}
                    label={isMobile ? `${liveViewers}` : `${liveViewers} viewers`} // Just number on mobile
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.3)', 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: '24px', sm: '28px' }, // Smaller on mobile
                        '& .MuiChip-icon': {
                            fontSize: { xs: '14px', sm: '16px' }
                        }
                    }}
                />
            </Box>
    
            {/* Progress Bar - Hide on mobile screens to save space */}
            {!isMobile && threshold > 0 && (
                <Box sx={{ minWidth: 150, ml: 2 }}>
                    <Typography 
                        variant="caption" 
                        color="white" 
                        align="center" 
                        display="block"
                    >
                        {showCreatorMode 
                            ? `${skipCount} users want to skip`
                            : `${skipCount}/${threshold} votes needed`
                        }
                    </Typography>
                    <Box sx={{ 
                        width: '100%', 
                        height: 4, 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            width: `${Math.min((skipCount / Math.max(threshold, 1)) * 100, 100)}%`,
                            height: '100%',
                            bgcolor: showCreatorMode 
                                ? '#4caf50'  // Green for creator view
                                : skipCount >= threshold ? '#4caf50' : '#ff9800',
                            transition: 'width 0.3s ease'
                        }} />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default SkipVoteDisplay;