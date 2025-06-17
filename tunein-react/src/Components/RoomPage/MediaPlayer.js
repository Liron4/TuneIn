import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';

const MediaPlayer = ({ videoId, startTime = 0, songData }) => {
    const playerRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [apiLoaded, setApiLoaded] = useState(!!window.YT);
    const initializationRef = useRef(false);

    // Create a stable initialization function with useCallback
    const initializePlayer = useCallback(() => {
        // Prevent double initialization
        if (initializationRef.current || !videoId) return;

        if (!window.YT || !window.YT.Player) {
            console.log('YouTube API not ready yet');
            return; // The API onReady callback will handle initialization
        }

        console.log('Initializing player for video:', videoId);
        initializationRef.current = true;

        try {
            // Reuse existing player when possible
            if (youtubePlayerRef.current) {
                console.log('Loading new video in existing player');
                youtubePlayerRef.current.loadVideoById({
                    videoId: videoId,
                    startSeconds: startTime
                });

                // Ensure player is ready and playing
                youtubePlayerRef.current.playVideo();
                setPlayerReady(true);
                return;
            }

            // Create new player instance
            console.log('Creating new YouTube player instance');
            youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    disablekb: 0,
                    fs: 0,
                    rel: 0,
                    start: startTime || 0,
                    modestbranding: 1,
                    playsinline: 1,
                    mute: 0
                },
                events: {
                    onReady: (event) => {
                        console.log('YouTube player ready');
                        setPlayerReady(true);

                        // Force autoplay
                        try {
                            event.target.unMute();
                            event.target.playVideo();

                            if (startTime > 0) {
                                event.target.seekTo(startTime);
                            }
                        } catch (err) {
                            console.error('Error starting playback:', err);
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
        } catch (err) {
            console.error('Error initializing YouTube player:', err);
            initializationRef.current = false; // Reset flag to allow retry
        }
    }, [videoId, startTime]);

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

    // Reset initialization flag when video changes
    useEffect(() => {
        initializationRef.current = false;
        setPlayerReady(false);
    }, [videoId]);

    // Initialize player when API is loaded and we have a videoId
    useEffect(() => {
        if (apiLoaded && videoId) {
            initializePlayer();
        }
    }, [apiLoaded, videoId, initializePlayer]);

    // Handle seek when startTime changes but videoId doesn't
    useEffect(() => {
        if (playerReady && youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
            youtubePlayerRef.current.seekTo(startTime);
        }
    }, [startTime, playerReady]);

    // Clean up the player when component unmounts
    useEffect(() => {
        return () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
                initializationRef.current = false;
            }
        };
    }, []);

    return (
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
    );
};

export default MediaPlayer;