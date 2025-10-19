import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DailyProgress() {
  const [created, setCreated] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("createdAt", ">=", todayStart)
        );

        const unsub = onSnapshot(q, snapshot => {
          let total = 0;
          let done = 0;
          snapshot.forEach(doc => {
            total++;
            if (doc.data().completed) done++;
          });
          setCreated(total);
          setCompleted(done);
        });

        return () => unsub();
      }
    });
  }, []);

  const percent = created === 0 ? 0 : Math.round((completed / created) * 100);

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-purple-700 mb-2">Progreso diario</h3>
      <p className="text-center text-sm text-gray-700 mb-2">
        {completed} de {created} tareas completadas ({percent}%)
      </p>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-purple-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
