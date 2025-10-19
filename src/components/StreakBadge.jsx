import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { saveProgress } from "../utils/saveProgress";

export default function StreakBadge() {
  const [streak, setStreak] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

        const unsub = onSnapshot(q, snapshot => {
          const counts = {};
          snapshot.forEach(doc => {
            const createdAt = doc.data().createdAt?.toDate();
            if (createdAt) {
              const key = createdAt.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
              counts[key] = (counts[key] || 0) + 1;
            }
          });

          const sorted = Object.entries(counts).sort((a, b) => new Date(b[0]) - new Date(a[0]));
          const max = Math.max(...Object.values(counts));

          let streakCount = 0;
          let today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
            if ((counts[key] || 0) > max) {
              streakCount++;
            } else {
              break;
            }
          }

          setStreak(streakCount);
          setShowBadge(streakCount >= 3);
          saveProgress(user.uid, null, streakCount, null);
        });

        return () => unsub();
      }
    });
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-pink-700 mb-2">🔥 Racha de superación</h3>
      {showBadge ? (
        <div className="text-center text-sm text-gray-800 bg-pink-100 px-3 py-2 rounded shadow">
          ¡Has superado tu récord 3 días seguidos! 🏅 ¡Sigue así!
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          Racha actual: {streak} día{streak !== 1 ? "s" : ""} superando tu récord.
        </p>
      )}
    </div>
  );
}


