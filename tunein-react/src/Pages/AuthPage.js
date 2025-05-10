import { useState } from "react";
import Login from "../Components/AuthPage/Login";
import Register from "../Components/AuthPage/Register";
import { Box, Button, ButtonGroup, Paper, Container } from "@mui/material";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

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
          {isLogin ? <Login /> : <Register />}
        </Paper>
      </Container>
    </Box>
  );
}
