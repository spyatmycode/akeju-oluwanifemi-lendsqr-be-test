import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer faux-token-')) {
    res.status(401).json({ error: 'Invalid or missing token' });
    return;
  }
  next();
};