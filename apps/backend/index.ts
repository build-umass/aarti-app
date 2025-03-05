import http from 'http';
import { createApp } from './app';
import { connectToDatabase } from './db';

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await connectToDatabase();
    
    const app = createApp();
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
      console.log('Aarti app backend listening on port', PORT);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error('Error starting Aarti app backend:', err);
});