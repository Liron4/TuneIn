import { useState } from "react";
import Login from "../Components/AuthPage/Login";
import Register from "../Components/AuthPage/Register";
import { Box, Button, ButtonGroup, Paper, Container, Divider, Typography } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';

export default function AuthPage({onAuthSuccess}) {
  const [isLogin, setIsLogin] = useState(true);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f3f4f6"
    >
      <Container maxWidth="xs">
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
