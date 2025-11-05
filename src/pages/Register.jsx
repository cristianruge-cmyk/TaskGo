import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import taskgoLogo from "../assets/taskgo-logo.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // 🔎 Validaciones básicas
    if (!email.includes("@")) {
      setError("El correo no es válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // ✅ Crear usuario en Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // ✅ Crear documento en Firestore coherente con tus reglas
      await setDoc(doc(db, "users", user.uid), {
        userId: user.uid, // 🔑 campo que tus reglas esperan
        email: user.email,
        name: user.displayName || "",
        background: "default"
      });

      // ✅ Redirigir al dashboard
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-800">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={taskgoLogo} alt="TaskGo Logo" className="h-24" />
        </div>

        {/* Formulario de registro */}
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="********"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Registrarse
          </button>
        </form>

        {/* Enlace para volver al login */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-purple-600 hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
