import { useState } from "react";
import Login from "../Components/AuthPage/Login";
import Register from "../Components/AuthPage/Register";
import PopUpMessage from "../Components/AuthPage/PopUpMessage";
import DarkModeToggle from "../Components/.reusable/DarkModeToggle";
import { ThemeProvider } from "../Components/.reusable/ThemeContext";
import { Box, Button, ButtonGroup, Paper, Container, Divider, Typography, useTheme } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import tuneInLogo from "../logo.png";

function AuthPageContent({onAuthSuccess}) {
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor={theme.palette.background.default}
    >
      <DarkModeToggle />
      <PopUpMessage />
      <Container maxWidth="xs">
        <Box mb={-8} display="flex" justifyContent="center">
          <img 
            src={tuneInLogo} 
            alt="TuneIn Logo" 
            style={{ maxWidth: '400px', width: '100%' }}
          />
        </Box>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box mb={2} display="flex" justifyContent="center">
            <ButtonGroup fullWidth>
              <Button
                variant={isLogin ? "contained" : "outlined"}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "contained" : "outlined"}
                onClick={() => setIsLogin(false)}
              >
                Register
              </Button>
            </ButtonGroup>
          </Box>
          {isLogin ? <Login onAuthSuccess={onAuthSuccess}/> : <Register />}

          {/* Google OAuth Button */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="textSecondary">OR</Typography>
          </Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ textTransform: 'none' }}
          >
            Continue with Google
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default function AuthPage(props) {
  return (
    <ThemeProvider>
      <AuthPageContent {...props} />
    </ThemeProvider>
  );
}
