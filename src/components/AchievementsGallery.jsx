import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function AchievementsGallery() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const ref = doc(db, "progress", user.uid);
        const unsub = onSnapshot(ref, snapshot => {
          if (snapshot.exists()) {
            setProgress(snapshot.data());
          }
        });
        return () => unsub();
      }
    });
  }, []);

  if (!progress) return null;

  const { record, streak, badges } = progress;

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-emerald-700 mb-4">🎖️ Logros desbloqueados</h3>

      {/* Medallas semanales */}
      {badges?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Medallas semanales</h4>
          <ul className="grid grid-cols-1 gap-2">
            {badges.map((badge, i) => (
              <li key={i} className="text-center text-sm text-gray-800 bg-yellow-100 px-3 py-2 rounded shadow">
                {badge}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Récord personal */}
      {record?.date && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">🏆 Récord personal</h4>
          <p className="text-sm text-gray-600">
            {record.count} tareas creadas el {record.date}
          </p>
        </div>
      )}

      {/* Racha de superación */}
      {streak >= 1 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">🔥 Racha de superación</h4>
          <p className="text-sm text-gray-600">
            {streak} día{streak !== 1 ? "s" : ""} seguidos superando tu récord
          </p>
        </div>
      )}
    </div>
  );
}
