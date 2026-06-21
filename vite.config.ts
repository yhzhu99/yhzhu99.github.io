import { copyFile } from "node:fs/promises";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue(), tailwindcss(), spaFallback404()],
});

function spaFallback404() {
  return {
    name: "spa-fallback-404",
    apply: "build" as const,
    async closeBundle() {
      await copyFile("dist/index.html", "dist/404.html");
    },
  };
}
