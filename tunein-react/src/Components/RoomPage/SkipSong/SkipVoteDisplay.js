import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const SkipVoteDisplay = ({ skipData, showCreatorMode = false }) => {
    const { liveViewers, skipCount, threshold } = skipData;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            {/* Vote Status Chips */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {showCreatorMode && (
                    <Chip
                        icon={<AdminPanelSettingsIcon />}
                        label="Creator"
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ 
                            backgroundColor: '#4caf50',
                            color: 'white'
                        }}
                    />
                )}
                
                <Chip
                    icon={<HowToVoteIcon />}
                    label={`${skipCount}/${threshold} votes`}
                    size="small"
                    color={skipCount >= threshold ? "success" : "default"}
                    variant="outlined"
                    sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.3)', 
                        backgroundColor: 'rgba(255,255,255,0.05)' 
                    }}
                />
                <Chip
                    icon={<PeopleIcon />}
                    label={`${liveViewers} viewers`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.3)', 
                        backgroundColor: 'rgba(255,255,255,0.05)' 
                    }}
                />
            </Box>

            {/* Progress Bar */}
            {threshold > 0 && (
                <Box sx={{ minWidth: 120 }}>
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
                            width: `${Math.min((skipCount / threshold) * 100, 100)}%`,
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