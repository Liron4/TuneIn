import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../Context/SocketContext';

export const useVotingData = (userProfile) => {
  const { newSocket, roomId } = useSocket();
  const [votingData, setVotingData] = useState({
    currentViewers: 0,
    likeVotes: 0,
    dislikeVotes: 0,
    userVote: null
  });

  // Get current song from global function
  const getCurrentSong = () => {
    if (typeof window !== 'undefined' && window.getCurrentSongData) {
      return window.getCurrentSongData();
    }
    return null;
  };

  // Fetch voting status when component mounts or room changes
  useEffect(() => {
    const fetchVotingStatus = async () => {
      if (!roomId || !userProfile) return;

      try {
        const token = localStorage.getItem('authToken');
        console.log('useVotingData: Fetching voting status for room:', roomId);
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/vote/${roomId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Voting status response:', response.data);
        setVotingData(response.data);
      } catch (error) {
        console.error('Error fetching voting status:', error);
      }
    };

    fetchVotingStatus();
  }, [roomId, userProfile]);

  // Socket listeners
  useEffect(() => {
    if (!newSocket) return;

    console.log('useVotingData: Setting up socket listeners');

    // Listen for vote updates
    newSocket.on('voteUpdate', (data) => {
      console.log('Vote update received:', data);
      setVotingData(prevData => ({
        currentViewers: data.currentViewers,
        likeVotes: data.likeVotes,
        dislikeVotes: data.dislikeVotes,
        userVote: data.userVote !== undefined ? data.userVote : prevData.userVote
      }));
    });

    // Listen for song skip events
    newSocket.on('songSkipped', (data) => {
      console.log('Song skipped:', data.reason);
      if (data.reason === 'majority_dislike') {
        console.log(`Song auto-skipped due to ${data.dislikePercentage}% dislikes`);
        setVotingData(prev => ({
          ...prev,
          likeVotes: 0,
          dislikeVotes: 0,
          userVote: null
        }));
      }
    });

    return () => {
      newSocket.off('voteUpdate');
      newSocket.off('songSkipped');
    };
  }, [newSocket]);

  // Vote submission function - gets currentSong from global function
  const submitVote = async (voteType) => {
    const currentSong = getCurrentSong(); // Get from global function
    
    if (!currentSong || !userProfile || !roomId) {
      console.log('Cannot vote: missing requirements', {
        hasSong: !!currentSong,
        hasProfile: !!userProfile,
        hasRoom: !!roomId
      });
      return false;
    }

    try {
      const token = localStorage.getItem('authToken');
      const newVoteType = voteType === votingData.userVote ? null : voteType;
      
      console.log('Submitting vote:', {
        voteType: newVoteType,
        addedBy: currentSong.addedBy,
        songTitle: currentSong.title
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/vote/${roomId}/vote`,
        {
          voteType: newVoteType,
          addedBy: currentSong.addedBy
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Vote response:', response.data);
      setVotingData(response.data);
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  };

  return { 
    votingData, 
    submitVote, 
    getCurrentSong // Expose for components to check current song
  };
};