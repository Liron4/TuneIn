import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAuth } from "./AuthContext";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
   const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`, 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Login response:', res.data); // Debug log

      // Validate response structure
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response: missing token');
      }

      if (!res.data.user || !res.data.user.userId) {
        throw new Error('Invalid response: missing user data');
      }

      login(res.data.token, res.data.user.userId);
      setMsg("Login successful!");
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (err) {
      console.error('Login error:', err); // Debug log
      console.error('Error response:', err.response); // Debug log
      
      if (err.response?.data?.message) {
        setMsg(err.response.data.message);
      } else if (err.message) {
        setMsg(err.message);
      } else {
        setMsg("Login failed - please try again");
      }
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />
      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      {msg && (
        <Alert severity={msg.includes("successful") ? "success" : "error"}>
          {msg}
        </Alert>
      )}
    </Box>
  );
}