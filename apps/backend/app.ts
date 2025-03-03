// apps/user-service/src/app.ts
import express from 'express';
import userRoutes from './routes';

export function createApp() {
  const app = express();

  // JSON parsing
  app.use(express.json());
  app.use((req, _, next) => {
    console.log(`User-service incoming: ${req.method} ${req.url}`);
    console.log(req.body)
    next();
  });
  

  // Register routes for user
  app.use('/users', userRoutes);

  return app;
}
