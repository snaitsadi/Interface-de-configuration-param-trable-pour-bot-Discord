import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  
  if (!session || !session.discordUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};