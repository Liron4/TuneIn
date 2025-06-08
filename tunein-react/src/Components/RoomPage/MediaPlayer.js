import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const MediaPlayer = ({ videoId, startTime = 0, songData }) => {
    const playerRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const [playerReady, setPlayerReady] = useState(false);

    // Only initialize the player when videoId changes
    useEffect(() => {
        // Store the current videoId to check if we need to reinitialize
        const currentVideoId = videoId;

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';

            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => initializePlayer(currentVideoId);
        } else {
            initializePlayer(currentVideoId);
        }

        return () => {
            // Only destroy the player if we're unmounting or changing videos
            if (youtubePlayerRef.current) {
                setPlayerReady(false);
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
        };
    }, [videoId]); // Only depend on videoId

    // Update player when startTime changes, but only if player is ready
    useEffect(() => {
        // Added a small delay and more robust checking
        if (playerReady && youtubePlayerRef.current) {
            const timer = setTimeout(() => {
                try {
                    // Double-check that the player is still valid and has seekTo method
                    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
                        youtubePlayerRef.current.seekTo(startTime);
                    } else {
                        console.log('Player not ready for seeking yet');
                    }
                } catch (err) {
                    console.error('Error seeking to time:', err);
                }
            }, 500); // Add small delay to ensure player is fully initialized

            return () => clearTimeout(timer);
        }
    }, [startTime, playerReady]);

    const initializePlayer = (currentVideoId) => {
        if (!window.YT || !window.YT.Player) {
            // YouTube API not ready yet, retry in 100ms
            setTimeout(() => initializePlayer(currentVideoId), 100);
            return;
        }

        try {
            // Only reinitialize if necessary
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.loadVideoById({
                    videoId: currentVideoId,
                    startSeconds: startTime
                });
                return;
            }

            youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
                height: '100%',
                width: '100%',
                videoId: currentVideoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    disablekb: 0,
                    fs: 0,
                    rel: 0,
                    start: startTime || 0,
                    modestbranding: 1,
                    playsinline: 1, // Important for mobile
                    mute: 0 // Start unmuted if possible
                },
                events: {
                    onReady: (event) => {
                        console.log('YouTube player ready');
                        setPlayerReady(true);

                        // Force autoplay with multiple approaches
                        try {
                            // Try to unmute and play (works in most browsers)
                            event.target.unMute();
                            event.target.playVideo();

                            // Add fallback for when autoplay is blocked
                            setTimeout(() => {
                                // Check if video isn't playing yet
                                if (event.target.getPlayerState() !== 1) {
                                    console.log('Attempting secondary play...');
                                    event.target.playVideo();
                                }
                            }, 1000);

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
        }
    };

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