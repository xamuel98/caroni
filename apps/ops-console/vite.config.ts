import type { ServerResponse } from 'node:http';
import type { Socket } from 'node:net';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_TARGET = 'http://localhost:3100';

/** Surface a clear 502 when the BFF isn't running, instead of an opaque 500. */
function onProxyError(
  err: NodeJS.ErrnoException,
  _req: unknown,
  res: ServerResponse | Socket,
): void {
  if (!('writeHead' in res) || res.headersSent) return;
  res.writeHead(502, { 'content-type': 'application/json' });
  res.end(
    JSON.stringify({
      title: 'Bad Gateway',
      status: 502,
      code: 'backend_unreachable',
      detail:
        `Cannot reach the API at ${API_TARGET} (${err.code ?? err.message}). ` +
        'Is the backend running? Start it with: pnpm --filter @caroni/api dev',
    }),
  );
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // Proxy API + auth to the BFF so cookies are same-origin in dev.
    proxy: {
      '/api': { target: API_TARGET, configure: (proxy) => proxy.on('error', onProxyError) },
      '/auth': { target: API_TARGET, configure: (proxy) => proxy.on('error', onProxyError) },
    },
  },
});
