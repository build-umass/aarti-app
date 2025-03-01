// apps/user-service/src/index.ts
import http from 'http';
import { createApp } from './app';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'), 
});

if (process.env.ENV_FILE) {
  dotenv.config({
    path: path.resolve(__dirname, '../../../', process.env.ENV_FILE),
  });
}

const PORT = process.env.PORT || 3002;

async function startServer() {
  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log('User Service listening on port', PORT);
  });
    
  
}

startServer().catch((err) => {
  console.error('Error starting User Service:', err);
});

