import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const GenrePicker = ({
  currentGenres = [],
  onGenresUpdated,
  maxGenres = 5,
  disabled = false,
  label = "Add genre",
  chipBackgroundColor = '#2a2a2a',
  chipHoverColor = '#3a3a3a',
  chipTextColor = 'white',
  textFieldStyles = {}, // Allow passing custom styles for TextField
}) => {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    if (localError) {
      setLocalError(''); // Clear error on input change
    }
  };

  // Add missing functionalities:
const handleAddGenre = () => {
  const newGenreToAdd = inputValue.trim();
  if (!newGenreToAdd) {
    setLocalError('Genre cannot be empty.');
    return;
  }
  if (currentGenres.length >= maxGenres) {
    setLocalError(`Maximum ${maxGenres} genres allowed.`);
    return;
  }
  if (currentGenres.map(g => g.toLowerCase()).includes(newGenreToAdd.toLowerCase())) {
    setLocalError('Genre already added.');
    return; // Add this return statement
  }

  const updatedGenres = [...currentGenres, newGenreToAdd];
  onGenresUpdated(updatedGenres); // Call the callback to update parent
  setInputValue(''); // Clear input after adding
};

const handleDeleteGenre = (genreToDelete) => {
  const updatedGenres = currentGenres.filter(genre => genre !== genreToDelete);
  onGenresUpdated(updatedGenres);
};

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Genres ({currentGenres.length}/{maxGenres}):
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: currentGenres.length > 0 ? 2 : 0 }}>
        {currentGenres.map((genre, index) => (
          <Chip
            key={index}
            label={genre}
            onDelete={!disabled ? () => handleDeleteGenre(genre) : undefined}
            deleteIcon={<DeleteIcon />}
            disabled={disabled}
            sx={{
              backgroundColor: chipBackgroundColor,
              color: chipTextColor,
              '&:hover': { 
                backgroundColor: !disabled ? chipHoverColor : chipBackgroundColor 
              },
              '& .MuiChip-deleteIcon': {
                color: chipTextColor,
                '&:hover': {
                  color: 'rgba(255,255,255,0.7)',
                },
              },
            }}
          />
        ))}
      </Box>

      {currentGenres.length < maxGenres && !disabled && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            size="small"
            label={label}
            value={inputValue}
            onChange={handleInputChange}
            variant="outlined"
            disabled={disabled}
            error={!!localError}
            helperText={localError}
            sx={{ 
              flexGrow: 1,
              ...textFieldStyles // Apply custom styles
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddGenre();
              }
            }}
          />
          <IconButton
            onClick={handleAddGenre}
            color="primary"
            disabled={disabled || !inputValue.trim()}
            aria-label="add genre"
          >
            <AddIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default GenrePicker;