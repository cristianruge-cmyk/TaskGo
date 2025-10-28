import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import taskgoLogo from "../assets/taskgo-logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Crear documento del usuario si no existe
  const ensureUserDoc = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email,
        background: "default"
      });
    }
  };

  // 🔐 Login con correo y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(result.user);
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // 🔐 Login con Google (Popup con fallback a Redirect)
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
      navigate("/dashboard");
    } catch (error) {
      console.warn("Popup falló, usando redirect:", error.message);
      try {
        await signInWithRedirect(auth, provider);
      } catch (err) {
        alert("Error en login con Google: " + err.message);
      }
    }
  };

  // 🔄 Manejar resultado de Redirect
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await ensureUserDoc(result.user);
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        if (error) console.error("Error en redirect:", error.message);
      });
  }, [navigate]);

  // 🔐 Recuperar contraseña
  const handleResetPassword = async () => {
    if (!email) {
      alert("Por favor ingresa tu correo para recuperar la contraseña");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Se envió un correo para restablecer tu contraseña");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-800">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={taskgoLogo} alt="TaskGo Logo" className="h-24" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Botón de Google */}
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
              fill="currentColor"
            >
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 122.6 24.5 165.1 64.9l-67 64.9C322.5 100.3 288.9 88 248 88c-86.1 0-156 71.9-156 168s69.9 168 156 168c74.5 0 122.1-42.5 127.6-101.5H248v-81.3h240c2.3 13.2 3.4 27.1 3.4 42.6z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        {/* Olvidé mi contraseña */}
        <div className="mt-4 text-center">
          <button
            onClick={handleResetPassword}
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Enlace para registrarse */}
        <div className="mt-2 text-center">
          <Link to="/register" className="text-sm text-blue-600 hover:underline">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
