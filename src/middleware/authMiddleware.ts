import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User'; // adjust the path if needed

interface JwtPayload {
  id: string;
}

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          res.status(401).json({ message: 'User not found' });
          return;
        }
  
        req.user = user;
        next();
      } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  };
  