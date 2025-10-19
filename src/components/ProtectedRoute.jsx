import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <p className="text-center text-white mt-10">Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
