import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2R__4WjCInJrYsyoeugN_Ik7lbPtX96A",
  authDomain: "taskgo-7d080.firebaseapp.com",
  projectId: "taskgo-7d080",
  storageBucket: "taskgo-7d080.appspot.com", // ← corregido
  messagingSenderId: "337719106669",
  appId: "1:337719106669:web:eac44b9a77d9c70c4af364"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
