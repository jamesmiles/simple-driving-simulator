import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';

/** Inline all JS into the HTML so the build works from file:// */
function inlineScript(): Plugin {
  return {
    name: 'inline-script',
    enforce: 'post',
    generateBundle(_, bundle) {
      // Find the HTML asset (could be index.html or game.html)
      const htmlKey = Object.keys(bundle).find(k => k.endsWith('.html'));
      if (!htmlKey) return;
      const htmlFile = bundle[htmlKey];
      if (htmlFile.type !== 'asset') return;

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
      input: resolve(__dirname, 'game.html'),
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
