import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function WeeklyStats() {
  const [taskCounts, setTaskCounts] = useState([]);

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

        const unsubscribeTasks = onSnapshot(q, snapshot => {
          const counts = {};
          for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
            counts[key] = 0;
          }

          snapshot.forEach(doc => {
            const createdAt = doc.data().createdAt?.toDate();
            if (createdAt) {
              const key = createdAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
              if (counts[key] !== undefined) counts[key]++;
            }
          });

          const ordered = Object.entries(counts).reverse();
          setTaskCounts(ordered);
        });

        return () => unsubscribeTasks();
      }
    });
  }, []);

  const data = {
    labels: taskCounts.map(([date]) => date),
    datasets: [
      {
        label: "Tareas creadas",
        data: taskCounts.map(([_, count]) => count),
        backgroundColor: "rgba(34,197,94,0.7)",
        borderColor: "rgba(0,0,0,0.8)",
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-blue-700 mb-2">Tareas creadas por día (última semana)</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

