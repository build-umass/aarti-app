import express from 'express';
import cors from 'cors';
import routes from './routes';

export function createApp() {
  const app = express();

  // Enable CORS
  app.use(cors());
  
  // JSON parsing
  app.use(express.json());
  app.use((req, _, next) => {
    console.log(`Aarti-backend incoming: ${req.method} ${req.url}`);
    console.log(req.body)
    next();
  });
  
  // Register routes for user
  app.use('/', routes);

  return app;
}