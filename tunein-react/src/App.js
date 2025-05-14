import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Pages/AuthPage";
import HomePage from "./Pages/HomePage";
import RoomPage from "./Pages/RoomPage";
import { AuthProvider, useAuth } from "./Components/AuthPage/AuthContext";

function App() {




  // Protected route component
  const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? element : <Navigate to="/auth" replace />;
  };

    return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/room" element={<ProtectedRoute element={<RoomPage />} />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;