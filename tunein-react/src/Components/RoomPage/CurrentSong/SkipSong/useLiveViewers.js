import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../Context/SocketContext';

export const useLiveViewers = (roomId, isCreator) => {
  const { newSocket } = useSocket();
  const [skipData, setSkipData] = useState({
    liveViewers: 0,
    skipCount: 0,
    threshold: 0,
    hasUserVoted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get initial data for all users (creators and regular users)
  useEffect(() => {
    const getInitialData = async () => {
      if (!roomId) return;

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/live-viewers/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSkipData(response.data);
        setError(''); // Clear any previous errors
        console.log('[HOOK] Initial data loaded:', response.data);
      } catch (err) {
        console.error('[HOOK] Error getting initial skip data:', err);
        setError('Failed to load skip data');
      }
    };

    getInitialData();
  }, [roomId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!newSocket) return;

    const handleSkipVoteUpdate = (data) => {
      console.log('[HOOK] Skip vote update received:', data);
      setSkipData(prev => ({
        ...prev,
        liveViewers: data.liveViewers,
        skipCount: data.skipCount,
        threshold: data.threshold
      }));
    };

    const handleViewerCountUpdate = (data) => {
      console.log('[HOOK] Viewer count update:', data);
      setSkipData(prev => ({
        ...prev,
        liveViewers: data.liveViewers,
        // Recalculate threshold when viewer count changes
        threshold: data.liveViewers <= 1 ? 1 : 
                   data.liveViewers === 2 ? 2 : 
                   Math.floor(data.liveViewers / 2) + 1
      }));
    };

    const handleSongSkippedByVote = (data) => {
      console.log('[HOOK] Song skipped by vote:', data);
      setSkipData(prev => ({
        ...prev,
        skipCount: 0,
        hasUserVoted: false
      }));
    };

    const handleSongChanged = () => {
      console.log('[HOOK] Song changed - resetting vote state');
      setSkipData(prev => ({
        ...prev,
        skipCount: 0,
        hasUserVoted: false
      }));
    };

    newSocket.on('skipVoteUpdate', handleSkipVoteUpdate);
    newSocket.on('viewerCountUpdate', handleViewerCountUpdate);
    newSocket.on('songSkippedByVote', handleSongSkippedByVote);
    newSocket.on('songChanged', handleSongChanged);

    return () => {
      newSocket.off('skipVoteUpdate', handleSkipVoteUpdate);
      newSocket.off('viewerCountUpdate', handleViewerCountUpdate);
      newSocket.off('songSkippedByVote', handleSongSkippedByVote);
      newSocket.off('songChanged', handleSongChanged);
    };
  }, [newSocket]);

  // Submit skip vote
  const submitSkipVote = async () => {
    if (loading) return false;
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/live-viewers/${roomId}/vote-skip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state immediately with server response
      setSkipData(response.data);
      console.log('[HOOK] Vote submitted:', response.data);
      
      return true;
    } catch (err) {
      console.error('[HOOK] Error submitting skip vote:', err);
      setError('Failed to process skip vote');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    skipData,
    loading,
    error,
    submitSkipVote
  };
};