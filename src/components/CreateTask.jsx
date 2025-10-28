import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// 🔹 Frases motivadoras
const frases = [
  "Una tarea menos es un peso menos 💪",
  "¡Sigue así, vas genial! 🚀",
  "Cada paso cuenta, no te detengas ✨",
  "Organízate hoy, disfruta mañana 🌟",
  "Hazlo ahora, tu yo del futuro te lo agradecerá 🙌"
];

export default function CreateTask({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("media");
  const [dueDate, setDueDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [frase, setFrase] = useState("");

  // 🔹 Seleccionar frase motivadora aleatoria al montar
  useEffect(() => {
    const random = Math.floor(Math.random() * frases.length);
    setFrase(frases[random]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setShowSuccess(false);

    if (!title.trim() || !dueDate) {
      setErrorMessage("Título y fecha límite son obligatorios.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage("❌ No hay usuario autenticado.");
        return;
      }

      const userId = user.uid;

      // Detectar si ya hay tareas hoy
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const tasksTodayQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("createdAt", ">=", Timestamp.fromDate(todayStart)),
        where("createdAt", "<=", Timestamp.fromDate(todayEnd))
      );

      const snapshot = await getDocs(tasksTodayQuery);
      const isFirstTaskToday = snapshot.empty;

      // Crear la tarea en Firestore
      const docRef = await addDoc(collection(db, "tasks"), {
        userId,
        title: title.trim(),
        description,
        urgency,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        createdAt: serverTimestamp(),
        completed: false
      });

      // 🔹 Agregar tarea provisional al estado local
      if (onTaskCreated) {
        onTaskCreated({
          id: docRef.id,
          userId,
          title: title.trim(),
          description,
          urgency,
          dueDate: new Date(dueDate),
          createdAt: new Date(), // provisional
          completed: false
        });
      }

      // Mostrar animación de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // 🎉 Confetti si es la primera tarea del día
      if (isFirstTaskToday) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Limpiar campos
      setTitle("");
      setDescription("");
      setUrgency("media");
      setDueDate("");

      // Nueva frase motivadora
      const random = Math.floor(Math.random() * frases.length);
      setFrase(frases[random]);

    } catch (err) {
      console.error("❌ Error al guardar la tarea:", err.message);
      setErrorMessage(`❌ Error al guardar la tarea: ${err.message}`);
    }
  };

  return (
    <div className="md:w-[400px] w-full max-h-[80vh] overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow-lg w-full"
      >
        {/* Frase motivadora */}
        {frase && (
          <p className="text-green-600 font-semibold text-center mb-2">
            {frase}
          </p>
        )}

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="text-center text-sm text-red-600 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Mensaje de éxito animado */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="text-center text-sm text-green-600 font-semibold"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded shadow">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                ¡Tarea agregada con éxito!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campos del formulario */}
        <input
          type="text"
          placeholder="Título de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>

        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow"
        >
          Crear tarea
        </button>
      </form>
    </div>
  );
}
