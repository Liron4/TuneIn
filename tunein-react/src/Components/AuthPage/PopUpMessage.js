import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function PopUpMessage() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <MusicNoteIcon color="primary" />
          <Typography variant="h6" component="span">
            Welcome to TuneIn!
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Welcome to the test run of <strong>TuneIn</strong> - a Collaborative Music Streaming Platform where you can create rooms, share music, and enjoy synchronized listening experiences with friends!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a beta version. If you encounter any bugs or have feedback, please report them to: <strong>lironbakshi@gmail.com</strong>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
          }
          label="Don't show again"
        />
        <Box flex={1} />
        <Button onClick={handleClose} variant="contained">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
