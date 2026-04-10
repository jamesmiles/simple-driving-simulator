import { defineConfig, Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/** Inline all JS into the HTML so the build works from file:// */
function inlineScript(): Plugin {
  return {
    name: 'inline-script',
    enforce: 'post',
    generateBundle(_, bundle) {
      const htmlFile = bundle['index.html'];
      if (!htmlFile || htmlFile.type !== 'asset') return;

      let html = htmlFile.source as string;

      // Find script tags and inline them
      for (const [name, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && name.endsWith('.js')) {
          html = html.replace(
            /<script[^>]*src="[^"]*"[^>]*><\/script>/,
            `<script>${chunk.code}</script>`,
          );
          delete bundle[name];
        }
      }

      htmlFile.source = html;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [inlineScript()],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
