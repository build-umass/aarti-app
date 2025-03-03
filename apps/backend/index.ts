// apps/user-service/src/index.ts
import http from 'http';
import { createApp } from './app'

const PORT = process.env.PORT || 3002;

async function startServer() {
  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log('Aarti app backend listening on port', PORT);
  });
}

startServer().catch((err) => {
  console.error('Error starting Aarti app backend:', err);
});

