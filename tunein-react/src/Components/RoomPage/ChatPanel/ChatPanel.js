import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import MessageList from './MessageList';
import { useSocket } from '../Context/SocketContext';

const StyledChatContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: 'rgba(33, 33, 33, 0.95)',
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.1)'
}));

const ChatPanel = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const inputRef = useRef(null);
  const { newSocket, isConnected } = useSocket();
  const MAX_MESSAGES = 200;

  console.log('ChatPanel state:', {
    roomId,
    messagesCount: messages.length,
    isConnected,
    userProfile: !!userProfile
  }); // Debug log

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');

        if (!token) {
          console.error('No auth token found');
          window.location.href = '/auth';
          return;
        }

        console.log('Fetching user profile...');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/profile`, // Fixed endpoint
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('Raw API response:', response.data);

        // Map ProfileBar property names to ChatPanel expected names
        const profileData = {
          username: response.data.nickname,           // Map nickname -> username
          profilePicture: response.data.profilePic,   // Map profilePic -> profilePicture
          genres: response.data.genres,
          points: response.data.points
        };

        console.log('Mapped user profile:', profileData);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/auth';
        }
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!newSocket) {
      console.log('ChatPanel: Waiting for socket connection...');
      return;
    }

    console.log('ChatPanel: Setting up chat listeners');

    const handleNewMessage = (message) => {
      console.log('Received new message:', message);
      setMessages(prev => {
        const newMessages = [message, ...prev];

        if (newMessages.length > MAX_MESSAGES) {
          return newMessages.slice(0, MAX_MESSAGES);
        }

        return newMessages;
      });
    };

    // Listen for chat messages
    newSocket.on('newChatMessage', handleNewMessage);

    // Cleanup listener
    return () => {
      if (newSocket) {
        newSocket.off('newChatMessage', handleNewMessage);
      }
    };
  }, [newSocket]); // Dependencies: re-run when socket changes



  // Get current video time directly from MediaPlayer using global function
  const getCurrentVideoTime = () => {
    if (window.getYouTubePlayerCurrentTime) {
      const currentTime = window.getYouTubePlayerCurrentTime();
      return currentTime !== null ? Math.floor(currentTime) : null;
    }
    return null;
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected || !userProfile) {
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        isConnected,
        hasProfile: !!userProfile
      });
      return;
    }

    // Client-side validation for 50 characters
    if (newMessage.length > 50) {
      console.log('Message too long:', newMessage.length);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      // Get current video timestamp directly from MediaPlayer
      const videoTimestamp = getCurrentVideoTime();

      console.log('Sending message:', {
        message: newMessage.trim(),
        videoTimestamp,
        userPicture: userProfile.profilePicture,
        nickname: userProfile.username
      });

      // Send message with all user data
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chat/${roomId}/send`,
        {
          message: newMessage.trim(),
          videoTimestamp,
          userPicture: userProfile.profilePicture,
          nickname: userProfile.username
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNewMessage('');
      inputRef.current?.focus();
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
      } else {
        alert('Network error: Failed to send message. Please check your connection and try again.');
      }
    }
  };

  // Handle Enter key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <StyledChatContainer>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <ChatIcon sx={{ color: 'white', fontSize: 20 }} />
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>
          Room Chat
        </Typography>
        <Box sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isConnected ? '#4caf50' : '#f44336',
          ml: 'auto'
        }} />
      </Box>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            ref={inputRef}
            fullWidth
            variant="outlined"
            placeholder={userProfile ? "Type a message..." : "Loading..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || !userProfile}
            size="small"
            multiline
            maxRows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: newMessage.length > 50 ? '#f44336' : 'rgba(255,255,255,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: newMessage.length > 50 ? '#f44336' : 'rgba(255,255,255,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: newMessage.length > 50 ? '#f44336' : 'rgba(29, 185, 84, 0.8)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.5)',
                opacity: 1,
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected || !userProfile || newMessage.length > 50}
            sx={{
              bgcolor: 'rgba(29, 185, 84, 0.8)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(29, 185, 84, 1)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        {/* Character count with visual feedback */}
        <Typography
          variant="caption"
          sx={{
            color: newMessage.length > 50 ? '#f44336' :
              newMessage.length > 40 ? '#ff9800' :
                'rgba(255,255,255,0.4)',
            fontSize: '0.7rem',
            mt: 0.5,
            display: 'block',
            fontWeight: newMessage.length > 50 ? 600 : 400
          }}
        >
          {newMessage.length}/50 {newMessage.length > 50 && '- Message too long!'}
        </Typography>
      </Box>
    </StyledChatContainer>
  );
};

export default ChatPanel;