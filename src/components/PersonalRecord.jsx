import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import confetti from "canvas-confetti";
import { saveProgress } from "../utils/saveProgress";

export default function PersonalRecord() {
  const [record, setRecord] = useState({ date: null, count: 0 });
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) return;

      const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

      const unsubscribeSnapshot = onSnapshot(q, snapshot => {
        const counts = {};
        const todayKey = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

        snapshot.forEach(doc => {
          const createdAt = doc.data().createdAt?.toDate();
          if (createdAt) {
            const key = createdAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
            counts[key] = (counts[key] || 0) + 1;
          }
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const [bestDate, bestCount] = sorted[0] || [null, 0];
        const todayCount = counts[todayKey] || 0;

        setRecord({ date: bestDate, count: bestCount });
        setTodayCount(todayCount);

        // ✅ Aquí ya tenemos acceso a user.uid
        saveProgress(user.uid, { date: bestDate, count: bestCount }, null, null);

        if (todayCount > bestCount) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
      });

      // Limpieza del snapshot listener
      return () => unsubscribeSnapshot();
    });

    // Limpieza del auth listener
    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-indigo-700 mb-2">🏆 Récord personal</h3>
      {record.date ? (
        <p className="text-center text-sm text-gray-700">
          Tu mejor día fue <strong>{record.date}</strong> con <strong>{record.count}</strong> tareas creadas.
        </p>
      ) : (
        <p className="text-center text-sm text-gray-500">Aún no tienes récord registrado.</p>
      )}
      {todayCount > record.count && (
        <p className="text-center text-sm text-green-600 mt-2 font-semibold">
          ¡Nuevo récord hoy con {todayCount} tareas! 🎉
        </p>
      )}
    </div>
  );
}