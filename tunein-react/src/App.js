import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthPage from "./Pages/AuthPage";
import HomePage from "./Pages/HomePage";
import RoomPage from "./Pages/RoomPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token); // Convert to boolean
    setLoading(false);
  }, []);

  // Protected route component
  const ProtectedRoute = ({ element }) => {
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? element : <Navigate to="/auth" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="/room" element={<ProtectedRoute element={<RoomPage />} />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;