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
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("userId", res.data.user.userId); // Optional: keep if needed
      login(res.data.token); // Use context to update auth state
      setMsg("Login successful!");
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
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