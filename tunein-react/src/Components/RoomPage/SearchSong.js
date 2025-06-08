import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  List
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import SongCard from './SongCard';

const SearchSong = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setSearching(true);
      setError(null);

      // Call your backend proxy endpoint
      const response = await axios.get(`http://localhost:5000/api/youtube/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.items || []);
    } catch (err) {
      console.error('Error searching YouTube:', err);
      setError('Failed to search for songs. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };


const handleSongAction = async (song) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found');

    // Fetch user profile to get the username (only token needed)
    const profileRes = await axios.get(`http://localhost:5000/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const username = profileRes.data.nickname;

    // Fetch video duration
    const videoId = song.id.videoId;
    const durationRes = await axios.get(
      `http://localhost:5000/api/youtube/duration?id=${videoId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Extract duration directly from response
    const durationInSeconds = durationRes.data.duration;

    // If duration is not found, throw error to prevent adding the song
    if (!durationInSeconds) {
      throw new Error('Could not retrieve song duration');
    }

    // Format the song object
    const formattedSong = {
      title: song.snippet.title,
      artist: song.snippet.channelTitle,
      thumbnail: song.snippet.thumbnails.default.url,
      id: videoId,
      addedby: username,
      duration: durationInSeconds
    };

    // Send to backend (extract roomId from URL path)
    const pathParts = window.location.pathname.split('/');
    const roomId = pathParts[pathParts.indexOf('room') + 1];
    if (!roomId) throw new Error('No roomId found in URL path');
    
    await axios.post(
      `http://localhost:5000/api/queue/${roomId}/add`,
      { song: formattedSong },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Song added to queue successfully!');
    // Optionally show success message to user
  } catch (err) {
    console.error('Error adding song to queue:', err);
    // Optionally show error message to user
  }
};


  return (
    <Box sx={{ width: '100%' }}>
      <form onSubmit={handleSearchSubmit}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs..."
            InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#1DB954' },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={searching || !query.trim()}
            sx={{
              bgcolor: '#1DB954',
              '&:hover': { bgcolor: '#1AA34A' },
              minWidth: '40px',
              height: '40px',
              padding: 0,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          </Button>
        </Box>
      </form>

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {searching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Render search results if any */}
      {searchResults.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)' }}>
            Search Results:
          </Typography>
          <List sx={{ p: 0 }}>
            {searchResults.map((song) => (
              <SongCard
                key={song.id.videoId}
                song={song}
                context="search"
                onAction={handleSongAction}
              />
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default SearchSong;