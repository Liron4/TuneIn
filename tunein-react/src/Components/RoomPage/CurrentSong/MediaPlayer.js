import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const MediaPlayer = ({ 
    videoId, 
    startTime = 0, 
    songData,
    visible = true,
    keepLastSongWhenEmpty = true,
    resumeRetryCount = 3,
    resumeRetryIntervalMs = 750
}) => {
    const playerRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const [playerInstance, setPlayerInstance] = useState(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [apiLoaded, setApiLoaded] = useState(!!window.YT);
    const isInitialLoadRef = useRef(true);
    
    // Handle Visibility (Infinite Persistence)
    useEffect(() => {
        if (!playerInstance) return;

        if (!visible) {
            // Hidden: Just pause the video. 
            // We do NOT destroy the player (infinite persistence) so the iframe 
            // stays mounted and the Android notification metadata remains active.
            console.log('Hiding player: pausing video (keeping instance alive)');
            try {
                playerInstance.pauseVideo();
            } catch (e) { console.error('Error pausing video:', e); }
        }
        // When visible becomes true again, the other useEffect (videoId change) 
        // or the parent component will handle playing the new song.
    }, [visible, playerInstance]);

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

    // Resume Retry Logic (Best Effort)
    useEffect(() => {
        const handleVisibilityChange = () => {
             if (document.visibilityState === 'hidden' && playerInstance && visible) {
                 console.log('Page hidden, attempting to keep playback alive (resume retry)');
                 let attempts = 0;
                 const tryResume = () => {
                     if (attempts >= resumeRetryCount) return;
                     attempts++;
                     console.log(`Resume attempt ${attempts}`);
                     try {
                         playerInstance.playVideo();
                     } catch(e) {}
                     setTimeout(tryResume, resumeRetryIntervalMs);
                 };
                 tryResume();
             }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handleVisibilityChange);
        };
    }, [playerInstance, visible, resumeRetryCount, resumeRetryIntervalMs]);

    // Global function to get current time from any component
    useEffect(() => {
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

        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API loaded');
            setApiLoaded(true);
        };

        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        return () => {
            window.onYouTubeIframeAPIReady = null;
        };
    }, []);

    // This effect handles the *initial* player creation
    useEffect(() => {
        if (!window.YT || !window.YT.Player || !apiLoaded) {
            console.log('YouTube API not ready yet');
            return;
        }

        if (youtubePlayerRef.current) {
            return;
        }

        isInitialLoadRef.current = !!videoId; 

        console.log('Creating new YouTube player instance');
        youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
            height: '100%',
            width: '100%',
            videoId: videoId || '', 
            playerVars: {
                autoplay: 1,
                controls: 1,
                disablekb: 0,
                fs: 0,
                rel: 0,
                start: startTime || 0, 
                modestbranding: 1,
                playsinline: 1,
                mute: 0,
                origin: window.location.origin
            },
            events: {
                onReady: (event) => {
                    console.log('YouTube player ready');
                    setPlayerReady(true);
                    setPlayerInstance(event.target); 
                    
                    // Set attributes for Android
                    try {
                        const iframe = event.target.getIframe();
                        if (iframe) {
                            iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
                        }
                    } catch(e) { console.error('Error setting iframe attributes:', e); }

                    if (videoId && visible) {
                        event.target.playVideo();
                    }
                },
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.ENDED) {
                        console.log('Video ended (via player event)');
                        // Keep session alive by seeking to start and pausing instead of stopping
                        event.target.seekTo(0);
                        event.target.pauseVideo();
                    }
                },
                onError: (event) => {
                    console.error('YouTube player error:', event.data);
                }
            }
        });

        return () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
            setPlayerInstance(null);
            setPlayerReady(false);
        };
    }, [apiLoaded]); 

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            {/* Overlay when hidden */}
            {!visible && (
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                    bgcolor: 'transparent', 
                }} />
            )}
            
            <Box
                sx={{
                    position: 'relative',
                    paddingTop: '56.25%', 
                    overflow: 'hidden',
                    borderRadius: 1,
                    opacity: visible ? 1 : 0,
                    pointerEvents: visible ? 'auto' : 'none'
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
        </Box>
    );
};

export default MediaPlayer;