import { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

export default function ProgressPanel({ tasks, total, completadas, pendientes, progress }) {
  const [lastMedals, setLastMedals] = useState([]);

  // 🔎 Agrupar tareas por día
  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.createdAt?.seconds) {
        const date = new Date(t.createdAt.seconds * 1000);
        const key = date.toISOString().split("T")[0];
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

  // 🔥 Racha de superación
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

  // 🥇 Medallas semanales
  const weeklyMedal = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tasksThisWeek = tasks.filter(
      t => t.createdAt?.seconds * 1000 >= startOfWeek.getTime()
    );

    const completedThisWeek = tasksThisWeek.filter(t => t.completed).length;

    if (completedThisWeek >= 15) return "🥇 Oro semanal";
    if (completedThisWeek >= 10) return "🥈 Plata semanal";
    if (completedThisWeek >= 5) return "🥉 Bronce semanal";
    return null;
  }, [tasks]);

  // 🏅 Logros adicionales
  const extraMedals = useMemo(() => {
    const medals = [];

    if (completadas >= 5) medals.push("🥉 5 tareas completadas");
    if (completadas >= 15) medals.push("🥈 15 tareas completadas");
    if (completadas >= 30) medals.push("🥇 30 tareas completadas");

    if (streak >= 3) medals.push("🔥 Racha de 3 días");
    if (streak >= 7) medals.push("🔥 Racha de 7 días");
    if (streak >= 30) medals.push("🔥 Racha de 30 días");

    return medals;
  }, [completadas, streak]);

  // 🔔 Detectar nuevos logros y mostrar notificación + confeti
  useEffect(() => {
    const currentMedals = [
      ...(weeklyMedal ? [weeklyMedal] : []),
      ...extraMedals
    ];

    const newOnes = currentMedals.filter(m => !lastMedals.includes(m));
    if (newOnes.length > 0) {
      newOnes.forEach(m => {
        toast.success(`🏅 ¡Nuevo logro desbloqueado!: ${m}`, {
          duration: 4000,
          position: "top-right"
        });
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      setLastMedals(currentMedals);
    }
  }, [weeklyMedal, extraMedals, lastMedals]);

  return (
    <div className="space-y-4 text-gray-800 dark:text-gray-100">
      {/* Resumen */}
      <div>
        <p><span className="font-semibold">Total:</span> {total} tareas</p>
        <p><span className="font-semibold">Pendientes:</span> {pendientes}</p>
        <p><span className="font-semibold">Completadas:</span> {completadas}</p>
        <p><span className="font-semibold">{progress}%</span> completado</p>
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 mt-2">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Medallas semanales */}
      <div>
        <h3 className="font-semibold">🏅 Medallas semanales</h3>
        {weeklyMedal ? (
          <p className="text-sm">Has ganado: {weeklyMedal}</p>
        ) : (
          <p className="text-sm">Aún no has ganado medallas esta semana.</p>
        )}
      </div>

      {/* Logros adicionales */}
      <div>
        <h3 className="font-semibold">🎖️ Logros</h3>
        {extraMedals.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {extraMedals.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">Aún no has desbloqueado logros.</p>
        )}
      </div>

      {/* Récord personal */}
      <div>
        <h3 className="font-semibold">🏆 Récord personal</h3>
        {recordDay.day ? (
          <p className="text-sm">
            Tu mejor día fue {new Date(recordDay.day).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short"
            })} con {recordDay.count} tareas creadas.
          </p>
        ) : (
          <p className="text-sm">Aún no tienes récord registrado.</p>
        )}
      </div>

      {/* Racha */}
      <div>
        <h3 className="font-semibold">🔥 Racha de superación</h3>
        <p className="text-sm">
          Racha actual: {streak} días superando tu récord.
        </p>
      </div>
    </div>
  );
}
