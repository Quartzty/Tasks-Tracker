import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Le dossier de travail contient des caractères spéciaux (<:>) qui cassent la
  // "fs allow list" de Vite → on désactive le mode strict en dev local.
  server: { fs: { strict: false } },
});
