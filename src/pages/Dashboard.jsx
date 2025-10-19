import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CreateTask from "../components/CreateTask";
import TaskList from "../components/TaskList";
import WeeklyStats from "../components/WeeklyStats";
import ProgressPanel from "../components/ProgressPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [showStats, setShowStats] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate("/login");
        return;
      }

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        orderBy("dueDate", "asc")
      );

      const unsubscribe = onSnapshot(q, (snap) => {
        const tasksData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTasks(tasksData);
        setLoadingTasks(false);
      });

      return () => unsubscribe();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const total = tasks.length;
  const completadas = tasks.filter(t => t.completed).length;
  const pendientes = total - completadas;
  const progress = total === 0 ? 0 : Math.round((completadas / total) * 100);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 to-blue-800 flex flex-col md:flex-row p-4 gap-6">
      
      {/* 🔴 Botón de cerrar sesión */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded shadow transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Columna izquierda */}
      <aside className="md:w-80 w-full space-y-6 text-white">
        <ProgressPanel
          tasks={tasks}
          total={total}
          completadas={completadas}
          pendientes={pendientes}
          progress={progress}
        />

        {/* Botón estadísticas semanales */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-white text-blue-700 font-semibold rounded shadow hover:bg-blue-100 transition"
          >
            {showStats ? "Ocultar estadísticas" : "Ver estadísticas semanales"}
          </button>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              key="weekly-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <WeeklyStats />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Panel central desplazado + animado */}
      <main className="flex-1 flex flex-col items-center justify-start mt-6 md:mt-0 space-y-6 ml-16">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <img
              src="/logo.png"
              alt="TaskGo"
              className="h-14 w-auto drop-shadow-md"
            />
          </motion.div>

          {/* Animación para el formulario */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CreateTask />
          </motion.div>

          {/* Botón mostrar/ocultar tareas */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="px-4 py-2 bg-white text-blue-700 font-semibold rounded shadow hover:bg-blue-100 transition"
            >
              {showTasks ? "Ocultar tus tareas" : "Mostrar tus tareas"}
            </button>
          </div>

          {/* Lista de tareas */}
          <AnimatePresence>
            {showTasks && (
              <motion.div
                key="tasklist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <TaskList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
