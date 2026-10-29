import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Production builds drop the CONTENT of draft projects (`draft: true`), so unfinished text never ships
 * inside the JavaScript bundle. In `npm run dev` and in tests they are untouched.
 */
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

// https://vite.dev/config/
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
        // Stable vendor chunks cache well on S3/CloudFront. three.js is split automatically (lazy hero WebGL).
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["motion"],
        },
      },
    },
  },
});
