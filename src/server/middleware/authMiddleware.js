import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user || !req.user.active) {
        res.status(401);
        throw new Error('Usuario no autorizado o cuenta desactivada');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Token inválido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No se proporcionó token de autenticación');
  }
});