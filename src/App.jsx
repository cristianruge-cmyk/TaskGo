import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      {/* Contenedor global con soporte para tema claro/oscuro */}
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas privadas */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>

        {/* Toaster para notificaciones visuales (global) */}
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </ThemeProvider>
  );
}

export default App;
