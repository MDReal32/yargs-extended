import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  build: {
    emptyOutDir: true,
    outDir: "build",
    ssr: "src/main.ts"
  }
});
