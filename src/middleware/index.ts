import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";


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

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization header is required" });
    }
    
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.id) {
        return res.status(401).json({ error: "Invalid or missing user in token" });
    }
    
    // Add user info to request
    (req as any).user = decoded;
    next();
};

// Middleware to ensure user can only access their own data
const ensureOwnUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.userId);
    const tokenUserId = (req as any).user.id;
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
    }
    
    if (userId !== tokenUserId) {
        return res.status(403).json({ error: "Access denied. You can only access your own data" });
    }
    
    next();
};

export const setupMiddleware = (app: express.Application) => {
  app.use(cors());
  app.use(express.json());
  app.use(healthCheckBypass);
};

export { authenticateToken, ensureOwnUser };
