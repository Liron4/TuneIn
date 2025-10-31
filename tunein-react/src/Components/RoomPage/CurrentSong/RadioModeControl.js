// RadioModeControl.js
import React, { useEffect, useRef, useState } from 'react';
import { Button, Box } from '@mui/material';

const RadioModeControl = ({ player, isRadioMode, setIsRadioMode, audioContextRef }) => {
  const audioPipeRef = useRef(null);
  const [videoElementKey, setVideoElementKey] = useState(0); // Track video element changes

  // 1. The "Unlock" Click
  const toggleRadioMode = () => {
    // Create AudioContext on first click (if not already created)
    if (!audioContextRef.current) {
      // Create the "unlocked speaker" on the first click
      audioContextRef.current = new AudioContext();
      console.log('🔊 AudioContext created and unlocked!');
    }
    
    // Toggle radio mode (state is now managed by parent)
    setIsRadioMode(prevMode => {
      const newMode = !prevMode;
      console.log(`📻 Radio Mode ${newMode ? 'ENABLED' : 'DISABLED'}`);
      return newMode;
    });
  };

  // 2. Monitor for video element changes (when new songs load)
  useEffect(() => {
    if (!player || !isRadioMode) return;

    // Poll to detect when video element changes (new song loaded)
    const checkVideoElement = setInterval(() => {
      try {
        const iframe = player.getIframe();
        if (!iframe) return;
        
        const videoElement = iframe.contentWindow.document.querySelector('video');
        if (videoElement && (!audioPipeRef.current || audioPipeRef.current.mediaElement !== videoElement)) {
          console.log('New video element detected - will recreate audio pipe');
          setVideoElementKey(prev => prev + 1); // Trigger pipe recreation
        }
      } catch (e) {
        // Ignore CORS errors during polling
      }
    }, 500); // Check every 500ms

    return () => clearInterval(checkVideoElement);
  }, [player, isRadioMode]);

  // 3. The "Pipe" Logic - Creates/recreates pipe when video changes
  useEffect(() => {
    // Wait until we have both the player AND the unlocked speaker
    if (!player || !audioContextRef.current || !isRadioMode) return;

    const audioContext = audioContextRef.current;
    
    // Helper function to create/re-create the pipe
    const createAndConnectPipe = () => {
      try {
        const iframe = player.getIframe();
        if (!iframe) {
          console.log('No iframe found');
          return false;
        }
        
        const videoElement = iframe.contentWindow.document.querySelector('video');
        if (!videoElement) {
          console.log('No video element found');
          return false;
        }

        // Always recreate the pipe for the current video element
        // Disconnect old pipe if exists
        if (audioPipeRef.current) {
          try { 
            audioPipeRef.current.disconnect();
            console.log('Disconnected old audio pipe');
          } catch (e) {}
        }
        
        // Create new pipe source
        const source = audioContext.createMediaElementSource(videoElement);
        source.mediaElement = videoElement; // Store reference
        audioPipeRef.current = source;
        
        // Always connect the pipe to the audio destination when Radio Mode is ON
        audioPipeRef.current.connect(audioContext.destination);
        console.log('✅ Audio pipe created and connected for video element');
        
        // IMPORTANT: Mute the player so audio only comes through the pipe
        player.mute();
        console.log('YouTube player muted - audio now flowing through Web Audio API');
        
        return true;
      } catch (e) {
        console.error('Error creating audio pipe:', e);
        return false;
      }
    };
    
    // Create and connect the pipe immediately
    const pipeCreated = createAndConnectPipe();
    
    if (!pipeCreated) {
      console.log('Failed to create audio pipe.');
    }
    
    // 4. The "Visibility Toggle" Logic
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden - audio continues via Web Audio API pipe');
      } else {
        console.log('Tab visible - audio still via Web Audio API pipe');
      }
      // Note: We keep the player muted at all times in Radio Mode
      // Audio always flows through the Web Audio API pipe
    };
    
    // Listen for visibility changes (for logging/debugging)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function (runs when mode is toggled OFF or video changes)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Note: We don't disconnect here because we want seamless transitions between songs
    };
  }, [isRadioMode, player, videoElementKey]); // Re-run when video element changes

  // 5. Cleanup when Radio Mode is turned OFF
  useEffect(() => {
    if (!isRadioMode && player && audioPipeRef.current) {
      // Radio Mode is OFF - clean up
      try { 
        player.unMute();
        console.log('Radio Mode OFF - YouTube player unmuted');
      } catch(e) {}
      
      if (audioPipeRef.current) {
        try { 
          audioPipeRef.current.disconnect();
          audioPipeRef.current = null;
          console.log('Audio pipe disconnected and cleared');
        } catch (e) {}
      }
    }
  }, [isRadioMode, player]);

  // Always render the control (even if player isn't ready yet)
  return null; // This component now only handles logic, UI moved to parent
};

export default RadioModeControl;
