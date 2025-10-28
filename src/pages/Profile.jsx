import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile, updatePassword } from "firebase/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || "");
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUploadImage = async () => {
    if (!imageFile || !user) return;

    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "taskgo_unsigned");
    data.append("folder", `profilePictures/${user.uid}`);

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dx968b0kv/image/upload", {
        method: "POST",
        body: data,
      });
      const file = await res.json();
      if (file.secure_url) {
        setPhotoURL(file.secure_url);
        toast.success("Imagen subida con éxito ✅");
      } else {
        console.error("Error al subir imagen:", file);
        toast.error("No se pudo subir la imagen ❌");
      }
    } catch (err) {
      console.error("Error en la subida:", err);
      toast.error("Error al subir la imagen ❌");
    }
  };

  const handleSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!photoURL.startsWith("http")) {
      toast.error("La URL de la foto no es válida ⚠️");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });
      toast.success("Perfil actualizado con éxito ✅");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa ambos campos ⚠️");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden ❌");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres ⚠️");
      return;
    }

    setChangingPassword(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Contraseña actualizada con éxito ✅");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error: " + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 to-blue-800 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Mi Perfil</h2>

          {/* Foto de perfil */}
          <div className="flex flex-col items-center mb-6">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                Sin foto
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-2"
            />
            <button
              onClick={handleUploadImage}
              className="mt-2 flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition"
            >
              📤 Subir imagen
            </button>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300">Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            {/* 🔹 URL oculta, ya no se muestra al usuario */}
            <input type="hidden" value={photoURL} readOnly />

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300">Correo electrónico</label>
              <p className="font-semibold">{user?.email || "Sin correo"}</p>
            </div>

            {/* Cambiar contraseña */}
            <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Cambiar contraseña</h3>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-300">Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <div className="mt-2">
                <label className="text-sm text-gray-500 dark:text-gray-300">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                🔒 {changingPassword ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            </div>
          </div>

          {/* Botón guardar perfil */}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className={`mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 ${
              saving ? "animate-pulse" : ""
            }`}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
