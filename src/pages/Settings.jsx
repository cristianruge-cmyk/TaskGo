import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme(); // 👈 leemos y actualizamos el tema global

  const handleThemeChange = (e) => {
    const value = e.target.value; // "light" | "dark"
    setTheme(value);              // 👈 aplica el tema (añade/quita la clase 'dark' en <html>)
    toast.success(`Tema cambiado a: ${value === "light" ? "Claro" : "Oscuro"}`);
  };

  const handleNotificationsChange = (e) => {
    const value = e.target.value;
    let msg = "Notificaciones actualizadas";
    if (value === "all") msg = "Recibirás todas las notificaciones";
    if (value === "important") msg = "Solo recibirás notificaciones importantes";
    if (value === "none") msg = "Notificaciones desactivadas";
    toast.success(msg);
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    toast.success(`Idioma cambiado a: ${value === "es" ? "Español" : "Inglés"}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 to-blue-800 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Cabecera */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Configuración</h2>

          {/* Opciones de configuración */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Tema
              </label>
              <select
                value={theme}             // 👈 refleja el tema actual
                onChange={handleThemeChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                El tema se aplica globalmente (Dashboard y Perfil).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Notificaciones
              </label>
              <select
                onChange={handleNotificationsChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="all">Todas</option>
                <option value="important">Solo importantes</option>
                <option value="none">Desactivadas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Idioma
              </label>
              <select
                onChange={handleLanguageChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </div>
          </div>

          {/* Botón volver */}
          <button
            onClick={() => {
              toast.success("Volviendo al Dashboard 🚀");
              navigate("/dashboard");
            }}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
