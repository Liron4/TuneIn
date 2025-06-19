import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../Context/SocketContext';

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

  // **FIX**: Always get initial data (creators need it too)
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
        console.log('[INITIAL DATA]', response.data);
      } catch (err) {
        console.error('Error getting initial skip data:', err);
        setError('Failed to load skip data');
      }
    };

    getInitialData();
  }, [roomId]); // Removed isCreator dependency

  // **ENHANCED**: Socket listeners for all users
  useEffect(() => {
    if (!newSocket) return;

    const handleSkipVoteUpdate = (data) => {
      console.log('[SOCKET] Skip vote update received:', data);
      setSkipData(prev => ({
        ...prev,
        liveViewers: data.liveViewers,
        skipCount: data.skipCount,
        threshold: data.threshold
      }));
    };

    const handleViewerCountUpdate = (data) => {
      console.log('[SOCKET] Viewer count update:', data);
      setSkipData(prev => ({
        ...prev,
        liveViewers: data.liveViewers
      }));
    };

    const handleSongSkippedByVote = (data) => {
      console.log('[SOCKET] Song skipped by vote:', data);
      setSkipData(prev => ({
        ...prev,
        skipCount: 0,
        hasUserVoted: false
      }));
    };

    newSocket.on('skipVoteUpdate', handleSkipVoteUpdate);
    newSocket.on('viewerCountUpdate', handleViewerCountUpdate);
    newSocket.on('songSkippedByVote', handleSongSkippedByVote);

    return () => {
      newSocket.off('skipVoteUpdate', handleSkipVoteUpdate);
      newSocket.off('viewerCountUpdate', handleViewerCountUpdate);
      newSocket.off('songSkippedByVote', handleSongSkippedByVote);
    };
  }, [newSocket]); // Removed isCreator dependency

  // Submit skip vote (only for non-creators)
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
      
      setSkipData(response.data);
      console.log(`[VOTE SUBMITTED] ${response.data.action}:`, response.data);
      
      if (response.data.action === 'already_voted') {
        setError('You have already voted to skip this song');
      }
      
      return true;
    } catch (err) {
      console.error('Error submitting skip vote:', err);
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