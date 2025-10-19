import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function WeeklyBadges() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("createdAt", ">=", startDate)
        );

        const unsub = onSnapshot(q, snapshot => {
          const dailyCounts = {};
          let total = 0;
          let maxInOneDay = 0;

          snapshot.forEach(doc => {
            const createdAt = doc.data().createdAt?.toDate();
            if (createdAt) {
              const key = createdAt.toLocaleDateString("es-CO", { weekday: "short" });
              dailyCounts[key] = (dailyCounts[key] || 0) + 1;
              total++;
            }
          });

          const activeDays = Object.keys(dailyCounts).length;
          maxInOneDay = Math.max(...Object.values(dailyCounts));

          const earned = [];
          if (activeDays >= 5) earned.push("🔥 Constancia semanal");
          if (maxInOneDay >= 7) earned.push("🎯 Día récord");
          if (total >= 25) earned.push("💪 Productividad total");

          setBadges(earned);
        });

        return () => unsub();
      }
    });
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-yellow-700 mb-2">Medallas semanales</h3>
      {badges.length > 0 ? (
        <ul className="space-y-2">
          {badges.map((badge, i) => (
            <li key={i} className="text-center text-sm text-gray-800 bg-yellow-100 px-3 py-2 rounded shadow">
              {badge}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-gray-500">Aún no has ganado medallas esta semana.</p>
      )}
    </div>
  );
}
