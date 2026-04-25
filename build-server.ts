import esbuild from "esbuild";

// Build script for the server to CJS for production
// Node supports ESM type stripping but for complex setups we might prefer a single file
esbuild.build({
  entryPoints: ["server.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  outfile: "dist/server.cjs",
  format: "cjs",
  external: ["vite", "path", "url", "axios", "cheerio", "express"], // Keep these external
}).catch(() => process.exit(1));
