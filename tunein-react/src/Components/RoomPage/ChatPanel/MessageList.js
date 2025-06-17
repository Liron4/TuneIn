import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import Message from './Message';

const StyledMessageContainer = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column-reverse', // Messages flow from bottom up
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255,255,255,0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '3px',
  },
});

const MessageList = ({ messages }) => {
  console.log('MessageList received messages:', messages); // Debug log

  return (
    <StyledMessageContainer>
      {messages.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: 'rgba(255,255,255,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ChatIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
          <Typography variant="body2">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        messages.map((message, index) => {
          console.log(`Rendering message ${index}:`, message); // Debug log
          return (
            <Message 
              key={message.id || `msg-${index}`} 
              message={message} 
            />
          );
        })
      )}
    </StyledMessageContainer>
  );
};

export default MessageList;