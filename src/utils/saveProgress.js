import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export async function saveProgress(userId, record, streak, badges) {
  try {
    const ref = doc(db, "progress", userId);
    await setDoc(ref, {
      userId,
      record,
      streak,
      badges
    }, { merge: true });
  } catch (err) {
    console.error("Error al guardar progreso:", err);
  }
}
