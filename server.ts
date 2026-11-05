import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAiRoutes } from './server/aiRoutes';
import { registerGitRoutes } from './server/gitRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse CLI flags (e.g. tsx server.ts --port 3000 --host 0.0.0.0) or environment variables
const args = process.argv.slice(2);
let cliPort: number | undefined;
let cliHost: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    cliPort = parseInt(args[i + 1], 10);
  }
  if (args[i] === '--host' && args[i + 1]) {
    cliHost = args[i + 1];
  }
}

const port = (!isNaN(cliPort!) && (cliPort ?? 0) > 0) ? cliPort! : parseInt(process.env.PORT || '3000', 10);
const host = cliHost || process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

registerAiRoutes(app);
registerGitRoutes(app);

// Setup Vite or static serving
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const server = app.listen(port, host, () => {
  console.log(`\n  ➜  Local:   http://localhost:${port}/`);
  console.log(`  ➜  Network: http://${host}:${port}/\n`);
  console.log(`WebNovel-Studio server running on http://${host}:${port}`);
});

server.on('error', (err: any) => {
  console.error('Server listen error:', err);
});
