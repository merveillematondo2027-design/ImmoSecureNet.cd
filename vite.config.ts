import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Google AI Studio preview can close Vite WebSockets before they open.
      // Keep HMR disabled here; manual refresh remains available and avoids
      // the recurring "WebSocket closed without opened" error.
      hmr: false,
      watch: null,
    },
  };
});
