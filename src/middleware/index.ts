import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';


const validateNginxSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.get('X-Service-Secret');
  const expectedSecret = process.env.NGINX_SECRET_KEY || 'your-secret-key-here';

  if (secret !== expectedSecret) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid or missing service secret key'
    });
  }

  next();
};

const healthCheckBypass = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/' || req.path === '/health' || req.path.startsWith('/api-docs')) {
    return next();
  }
  validateNginxSecret(req, res, next);
};

export const setupMiddleware = (app: express.Application) => {
  app.use(cors());
  app.use(express.json());
  app.use(healthCheckBypass);
};
