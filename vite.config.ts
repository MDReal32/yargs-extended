import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      bundleTypes: true,
      entryRoot: "src",
      exclude: ["src/**/*.spec.ts"],
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.build.json"
    })
  ],
  build: {
    emptyOutDir: true,
    outDir: "build",
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: () => "index.js"
    },
    rollupOptions: {
      external: ["type-fest", "yargs", "yargs/helpers"]
    },
    sourcemap: true
  }
});
