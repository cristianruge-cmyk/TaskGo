import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProgressPanel({ tasks, total, completadas, pendientes, progress }) {
  const [open, setOpen] = useState(false);

  // 🔎 Agrupar tareas por día (fecha sin hora)
  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.createdAt?.seconds) {
        const date = new Date(t.createdAt.seconds * 1000);
        const key = date.toISOString().split("T")[0]; // YYYY-MM-DD
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [tasks]);

  // 🏆 Récord personal
  const recordDay = useMemo(() => {
    let bestDay = null;
    let max = 0;
    Object.entries(tasksByDay).forEach(([day, count]) => {
      if (count > max) {
        max = count;
        bestDay = day;
      }
    });
    return { day: bestDay, count: max };
  }, [tasksByDay]);

  // 🔥 Racha de superación (días consecutivos superando el récord anterior)
  const streak = useMemo(() => {
    if (!recordDay.day) return 0;
    const sortedDays = Object.keys(tasksByDay).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let prevCount = 0;

    sortedDays.forEach(day => {
      const count = tasksByDay[day];
      if (count > prevCount) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
      prevCount = count;
    });

    return maxStreak;
  }, [tasksByDay, recordDay]);

  // 🥇 Medallas semanales (ejemplo simple)
  const medals = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const tasksThisWeek = tasks.filter(
      t => t.createdAt?.seconds * 1000 >= startOfWeek.getTime()
    );

    const completedThisWeek = tasksThisWeek.filter(t => t.completed).length;

    if (completedThisWeek >= 15) return "🥇 Oro";
    if (completedThisWeek >= 10) return "🥈 Plata";
    if (completedThisWeek >= 5) return "🥉 Bronce";
    return null;
  }, [tasks]);

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-white text-blue-700 font-semibold rounded shadow hover:bg-blue-100 transition"
      >
        {open ? "Ocultar estadísticas" : "Tu progreso"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="progress-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-white/90 backdrop-blur rounded-lg p-4 shadow space-y-4 text-gray-800"
          >
            {/* Resumen */}
            <div>
              <p><span className="font-semibold">Total:</span> {total} tareas</p>
              <p><span className="font-semibold">Pendientes:</span> {pendientes}</p>
              <p><span className="font-semibold">Completadas:</span> {completadas}</p>
              <p><span className="font-semibold">{progress}%</span> completado</p>
              <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Medallas */}
            <div>
              <h3 className="font-semibold">🏅 Medallas semanales</h3>
              {medals ? (
                <p className="text-sm text-gray-600">Has ganado: {medals}</p>
              ) : (
                <p className="text-sm text-gray-600">Aún no has ganado medallas esta semana.</p>
              )}
            </div>

            {/* Récord personal */}
            <div>
              <h3 className="font-semibold">🏆 Récord personal</h3>
              {recordDay.day ? (
                <p className="text-sm text-gray-600">
                  Tu mejor día fue {new Date(recordDay.day).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short"
                  })} con {recordDay.count} tareas creadas.
                </p>
              ) : (
                <p className="text-sm text-gray-600">Aún no tienes récord registrado.</p>
              )}
            </div>

            {/* Racha */}
            <div>
              <h3 className="font-semibold">🔥 Racha de superación</h3>
              <p className="text-sm text-gray-600">
                Racha actual: {streak} días superando tu récord.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
