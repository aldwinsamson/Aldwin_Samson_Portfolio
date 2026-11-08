import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function dropDraftProjects(): Plugin {
  return {
    name: "drop-draft-projects",
    apply: "build",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0].replace(/\\/g, "/");
      const isProjectFile = /\/src\/content\/projects\/[^/_][^/]*\.ts$/.test(file) && !file.endsWith("/index.ts");
      if (!isProjectFile || !/^\s*draft:\s*true/m.test(code)) return null;
      return { code: "export default undefined;", map: null };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), dropDraftProjects()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["motion"],
        },
      },
    },
  },
});
