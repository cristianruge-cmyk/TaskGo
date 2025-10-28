import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <div 
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <img
          src="/logo-taskgo.png"
          alt="TaskGo"
          className="h-12 w-auto"
        />
      </div>

      {/* Botón hamburguesa (solo visible en móvil) */}
      <button
        className="md:hidden focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {menuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Menú de navegación */}
      <nav
        className={`${
          menuOpen ? "block" : "hidden"
        } md:flex md:items-center md:space-x-6 
           absolute md:static top-full left-0 w-full md:w-auto 
           bg-blue-700 md:bg-transparent`}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="block px-4 py-2 md:p-0 hover:underline"
        >
          Inicio
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="block px-4 py-2 md:p-0 hover:underline"
        >
          Perfil
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="block px-4 py-2 md:p-0 hover:underline"
        >
          Configuración
        </button>

        {/* Botón rojo de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 
                     md:w-auto md:px-4 md:py-2 
                     bg-red-500 hover:bg-red-600 
                     text-white font-semibold rounded shadow transition 
                     mt-2 md:mt-0"
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}

export default Header;
