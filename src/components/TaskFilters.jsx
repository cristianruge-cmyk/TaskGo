// src/components/TaskFilters.jsx
export default function TaskFilters() {
  return (
    <div className="bg-white p-4 rounded shadow text-black">
      <h2 className="text-lg font-bold mb-2">Filtros</h2>
      {/* Aquí puedes agregar filtros por urgencia, fecha, completadas, etc. */}
      <div className="space-y-2">
        <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded">Todas</button>
        <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-2 rounded">Urgencia alta</button>
        <button className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-1 px-2 rounded">Completadas</button>
      </div>
    </div>
  );
}
