import { useEffect, useState, useMemo, useRef } from "react";
import { db, auth } from "../firebase";
import confetti from "canvas-confetti";
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
  const [urgencyFilter, setUrgencyFilter] = useState("todas");
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const hasCelebrated = useRef(false);

  const urgencyColor = {
    baja: "border-green-400",
    media: "border-yellow-400",
    alta: "border-red-500"
  };

  // 🔑 Escuchar tareas en tiempo real del usuario actual
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

          // 🎉 Confetti cuando todas están completadas
          if (
            tasksData.length > 0 &&
            tasksData.every(t => t.completed) &&
            !hasCelebrated.current
          ) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
            hasCelebrated.current = true;
          } else if (tasksData.some(t => !t.completed)) {
            hasCelebrated.current = false;
          }
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

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
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

  // 🔑 Filtros
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const estadoOk =
        filter === "todas" ||
        (filter === "pendientes" && !task.completed) ||
        (filter === "completadas" && task.completed);

      const urgenciaOk =
        urgencyFilter === "todas" || task.urgency === urgencyFilter;

      return estadoOk && urgenciaOk;
    });
  }, [tasks, filter, urgencyFilter]);

  if (loading) return <p className="text-white text-center mt-4">Cargando tareas...</p>;

  return (
    <div className="mt-6 w-full max-w-3xl space-y-4">
      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {["todas", "pendientes", "completadas"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm font-semibold ${
              filter === f ? "bg-white text-blue-700" : "bg-blue-300 text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Filtros por urgencia */}
      <div className="flex flex-wrap gap-2">
        {["todas", "baja", "media", "alta"].map(u => (
          <button
            key={u}
            onClick={() => setUrgencyFilter(u)}
            className={`px-3 py-1 rounded text-sm font-semibold ${
              urgencyFilter === u ? "bg-white text-blue-700" : "bg-blue-300 text-white"
            }`}
          >
            {u === "todas" ? "Todas" : u.charAt(0).toUpperCase() + u.slice(1)}
          </button>
        ))}
      </div>

      {/* Mensajes condicionales */}
      {tasks.length === 0 && (
        <p className="text-white mt-4">No tienes tareas aún.</p>
      )}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <p className="text-white mt-4">Aún no tienes tareas que coincidan con el filtro.</p>
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
            <h3 className="text-lg font-bold text-purple-700">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-700">{task.description}</p>
            )}
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






