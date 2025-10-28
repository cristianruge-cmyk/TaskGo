export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // 👈 habilita el modo oscuro por clase
  theme: {
    extend: {
      colors: {
        taskgoBlue: "#2563eb",   // Azul principal
        taskgoGreen: "#22c55e",  // Verde motivador
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Fuente personalizada
      },
    },
  },
  plugins: [],
}