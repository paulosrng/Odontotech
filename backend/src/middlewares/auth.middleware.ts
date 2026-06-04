import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Forbidden, Unauthorized } from '../shared/errors';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

/** Validates the Bearer access token and attaches req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw Unauthorized('Token de acesso ausente.');
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
    req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
    next();
  } catch (err: any) {
    if (err?.name === 'TokenExpiredError') throw Unauthorized('Token de acesso expirado.');
    throw Unauthorized('Token de acesso inválido.');
  }
}

/** Restricts a route to the given roles (use after authenticate). */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw Unauthorized();
    if (roles.length && !roles.includes(req.user.role)) {
      throw Forbidden('Você não tem permissão para esta ação.');
    }
    next();
  };
}
