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
import { useAuthState } from "react-firebase-hooks/auth";
import taskgoLogo from "../assets/taskgo-logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  // ✅ Crear documento de usuario si no existe
  const ensureUserDoc = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        userId: user.uid, // 🔑 coherente con reglas Firestore
        name: user.displayName || "",
        email: user.email,
        background: "default"
      });
    }
  };

  // ✅ Capturar resultado de login con redirect
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

  // ✅ Redirigir si ya hay sesión activa
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

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

