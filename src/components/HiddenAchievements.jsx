import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore";

export default function HiddenAchievements() {
  const [hidden, setHidden] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const ref = doc(db, "progress", user.uid);

        const unsub = onSnapshot(q, async snapshot => {
          const counts = {};
          let confettiCount = 0;
          let punctual = false;

          snapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();
            const dueDate = data.dueDate?.toDate();

            if (createdAt) {
              const key = createdAt.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
              counts[key] = (counts[key] || 0) + 1;
            }

            if (dueDate?.getHours() === 8 && dueDate?.getMinutes() === 0) {
              punctual = true;
            }

            if (data.confettiTriggered) {
              confettiCount++;
            }
          });

          const activeDays = Object.keys(counts).length;
          const maxInOneDay = Math.max(...Object.values(counts));
          const unlocked = [];

          if (activeDays >= 7) unlocked.push("🧠 Maestro de la rutina");
          if (punctual) unlocked.push("🕓 Planificador puntual");
          if (maxInOneDay >= 10) unlocked.push("🧹 Limpieza total");
          if (confettiCount >= 5) unlocked.push("🎉 Confetti legendario");

          setHidden(unlocked);

          await setDoc(ref, { hiddenAchievements: unlocked }, { merge: true });
        });

        return () => unsub();
      }
    });
  }, []);

  if (hidden.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6 border border-pink-300">
      <h3 className="text-center text-lg font-semibold text-pink-700 mb-2">✨ Logros secretos desbloqueados</h3>
      <ul className="space-y-2">
        {hidden.map((item, i) => (
          <li key={i} className="text-center text-sm text-gray-800 bg-pink-100 px-3 py-2 rounded shadow animate-pulse">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
