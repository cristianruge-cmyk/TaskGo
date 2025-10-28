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
import Header from "../components/Header";
import Footer from "../components/Footer";

function Dashboard() {
  const [showStats, setShowStats] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [tasks, setTasks] = useState([]);
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
    <div className="relative min-h-screen flex flex-col 
      bg-gradient-to-br from-blue-500 to-blue-800 
      dark:from-gray-900 dark:to-gray-800 
      transition-colors text-white">

      {/* Header */}
      <Header />

      {/* Contenedor principal */}
      <div className="flex flex-col md:flex-row justify-center gap-8 flex-1 p-6">
        {/* Columna izquierda: Crear tarea */}
        <div className="md:w-[400px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 🔹 Mantiene translucido */}
            <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg p-6">
              <CreateTask />
            </div>
          </motion.div>
        </div>

        {/* Columna derecha: Lista de tareas */}
        <div className="md:flex-1 w-full max-w-3xl mx-auto">
          <AnimatePresence>
            {showTasks && (
              <motion.div
                key="tasklist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                {/* 🔹 Mantiene translucido */}
                <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg p-6">
                  <TaskList />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sección inferior */}
      <div className="mt-6 px-6">
        <div className="flex justify-center gap-4">
          {/* Botón Tu progreso */}
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="px-4 py-2 bg-white/20 dark:bg-gray-700/60 
            text-white font-semibold rounded shadow 
            hover:bg-white/30 dark:hover:bg-gray-600 transition"
          >
            {showProgress ? "Ocultar progreso" : "Tu progreso"}
          </button>

          {/* Botón estadísticas */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-white/20 dark:bg-gray-700/60 
            text-white font-semibold rounded shadow 
            hover:bg-white/30 dark:hover:bg-gray-600 transition"
          >
            {showStats ? "Ocultar estadísticas" : "Ver estadísticas semanales"}
          </button>
        </div>

        {/* Panel de progreso (🔹 ahora en blanco sólido) */}
        <AnimatePresence>
          {showProgress && (
            <motion.div
              key="progress-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="mt-4"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-gray-800 dark:text-gray-100">
                <ProgressPanel
                  tasks={tasks}
                  total={total}
                  completadas={completadas}
                  pendientes={pendientes}
                  progress={progress}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de estadísticas (🔹 mantiene translucido) */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              key="weekly-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="mt-4"
            >
              <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg p-6">
                <WeeklyStats />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Dashboard;
