import {
  Box,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const SongCard = ({ song, context = 'search', onAction, disabled = false }) => {
  // Determine icon based on context (search vs queue vs display-only)
  const getActionIcon = () => {
    switch (context) {
      case 'search':
        return <AddIcon />;
      case 'queue':
        return <RemoveIcon sx={{ color: '#f44336' }} />; // Red remove icon
      case 'display':
        return null; // No icon for songs added by others
      default:
        return <AddIcon />;
    }
  };

  // Format the YouTube song data
  const formatSongData = (song) => {
    // For search results from YouTube API
    if (song.snippet) {
      return {
        title: song.snippet.title,
        artist: song.snippet.channelTitle,
        thumbnail: song.snippet.thumbnails.default.url,
        id: song.id.videoId
      };
    }
    
    // For already formatted songs (e.g., in queue)
    return song;
  };

  const formattedSong = formatSongData(song);
  const actionIcon = getActionIcon();

  return (
    <ListItem
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 1,
        mb: 1,
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.4)',
        }
      }}
      secondaryAction={
        onAction && actionIcon && (
          <IconButton 
            edge="end" 
            onClick={() => onAction(song)}
            disabled={disabled}
            sx={{ 
              color: context === 'queue' ? '#f44336' : '#1DB954', // Red for remove, green for add
              '&:hover': { 
                color: context === 'queue' ? '#d32f2f' : '#1AA34A'
              },
              '&.Mui-disabled': {
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {actionIcon}
          </IconButton>
        )
      }
    >
      <ListItemAvatar>
        <Avatar 
          src={formattedSong.thumbnail} 
          alt={formattedSong.title}
          variant="rounded"
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              fontWeight: 500
            }}
          >
            {formattedSong.title}
          </Typography>
        }
        secondary={
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)'
            }}
          >
            {formattedSong.artist || formattedSong.channelTitle}
          </Typography>
        }
      />
    </ListItem>
  );
};

export default SongCard;