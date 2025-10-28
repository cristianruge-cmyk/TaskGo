import { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const urgencyColor = {
    baja: "border-green-400",
    media: "border-yellow-400",
    alta: "border-red-500"
  };

  // 🔑 Escuchar tareas en tiempo real
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          orderBy("dueDate", "asc")
        );

        const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(tasksData);
          setLoading(false);
        });

        return () => unsubscribeTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 🔑 Marcar como completada
  const handleComplete = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { completed: true });
    } catch (error) {
      console.error("Error al marcar como completada:", error);
    }
  };

  // 🔑 Eliminar tarea
  const handleDelete = async (taskId) => {
    setDeletingTaskId(taskId);

    setTimeout(async () => {
      try {
        const taskRef = doc(db, "tasks", taskId);
        await deleteDoc(taskRef);
        setDeletingTaskId(null);
      } catch (error) {
        console.error("Error al eliminar la tarea:", error);
        setDeletingTaskId(null);
      }
    }, 300);
  };

  // 🔑 Nueva lógica de filtros
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      switch (filter) {
        case "pendientes":
          return !task.completed;
        case "completadas":
          return task.completed;
        case "urgencia:baja":
          return task.urgency === "baja";
        case "urgencia:media":
          return task.urgency === "media";
        case "urgencia:alta":
          return task.urgency === "alta";
        default:
          return true; // "todas"
      }
    });
  }, [tasks, filter]);

  if (loading) return <p className="text-white text-center mt-4">Cargando tareas...</p>;

  return (
    <div className="mt-6 w-full max-w-3xl space-y-4">

      {/* 🔹 Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("todas")}
          className={`px-4 py-1 rounded-full font-medium transition ${
            filter === "todas"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter("pendientes")}
          className={`px-4 py-1 rounded-full font-medium transition ${
            filter === "pendientes"
              ? "bg-yellow-500 text-white"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilter("completadas")}
          className={`px-4 py-1 rounded-full font-medium transition ${
            filter === "completadas"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          Completadas
        </button>
        <button
          onClick={() => setFilter("urgencia:baja")}
          className={`px-4 py-1 rounded-full font-medium transition ${
            filter === "urgencia:baja"
              ? "bg-gray-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Baja
        </button>
        <button
          onClick={() => setFilter("urgencia:media")}
          className={`px-4 py-1 rounded-full font-medium transition ${
            filter === "urgencia:media"
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          }`}
        >
          Media
        </button>
        <button
          onClick={() => setFilter("urgencia:alta")}
          className={`px-4 py-1 rounded-full font-medium transition ${
            filter === "urgencia:alta"
              ? "bg-red-600 text-white"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          Alta
        </button>
      </div>

      {/* Mensajes condicionales */}
      {tasks.length === 0 && (
        <p className="text-white mt-4">No tienes tareas aún.</p>
      )}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <p className="text-white mt-4">
          No hay tareas que coincidan con el filtro seleccionado:{" "}
          <span className="font-semibold">{filter}</span>
        </p>
      )}

      {/* Lista de tareas */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`border-l-4 ${urgencyColor[task.urgency]} bg-white rounded-lg p-4 shadow transition-all duration-300 text-gray-800 ${
              deletingTaskId === task.id ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <h3 className="font-bold text-lg">{task.title}</h3>
            <p className="text-gray-700 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
              {task.description}
            </p>

            <p className="text-sm mt-2 text-gray-800">
              <span className="font-semibold">Urgencia:</span> {task.urgency}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Fecha límite:</span>{" "}
              {task.dueDate?.seconds
                ? new Date(task.dueDate.seconds * 1000).toLocaleString()
                : "Sin fecha"}
            </p>
            <p className="text-sm flex items-center gap-2 text-gray-800">
              <span className="font-semibold">Estado:</span>
              {task.completed ? "✅ Completada" : "⏳ Pendiente"}
            </p>

            {/* Botones de acción */}
            <div className="mt-3 flex gap-2">
              {!task.completed && (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded transition"
                >
                  Marcar como completada
                </button>
              )}
              <button
                onClick={() => handleDelete(task.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
