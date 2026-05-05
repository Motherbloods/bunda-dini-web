import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          "vendor-firebase-app": ["firebase/app"],
          "vendor-firebase-auth": ["firebase/auth"],
          "vendor-firebase-firestore": ["firebase/firestore"],

          "vendor-recharts": ["recharts"],

          "vendor-pdf": ["jspdf", "jspdf-autotable"],
          "vendor-xlsx": ["xlsx"],

          "vendor-utils": ["date-fns", "clsx", "uuid"],

          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
});
