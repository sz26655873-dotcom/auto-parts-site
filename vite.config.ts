import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync, readFileSync, existsSync, statSync, readdirSync, copyFileSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vite plugin that copies functions-src/ files to dist/functions/ after build.
 * This ensures Cloudflare Pages Functions can find the API routes in the
 * functions/ directory during deployment.
 *
 * Only copies .ts files from functions-src/api/ and functions-src/lib/.
 */
function copyFunctionsPlugin(): Plugin {
  return {
    name: 'copy-functions-src',
    closeBundle() {
      const srcBase = resolve(__dirname, 'functions-src');
      // Copy to BOTH dist/functions/ and project-root functions/
      // wrangler pages deploy needs functions/ at project root for API routes
      const destBases = [resolve(__dirname, 'dist/functions'), resolve(__dirname, 'functions')];

      /** Recursively copy .ts files from srcDir to destDir. */
      function copyTsFiles(srcDir: string, destDir: string): void {
        if (!existsSync(srcDir)) return;

        // Ensure destination directory exists
        mkdirSync(destDir, { recursive: true });

        const entries = readdirSync(srcDir, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = join(srcDir, entry.name);
          const destPath = join(destDir, entry.name);

          if (entry.isDirectory()) {
            copyTsFiles(srcPath, destPath);
          } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            // Copy file (overwrite if exists, create if not)
            copyFileSync(srcPath, destPath);
          }
        }
      }

      for (const destBase of destBases) {
        // Copy api/ and lib/ subdirectories
        copyTsFiles(join(srcBase, 'api'), join(destBase, 'api'));
        copyTsFiles(join(srcBase, 'lib'), join(destBase, 'lib'));

        // Copy _middleware.ts if exists (Cloudflare Pages middleware)
        const middlewareSrc = join(srcBase, '_middleware.ts');
        const middlewareDest = join(destBase, '_middleware.ts');
        if (existsSync(middlewareSrc)) {
          copyFileSync(middlewareSrc, middlewareDest);
        }
      }

      console.log('✓ functions-src/ → dist/functions/ + functions/ copy completed');
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyFunctionsPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(new Date().toISOString().split('T')[0] + '-' + Date.now().toString(36)),
  },
});
