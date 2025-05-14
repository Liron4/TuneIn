import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActionArea, 
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    navigate(`/room/${room._id}`);
  };

  return (
    <Card sx={{ 
      maxWidth: '100%', 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
      }
    }}> 
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          height="140"
          image={imageError ? "/ProjectImages/default-room-image.jpg" : room.image}
          alt={room.name}
          onError={() => setImageError(true)}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {room.name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {room.genres?.slice(0, 3).map((genre, index) => (
              <Chip 
                key={index}
                label={genre}
                size="small"
                variant="outlined"
                sx={{ 
                  backgroundColor: '#FF0000', 
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
            ))}
            {room.genres?.length > 3 && (
              <Chip 
                label={`+${room.genres.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Created by: {room.creator?.nickname || "Unknown"}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default RoomCard;