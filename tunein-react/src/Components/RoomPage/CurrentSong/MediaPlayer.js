import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import RadioModeControl from './RadioModeControl';

const MediaPlayer = ({ videoId, startTime = 0, songData, isRadioMode, setIsRadioMode, audioContextRef }) => {
    const playerRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const [playerInstance, setPlayerInstance] = useState(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [apiLoaded, setApiLoaded] = useState(!!window.YT);
    const isInitialLoadRef = useRef(true);

    // Handle NEW songs (videoId prop changes)
    useEffect(() => {
        if (!playerInstance || !videoId) return;

        // Don't run this on the *first* load, as the player is already
        // being created with this videoId.
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }

        console.log('🎵 New videoId prop received. Loading new video:', videoId);
        playerInstance.loadVideoById({
            videoId: videoId,
            startSeconds: 0 // New songs should start at 0
        });
        console.log('📺 loadVideoById called - new video element will be created');

    }, [videoId, playerInstance]);

    // ADDED: Global function to get current time from any component
    useEffect(() => {
        // Expose getCurrentTime function globally for ChatPanel access
        window.getYouTubePlayerCurrentTime = () => {
            if (youtubePlayerRef.current && playerReady) {
                try {
                    return youtubePlayerRef.current.getCurrentTime();
                } catch (error) {
                    console.error('Error getting current time:', error);
                    return null;
                }
            }
            return null;
        };

        // ADDED: Expose setCurrentTime function globally
        window.setYouTubePlayerCurrentTime = (time) => {
            if (youtubePlayerRef.current && playerReady) {
                try {
                    youtubePlayerRef.current.seekTo(time, true);
                    return true;
                } catch (error) {
                    console.error('Error setting current time:', error);
                    return false;
                }
            }
            return false;
        };

        // Cleanup on unmount
        return () => {
            window.getYouTubePlayerCurrentTime = null;
            window.setYouTubePlayerCurrentTime = null;
        };
    }, [playerReady]);

    // Load YouTube API
    useEffect(() => {
        if (window.YT) {
            setApiLoaded(true);
            return;
        }

        console.log('Loading YouTube API...');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';

        // Define global callback
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API loaded');
            setApiLoaded(true);
        };

        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        return () => {
            // Cleanup the global callback if component unmounts before API loads
            window.onYouTubeIframeAPIReady = null;
        };
    }, []);

    // This effect handles the *initial* player creation
    useEffect(() => {
        // Ensure API is loaded
        if (!window.YT || !window.YT.Player || !apiLoaded) {
            console.log('YouTube API not ready yet');
            return;
        }

        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.destroy();
        }

        isInitialLoadRef.current = !!videoId; // Set flag for initial load only if we have a video

        console.log('Creating new YouTube player instance');
        youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
            height: '100%',
            width: '100%',
            videoId: videoId || '', // Allow idle player when no video is active
            playerVars: {
                autoplay: 1,
                controls: 1,
                disablekb: 0,
                fs: 0,
                rel: 0,
                start: startTime || 0, // Use startTime ONLY for initial load
                modestbranding: 1,
                playsinline: 1,
                mute: 0
            },
            events: {
                onReady: (event) => {
                    console.log('YouTube player ready');
                    setPlayerReady(true);
                    setPlayerInstance(event.target); // Save the player to state
                    if (videoId) {
                        event.target.playVideo();
                    }
                },
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.ENDED) {
                        console.log('Video ended (via player event)');
                    }
                },
                onError: (event) => {
                    console.error('YouTube player error:', event.data);
                }
            }
        });

        // Cleanup on unmount
        return () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
            setPlayerInstance(null);
            setPlayerReady(false);
        };
    }, [apiLoaded]); // This effect runs only once when API is loaded

    useEffect(() => {
        if (!playerInstance || videoId) return;

        try {
            console.log('⏸️ No active videoId; keeping player alive in idle state');
            playerInstance.stopVideo();
            if (typeof playerInstance.clearVideo === 'function') {
                playerInstance.clearVideo();
            }
        } catch (error) {
            console.error('Error idling YouTube player:', error);
        }
    }, [videoId, playerInstance]);

    return (
        <Box>
            <Box
                sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    overflow: 'hidden',
                    borderRadius: 1
                }}
            >
                <Box
                    ref={playerRef}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                />
            </Box>
            
            {/* Render the RadioModeControl child and pass it the live, stable player instance */}
            <RadioModeControl 
                player={playerInstance} 
                isRadioMode={isRadioMode}
                setIsRadioMode={setIsRadioMode}
                audioContextRef={audioContextRef}
            />
        </Box>
    );
};

export default MediaPlayer;