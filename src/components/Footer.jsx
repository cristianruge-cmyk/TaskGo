export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo + descripción */}
        <div>
          <h2 className="text-2xl font-bold text-white">TaskGo</h2>
          <p className="text-sm mt-2">
            Organiza tus tareas de manera simple y efectiva. 
            Tu productividad, en un solo lugar.
          </p>
        </div>

        {/* Menú */}
        <div>
          <h3 className="text-white font-semibold mb-3">Menú</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-white">Inicio</a></li>
            <li><a href="/tasks" className="hover:text-white">Tareas</a></li>
            <li><a href="/about" className="hover:text-white">Acerca de</a></li>
            <li><a href="/contact" className="hover:text-white">Contacto</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contacto</h3>
          <p>Email: contacto@taskgo.com</p>
          <p>Tel: +57 300 123 4567</p>
          <p>Bogotá, Colombia</p>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="text-white font-semibold mb-3">Síguenos</h3>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:text-white">🌐</a>
            <a href="#" className="hover:text-white">📘</a>
            <a href="#" className="hover:text-white">📸</a>
            <a href="#" className="hover:text-white">💼</a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} TaskGo. Todos los derechos reservados.</p>
        <a href="/privacy" className="hover:text-white underline">
          Política de privacidad
        </a>
      </div>
    </footer>
  );
}
