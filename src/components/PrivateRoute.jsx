import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <p className="text-white text-center mt-10">Cargando...</p>;
  }

  return user ? children : <Navigate to="/" replace />;
}
